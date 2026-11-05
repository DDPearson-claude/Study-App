# GLOOMWATER: Game Design Document

*Sail · fish · survive the swarm. A lantern-lit 3D fishing-survival roguelite in a single HTML file.*

> **How to read this document.** `src/data.js` is the single source of truth for every number, and every table in this document is generated from it. When prose and a table disagree, the table (and data.js) wins. Section numbers (§) match the comments in data.js. The binding module APIs, events and state schema live in `CONTRACT.md`; this document specifies *behaviour*. "Optional extension" means a field or call outside the contract that consumers must read with `?.` / `??`.

**Vocabulary (ours, always):** the **Wick** (player), **Old Murk** (toad merchant), **Shells** (run currency), **Embers** (health, shown as small flames), **Cinders** (XP dropped by gloomlings; the contract's "embers (XP)" are called Cinders in-game so they never clash with health), **Memories** (meta currency), **Relics** (permanent upgrades), **Boons** (level-up picks), **Kindles** (level-6 weapon fusions), the **Gloom** and **Gloomtide** (the night), **gloomlings** (night enemies; never "shades" in UI text), **Wardens** (night bosses), **Waystones** (start deeper), the **Shrine of Drowned Lanterns**.

> **Precedence (v3).** §25 is the binding v3 spec and **overrides §1–§24 and the appendices wherever they conflict**. §25.12 says, section by section, what is kept, modified, replaced or cut; §25.13 lists the edits made inside §24. Inside The Long Descent (the prestige mode, §25.3.7) §1–§24's run rules still apply. v3 vocabulary: §25.0.4.

**Contents**

| § | section | in v3 (§25.12) |
|---|---|---|
| 1 | Vision & pillars | replaced by §25.1 (premise and tone kept) |
| 2 | Core loop | replaced by §25.2–§25.3 (kept for The Long Descent) |
| 3 | Controls | modified (hub walking, station pills, float long-press, drag preset) |
| 4 | Sailing & arenas | modified (Mossmere places, Homeward Waystones, the `COVE` arena) |
| 5 | Fishing | modified; §5.7 feeding spots cut (signs), §5.8 weight replaced (size model) |
| 6 | Survival | modified; §6.7 death replaced (Snuffed, Scorched) |
| 7 | Night swarm | kept, demoted to night modes (§25.5) |
| 8 | Lantern combat | kept (hidden by day, §25.5.7) |
| 9 | Economy & creel decisions | replaced / modified (§25.7.3, §25.10) |
| 10 | Boons & levelling | modified (XP per mode, Angler pool, banked level-ups) |
| 11 | Characters | modified (fishing halves) |
| 12 | Challenges & unlocks | modified (48, Gloom tab, tier V) |
| 13 | Merchant visits & shop | modified (Gear Bench, Ledger, combat kit) |
| 14 | Zones & gates | modified (Waystones, permanent gates) |
| 15 | Bounties | modified (+ Murk's Ledger) |
| 16 | Journal | modified (rulers, seals, Elder Log, mount book) |
| 17 | Meta: Memories, Relics, Waystones | replaced / modified (§25.10.4) |
| 18 | Pacing targets | replaced by §25.9 (kept for The Long Descent) |
| 19 | Art direction | modified (fish, Mossmere harbour, the Landing, Murk off green, cameras) |
| 20 | Audio direction | modified |
| 21 | UI/UX | modified (new screens, HUD by mode) |
| 22 | Originality notes | modified (+ §25.15.3) |
| 23 | Implementation notes (§23.1 who reads what, incl. §24–§25) | modified |
| 24 | Exploration on foot (v2, behind `WALK_ENABLED`) | kept, edited in place (§25.13) |
| 25 | **Fishing & discovery first (v3)**: decision log, expeditions, the Landing, night modes, fishing craft, size, places, progression, economy, supersession, phase plan | **binding** |
| A | Balance simulation | modified (T1, T3, T5) |
| B | The foot profile | kept |

---

## 1. Vision & pillars

**Premise.** Long ago the Lamplit Kingdom hung a great lantern over its lake. When the lantern fell, the kingdom followed it into the water. The Wicks are what is left of its candles: small, stubborn flames on rafts, fishing so they stay lit. Somewhere below, the **Pale Leviathan** carries the great lantern's last ember in its belly.

**Tone.** Tender, lonely, wry. Sad but quietly kind. The dark is patient, not cruel. Text is short, concrete and present-tense.

**The loop in one sentence.** By day you sail a cavern lake and fish; every fish is food, lantern oil or Shells, and there is one small creel. By night the Gloom swarms from every side, and your lantern's light, fed by that oil, burns everything that enters it.

**Pillars**
1. **Oil = light = damage = life.** One resource powers the night: the light radius and the aura's damage both scale with oil, flares and zaps cost oil, and darkness kills. The day's fishing is how you buy the night's power.
2. **Two halves, one run.** Calm days are skill-fishing and routing (spots, Murk's dock, the legend pool). Nights are a survivors-style horde. Boons and levels persist through the whole descent, so both halves build one character.
3. **Every threat is readable.** Every source of damage has a telegraph of at least 0.35 s (gloomling lunge) and most have 1 s or more (eel 1.0 s, hand stain 1.4 s, Warden abilities 1.0–1.5 s), with shape, colour and sound cues. Fair deaths only.
4. **Challenging, never hopeless.** First runs end around night 3–5; the swarm is genuinely threatening by night 4–6 in the first lake unless the build is good. A first victory takes many runs of relics, characters and unlocked boons. Every death banks Memories and usually pops a challenge.
5. **Pointer-first.** Everything works with one pointer (mouse or a thumb) plus a joystick: hold, release, tap. Keyboard is a convenience.
6. **Hand-inked melancholy.** Silhouettes, layered depth, bioluminescence, one warm light in a cold world, thin ornate UI. Inspired by the *mood* of Hollow Knight's art, never its content (§22).

---

## 2. Core loop

### 2.1 Moment to moment: the calm (day)
1. **Read the lake.** Shimmering mote columns mark feeding spots (visible through fog), Murk's green lamp marks today's dock, a faint ring of still water marks the legend pool, the Descent Gate whirlpool sits up-screen.
2. **Sail** (joystick / WASD) to a spot. Boat inertia: you plan your stop.
3. **Anchor and cast.** Press on the water: the raft brakes, the Wick turns toward the pointer, and the ping-pong charge meter runs. A reticle on the water shows where the bobber will land and how deep the water is there (shallow / mid / deep). Release near the peak.
4. **Wait.** Nibbles are tests. Tapping early spooks the fish.
5. **Hook.** The bobber plunges with a "!": tap inside the window. A fast tap is a **perfect hook** (better start, finer catch, streak).
6. **Reel.** Hold to reel, release to ease. Keep tension in the pale safe band and inside the bright drifting sweet band (double progress). When the gauge flares and the line shivers, a surge is coming: let go.
7. **Decide.** The catch card: **Keep** (sell to Murk later, or keep as an oil/food battery), **Eat** (satiety), **Render** (oil) or **Release** (luck for the rest of the day).
8. Repeat. Before dusk, sail to Murk's dock to sell, buy gear, bait and supplies, and take bounties.

### 2.2 Moment to moment: the Gloomtide (night)
- Gloomlings pour in from a ring 22–34 m away. Your **light** auto-burns everything inside it; your **weapons** (boons) fire on their own.
- **Steer**: pull the swarm through your light and weapons, keep moving away from ink stains, artillery rings and charges, use islands to split water-bound packs.
- **Collect cinders** at the light's edge (the "cinder line") to level up: **pick 1 of 3 boons**.
- **Tap to zap** eels, moths, inkwells and hands. **Flare** (Space / F / button) when crowded.
- **Watch the oil.** If it sags, **Burn** a fish (R / button) without opening the creel.
- Survive to dawn: everything left dissolves, cinders fly to you, you mend.

### 2.3 Per day
| phase | day 1 clock | what happens |
|---|---|---|
| calm (120 s) | 0:00–2:00 | Murk moors (day 1 at 0:20); spots spawn; fishing, routing, trade. Murk's bell warns at 85% of the calm. |
| dusk (14 s) | 2:00–2:14 | Murk casts off. Light thins. Sparse scouts. Last chance to position and top up oil. |
| gloomtide (90 s, +6 s per day, max 120 s) | 2:14–3:44 | The swarm: build-up, 20 s swells, formations, elites, Warden on boss nights, crescendo, an 8 s hush. |
| dawn (8 s) | 3:44–3:52 | Survivors dissolve, cinders auto-collect, heal (dawnHeal, +1 if well-fed). Next day begins. |

A day is 232 s on day 1 and 262 s from day 6 onward.

### 2.4 Per run (a "descent")
1. Start in the Mossmere (or a Waystone lake) with your chosen Wick, its start boon and kit.
2. Each lake has a **legendary** fish. Buy its **legend bait** from Murk, cast into the **legend pool** at the right time: the bite is guaranteed; the boss fight is the test.
3. Landing it opens the **Descent Gate**. Pay its Shell toll at the whirlpool and sink to the next lake: richer fish and Shells, and the swarm's **Heat** jumps by +3, like skipping three nights.
4. Every third night in a lake a **Warden** rises. Kill it for **Heartwax** (+1 max Ember for the run, first kill of each Warden only), a **Warden's Gift** pick, Shells and oil. Lingering in a lake past its 4th night adds +1 extra Heat per night, so a lake cannot be camped forever.
5. Four lakes. Landing the **Pale Leviathan** in the Pallid Deep wins the run (endless play continues if you choose).
6. Death ends the run: Memories are tallied and banked. Nothing earned is ever taken away.

### 2.5 Meta
- **Memories** → **Relics** at the Shrine (permanent stat and utility upgrades, Waystones).
- **Challenges** (a 30-goal checklist; 40 in the walking build, tier IV *Paths Underfoot*, §24.10) → new **Wicks**, new **boons** in the pool, new **relics**, a new **bait**, plus Memories.
- **Journal**: 32 species to name (40 in the walking build: + 8 place-kept fish, §24.7; a Places tab), zone-completion perks, mastery.
- **Waystones**: start deeper with a Shell purse and banked levels.
- Records and near-miss lines on the death screen ("Sporewood toll: 34 Shells away").

---

## 3. Controls

### 3.1 Mouse & keyboard
| input | action |
|---|---|
| WASD / arrows | Sail (screen-relative: up = away from the camera) |
| Left-click a gloomling (within 48 px) | **Zap** (takes priority over everything else) |
| Left-click Murk's barge (when within 5 m) | Open the shop |
| Left button on water: hold | Anchor + charge the cast (aim = pointer) |
| release | Cast |
| click during a bite | Set the hook |
| hold / release while hooked | Reel / ease |
| Space or F | **Flare** |
| E | Interact: Trade / Descend (walking build: also Ashore, Board, Ring Bell, Share flame (hold), Flame-leap, deeds, Plant; §24.2) |
| R | **Burn a fish** (render the lowest-value non-legendary fish in the creel) |
| C / J | Creel / Journal |
| Esc or P | Pause |
| In the level-up picker | 1–4 pick a card, R reroll, S skip |

### 3.2 Touch
- **Floating joystick** in the lower-left 40% of the screen: it appears where the thumb lands (radius 60 px, 10% dead zone) and writes `ctx.input.joy`.
- **Tap / hold anywhere else on the water**: exactly the mouse rules (cast, hook, reel). Tap a gloomling to zap (56 px pick radius).
- **Right-side buttons**: **Flare** (72 px, radial cooldown ring, greyed when oil < flareCost), **Burn** (56 px, shows the fish it will burn), contextual **Trade / Descend** pill above the Flare button. Small 44 px icons top-right: Creel, Journal, Pause.
- **Multi-touch is a core skill:** one finger holds the reel while another taps a gloomling. *Integration requirement (main.js):* track the pointer id that started a fishing hold; only that pointer's up/cancel calls `fishing.onPointerUp()`. Taps from other pointers go to `combat.onPointerDown` first.

### 3.3 Pointer priority (contract §4)
pointerdown → `combat.onPointerDown(ndc)` (zap) → else Murk's barge (if `progression.canShop()`) → else `fishing.onPointerDown()`. A tap that zaps never spooks a waiting fish and never starts a cast. On a single mouse, clicking an enemy mid-reel is a brief release (see §5.9 for the slack budget).

### 3.4 Accessibility & comfort
Surges, dives and leaps use **shape + colour** (red ▼ "ease", white ▲ "hold"). Settings: master / music / sfx volume, quality, screen shake, damage numbers, plus optional extensions *reel toggle mode* (tap to start/stop reeling instead of hold) and *reduced flashing*. `navigator.vibrate?.(25)` on surge warnings and hits (touch only). All touch targets ≥ 44 px.

---

## 4. Sailing & arenas

### 4.1 Raft handling (player.js, `BALANCE.move`)
```
dir    = rotateY(input.move + input.joy, render.getYaw()), |dir| ≤ 1     // screen-relative
target = dir · stats.moveSpeed · (inSlick ? slickMult : 1) · (anchoredByFishing ? 0 : 1)
rate   = |dir| > 0.1 ? (dot(dir, v̂) < backpaddleDot ? accel·backpaddle : accel)
                     : (fishing.isBusy() ? anchorDrag : drag)
v     += (target − v) · (1 − e^(−rate·dt));   pos += v·dt;   world.collide(pos, raftRadius)
```
| parameter | value | feel |
|---|---|---|
| `moveSpeed` (STATS base) | 6 m/s | Crossing the Mossmere (120 m) ≈ 20 s. Base gloomlings 2.6 m/s, inkmites 3.9 m/s; late mites reach ≈ 5.6 m/s. |
| `accel` | 3 /s | 0 → 90% of top speed in 0.77 s |
| `drag` | 1.5 /s | coasts ≈ 4 m; boat-like, not ice |
| `backpaddle` | ×1.8 when input opposes velocity | quick reversals to dodge hand stains |
| `turnRate` | 5 rad/s | heading follows velocity above 0.4 m/s: `heading = atan2(−v.x, −v.z)` |
| `raftRadius` | 1.6 m | velocity along the contact normal is removed (slide along walls). Impacts > 4 m/s bounce 30%, splash, `render.shake(0.1)`, no damage. |
| `anchorDrag` | 6 /s | applied while fishing is busy and there is no input |
| wake / paddle ripple | every 0.12 s at full speed / 0.45 s | `water.addWake`, `water.addRipple` |

### 4.2 Anchoring rules (player ↔ fishing)
| fishing state | movement |
|---|---|
| idle | free |
| charging | movement input → `fishing.cancel('moved')`. Pressing on the water while faster than 2 m/s **drops anchor**: the raft brakes at `anchorDrag`; the meter starts once speed < 2 m/s ("anchoring…" shown). Emit `player:anchor {anchored:true}` once speed < 0.3 m/s. |
| casting / waiting | any movement input → `fishing.cancel('moved')` (`fishing:miss {reason:'moved'}`) |
| bite / reeling / landing | **locked** (target = 0) |
| reeling: cut line | holding movement for 0.6 s → `fishing.cancel('moved')`: the fish escapes (`fishing:escaped {reason:'slack', cut:true}`) and you are free. The bail-out when a night hook goes wrong. |
| any | if the raft is pushed (knockback) more than castDist + 4 m from a waiting bobber, the line reels in |

`player:anchor {anchored:false}` fires when the raft next moves above 0.3 m/s.

### 4.3 Arenas and the depth recipe
Each lake is a roughly circular cavern lake centred on the origin (−Z = north = up-screen; the camera looks toward −Z). Every lake **spawns you in the south and puts its gate north or centre**, so "descend" always reads as "sail up-screen". Islands and pillars are collision circles (`world.getObstacles()`); cliffs ring the shore at R.

**Depth** (`world.getDepth(x, z)` → 0..1):
```
r = hypot(x, z)
base = layoutShape(x, z)                       // per layout below, 0..1
shore = smoothstep(R, R − shelf, r)            // 0 at the cliff, 1 inside the shelf
isl = Π over islands smoothstep(rI, rI + 5, distance to island centre)
d = clamp01(base · shore · isl + noise(±arena.noise, low frequency, seeded))
then max with every deepPool:  d = max(d, pool.depth · smoothstep(pool.r, pool.r·0.6, distance))
```
| layout | shape |
|---|---|
| `bowl` (Mossmere) | `base = 0.15 + 0.6·(1 − r/R)²` mid-deep toward the centre, plus the Bell Pool |
| `twoBasins` (Sporewood) | two basins (the deep pools) separated by the reef mat (depth 0.15 along x≈0, width 6); elsewhere 0.35–0.6 |
| `ringTrench` (Glasswater) | plateau `r < 22` at 0.2; trench `26 < r < 48` at 0.92 (smooth 4 m walls); outer shelf 0.45 |
| `drop` (Pallid Deep) | 0.8 almost everywhere, the causeway strip (x≈0, z 30…70, width 8) at 0.2, the Well at 1.0 |

The **bobber's depth decides the fish**, not the raft's, so casting from the shallows over a drop-off is a learnable trick. Spots spawn at depth ≥ 0.2; legend pools sit at depth ≥ 0.8; creelsnatch eels spawn only at depth ≥ 0.4.

### 4.4 The four arenas
*Walking build (`WALK_ENABLED`, §24): `ARENA_V2` replaces the three lower lakes' islands, pillars, deep pools, legend pool, gate, spawn and docks and adds their walk maps (§24.6). The cells below are the v1 values and stay authoritative for v1 builds and for the Mossmere.*

|  | The Mossmere | Sporewood Pools | Glasswater Vault | The Pallid Deep |
|---|---|---|---|---|
| radius · seed · layout | R 60 · 1307 · `bowl` | R 65 · 2711 · `twoBasins` | R 70 · 4421 · `ringTrench` | R 78 · 9001 · `drop` |
| depth share shallow/mid/deep % | 35 / 40 / 25 | 30 / 40 / 30 | 30 / 20 / 50 | 10 / 30 / 60 |
| deep features | Bell Pool (-4, -14) r 13 @ 0.9 | Lullaby Pool (-28, -8) r 16 @ 0.85<br>Grove Well (28, -16) r 14 @ 0.95<br>cap-reef mat x≈0, z -42…38, depth 0.15 | Ring Trench 26 < r < 48 @ 0.92<br>shallow plateau r 22 | The Well (0, -52) r 12 @ 1<br>shallow causeway x≈0, z 30…70 |
| legend pool | Bell Pool (-4, -14) | Grove Well (28, -16) | North Trench (0, -37) | The Well (0, -52) |
| islands (x, z, r) | Drowned Gatehouse (22, -12) r8<br>Mossbell Isle (-30, 14) r6<br>Root Isle (34, 20) r5<br>Stair Isle (-14, 28) r4<br>Elder Sister (-30, -24) r5<br>Younger Sister (-18, -34) r4 | Cap Reef I (0, 32) r4.5<br>Cap Reef II (0, 10) r5<br>Cap Reef III (0, -14) r5<br>Cap Reef IV (0, -36) r4.5<br>West Lily Cap (-44, -30) r5<br>East Lily Cap (46, -2) r4<br>South Lily Cap (-16, 40) r4 | Monolith of Hymns (38, 0) r5<br>Monolith of Ledgers (19, 32.9) r4.5<br>Monolith of Maps (-19, 32.9) r4.5<br>Monolith of Names (-38, 0) r5<br>Monolith of Tides (-19, -32.9) r6<br>Monolith of Lamps (19, -32.9) r6 | The Kneeling West (-24, -44) r10<br>The Kneeling East (24, -44) r10<br>Funeral Barge (-40, 10) r4<br>Candle Barge (42, 4) r4<br>Bier Barge (-10, -20) r4 |
| pillars | 4 pier: (-40, -4) (-33, -1) (-26, 2) (-19, 5)<br>3 pylon: (12, -5) (10, -18) (30, -25)<br>3 statue: (40, -20) (-46, 22) (8, 36) | 8 stalk: (-41, 21) (-35, 22) (-38, 28) (-44, 27) (35, 23) (41, 24) (37, 30) (43, 30) | 6 reliquary: (8.66, 5) (0, 10) (-8.66, 5) (-8.66, -5) (0, -10) (8.66, -5)<br>6 shelf: (56, 0) (28, 48.5) (-28, 48.5) (-56, 0) (-28, -48.5) (28, -48.5) | 9 rib: (-27.7, 16) (-32, 0) (-27.7, -16) (-16, -27.7) (0, -32) (16, -27.7) (27.7, -16) (32, 0) (27.7, 16) |
| Descent Gate | The Moss Sluice (0, -49) r 4.5 | The Mycelium Veil (30, -47) r 4.5 | The Vault Seal (0, 0) r 5 | none: the Well is the finale |
| spawn | (0, 46), yaw 0 | (0, 50), yaw 0 | (0, 58), yaw 0 | (0, 66), yaw 0 |
| Murk docks (day 1 first) | (24, 38) (49, 6) (35, -40) (-36, -38) (-48, 14) | (20, 57) (56, 18) (52, -34) (-36, -50) (-57, 8) | (21.9, 60.1) (64, -2.2) (17.6, -61.5) (-53.1, -35.8) (-50.4, 39.4) | (48, 56) (-48, 56) (70, 20) (-70, 20) |

**Night character of each lake.** *Mossmere:* an open bowl, an AoE killing floor; the bridge piers funnel mites; circle the Gatehouse to split water-bound packs. *Sporewood:* the reef gaps (z ≈ 21, −2, −25) are chokepoints for ticks and mites; flyers cross the caps freely; sporelings orbit outside your light. *Glasswater:* the plateau is eel-free but inside a ring of pillars; the trench is open but eel-rich; inkwells have clear lines of fire. *Pallid Deep:* no safe shallows except the causeway (eel-free, but the choir and flyers still come); the Well is far from every dock.

### 4.5 How the arena creates decisions
| decision | the pull | the cost |
|---|---|---|
| **Spot vs. Murk** | 2–4 live spots, 10–45 m away, 45–75 s each, visible from afar; Murk's dock moves daily | A 120 s calm fits ~4–5 catches *or* ~3 catches plus a trade trip (10–20 s of sailing) |
| **Legend pool** | guaranteed legendary bite with the right bait and time | usually across the lake; a late hook can run into dusk |
| **Where you stand at dusk** | deep water: night species, but creelsnatch eels; shallows: eel-free; shore: removes ~40% of spawn directions but you cannot retreat; open centre: run anywhere, surrounded | commit ~15 s before the Gloomtide |
| **Islands at night** | water-bound enemies (mites, ticks, eels) path around obstacles; flyers (wisp-model, moths) glide over | getting pinned against an island by flyers |
| **Chokepoints** | funnel packs into AoE | inkwell rings land in the lane you are stuck in |
| **Cinders** | drop where enemies die, mostly 6–10 m out | you must sail toward the swarm to grow ("the cinder dance") |
| **Stolen fish** | a slain creelsnatch drops your fish, floating for 20 s | a detour into deep water at night |
| **Leash** | gloomlings > 40 m away for > 4 s are moved back onto the spawn ring | you can move the fight, never end it by running |

### 4.6 Docks and gate
`world.getMerchantDock(day)`: `dockIndex = day === 1 ? 0 : (seed + 2·day) % docks.length`, and if that equals yesterday's index use `(index + 1) % n`. Yaw faces the lake centre. The gate is drawn `'sealed'` from day 1 (the goal is always on screen; a cold, still whirlpool ring) and `'open'` (spinning, glowing, foam spiral) once its requirements are met; `'hidden'` in the final lake. Optional night tool: an open gate drowns water-bound gloomlings within 6 m (no cinders).

---

## 5. Fishing

### 5.1 Aim & the cast meter (`BALANCE.cast`)
- **Aim.** While charging, each frame: `P = render.groundPoint(ndc)` (keep the last value if null); `dir = normalize(P − raft)` on the xz-plane; `aimYaw = atan2(−dir.x, −dir.z)`; `actors.setAim(aimYaw)`.
- **Meter.** A triangle wave with period 1.6 s: `ph = (t mod period)/period; charge = ph < 0.5 ? 2·ph : 2 − 2·ph` (0→1 in 0.8 s, back in 0.8 s). It starts once the raft is slower than 2 m/s. `view.charge = charge`.
- **Reticle.** On the water at `raft + dir · max(minDist, charge·castMax)`: a thin bone-white ring, tinted and labelled by `DEPTH_BANDS` of `world.getDepth` there (shallow < 0.35 pale moon-blue, mid < 0.75 amber, deep violet with a gold rim). A dotted range ring at `castMax` around the raft. A spot under the reticle brightens. `view.hint` = 'shallow' | 'mid' | 'deep'.
- **Release.** A press shorter than 0.12 s never casts (back to idle). Otherwise `castDist = max(3, charge × stats.castMax)`, target = `raft + dir·castDist`. If the target is not open water (`world.isOpenWater(x, z, 0.5)`), step back along the ray in 0.5 m steps to the last open point; if none ≥ minDist, cancel with the toast "No open water there".
- **Clean Cast** (charge ≥ 0.92, about a 0.13 s window at each peak): bite wait × 0.85 and +0.05 rarity for this cast; "Clean Cast" float text.
- **Flight**: `flightBase + flightPerM·dist` s on a ballistic arc of height `arcHeight·dist`; on landing: splash, ripples, `fishing:land {position}`, then sample `depth = world.getDepth(bobber)`.
- **Bait.** `progression.consumeBait()` at release (one general bait charge per cast). Legend baits are not spent by casting: progression decrements a legend bait only on `fishing:hook` of a legendary.

### 5.2 Which fish bites (rolled when the bobber lands)
```
eligible = SPECIES where zone == current zone, rarity != 'legendary',
           time ok (any | calm = not gloomtide | gloom = gloomtide only),
           depth[0] ≤ bobberDepth ≤ depth[1],
           bait == null || bait == equipped bait
rb = stats.rarityBonus (includes Mercy) + bait.rarityBonus + spot rarity (0.10, rare spot 0.25)
     + (clean ? 0.05 : 0) + (pity ? 0.1 : 0)
weight = RARITY_WEIGHTS[rarity] × (uncommon: 1 + 2·rb | rare: 1 + 4·rb)
         × (species in equipped bait's attract list ? 2.5 : 1) × (species.bait == equipped ? 1.5 : 1)
```
Every lake has an "any"-time common at every depth (validated), so a cast always has a pool. Rarer species live in narrower and deeper bands, so deep water naturally pays better. Legendaries bite only by the legend rule (§5.6).

### 5.3 Waiting, nibbles, bite, hook window (`BALANCE.bite`)
```
W = (waitBase 3 + Exp(mean 5.5)) / (biteSpeedTotal × (inSpot ? 1/0.55 : 1) × (gloomtide ? 1.15 : 1))
    × (clean ? 0.85 : 1) × (pity ? 0.7 : 1)              clamp to [2, 25] s
biteSpeedTotal = stats.biteSpeed + bait.biteSpeed;  legend pool: W × 0.7
```
Mean wait at base stats is 8.5 s (4.7 s in a spot).
- **Nibbles**: count 0/1/2/3 with probability 20/35/30/15% (+1 for uncommon and rarer, max 4). Each is a 0.06 m dip lasting 0.22 s, at least 0.7 s apart, the last at least 0.6 s before the bite. Each emits `fishing:nibble`, bobber state `nibble`, a tiny bell jingle on the rod tip.
- **Feints** (lake index ≥ 2, rare species): 30% chance of one 0.12 m dip with no "!".
- **nibbleTells**: ≥ 1 → the last nibble before a real bite is a gold double-dip. ≥ 2 → feints are tinted grey.
- **Spook**: tapping water while waiting → `fishing:miss {reason:'early'}`, reel in over 1.5 s. (A tap on an enemy is a zap and never spooks.)
- **Bite**: a 0.25 m plunge, splash, "!" over the bobber, `fishing:bite {speciesId}`, bobber `bite`. Window `w = clamp(species.window × stats.hookWindow × (starving ? 0.85 : 1) + (wounded legendary ? 0.1 : 0), 0.35, 1.4)` s.
- **Hook**: a tap within `w` → `fishing:hook {speciesId, perfect}`. **Perfect** if reaction ≤ `max(0.25, 0.4·w)`. Late → `fishing:miss {reason:'late'}`, reel in 0.6 s.
- **Perfect-hook streak**: `run.flags.streak` +1 on a perfect hook, reset on a normal hook or any miss. Sale value × (1 + 0.1 × min(streak, 5)); the HUD shows up to five flame pips by the bait icon.

### 5.4 Species
32 species, 8 per lake (3 common, 2 uncommon, 2 rare, 1 legendary), plus, in the walking build, 8 place-kept rares in the three lower lakes (§24.7) for 40. `value / food / oil` are at mean weight and normal quality, already scaled by lake. Difficulty columns are the contract semantics (§8 of the contract). Difficulty is derived from an authoring tier × behaviour (× legendary), with the duty cap applied; the two finale fish are hand-tuned. Each lake's commons are roughly as hard as the previous lake's rares.

**The Mossmere** (`mossmere`)

| species | rarity | time | depth | bait | kg | value / food / oil | behaviour | power · surgeEvery · surgeTime · stamina · sweet · erratic · window | shape |
|---|---|---|---|---|---|---|---|---|---|
| **Dusk Minnow** `dusk_minnow` | common | any | 0–0.55 | — | 0.05–0.25 | 5 / 16 / 16 | darter | 0.54 · 3.9 · 0.4 · 5 · 1.3 · 0.2 · 1.1 | minnow |
| **Mossback Perch** `mossback_perch` | common | any | 0.1–1 | — | 0.3–1.4 | 7 / 22 / 20 | steady | 0.6 · 6.5 · 0.7 · 5 · 1.3 · 0.05 · 1.1 | perch |
| **Gutter Crayfish** `gutter_crayfish` | common | any | 0–0.45 | — | 0.1–0.5 | 6 / 20 / 18 | sinker | 0.72 · 11.05 · 0.77 · 5.75 · 1.3 · 0 · 1.1 | crayfish |
| **Weeping Carp** `weeping_carp` | uncommon | any | 0.35–1 | — | 1.5–5.5 | 15 / 26 / 20 | sinker | 1.02 · 8.84 · 1.05 · 8.05 · 1.1 · 0.07 · 0.9 | carp |
| **Candlefin Koi** `candlefin_koi` | uncommon | calm | 0.25–0.85 | — | 0.8–3 | 18 / 18 / 28 | darter | 0.77 · 3.12 · 0.52 · 7 · 1.1 · 0.27 · 0.9 | koi |
| **Reedjaw Pike** `reedjaw_pike` | rare | any | 0.55–1 | — | 2.5–9 | 34 / 30 / 26 | thrasher | 1.26 · 6.31 · 1.8 · 9.5 · 0.95 · 0.25 · 0.75 | pike |
| **Gloam Eel** `gloam_eel` | rare | gloom | 0.4–1 | `lumen_moss` | 1–4 | 42 / 22 / 36 | leaper | 1.15 · 4.29 · 0.96 · 9.5 · 0.9 · 0.3 · 0.75 | eel |
| **The Belled Matriarch** `belled_matriarch` | legendary | calm | 0.8–1 | `heartmoss` | 12–30 | 140 / 60 / 60 | steady | 1.32 · 5.31 · 1.38 · 18.05 · 0.84 · 0.25 · 0.64 | carp |

**Sporewood Pools** (`sporewood`)

| species | rarity | time | depth | bait | kg | value / food / oil | behaviour | power · surgeEvery · surgeTime · stamina · sweet · erratic · window | shape |
|---|---|---|---|---|---|---|---|---|---|
| **Sporebelly Puffer** `sporebelly_puffer` | common | any | 0–0.6 | — | 0.2–0.9 | 13 / 22 / 26 | thrasher | 0.94 · 5.72 · 1.42 · 7 · 1.1 · 0.17 · 0.9 | puffer |
| **Plumgill Perch** `plumgill_perch` | common | any | 0.15–1 | — | 0.4–1.8 | 14 / 26 / 24 | steady | 0.85 · 5.2 · 0.95 · 7 · 1.1 · 0.12 · 0.9 | perch |
| **Capshell Crayfish** `capshell_crayfish` | common | any | 0–0.45 | — | 0.2–0.9 | 12 / 26 / 22 | sinker | 1.02 · 8.84 · 1.05 · 8.05 · 1.1 · 0.07 · 0.9 | crayfish |
| **Velvet Ray** `velvet_ray` | uncommon | any | 0.35–0.9 | — | 2–7 | 32 / 30 / 28 | leaper | 1.15 · 4.29 · 0.96 · 9.5 · 0.9 · 0.3 · 0.75 | ray |
| **Threadling Eel** `threadling_eel` | uncommon | any | 0.3–0.85 | `spore_cake` | 0.5–2.2 | 34 / 22 / 36 | darter | 0.77 · 3.12 · 0.52 · 7 · 1.1 · 0.27 · 0.9 | eel |
| **Mildew Angler** `mildew_angler` | rare | gloom | 0.5–1 | — | 3–10 | 66 / 34 / 40 | sinker | 1.38 · 7.14 · 1.32 · 10.93 · 0.95 · 0.15 · 0.75 | angler |
| **Sleepspore Jelly** `sleepspore_jelly` | rare | calm | 0.2–0.75 | `lumen_moss` | 0.4–1.5 | 62 / 14 / 46 | darter | 1.03 · 2.76 · 0.66 · 9.5 · 0.95 · 0.35 · 0.75 | jelly |
| **The Drifting Grove** `drifting_grove` | legendary | calm | 0.8–1 | `glowcap_bulb` | 20–45 | 320 / 70 / 70 | leaper | 1.73 · 5.21 · 1.38 · 23.75 · 0.67 · 0.45 · 0.53 | ray |

**Glasswater Vault** (`glasswater`)

| species | rarity | time | depth | bait | kg | value / food / oil | behaviour | power · surgeEvery · surgeTime · stamina · sweet · erratic · window | shape |
|---|---|---|---|---|---|---|---|---|---|
| **Prism Minnow** `prism_minnow` | common | any | 0–0.6 | — | 0.05–0.3 | 24 / 26 / 32 | darter | 0.77 · 3.12 · 0.52 · 7 · 1.1 · 0.27 · 0.9 | minnow |
| **Glassgill Perch** `glassgill_perch` | common | any | 0.15–1 | — | 0.5–2 | 28 / 32 / 30 | steady | 1.15 · 4.9 · 1.2 · 9.5 · 0.95 · 0.2 · 0.75 | perch |
| **Glassblown Puffer** `glassblown_puffer` | common | any | 0–0.55 | — | 0.3–1.2 | 26 / 28 / 34 | thrasher | 1.26 · 6.31 · 1.8 · 9.5 · 0.95 · 0.25 · 0.75 | puffer |
| **Chime Jelly** `chime_jelly` | uncommon | calm | 0.25–0.85 | `glass_larva` | 0.5–2 | 56 / 18 / 50 | darter | 1.03 · 2.76 · 0.66 · 9.5 · 0.95 · 0.35 · 0.75 | jelly |
| **Mirror Pike** `mirror_pike` | uncommon | any | 0.5–1 | — | 3–10 | 62 / 38 / 40 | darter | 1.35 · 3.15 · 0.83 · 12.5 · 0.8 · 0.45 · 0.62 | pike |
| **Shardspine Eel** `shardspine_eel` | rare | gloom | 0.4–1 | — | 2–6 | 130 / 36 / 56 | thrasher | 1.65 · 7.33 · 2.25 · 12.5 · 0.8 · 0.35 · 0.62 | eel |
| **The Blind Scrivener** `blind_scrivener` | rare | any | 0.6–1 | `ember_roe` | 4–12 | 120 / 44 / 52 | sinker | 1.8 · 5.95 · 1.65 · 14.37 · 0.8 · 0.25 · 0.62 | angler |
| **The Glass Sovereign** `glass_sovereign` | legendary | gloom | 0.8–1 | `prism_moth` | 18–40 | 600 / 80 / 90 | leaper | 2 · 5 · 1.3 · 30 · 0.6 · 0.5 · 0.45 | koi |

**The Pallid Deep** (`paleabyss`)

| species | rarity | time | depth | bait | kg | value / food / oil | behaviour | power · surgeEvery · surgeTime · stamina · sweet · erratic · window | shape |
|---|---|---|---|---|---|---|---|---|---|
| **Ossuary Fry** `ossuary_fry` | common | any | 0–0.6 | — | 0.05–0.3 | 42 / 32 / 40 | darter | 1.03 · 2.76 · 0.66 · 9.5 · 0.95 · 0.35 · 0.75 | minnow |
| **Pallid Wraithfin** `pallid_wraithfin` | common | any | 0.1–1 | — | 0.4–2 | 48 / 38 / 42 | steady | 1.15 · 4.9 · 1.2 · 9.5 · 0.95 · 0.2 · 0.75 | ghost |
| **Bonecrook Crayfish** `bonecrook_crayfish` | common | any | 0–0.5 | — | 0.3–1.2 | 44 / 40 / 36 | sinker | 1.38 · 7.14 · 1.32 · 10.93 · 0.95 · 0.15 · 0.75 | crayfish |
| **Gilt-Eyed Eel** `gilt_eyed_eel` | uncommon | any | 0.4–1 | — | 2–7 | 92 / 40 / 56 | thrasher | 1.65 · 7.33 · 2.25 · 12.5 · 0.8 · 0.35 · 0.62 | eel |
| **Shroud Ray** `shroud_ray` | uncommon | any | 0.45–1 | — | 4–12 | 88 / 44 / 48 | leaper | 1.5 · 4.81 · 1.2 · 12.5 · 0.76 · 0.4 · 0.62 | ray |
| **Funeral Veil** `funeral_veil` | rare | gloom | 0.3–0.9 | — | 0.8–3 | 190 / 24 / 74 | darter | 1.35 · 3.15 · 0.83 · 12.5 · 0.8 · 0.45 · 0.62 | jelly |
| **Lampwarden Angler** `lampwarden_angler` | rare | gloom | 0.6–1 | `ember_roe` | 6–16 | 210 / 50 / 70 | sinker | 2.34 · 6.82 · 2.04 · 18.4 · 0.68 · 0.35 · 0.52 | angler |
| **The Pale Leviathan** `pale_leviathan` | legendary | gloom | 0.85–1 | `pale_marrow` | 120–300 | 2500 / 100 / 150 | sinker | 2.5 · 6.2 · 1.8 · 44 · 0.62 · 0.55 · 0.45 | leviathan |

**Model params** (models.createFish): `shape` ∈ FISH_SHAPES; `body / belly / fin` hex colours; `glow` hex or null (no emissive); `pattern` ∈ scales · stripes · bands · spots · none; `eyes` ∈ normal · glow · blind; `scale` 1.0 ≈ a 40 cm fish at mid weight (legendaries 2.0–3.5).

**Behaviours.** *steady*: none. *darter*: short, frequent surges (0.5 s warning), the sweet band jumps sideways after each surge. *sinker*: heavy constant pull (+0.06·pw/LS tension), band sits 0.08 low. *thrasher*: long, violent surges (strength 1.3). *leaper*: surges are **leaps**: tension collapses, so **hold** through them or go slack.

### 5.5 The reel tension model (per frame, `BALANCE.reel`)
Inputs: `holding` (pointer held), `sp = species.difficulty`, `LS = stats.lineStrength`, `RS = stats.reelSpeed × (starving ? 0.75 : 1)`. State: tension `T`, its velocity `vT`, progress `P`, slack timer `slackT`, surge state, band centre `c`.
```
pw  = sp.power × (1 − tire·P·tireOn) × (enraged ? 1.25 : 1)       // tireOn: always, except legendaries before their last phase
str = strength[behavior]  (steady 1, darter 0.6, sinker 1, thrasher 1.3, leaper 1)
if leaping:        target = holding ? +0.25·pw/LS : −0.90
elif holding:      target = 0.42·pw·(surging ? 2.2·√str : 1) / LS
elif surging:      target = 0.18·pw·str / (LS·surgeDuration)       // released in a surge: a fixed total creep
else:              target = −0.55 / (0.8 + 0.2·pw)                 // easing off; strong fish ease slower
target += sp.erratic · 0.22 · noise1(1.5 Hz smooth value noise in [−1, 1])
if sinker:         target += 0.06·pw/LS
vT += (target − vT)·(1 − e^(−9·dt));   T = max(0, T + vT·dt)       // ≈ 110 ms easing: readable on touch
```
Reference: a Mossmere common at base gear rises ≈ 0.23–0.30/s while holding and falls ≈ 0.6/s when released; the Pale Leviathan with Silverthread (LS ≈ 1.9) rises ≈ 0.55/s, the feel of a Mossmere uncommon at base gear. Gear buys back control.

**Bands.**
```
safe band  = [0.15, 0.85]
w = clamp(stats.sweetZone × sp.sweet × phaseShrink, 0.05, 0.40)
c = 0.5 + A·sin(ω·t + φ) + 0.08·erratic·noise2(t) + (sinker ? −0.08 : 0) + darterOffset
    A = 0.08 + 0.14·erratic,   ω = 0.5 + 0.9·erratic rad/s,   φ random per fight
    darter: at each surge end, darterOffset jumps ±U(0.10, 0.18) over 0.3 s
c = clamp(c, 0.15 + w/2, 0.85 − w/2)
```
**Progress.**
```
if holding and 0.15 ≤ T ≤ 0.85:   P += dt · RS / sp.stamina · (|T − c| ≤ w/2 ? 2 : 1)
if T < 0.15:                       P −= 0.04·dt                 // slack: the fish swims off
if surging && !leaping && !holding: P −= 0.015·dt               // a well-managed surge costs little
P ≥ 1 → state 'landing' for 1.2 s (the fish thrashes up to the raft) → fishing:caught {speciesId, weight, quality}
```
**Fail states.**
- **Snap**: `T ≥ 1.0` continuously for ≥ 0.12 s → `fishing:escaped {reason:'snap'}` (the grace absorbs frame hitches).
- **Slack**: `T < 0.08` adds dt to `slackT`, otherwise `slackT` decays at 2×dt; `slackT ≥ stats.slackTime` → `fishing:escaped {reason:'slack'}`.
- **Start**: `T = 0.35, P = 0.10`; a perfect hook starts at `P = 0.22` and delays the first surge by a further 1.5 s.

**Surges.**
```
warn  = darter ? 0.5 : max(0.5, 0.9 − 0.2·erratic);     enraged: max(0.55, warn − 0.15)
every = max(sp.surgeEvery × (enraged ? 0.75 : 1), (sp.surgeTime + warn) / 0.42)   // ≥ 58% of a fight is reelable
first surge after every·U(0.75, 1.25) + 1.5 s;  later surges every·U(0.75, 1.25) after the previous one ends
```
During the warning `view.surgeWarn` ramps 0 → 1, telegraphed on three channels: the gauge outline pulses red, the line shivers (+ `line_strain`), and the phone vibrates. Then `fishing:surge {strength: pw·str}` for `sp.surgeTime·U(0.85, 1.15)` s. Optional extension `view.surgeKind: 'pull' | 'leap' | 'dive'` lets the UI draw red ▼ "ease" or white ▲ "hold". Holding through a pull surge keeps progress coming but tension rockets (×2.2): that only pays with a strong line, which is where skill and gear meet.

**Gear curve the species are tuned against** (on-curve player arriving in each lake): lineStrength 1.0 / 1.15 / 1.3 / 1.45 (the Leviathan wants ≥ 1.7: Silverthread), reelSpeed 1.0 / 1.15 / 1.3 / 1.45, sweetZone 0.16 / 0.17 / 0.18 / 0.2, castMax 16 / 19 / 22 / 22+. One tier under, rares are a coin flip and fights take twice as long; two tiers under is a wall. Boons (Steady Reel, Hungry Waters, Lucky Knot) let a fisher build close the gap.

### 5.6 Legendaries (boss fights)
**The legend rule (no RNG frustration).** The legendary bites — guaranteed — when **all three** hold: (1) the lake's legend bait is equipped, (2) the legendary's time window is active (`calm` = any phase except gloomtide; `gloom` = gloomtide), (3) the bobber lands inside the lake's **legend pool** (`arena.legendPool`, radius 3.2 m). Wait = W × 0.7, then exactly two nibbles, then the bite. On hook: the banner "{name}: {epithet}", boss music, the legend bait is consumed. A missed hook-set keeps the bait.

**Visibility.** The legend pool is always drawn as a faint ring of unnaturally still water. When you own its bait and the time is right, it raises a column of slow golden motes visible from anywhere, gets an edge marker, and shows the toast "A golden stillness gathers far out…" once per day.

**Shared fight rules.** Legendaries don't tire until their final phase; phases trigger on progress P; after `enrage` seconds of fighting: power ×1.25, surge interval ×0.75, warnings shortened (min 0.55 s). During a legendary fight a hand slam does **not** snap the line: it deals its damage and spikes tension +0.25 instead. While a legendary is hooked no **new** elite hands rise (`BALANCE.combat.legendPausesElites`; its own summons still come), and a gloom-time fight holds the Gloomtide open until it resolves (the hush spawns nothing): an anchored Wick cannot dodge, so the fish must be the fight.

**Wounded.** If a legendary escapes: `run.flags.wounded[id] = min(0.4, 0.5 × P at escape)`; its next hook starts at that progress, gets +0.1 s on the hook window, and the pool goes dim for 20 s.

| legendary | zone · time · bait | enrage | phases (at progress P) | cue |
|---|---|---|---|---|
| **The Belled Matriarch** | mossmere · calm · `heartmoss` | 60 s | 0: *The Slow Toll* (none)<br>0.4: *Double Toll* (doubleSurge)<br>0.75: *Last Toll* (shrink) | A bell tolls beneath the raft before every surge. |
| **The Drifting Grove** | sporewood · calm · `glowcap_bulb` | 75 s | 0: *Grazing* (none)<br>0.35: *False Bloom* (decoy)<br>0.7: *Spore Veil* (flicker) | Spores burst from the water whenever she breaches. |
| **The Glass Sovereign** | glasswater · gloom · `prism_moth` | 90 s | 0: *Glide* (none)<br>0.35: *Glass Glide* (mixedSurge)<br>0.7: *Brittle Line* (brittle) | The whole Vault rings like struck glass. The swarm keeps coming (spawn rate × legendFightRateMult). |
| **The Pale Leviathan** (final) | paleabyss · gloom · `pale_marrow` | 110 s | 0: *Deep Pull* (drag)<br>0.25: *Grasping Dark* (summon)<br>0.5: *Eclipse* (eclipse)<br>0.8: *Last Breath* (shrink) | The water goes very still. The Ferryman cannot rise while it is hooked. Landing it ends the Gloomtide and wins the run. |

Phase mechanics in detail:
- **The Belled Matriarch** (Mossmere, calm). *Slow Toll* (0–0.4): regular surges, each preceded by a bell toll under the raft (sound + expanding ring). *Double Toll* (0.4–0.75): surges come in pairs 0.9 s apart, each with its own 0.5 s warning. *Last Toll* (0.75–1): the sweet band shrinks linearly to 0.6× by P = 1; tiring resumes at P 0.9.
- **The Drifting Grove** (Sporewood, calm). *Grazing* (0–0.35): leaps (hold). *False Bloom* (0.35–0.7): a decoy band (pink, 1.4× wider, glowing) appears beside the true band (amber with bone-white filigree); the decoy gives 0 progress; they swap sides on every surge. *Spore Veil* (0.7–1): every 8 s both bands flicker out for 1.5 s; read the line-strain audio and the Wick's strain pose.
- **The Glass Sovereign** (Glasswater, **gloomtide**). *Glide* (0–0.35): leaps (hold). *Glass Glide* (0.35–0.7): surges mix leaps (white ▲ HOLD) and dives (red ▼ RELEASE) with a 0.8 s shape-and-colour tell. *Brittle Line* (0.7–1): snap threshold drops to 0.92, and the sweet band splits into two drifting shards (0.6× width each; both count). The swarm keeps coming at ×0.65 rate: a night fight.
- **The Pale Leviathan** (Pallid Deep, **gloomtide**, final). *Deep Pull* (0–0.25): constant drag +0.08, band 0.10 low. *Grasping Dark* (0.25–0.5): summons two Ringed Grasp hands 4 s apart with full telegraphs; flare or zap them while holding (a second finger on touch). *Eclipse* (0.5–0.8): light ×0.5, alternating thrash (▼) and breach (▲) every 3 s with 0.6 s warnings. *Last Breath* (0.8–1): band shrinks to 0.6×, progress decay ×2 outside the safe band. **No slack escape in phases I–III**: slack makes it dive instead (P −0.12, T reset to 0.35); from *Last Breath*, slack can lose it. The Ferryman cannot rise while it is hooked. Landing it: `killAll('dawn')`, the phase jumps to dawn, every memorial candle in the Deep lights gold from the raft outward, `victory`.

### 5.7 Feeding spots (`BALANCE.spots`)
- Count: 2–4 during calm/dusk/dawn, 1–2 during the gloomtide. Each lives 45–75 s (fading over its last 5 s); a replacement appears 8–16 s after one ends.
- Placement: `world.randomWaterPoint({from: raft, minDist: 10, maxDist: 45, depthMin: 0.2, clearance: 3})`.
- In-spot (bobber within 2.6 m): wait × 0.55, +0.10 rarity, +0.08 quality score. **Rare spots** (0.15 chance, violet-gold): +0.25 rarity, +0.15 quality.
- A catch from a spot depletes it (ttl → min(ttl, 8 s)).
- Visual: a 6 m column of shimmering motes drawn without fog (visible across the lake), ripple rings, circling fish silhouettes. Edge markers for the nearest two.
- **Tide Chart** supply: two rare spots appear immediately and last until dusk.

### 5.8 Weight & quality (`BALANCE.economy`, `QUALITY`)
```
t = U^(1.6 / (1 + bait.weightBias))           // big fish are rare: record hunting
weight = w_min + (w_max − w_min)·t;   sizeK = 0.75 + 0.5·t
q = timeInSweet / max(1, timeHoldingInSafe) + (perfectHook ? 0.15 : 0) − 0.10 × secondsAbove(T 0.85)
    + spotQuality + bait.shimmer + relic shimmer
tier = q ≥ 0.78 → perfect ("Shimmering") | q ≥ 0.45 → fine | normal; then a luck bump of one tier with QUALITY[next].chance
```
| quality | label | q threshold | value × | food & oil × | luck bump chance |
|---|---|---|---|---|---|
| `normal` | Common | 0 | 1 | 1 | 0 |
| `fine` | Fine | 0.45 | 1.4 | 1.1 | 0.05 |
| `perfect` | Shimmering | 0.78 | 2.5 | 1.25 | 0.01 |

Shimmering fish sparkle (`setGlow`), count for the *Shimmering* challenge, and sell for ×2.5.

### 5.9 Night fishing
Allowed and valuable: gloom-only species pay the most in every lake, and the *Night Angler* challenge and *Lantern on the Line* boon reward it. While hooked you are a sitting target: spawn rate ×0.8 (×0.65 for a legendary), your aura and weapons keep working, and taps zap. **The slack budget:** releasing at T ≈ 0.5 lets tension fall to 0.08 in ≈ 0.8 s, then slackTime (1.6 s) gives ≈ 2.4 s to zap one or two gloomlings before the fish slips. A non-legendary line is snapped by a hand slam. Cut the line (hold movement 0.6 s) to bail out.

### 5.10 `fishing.view` mapping
`charge`, `castDist`, `aim` (yaw), `tension = T`, `sweetMin = c − w/2`, `sweetMax = c + w/2`, `danger = max(smoothstep(0.72, 1.0, T), slackT / slackTime)` (0..1), `progress = P`, `surge` (0/1), `surgeWarn` (0..1), `stamina = 1 − P`, `biteWindow` (fraction of the hook window left), `speciesId` (after the hook; during a legendary banner), `rarity`, `hint` (depth label while charging, phase name in boss fights). Optional extensions: `surgeKind`, `decoyMin/decoyMax` (False Bloom), `shards` (Brittle Line), `bandsHidden` (Spore Veil).

---

## 6. Survival

### 6.1 Day phases
`survival.getPhaseInfo()`: `calm → dusk → gloomtide → dawn → (day+1) calm`. Durations from `BALANCE.phases`; the gloomtide lasts `gloomtideLength(day) = min(120, 90 + 6·(day−1))` s (data.js exports it). `phase:change {phase, prev, day}` on every transition; `day:start {day}` at each calm from day 2. Debug: `skipPhase()`, `setPhase(name)`, `god(on)`.

### 6.2 Drains (`BALANCE.drain`)
```
oil/s     = stats.oilDrain × oilPhase[phase] × zone.drain.oil × diff.drainMult      oilPhase: calm 1.0, dusk 1.3, gloomtide 1.8, dawn 0.5
satiety/s = stats.satietyDrain × zone.drain.satiety × diff.drainMult               (no phase multiplier)
```
`diff` = `difficultyFor(day, zoneIndex, k)` (drainMult = 1 + 0.04·Heat). Day-1 passive need in the Mossmere: ≈ 43 oil (17 of it in the calm) and ≈ 23 satiety, i.e. about 2 rendered and 1 eaten fish, before combat spending.

### 6.3 The light
The light radius and aura are specified in §8.1 (they are combat). Survival owns the value: `survival.lightRadius` each frame, `actors.setLanternLevel(oil/maxOil)`, `actors.setLightRadius(r)`, `actors.setVitality(hp/maxHp)`.

### 6.4 Damage, i-frames, armor (`BALANCE.damage`)
- **Contact**: an enemy within 1.8 m of the raft centre (walking build: 1.6 m and |Δy| ≤ 1.6 m of the Wick on foot, §24.8) (or an AoE ability) calls `survival.damage(n, source)`. `n = max(1, floor(enemy.damage × diff.damageMult))`, Wardens capped at 3. Enemies with damage 0 (moths, inkwell bodies) never cost Embers.
- **Oil on contact**: `enemy.oilDrain × diff.drainMult` (per second while latched or gripping).
- **Armor**: one roll per Ember-damage event: `random < stats.armor` (cap 0.6) → "Warded" float text, no Ember lost; the oil drain still applies.
- **I-frames**: 1.2 s after losing an Ember (Tallow +0.6). Contacts during i-frames drain 50% oil and no Embers. The Wick flickers.
- **Gutter-burst** (free, automatic): every Ember lost releases a radial knock, radius 4 m, push 5 m, stun 0.5 s, 0 damage, no oil, no flare cooldown. Hearts-based health needs this, or a pile-up turns five Embers into five seconds.
- **Fodder bursts on contact** (gloomling, inkmite, sporeling, choir) and drops **no cinder**, so leaks also cost growth.
- **Starvation** (satiety 0): 5 s grace, then 1 Ember every 20 s (cause `starvation`); while starving reelSpeed ×0.75 and hookWindow ×0.85.
- **Darkness** (oil 0): first, **Last Flicker**: the first time oil reaches 0 each day, the brazier coughs back +12 oil (toast) and the lantern stays lit. Otherwise `lantern:out`: light shrinks to a 2.5 m ember glow, the aura stops, enemies move ×1.3 and spawn ×1.3, flares are impossible, zaps burn 4 satiety for 50% damage ("wax zap"); after 3 s grace, 1 Ember every 8 s (cause `darkness`). Any oil > 0 (render a fish, a drip, Murk) → `lantern:lit`.

### 6.5 Healing (`BALANCE.heal`)
| source | amount |
|---|---|
| Dawn | `stats.dawnHeal` (base 1), +1 if satiety ≥ 70% ("Well-fed") |
| Kindling Heart (boon) | +1 max and +1 now |
| Undying Ember (legendary boon) | +2 max and +2 now |
| Heartwax (Warden kill) | +1 max Ember for the rest of the run (`run.flags.heartwax`, added by getStats) and +1 now; only the **first** kill of each Warden per run (`BALANCE.heal.heartwaxOnce`) |
| Wax Patch (Murk) | +1, one per visit |
| A Warm Breath (fallback card) | +1 |

### 6.6 Warnings
`resource:low` edges with hysteresis: oil ≤ 25% (re-arm above 35%), satiety ≤ 20% (re-arm 30%), hp ≤ 2 Embers. **Dusk forecast**: at dusk start, if `oil < oilDrain × 1.8 × zone.drain.oil × drainMult × gloomtideLength + 10`, toast (bad) "Your lantern won't last the Gloomtide." Heartbeat audio at hp ≤ 2.

### 6.7 Death & Second Wick
hp ≤ 0 → if the *Second Wick* relic is owned and unused this run (`progression.tryRevive?.()`, optional extension): revive at 1 Ember, oil = max(oil, 40), a free flare burst, 2 s i-frames, toast. Otherwise `player:died {cause}` with cause `gloom` (enemy), `darkness` or `starvation`.

### 6.8 Anti-frustration (never unwinnable)
- A bare hook is always free; the rod never breaks; no debt; supplies never sell out.
- Last Flicker once a day; wax zaps at 0 oil; darkness ticks only every 8 s (time to land and burn a fish).
- **Pity bites**: at hp ≤ 2 or oil ≤ 15%, bite wait ×0.7 and +0.1 rarity.
- **Murk's Pity**: once per run, if shells < 20 and oil < 25% when Murk arrives, he gifts 30 oil and 30 satiety.
- Every damage source is telegraphed; off-screen elites and Wardens show an eye glyph at the screen edge; the last 7% of every Gloomtide spawns nothing (the hush).
- The death screen names the top damage source with one actionable tip ("Gloomlings reached you 6 times. Brighter Wick widens your light.").

---

## 7. Night swarm: director, enemies, elites, Wardens

### 7.1 The one-number model: Gloom Heat
```
H = (day − 1) + 3 × zoneIndex + max(0, nightInZone − 4)        // linger: +1 per night beyond a lake's 4th
```
Each night adds 1. Descending adds 3, like skipping three nights at once. Staying keeps H climbing while XP falls behind the level curve, so camping is allowed but discouraged; descending is a real decision about whether your build is ready. A Waystone start begins on day 1 at H = 3z with banked levels (§17.3). **Linger** (`director.lingerFrom` 4, `lingerHeat` 1): from a lake's 5th night each further night adds +1 more Heat, so camping the Mossmere ends around day 15 even for a strong build (balance sim) and earns ~45% fewer Memories per minute than descending. `heatFor(day, zoneIndex, nightInZone)` takes the night count; without it the night is assumed on-pace (= day in the first lake, no linger deeper).

### 7.2 The director: `difficultyFor(day, zoneIndex, k, {nightInZone})`
```
L          = gloomtideLength(day);  t = k·L
shape(k)   = k < 0.12 → 0.5 (build-up) | k ≥ 0.93 → 0 (hush) | else (k ≥ 0.80 ? 1.4 : 1) × (1 + 0.25·sin(2π·t/20))
spawnRate  = 0.75 × zone.gloom × (1 + 0.12·H) × shape(k)        individuals / s   (zone.gloom 1.0 / 1.13 / 1.27 / 1.4)
maxAlive   = min(150, 30 + 6·H)
hpMult     = 1 + 0.24·H + 0.025·H²
bossHpMult = 1 + 0.30·H                                           (Wardens only: hp = base × bossHpMult)
speedMult  = min(1.45, 1 + 0.03·H)
damageMult = 1 + 0.5·floor(H/12)         → Embers per hit = max(1, floor(base × damageMult)), Wardens ≤ 3
drainMult  = 1 + 0.04·H
eliteEvery = day < 2 ? 0 : max(22, 42 − 2·H) s, first elite at k = 0.25; paused while a Warden lives or a legendary is hooked
boss       = nightInZone % 3 == 0 ? zone.warden : null           (nightInZone falls back to day)
xpScale    = 1 + 0.10·H                                           (× every cinder)
kinds      = [{id, w}] of available non-elite enemies;  elites = [{id, w}]
```
`nightInZone` = Gloomtides since the last `zone:change`, 1-based (combat counts it; optional 4th argument). Descending before a lake's third night skips its Warden: faster, but you lose its rewards.

**Spawning.** Each frame of the gloomtide: `credit += spawnRate × dt × (darkness ? 1.3 : 1) × (hooked ? 0.8 : 1) × (legendary hooked ? 0.65 : 1) × (Warden alive ? 0.6 : 1) × (1 + bait.gloomDraw)`. While `credit ≥ 1`: pick a kind by weight; pack size = `pack` (inkmite: +1 per 3 H, max 10); if `alive + pack > maxAlive` or the kind's own `maxAlive` (+`maxAlivePerHeat`·H) is reached, defer (credit is capped at 10); otherwise spawn and subtract the pack size. An enemy's availability: `zoneIndex > zoneMin`, or `zoneIndex == zoneMin && day ≥ dayMin`.

**Placement.** `world.randomWaterPoint({from: raft, minDist: 22, maxDist: 34, clearance: 1})` (`depthMin: 0.4` for eels); at most 35% behind the camera (+Z half); packs spread 2.5 m; 12 ring samples, then any water ≥ 18 m away, so hugging the shore naturally narrows the spawn arc. Spawns fade up from a ripple over 0.6 s.

**Dusk scouts.** Rate × 0.3 of the k = 0.5 rate, max 6 alive, gloomlings only (sporelings in Sporewood and deeper). **Calm stragglers**: from lake index ≥ 1 or day ≥ 5, one creelsnatch raid per calm at k ∈ [0.3, 0.8], only if the creel holds fish. **Dawn**: `killAll('dawn')`: everything dissolves without drops; lying cinders auto-collect; a living Warden withdraws (no reward, no penalty).

| day | zone | night in lake | Heat H | gloomtide s | ≈ spawns/night | maxAlive | hpMult | Warden hp × | speedMult | damageMult | drainMult | eliteEvery s | xpScale |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | mossmere | 1 | 0 | 90 | 61 | 30 | 1 | 1 | 1 | 1 | 1 | — | 1 |
| 2 | mossmere | 2 | 1 | 96 | 75 | 36 | 1.265 | 1.3 | 1.03 | 1 | 1.04 | 40 | 1.1 |
| 3 | mossmere | 3 | 2 | 102 | 87 | 42 | 1.58 | 1.6 | 1.06 | 1 | 1.08 | 38 | 1.2 |
| 4 | mossmere | 4 | 3 | 108 | 100 | 48 | 1.945 | 1.9 | 1.09 | 1 | 1.12 | 36 | 1.3 |
| 5 | mossmere | 5 | 5 | 114 | 126 | 60 | 2.825 | 2.5 | 1.15 | 1 | 1.2 | 32 | 1.5 |
| 6 | mossmere | 6 | 7 | 120 | 154 | 72 | 3.905 | 3.1 | 1.21 | 1 | 1.28 | 28 | 1.7 |
| 8 | mossmere | 8 | 11 | 120 | 194 | 96 | 6.665 | 4.3 | 1.33 | 1 | 1.44 | 22 | 2.1 |
| 4 | sporewood | 1 | 6 | 108 | 143 | 66 | 3.34 | 2.8 | 1.18 | 1 | 1.24 | 30 | 1.6 |
| 6 | sporewood | 3 | 8 | 120 | 185 | 78 | 4.52 | 3.4 | 1.24 | 1 | 1.32 | 26 | 1.8 |
| 8 | glasswater | 1 | 13 | 120 | 272 | 108 | 8.345 | 4.9 | 1.39 | 1.5 | 1.52 | 22 | 2.3 |
| 9 | glasswater | 2 | 14 | 120 | 285 | 114 | 9.26 | 5.2 | 1.42 | 1.5 | 1.56 | 22 | 2.4 |
| 11 | paleabyss | 1 | 19 | 120 | 384 | 144 | 14.585 | 6.7 | 1.45 | 1.5 | 1.76 | 22 | 2.9 |
| 13 | paleabyss | 3 | 21 | 120 | 412 | 150 | 17.065 | 7.3 | 1.45 | 1.5 | 1.84 | 22 | 3.1 |

*Spawns/night integrates `spawnRate` over the whole gloomtide (pack members counted individually). Mossmere rows assume the Wick never left (from night 5 the linger term adds Heat); deeper rows assume a typical arrival day (Sporewood day 4, Glasswater day 8, Pallid Deep day 11); boss nights follow `nightInZone`.*

### 7.3 Formations
From day 2, at gloomtide k = 0.35 and k = 0.65, one weighted pick each (skipped while a Warden lives). Each shows a small banner. They teach the counters.

| formation | from | composition | banner | the answer it teaches |
|---|---|---|---|---|
| **The Closing Ring** `encircle` | The Mossmere, day 2 | gloomling (sporeling in Sporewood): {base:10,perHeat:2}, ring 18 m | They close in a ring. | Flare a gap, or burn through with area weapons. |
| **Mite Tide** `tide` | The Mossmere, day 2 | inkmite: {packs:[3,4],packSize:{base:18,perHeat:1}}, speed ×1.25 | A tide of mites sweeps in. | Sail perpendicular to it. |
| **The Dimming** `dimming` | The Mossmere, day 3 | duskmantle: {base:5,perHeatHalf:1} | Wings, from one side. | Zap them off, or flare. |
| **Inkwell Volley** `volley` | Sporewood Pools, day 1 (Mossmere day 6) | weeping_inkwell: {base:3}, ring 16 m | Grief, from three sides. | Keep moving and hunt them down. |
| **Bell-Jar Procession** `procession` | Glasswater Vault, day 1 | belljar_tick: {min:4,max:6}, escort inkmite | Glass, clinking in a line. | Weapons and zaps, not the aura. Kite them. |
| **The Hush** `hush` | The Pallid Deep, day 1 | silent_choir: {trios:3}, light ×0.8 for 8 s | The light thins. Something is listening. | Keep oil above a third. The beam reveals them. |

### 7.4 The roster
`hp`/`speed` are base values (× hpMult / speedMult at spawn). Embers = damage per hit before damageMult. Inside the light enemies move ×0.75 (moths ×1.15). Cinders = xp × xpScale × stats.xpMult.

| enemy | model | from | hp | speed | Embers | oil | cinders | pack | bag weight z0/z1/z2/z3 | behaviour |
|---|---|---|---|---|---|---|---|---|---|---|
| **Gloomling** `gloomling` | wisp | The Mossmere, day 1 | 4 | 2.6 | 1 | 2 | 1 | 1 | 10 / 6 / 4 / 3 | chase |
| **Inkmite** `inkmite` | mite ×0.8 | The Mossmere, day 2 | 1.5 | 3.9 | 1 | 1 | 0.5 | 6 (+1 per 3 H, ≤10) | 5 / 4 / 3 / 2 | pack |
| **Duskmantle** `duskmantle` | moth | The Mossmere, day 2 | 3 | 3.4 | 0 | 1.2/s latched | 2 | 1 | 3 / 3 / 2.5 / 2 | latch |
| **Creelsnatch** `creelsnatch` | eel | The Mossmere, day 3 | 8 | 4.5 | 1 | 0 | 3 | 1 | 2 / 2 / 2 / 1.5 | leap |
| **Sporeling Drift** `sporeling` | wisp | Sporewood Pools, day 1 | 6 | 2.8 | 1 | 2 | 1.5 | 3 | 0 / 6 / 3 / 2 | orbitDive |
| **Weeping Inkwell** `weeping_inkwell` | wisp ×1.5 | The Mossmere, day 6 | 11 | 1.8 | 0 | 0 | 4 | 1 | 1.5 / 2.5 / 2.5 / 2 | artillery |
| **Bell-Jar Tick** `belljar_tick` | mite ×2 | Sporewood Pools, day 8 | 28 | 1.7 | 1 | 3 | 5 | 2 | 0 / 1.5 / 3 / 2.5 | bulwark |
| **Silent Choir** `silent_choir` | wisp ×1.1 | Glasswater Vault, day 12 | 7 | 2.8 | 1 | 4 | 2 | 3 | 0 / 0 / 1.5 / 6 | stalk |
| **Drowned Hand** `drowned_hand` | hand | The Mossmere, day 2 | 60 | 0 | 2 | 10 | 15 | 1 | elite timer | slam |

**Behaviours and telegraphs** (every hit is readable):
- **Gloomling** (`chase`, flies). Drifts in on a gentle weave with 0.9 m separation. At 3 m it **pauses 0.35 s with its eyes flaring white**, then lunges at ×2.5 speed for 0.5 s. Bursts on contact. The aura alone holds them for about two nights at full oil (§8.2).
- **Inkmite** (`pack`, water-bound). Packs of 6 (+1 per 3 Heat, max 10) with boids flocking and ±1.2 m/s zig-zag. Fast; islands and chokepoints break packs; AoE answers them. Per-lake re-skins: Spore Tick, Shard Mite, Ash Mite.
- **Duskmantle** (`latch`, flies). Erratic flutter toward the lantern; **speeds up ×1.15 inside the light**. Up to 4 latch on: each multiplies the light radius by 0.88 (total floor 0.5) and drains 1.2 oil/s; the aura burns latched moths at 50%. A zap peels one off (+1 oil refund); a flare clears all. The death-spiral accelerant. Re-skins: Veil Moth (Glasswater), Pyrewing (Pallid Deep).
- **Creelsnatch** (`leap`, eel). Spawns only at depth ≥ 0.4. Circles 6–9 m out, submerged (immune to the aura) for 3–6 s, then **surfaces for 1.0 s** (eyes glow, hiss, tightening ripple ring) and leaps across the raft (0.6 s airborne, **zap ×2**). Crossing the raft costs 1 Ember and **steals** a random non-legendary fish (`progression.removeFromCreel()`, `enemy:steal`), then it flees for 3 s; kill it to drop the fish, floating for 20 s. Glasswater re-skin *Prism Eel*: its first leap is a 0.8 s feint splash.
- **Sporeling Drift** (`orbitDive`, trios). Orbits at 9 m (outside base light) for 2 s, then dives one at a time 0.5 s apart with a rising chime. **Death burst** r 2.2 m deals 3 × damageMult to *other* gloomlings (chain pops). A contact burst dims your light ×0.85 for 3 s.
- **Weeping Inkwell** (`artillery`). Holds 13–18 m away (retreats as your light grows). Every 5 s lobs a glob (1.2 s flight) at your position 0.6 s ahead: a **2.4 m dark ring** marks the landing. A hit costs 1 Ember and leaves an **ink slick** (r 2.4 m, 6 s: raft speed ×0.6, light ×0.8). Max 3 (+1 per 8 H). The anti-turtle unit: keep moving, hunt it with zaps and projectiles.
- **Bell-Jar Tick** (`bulwark`, pairs). Takes **×0.25 from the aura** (×0.6 once below 50% hp, "cracked"), ×1 from weapons, **×1.5 from zaps**. Contact shoves the raft 3 m and does not consume it: it re-hits after 1 s. Beats aura-only builds.
- **Silent Choir** (`stalk`, trios). **Invisible outside the light** except gold pinprick eyes; gathers at the light edge until 3+ are present, then advances together; when your oil < 35% they **rush** ×1.6. Punishes low oil; the Lighthouse Beam reveals them.

### 7.5 Elites: the Drowned Hand
On the elite timer (`eliteEvery`, first at k = 0.25, from day 2; paused while a Warden lives or a legendary is hooked). **Telegraph:** an ink stain spreads under your current position (r 3.2 m) over **1.4 s**; the hand breaches (0.6 s, vulnerable); then **slams** for 2 Embers, 10 oil and a 4 m knock (and snaps a non-legendary line). It stays 3 s as an obstacle (aura applies), then repeats: up to 3 slams or ≈ 16 s, then sinks (escapes, no reward). **Counter:** a **flare during the stain or breach staggers it for 2 s and it takes +50% damage**; 3 zaps during the breach also stagger. **Reward:** a great cinder (15 × xpScale), **15 oil**, 6 × valueMult Shells, `elitesSlain`.

Per-lake twists (`zoneMods`): *Mould-Gloved Hand* (Sporewood): a slam leaves a spore cloud (light ×0.8 for 4 s). *The Undertow Grasp* (Glasswater): a landed slam tips 2 fish from the creel. *Ringed Grasp* (Pallid Deep): rises in **pairs** 1 s apart; a landed slam **grips** (no movement for 3 s, 3 oil/s; 3 zaps break it).

### 7.6 Wardens (night bosses)
Boss nights: `nightInZone` 3, 6, 9 … The Warden rises at k = 0.35 after a 3 s banner ("{name} — A Warden rises from the Gloom"). `hp = base × bossHpMult` (1 + 0.3·H: linear, because single-target damage grows roughly linearly with level; quadratic hpMult made every Warden past the first unkillable in the balance sim). While it lives: spawn rate ×0.6, no formations, elites paused. Contact: 2 Embers (the Wickeater 1: it is the teaching Warden; ≤ 3 after damageMult) and its oil drain. **Target: 40–55 s to kill with an on-curve build**; an under-built first run usually only outlasts it. If it survives to dawn it withdraws.

| Warden | lake | base hp | speed | Embers / oil on contact | cinders | Shells | abilities (cooldown · telegraph) | phase 2 (≤ 50% hp) |
|---|---|---|---|---|---|---|---|---|
| **The Wickeater** `the_wickeater` | mossmere | 1000 | 1.5 | 1 / 20 | 60 | 40 | inhale 9 s · 1.5 s<br>brood 12 s (6 gloomling) | abilities: [{id:snuff,radius:6,lightMult:0.6}]<br>inhaleEvery: 7 |
| **The Veiled Gardener** `the_veiled_gardener` | sporewood | 1100 | 1.5 | 2 / 20 | 90 | 80 | veil 10 s · 1.2 s<br>charge 14 s · 1.2 s<br>brood 11 s (6 sporeling) | veilDuration: 8<br>veilDrift: 1.5 |
| **The Shard Abbot** `the_shard_abbot` | glasswater | 1200 | 1.6 | 2 / 25 | 130 | 140 | hymnRing 8 s · 1 s<br>reliquary 14 s (2 belljar_tick) | mirror: {every:12,duration:6,images:2} |
| **The Lightless Ferryman** `the_lightless_ferryman` | paleabyss | 1400 | 1.7 | 2 / 30 | 200 | 220 | poleSweep 7 s · 1 s<br>eclipse 14 s · 1.5 s<br>brood 10 s (6 silent_choir) | abilities: [{id:inhale,every:9,telegraph:1.5,radius:12,pull:3.5,duration:2,maw:2.5,mawDamage:2,mawOil:25}] |

- **The Wickeater.** *Inhale* (every 9 s, 1.5 s tell: maw brightens, water streaks inward): pulls the raft at 3.5 m/s within 10 m for 2 s; entering the 2.5 m maw costs 2 Embers and 25 oil. *Brood*: 6 gloomlings every 12 s. Phase 2: *Snuff*, a 6 m wax-smoke ring around it (light ×0.6 inside); Inhale every 7 s.
- **The Veiled Gardener.** *Veil of Spores* (10 s, 1.2 s tell): a spore cloud at your position (r 6 m, 4 s; light and aura ×0.6). *Procession Charge* (14 s, 1.2 s tell): an amber line glows 25 m across the water, then it charges along it at 14 m/s (2 Embers). *Brood*: two sporeling trios every 11 s. Phase 2: veils last 8 s and drift toward you.
- **The Shard Abbot.** *Hymn Ring* (8 s, 1.0 s chime): 12 glass shards expand at 7 m/s with **2 gaps**; 1 Ember each. *Reliquary*: 2 Bell-Jar ticks every 14 s. Phase 2: *Mirror*: splits into 2 images for 6 s every 12 s; only the image inside your light or beam takes damage; both cast rings.
- **The Lightless Ferryman.** *Pole Sweep* (7 s, 1.0 s tell): a 120° arc, 10 m long, lights up on the water, then sweeps (2 Embers). *Eclipse* (14 s, 1.5 s tell): light ×0.4 for 4 s and the choir rushes. *Toll* (its brood): two choir trios every 10 s. Phase 2 adds the Wickeater's Inhale at 12 m. Never rises while the Pale Leviathan is hooked.

**Warden rewards:** **Heartwax** (+1 max Ember for the run, mend 1; first kill of each Warden per run only), a **Warden's Gift** pick (3 options, all rare or better, or a Kindle if eligible; it does not consume XP), Shells (40 / 80 / 140 / 220), 40 oil, a great cinder, `boss:slain`, `bossesSlain`.

### 7.7 What escalates, and what ends runs
Escalators in the order a player notices them: count (rate, maxAlive) → toughness (quadratic hpMult) → new archetypes (moths and mites night 2, eels night 3, inkwells / ticks / choir when you linger or descend) → formations (2 per night) → elites (every 40 s, shrinking to every 22 s) → Warden nights → night length (90 → 120 s) → oil burn (drainMult) → hits worth more Embers once H ≥ 12 (hands 3) and H ≥ 24 (everything 2, past a typical finale).

**Run killers** (target share of first-run deaths): the **Gloom ≈ 65%** (usually a moth-dimmed light leads to leaks, then a hand slam), **darkness ≈ 25%**, **starvation ≈ 10%**. The death spiral (low oil → small weak light → leaks → contact drains → less oil) is intentional, and it has exits: Burn-a-fish, oil drips and elite oil, the Gutter-burst, a flare if you can still afford one, Last Flicker, Second Wick.

**Hits per night targets** (on-curve player): night 1: 0; night 2: 0–1; night 3 (Warden): 1–2; nights 4–5: 1–2; a new lake's first night: 2–3. A novice takes roughly double, which against 5 Embers and ~2 heals a day ends the run on night 3–5.

---

## 8. Lantern combat: aura, flare, zap

### 8.1 The light and the aura (`BALANCE.light`)
```
oilFrac = oil / maxOil
lightR  = stats.lightRadius × (0.55 + 0.45·oilFrac) × Π dims × flareBoost             (survival.lightRadius)
          dims: each latched moth ×0.88, ink slick ×0.8, spore veil ×0.6, spore cloud ×0.8, Eclipse ×0.4, Hush ×0.8; Π dims ≥ 0.5
          flareBoost: ×1.4 for 3 s after a flare
aura    : every 0.25 s, each enemy with distance ≤ lightR takes
          stats.auraDps × (0.30 + 0.70·oilFrac) × stats.damageMult × 0.25 × (crit ? 2 : 1) × enemy.auraTaken
oil = 0 → lightR = 2.5 m (ember glow), aura = 0
```
The radius falls more slowly than the burn: half oil still gives 78% of the radius but only 65% of the damage. The light stays readable while low oil feels weak.

**The light is the arena inside the arena.** Inside it enemies move ×0.75 (moths ×1.15), are rim-lit and fully readable, and burn; the Silent Choir is only visible there. The light's edge is the **cinder line**: most kills happen 6–10 m out, so collecting means pushing your light over the swarm. Lantern Pulse radius, Lighthouse Beam length and Hearth Halo radius all track `lightR`, so a brighter Wick is a real build axis.

### 8.2 Threat Ratio (a QA metric)
`R = time-to-kill inside the light ÷ time to cross the light`. R > 1 means a gloomling reaches you. Base kit (aura 2, light 8 m) against a Gloomling:

| Heat | typical night | R @ oil 100% | R @ oil 50% | R @ oil 25% |
|---|---|---|---|---|
| 0 | Mossmere N1 | 0.63 | 1.36 | 2.35 |
| 1 | Mossmere N2 | 0.82 | 1.78 | 3.06 |
| 2 | Mossmere N3 | 1.05 | 2.28 | 3.93 |
| 3 | Mossmere N4 | 1.33 | 2.89 | 4.97 |
| 6 | Sporewood entry | 2.48 | 5.37 | 9.25 |
| 9 | Sporewood N4 | 4.14 | 8.98 | 15.45 |
| 12 | Glasswater entry | 6.40 | 13.87 | 23.86 |

**Meaning:** the lantern alone holds the dark for about two nights at full oil, and for no nights at half oil. That is the fishing ↔ combat link. After that, the build carries you. Per-enemy AoE damage the build should reach to keep R ≤ 0.6 at 75% oil: ≈ 4 dps (H 3, ~L13), 6.6 (H 6, ~L15), 8.7 (H 8, ~L22), 14.7 (H 12, ~L25), 19 (H 14, ~L34), 28 (H 18, ~L38), 36 (H 21, ~L46). An on-curve build gets there with the aura plus one or two AoE weapons; single-target builds fall behind on density, which is the build lesson. Recommend `ctx.debug.threat?.()` to print the live R.

### 8.3 Flare (Space / F / button)
| | value |
|---|---|
| cost | `stats.flareCost` (16 oil); needs oil ≥ cost; *Flare Powder* charges make it free |
| cooldown | `stats.flareCooldown × stats.cooldownMult` (16 s base) |
| reach | `stats.flareRadius` (10 m, beyond the light) |
| damage | `10 × g(L) × damageMult` **+ 15% of max hp** (3% vs Wardens), where `g(L) = 1 + 0.06·(level − 1)` (×1.54 at L10, ×3.3 at L40) |
| control | knock 6 m, stun 1.5 s, **clears all latched moths**, staggers hands in stain or breach for 2 s (+50% damage taken), light ×1.4 for 3 s, 0.3 s i-frames |
`flare {position, radius}` event; `combat.flareReady()` → 0..1 for the button ring.

### 8.4 Zap (tap a gloomling)
| | value |
|---|---|
| pick | nearest visible gloomling to the pointer within 48 px (56 px on touch) and 26 m of the raft |
| cost | `stats.zapCost` (1 oil); at 0 oil a "wax zap" costs 4 satiety for 50% damage |
| damage | `stats.zapDamage × g(L) × damageMult` (6 base: one-shots night-1 gloomlings) |
| cooldown | 0.2 s |
| control | stun 0.25 s, knock 1.2 m; **×2 on airborne eels**, ×1.5 on Bell-Jar ticks; peeling a latched moth refunds 1 oil |
Zap is the precision tool (eels, moths, inkwells, hand staggers); flare is the panic button and gap-maker. Both draw on the same oil as fishing.

### 8.5 Oil through the night
**Sources:** rendering fish (16–150 oil), Murk's oil, **oil drips** (the first kill after every 15 s of night drops 3 + 1.5·zoneIndex oil), elite hands (15), Wardens (40), Gutsfire and Heartbeat of the Deep. **Sinks:** passive burn, zaps, flares, contacts, latched moths.

| night | Heat / length | burn | zaps | flares | contacts + moths | spend | oil drips | elite oil | net |
|---|---|---|---|---|---|---|---|---|---|
| Mossmere N1 | H0, 90 s | 23 | 15 | 32 (×2) | 6 | 76 | 18 | 0 | -58 |
| Mossmere N4 | H3, 108 s | 30 | 20 | 48 (×3) | 21 | 119 | 21 | 45 | -53 |
| Sporewood N3-in-zone | H8, 120 s | 48 | 20 | 48 (×3) | 30 | 146 | 36 | 60 | -50 |
| Glasswater N2-in-zone | H14, 120 s | 66 | 20 | 56 (×3.5) | 40 | 182 | 48 | 60 | -74 |
| Pallid Deep N2-in-zone | H20, 120 s | 90 | 20 | 56 (×3.5) | 55 | 221 | 60 | 120 (4 pairs) | -41 |

*Burn, drips and elite oil are computed from data; zap/flare/contact columns are on-curve play estimates (base stats, no oil upgrades).*

Every night costs **roughly 1.5–3 fish worth of oil** (−30 to −70 net), from the first lake to the last; deep lakes burn more but hands drop more. A day lands about 4–5 fish, which also have to cover food and Shells. Low oil is not only a death risk: it shrinks your light and weakens your aura, so players top up even when they are not about to run dry. That is the tension: *eat, burn or sell.*

### 8.6 Burn-a-fish (quick action)
HUD button and hotkey R: renders the lowest-value non-legendary fish in the creel via `progression.fishAction(uid, 'render')` without opening the creel; 0.8 s animation (the Wick tosses it into the brazier; the flame flares 1.4×); the aura keeps running. Disabled with an empty creel. With Gutsfire it becomes a deliberate "burn a fish, surge" power move.

---

## 9. Economy & creel decisions

### 9.1 Fish → Shells, food, oil (progression `makeFish`)
```
fish.value = round(species.value × sizeK × QUALITY[q].valueMult × (1 + 0.1·min(streak, 5)))   // stored without sellMult
fish.food  = round(species.food × sizeK × QUALITY[q].yieldMult)
fish.oil   = round(species.oil  × sizeK × QUALITY[q].yieldMult)
sell  → round(fish.value × stats.sellMult) Shells     (only to Old Murk; sellMult upgrades lift fish already in the creel)
eat   → survival.addSatiety(fish.food × stats.foodMult)
render→ survival.addOil(fish.oil × stats.oilYieldMult)
release → +0.02 rarityBonus until the next day:start (cap +0.10; run.flags.mercy, included by getStats)
```
**The rule of thumb that rarity creates:** a Mossmere common sells for ~6 Shells but renders ~18 oil (worth ~11 Shells at Murk's price), so commons are best burned or eaten; uncommon and rare fish sell for 2–6× more and are the money. Night (gloom-only) fish are the richest in every lake.

### 9.2 The creel is your battery
- Base **4 slots** (`creelSize`). Murk buys only while moored during the calm; anything caught after he leaves rides overnight.
- Fish in the creel are your **only night oil reserve** (Burn-a-fish), and they are what creelsnatch eels steal. Fish kept for money and fish kept as oil compete for the same slots.
- **Theft**: `enemy:steal` takes a random non-legendary fish; kill the thief to drop it. Undertow Grasp tips 2. Legendaries are theft-proof.
- **Trophy or Toll**: a landed legendary can be sold (its price covers most of the next gate's toll: ≈ 70% / 75% / 65%) or kept in a slot until the run ends, when it is mounted for +10 / +20 / +35 Memories and appears on the raft in later runs (first time). A slot lost and Shells lost now, for permanent progress.

### 9.3 Daily budget (staying above ~60% oil)
| lake (typical days) | fish landed / day | oil need / day (base stats) | satiety / day | fish spent surviving (on-curve Chimney + Brazier) | left to keep or sell | Shells / day (sales + bounties + drops) |
|---|---|---|---|---|---|---|
| Mossmere (2–4) | 4.5 | ≈ 70–80 | ≈ 24 | ≈ 3.5 | ≈ 1 | 45–70 |
| Sporewood (4–7) | 4 | ≈ 95 | ≈ 38 | ≈ 3.2 | ≈ 0.8 | 90–140 |
| Glasswater (8–10) | 4 | ≈ 110 | ≈ 50 | ≈ 3.3 | ≈ 0.7 | 180–280 |
| Pallid Deep (11+) | 3.5 | ≈ 130 | ≈ 65 | ≈ 3.0 | ≈ 0.5 | 300–420 |

Surviving costs about 3–3.5 fish a day in every lake: drains grow with Heat while fish yields grow with depth. The squeeze deepens because fish get harder to land and nights get harder. Thick-Glass Chimney and the Rendering Brazier are the "invest now, earn later" buys; relics (Spoon, Oilskin) and boons (Slow Burn, Gutsfire) loosen it further. A Warden kill adds 40 / 80 / 140 / 220 Shells, elites add 6 × valueMult each, and a sold legendary pays the next toll.

---

## 10. Boons & levelling

### 10.1 XP: cinders (`BALANCE.xp`)
```
xpForLevel(L) = round(5 + 2.6·(L−1) + 0.30·(L−1)²)            cinders to go from L to L+1
cinder value  = enemy.xp × (1 + 0.10·H) × stats.xpMult
fish cinders  = fishXpFor(rarity, zoneIndex) × stats.xpMult      (Taper ×2)
```
| level | cinders needed | cumulative |
|---|---|---|
| 1 → 2 | 5 | 5 |
| 2 → 3 | 8 | 13 |
| 3 → 4 | 11 | 24 |
| 4 → 5 | 16 | 40 |
| 5 → 6 | 20 | 60 |
| 6 → 7 | 26 | 86 |
| 8 → 9 | 38 | 155 |
| 10 → 11 | 53 | 253 |
| 12 → 13 | 70 | 384 |
| 15 → 16 | 100 | 653 |
| 20 → 21 | 163 | 1336 |
| 25 → 26 | 240 | 2376 |
| 30 → 31 | 333 | 3849 |
| 35 → 36 | 440 | 5829 |
| 40 → 41 | 563 | 8392 |
| 45 → 46 | 700 | 11612 |

| rarity | Mossmere | Sporewood | Glasswater | Pallid Deep |
|---|---|---|---|---|
| common | 3 | 5 | 6 | 8 |
| uncommon | 5 | 8 | 10 | 13 |
| rare | 10 | 15 | 20 | 25 |
| legendary | 40 | 60 | 80 | 100 |

**Pickups.** Cinders merge into small (1), bright (5) and great (25) motes within 1.5 m to keep counts low; inside `stats.pickupRadius` (base 4 m) they glide to the raft at 14 m/s; they fade after 20 s; all auto-collect at dawn. `xp:gain` is aggregated ≤ 10/s.

**Expected level at dawn** (modelled, on-curve, most spawns killed): night 1 → L6–7 (a pick every ~23 s), night 2 → L8–9, night 3 (Warden) → L11–12, night 4 → L13–14, night 6 → L17–18; descending on time: Sporewood night 3-in-lake → L22–24, Glasswater → L33–35, Pallid Deep finale → L44–48. Camping slows picks to ~55–60 s. A full build (4 weapons × 5 + 6 passives + Kindles ≈ 47 levels) completes right around the finale. Fish give L2 during day 1 (two commons), so boons are taught without pressure.

### 10.2 Offers, slots, rerolls
- **Slots:** 4 weapons, 6 passives (stat boons, fishing boons and proc boons all count as passives).
- **Offer:** 3 cards (4 for The Wick's first pick each night). For each card, weight = `rarityWeights[rarity] × (1 + luck × luckShift[rarity]) × (owned & not maxed ? 1.4 : 1)`; rarity weights common 60 / rare 28 / epic 10 / legendary 2; luckShift 0 / 0.6 / 1.2 / 2.0. New weapons only while < 4 owned; new passives only while < 6. Locked boons (unlock challenge not done) never appear, except a character's start boon.
- **Guarantees:** the first level-up of a run offers ≥ 2 weapons; at L6 with ≤ 1 weapon, force one weapon card. An eligible **Kindle** is weighted ×3 and forced if missed for 2 level-ups.
- **Reroll:** replaces all cards; `stats.rerolls` per run (base 1; Lucky Knot, Gambler's Wick). **Skip:** +8 × (1 + zoneIndex) Shells.
- **Fallbacks** when nothing is eligible: *Spilled Shells* (+15 × (1 + zoneIndex)), *A Warm Breath* (mend 1), *Oil Tears* (+30 oil).
- The picker pauses the game (`gameDt = 0`); multiple pending level-ups queue.
- All weapon damage × `damageMult`, rolls `critChance` for ×2; cooldowns × `cooldownMult`.

### 10.3 Weapons (10)
`levels[i]` holds the complete parameters at level i + 1. Parameter meanings by type:
| type | parameters |
|---|---|
| `orbit` | `count` coals at `radius` m spinning at `spin` rad/s; each hits a target at most once per `hitCooldown` s for `damage` |
| `motes` | every `cooldown` s launch `count` homing motes (`speed` m/s, `range` m acquisition) for `damage`; `pierce` extra targets |
| `trail` | while raft speed ≥ `minSpeed`, lay fire `width` m wide that lasts `life` s, `dps` to enemies inside; touched enemies keep burning (40% dps) for `igniteTime` s |
| `hook` | every `cooldown` s throw a hook at the nearest enemy (`speed` m/s) for `damage`; ricochets `bounces` times to enemies within `bounceRange` m; `returns`: hits again on the way back |
| `spark` | every `cooldown` s strike the nearest enemy within `range` m and fork to `chains` more within `chainRange` m, `damage` each, `stun` s |
| `bell` | every `cooldown` s a toll of `radius` m: `damage` and slow by `slow` for `slowTime` s |
| `nova` | every `cooldown` s a pulse of radius `radiusMult × lightR`: `damage` and `knock` m |
| `mines` | every `cooldown` s drop a float in the wake (moving) or toss it `toss` m at the densest cluster (anchored); keeps ≤ `max`; arms in `arm` s, triggers within `trigger` m, `damage` in `blastRadius`, expires after `life` s |
| `vortex` | every `cooldown` s open a whirlpool on the densest cluster within `range` m: `radius`, `pull` m/s inward, `dps`, lasts `duration` s |
| `beam` | `beams` shafts of length `lightR + lengthAdd`, `width` m, turning at `turnSpeed` rad/s; `damage` per pass (per target ≤ once per `hitCooldown`); reveals the choir; counts as "light" for the Abbot's Mirror |

| weapon | rarity | unlock | type · tags | L1 → L5 parameters | Kindle (L6) = weapon L5 + passive |
|---|---|---|---|---|---|
| **Circling Cinders** `circling_cinders` | common | start | `orbit` · fire, area, close | count 2/3/3/4/5 · damage 4/4/6/6/9 · radius 2.8/2.8/3/3.2/3.4 · spin 2.4/2.4/2.7/2.7/3 · hitCooldown 0.6/0.6/0.55/0.55/0.5 | **Hearth Halo** ← Searing Glow: count 7, damage 14, radiusLightMult 0.6, spin 3, hitCooldown 0.5, burnDps 3, burnTime 2 |
| **Drifting Motes** `drifting_motes` | common | start | `motes` · light, projectile, homing | count 2/2/3/3/4 · damage 6/8/8/11/14 · cooldown 1.5/1.4/1.3/1.2/1 · speed 9/9/10/11/12 · range 16/16/16/16/16 · pierce 0/0/0/0/1 | **Lantern Moths** ← Brighter Wick: count 6, damage 14, cooldown 1, speed 12, range 16, pierce 2, reseek true |
| **Burning Wake** `burning_wake` | common | start | `trail` · fire, area, movement | dps 5/7/7/10/14 · life 2.5/2.5/3.5/3.5/4.5 · width 1.4/1.6/1.8/2/2.4 · minSpeed 1.5/1.5/1.5/1.5/1 · igniteTime 2/2/2/2/2 | **Comet Keel** ← Swift Oars: dps 24, life 4.5, width 2.6, minSpeed 1, igniteTime 2, ram {speedFrac:0.8,damage:30,knock:5} |
| **Prodigal Hook** `prodigal_hook` | common | start | `hook` · projectile, ricochet | damage 10/13/13/17/22 · bounces 3/3/4/5/6 · cooldown 2.2/2/1.8/1.6/1.4 · speed 18/18/18/18/18 · bounceRange 7/7/7/7/7 · returns true/true/true/true/true | **Gaff of the Drowned Crown** ← Fierce Flame: damage 30, bounces 9, cooldown 1.2, speed 18, bounceRange 7, returns true, pull 4, critMult 3 |
| **Forked Spark** `forked_spark` | rare | start | `spark` · light, chain | damage 8/8/12/12/16 · chains 3/4/4/5/6 · cooldown 2/1.8/1.7/1.5/1.3 · range 11/11/11/11/11 · chainRange 4.5/4.5/4.5/5/5.5 · stun 0.15/0.15/0.15/0.15/0.15 | **Stormglass** ← Restless Hands: damage 18, chains 9, cooldown 1.3, range 11, chainRange 5.5, stun 0.15, casts 2, charge {time:3,zapMult:3} |
| **Tolling Bell** `tolling_bell` | rare | First Dawn (`first_dawn`) | `bell` · area, slow, frost | damage 4/5/7/9/12 · radius 8/9/10/11/12 · slow 0.35/0.4/0.45/0.5/0.55 · slowTime 2.5/2.5/2.5/2.5/2.5 · cooldown 6/5.5/5/4.5/4 | **Requiem** ← Hardened Wax: damage 16, radius 13, slow 0.6, slowTime 2.5, cooldown 4, chillVuln 0.3, rootEvery 3, rootTime 1 |
| **Lantern Pulse** `lantern_pulse` | rare | Three Long Nights (`three_nights`) | `nova` · light, area, knockback | damage 10/13/17/21/28 · radiusMult 0.9/0.95/1/1.05/1.15 · cooldown 5/4.6/4.2/3.8/3.2 · knock 2/2/2.5/2.5/3.5 | **Heartbeat of the Deep** ← Slow Burn: damage 40, radiusMult 1.15, cooldown 2.4, knock 3.5, oilPerHit 0.5, oilMaxPerPulse 3 |
| **Smouldering Floats** `smouldering_floats` | rare | Unclenched (`break_a_hand`) | `mines` · fire, area, trap | damage 18/24/30/38/50 · blastRadius 2.5/2.8/3/3.2/3.6 · cooldown 2.5/2.2/2/1.8/1.5 · max 3/4/5/6/8 · arm 0.6/0.6/0.6/0.6/0.6 · trigger 1.5/1.5/1.5/1.5/1.5 · life 12/12/12/12/12 · toss 4–8/4–8/4–8/4–8/4–8 | **Lantern Fleet** ← Cinder Magnet: damage 60, blastRadius 3.6, cooldown 1.5, max 10, arm 0.6, trigger 1.5, life 12, toss [4,8], drift 2, pullsCinders true |
| **Little Maelstrom** `little_maelstrom` | epic | Full Flame (`full_flame`) | `vortex` · water, control, area | dps 6/8/10/13/18 · radius 3/3.3/3.6/4/4.5 · pull 3/3.5/4/4.5/5.5 · duration 3/3.2/3.5/3.8/4.5 · cooldown 9/8.5/8/7.5/6.5 · range 14/14/14/14/14 | **Undertow Bloom** ← Wildfire: dps 24, radius 4.5, pull 5.5, duration 4.5, cooldown 6.5, range 14, count 2, endFlare true |
| **Lighthouse Beam** `lighthouse_beam` | epic | Lamplighter's Vengeance (`lamplighter`) | `beam` · light, area, sweep | damage 8/10/10/13/18 · beams 1/1/2/2/3 · lengthAdd 4/5/5/6/8 · width 0.9/1/1/1.1/1.3 · turnSpeed 1.2/1.3/1.3/1.4/1.6 · hitCooldown 0.4/0.4/0.4/0.4/0.4 | **The Great Lantern** ← Kindling Heart: damage 24, beams 4, lengthAdd 8, width 1.3, turnSpeed 1.6, hitCooldown 0.4, scorch 1, spinOnHurt {mult:3,time:3} |

**Weapons that work while anchored** (fisher-friendly): all except Burning Wake.

### 10.4 Kindles (level-6 fusions)
When a weapon is at L5 and you own its paired passive at any level, a legendary **Kindle** card can appear; picking it makes the weapon level 6 with `kindle.params` and shows the banner "{name} — The flame remembers". The pairs are in the weapons table's last column: Circling Cinders + Searing Glow → **Hearth Halo**; Drifting Motes + Brighter Wick → **Lantern Moths**; Burning Wake + Swift Oars → **Comet Keel** (ram: at ≥ 80% top speed, non-elite contact deals 30 damage and a 5 m knock *instead of* costing an Ember); Prodigal Hook + Fierce Flame → **Gaff of the Drowned Crown**; Forked Spark + Restless Hands → **Stormglass**; Tolling Bell + Hardened Wax → **Requiem**; Lantern Pulse + Slow Burn → **Heartbeat of the Deep**; Smouldering Floats + Cinder Magnet → **Lantern Fleet**; Little Maelstrom + Wildfire → **Undertow Bloom**; Lighthouse Beam + Kindling Heart → **The Great Lantern**. Kindling a weapon completes the *What the Flame Remembers* challenge.

### 10.5 Passives (16) and legendary passives (3)
| passive | rarity | max | per level | extra | unlock |
|---|---|---|---|---|---|
| **Brighter Wick** `brighter_wick` | common | 5 | lightRadius +0.7 | — | start |
| **Searing Glow** `searing_glow` | common | 5 | auraDps +0.6 | — | start |
| **Fierce Flame** `fierce_flame` | rare | 5 | damageMult +0.08, critChance +0.03 | — | start |
| **Restless Hands** `restless_hands` | rare | 5 | cooldownMult -0.06 | — | start |
| **Swift Oars** `swift_oars` | common | 4 | moveSpeed +0.45, pickupRadius +0.4 | — | start |
| **Cinder Magnet** `cinder_magnet` | common | 4 | pickupRadius +1.5, xpMult +0.05 | — | start |
| **Slow Burn** `slow_burn` | common | 5 | maxOil +15, oilDrain -0.012 | — | start |
| **Hardened Wax** `hardened_wax` | rare | 4 | armor +0.06 | — | start |
| **Kindling Heart** `kindling_heart` | epic | 3 | maxHp +1 | on pick: heal 1 | start |
| **Wildfire** `wildfire` | rare | 4 | flareRadius +1.2, flareCost -2, flareCooldown -1.5 | — | start |
| **Static Fingers** `static_fingers` | common | 4 | zapDamage +3, zapCost -0.15 | — | start |
| **Steady Reel** `steady_reel` | common | 5 | reelSpeed +0.1, lineStrength +0.08, sweetZone +0.01 | — | start |
| **Hungry Waters** `hungry_waters` | common | 5 | biteSpeed +0.12, hookWindow +0.06, rarityBonus +0.02 | — | start |
| **Lucky Knot** `lucky_knot` | rare | 3 | luck +0.2, rarityBonus +0.03, rerolls +1 | — | Naturalist (`naturalist`) |
| **Gutsfire** `gutsfire` | rare | 5 | oilYieldMult +0.05 | proc on render: time 6 auraDps 1.5 lightRadius 1 / time 7 auraDps 2 lightRadius 1.25 / time 8 auraDps 2.5 lightRadius 1.5 / time 9 auraDps 3 lightRadius 1.75 / time 10 auraDps 4 lightRadius 2 | Kindling (`ember_hoard`) |
| **Lantern on the Line** `lantern_on_the_line` | rare | 3 | — | proc on reel: auraMult 1.3 lineDps 6 lineRadius 1.5 lineSlow 0.3 / auraMult 1.45 lineDps 9 lineRadius 1.5 lineSlow 0.3 / auraMult 1.6 lineDps 12 lineRadius 1.5 lineSlow 0.3 flareOnNightLand true | Night Angler (`night_angler`) |
| **Undying Ember** `undying_ember` | legendary | 1 | maxHp +2, dawnHeal +1 | on pick: heal 2 | Where the Light Was Laid (`pallid_arrival`) |
| **Moonless Calm** `moonless_calm` | legendary | 1 | auraDps +1.5, lightRadius +2 | — | Four Silences (`four_silences`) |
| **Gilded Hook** `gilded_hook` | legendary | 1 | rarityBonus +0.1, sellMult +0.15, hookWindow +0.1 | — | Cartographer of Gills (`cartographer`) |

`onPick` heals immediately. `proc` boons are read by combat with `?.`: *Gutsfire* triggers on every render (`fish:action` render or Burn-a-fish); *Lantern on the Line* applies while a fish is hooked during dusk or the gloomtide (at L3, landing a fish at night fires a free flare).

**Pool:** 29 boons in total; 18 are in the pool from run 1 (5 weapons, 13 passives); 11 are unlocked by challenges.

### 10.6 Synergy archetypes (shown as tags on cards)
| build | core | why it works |
|---|---|---|
| **Big Light** | Brighter Wick, Lantern Pulse, Lighthouse Beam, Slow Burn | radius scales three systems; Slow Burn keeps oil (and so radius) high |
| **Kite** (Stub) | Swift Oars, Burning Wake → Comet Keel, Smouldering Floats, Tolling Bell | everything chasing you walks through fire and mines |
| **Spark-tap** (Ashwick) | Static Fingers, Forked Spark → Stormglass, Restless Hands, Fierce Flame | chains charge enemies; charged zaps deal ×3 |
| **Fisher** (Taper) | Steady Reel, Hungry Waters, Gutsfire, Lantern on the Line + Motes / Hook / Bell | autonomous weapons fight while you're anchored; fish become oil and power |
| **Bulwark** (Tallow) | Hardened Wax, Kindling Heart, Lantern Pulse, Circling Cinders → Hearth Halo | stand your ground and shove the tide back |
| **Drowning** | Little Maelstrom, Floats or Pulse, Searing Glow | vortices pack enemies for AoE |

---

## 11. Characters (five Wicks)

| Wick | unlock | stat changes | start boon | start kit | quirk | look (flame · cloak · eyes · hat) |
|---|---|---|---|---|---|---|
| **The Wick** `wick` — *A Small, Stubborn Flame* | free | — | Drifting Motes | 4 Mire Worms | **Curious**: The first level-up of each night offers 4 cards instead of 3. | #ffb347 · #4a2e24 · #ffb347 · none |
| **Taper** `taper` — *The Long Reach* | Steady Hands (`steady_hands`) | castMax +4, reelSpeed +0.15, hookWindow +0.1, rarityBonus +0.04, auraDps -0.4, maxOil -10 | Prodigal Hook | 8 Mire Worms, 2 Lumen Moss | **Angler's Ember**: Fish give double cinders, and every landed fish refunds 25% of the flare cooldown. | #ffd27a · #34404a · #ffd27a · tall |
| **Stub** `stub` — *The Bright Little One* | Down the Sluice (`down_the_sluice`) | moveSpeed +1, lightRadius +1.5, pickupRadius +1.5, maxHp -1, creelSize -1 | Burning Wake | 30 Shells | **Fanned Flame**: After 1.5 s at 80%+ top speed, the aura burns ×1.3 (fades over 1 s when slowing). | #fff0a8 · #5a3a1e · #fff0a8 · none |
| **Tallow** `tallow` — *The Stout Candle* | The Long Vigil (`long_vigil`) | maxHp +2, armor +0.1, dawnHeal +1, maxSatiety +25, moveSpeed -0.8, cooldownMult +0.1 | Lantern Pulse | — | **Slow Melt**: +0.6 s i-frames; the Gutter-burst is 50% wider and deals flare damage. | #ff9a4a · #3e3a24 · #ffb347 · hood |
| **Ashwick** `ashwick` — *Burned Once, Burns Back* | Unwarded (`unwarded`) | auraDps +0.8, damageMult +0.15, critChance +0.05, zapDamage +3, zapCost -0.3, hookWindow -0.15, sweetZone -0.02, maxOil -15, creelSize -1 | Forked Spark | — | **Cinder Heart**: Every 12th kill in a night fires a free mini-flare (5 m, half flare damage). | #ff6a3d · #1e1a1a · #ff6a3d · hood |

- The start boon is granted at level 1 (it bypasses its unlock gate and joins the run's pool). The start kit's bait is added to `run.bait`; shells add to the starting purse.
- **Unlock ladder:** Taper ≈ run 2 → Ashwick ≈ runs 3–5 → Stub ≈ runs 3–6 → Tallow ≈ runs 4–6. Locked Wicks show their silhouette and their challenge on the title screen.
- Looks (actors.setCharacter): **The Wick**: round, umber cloak, amber flame and eyes. **Taper**: tall and thin, slate cloak, a pale-gold flame atop a stovepipe of wax. **Stub**: thumb-sized, rust cloak, a white-gold flame bigger than its body. **Tallow**: broad and squat, olive hood, a low deep-orange flame. **Ashwick**: charred grey wax, tattered charcoal hood, red-orange flame, eyes like cracks in a coal.

---

## 12. Challenges & unlocks

### 12.1 The checklist (30; 40 in the walking build, tier IV *Paths Underfoot* in §24.10)
**First Flickers**

| # | challenge | goal | type · params | scope | reward |
|---|---|---|---|---|---|
| 1 | **First Light** `first_light` | Land your first fish. | `catch` {n:1} | total | 5 Memories |
| 2 | **First Dawn** `first_dawn` | Endure your first Gloomtide. | `nights` {n:1} | run | `boon:tolling_bell` + 5 Memories |
| 3 | **Kindling** `ember_hoard` | Reach level 8 in one descent. | `level` {n:8} | run | `boon:gutsfire` + 8 Memories |
| 4 | **Three Long Nights** `three_nights` | Endure 3 Gloomtides in one descent. | `nights` {n:3} | run | `boon:lantern_pulse` + 10 Memories |
| 5 | **Unclenched** `break_a_hand` | Break a Drowned Hand. | `slayElite` {n:1} | total | `boon:smouldering_floats` + 8 Memories |
| 6 | **Steady Hands** `steady_hands` | Land 25 fish across all descents. | `catch` {n:25} | total | `character:taper` + 10 Memories |
| 7 | **Naturalist** `naturalist` | Name 8 species in the Journal. | `journal` {n:8} | total | `boon:lucky_knot` + 10 Memories |
| 8 | **Gloombreaker** `gloombreaker` | Disperse 500 gloomlings across all descents. | `slay` {n:500} | total | 15 Memories |

**The Long Vigil**

| # | challenge | goal | type · params | scope | reward |
|---|---|---|---|---|---|
| 9 | **Unwarded** `unwarded` | Silence a Warden. | `boss` {n:1} | total | `character:ashwick` + 15 Memories |
| 10 | **Down the Sluice** `down_the_sluice` | Reach Sporewood Pools. | `reachZone` {zone:sporewood} | total | `character:stub` + 15 Memories |
| 11 | **The Long Vigil** `long_vigil` | Endure 5 Gloomtides in one descent. | `nights` {n:5} | run | `character:tallow` + 20 Memories |
| 12 | **Untouched** `untouched` | Endure a Gloomtide (night 2 or later) without losing an Ember. | `nightNoDamage` {n:1,minDay:2} | run | `relic:barnacle_cloak` + 10 Memories |
| 13 | **Bonfire Night** `bonfire_night` | Disperse 200 gloomlings in a single Gloomtide. | `slayNight` {n:200} | run | `relic:ember_in_resin` + 20 Memories |
| 14 | **Full Flame** `full_flame` | Raise a weapon Boon to level 5. | `boonLevel` {kind:weapon,level:5} | run | `boon:little_maelstrom` + 15 Memories |
| 15 | **Night Angler** `night_angler` | Land 3 fish during a single Gloomtide. | `nightCatch` {n:3} | run | `boon:lantern_on_the_line` + 15 Memories |
| 16 | **Clockwork Wrist** `perfect_10_run` | Set 10 perfect hooks in one descent. | `perfectHooks` {n:10} | run | `relic:steady_hook` + 10 Memories |
| 17 | **Kindled** `kindled` | Reach level 15 in one descent. | `level` {n:15} | run | `relic:remembrance` + 20 Memories |
| 18 | **Shimmering** `shimmering` | Land a Shimmering fish. | `quality` {quality:perfect} | total | `relic:shimmer_scale` + 5 Memories |
| 19 | **Heavyweight** `heavy_catch` | Land a non-legendary fish over 8 kg. | `weight` {kg:8,excludeLegendary:true} | total | `bait:shimmerfly` + 10 Memories |
| 20 | **Old Hand** `catch_100` | Land 100 fish across all descents. | `catch` {n:100} | total | `relic:listening_bobber` + 20 Memories |
| 21 | **Murk's Favourite** `shells_1000_run` | Earn 1000 Shells in one descent. | `shells` {n:1000} | run | `relic:torn_ledger` + 20 Memories |

**Deeper Water**

| # | challenge | goal | type · params | scope | reward |
|---|---|---|---|---|---|
| 22 | **What the Flame Remembers** `kindle_one` | Kindle a weapon (level 6). | `kindle` {n:1} | run | `relic:gamblers_wick` + 30 Memories |
| 23 | **Cartographer of Gills** `cartographer` | Name 16 species in the Journal. | `journal` {n:16} | total | `boon:gilded_hook` + 25 Memories |
| 24 | **Lamplighter's Vengeance** `lamplighter` | Disperse 2500 gloomlings across all descents. | `slay` {n:2500} | total | `boon:lighthouse_beam` + 30 Memories |
| 25 | **Into the Vault** `into_the_vault` | Reach the Glasswater Vault. | `reachZone` {zone:glasswater} | total | `relic:second_wick` + 30 Memories |
| 26 | **Where the Light Was Laid** `pallid_arrival` | Reach the Pallid Deep. | `reachZone` {zone:paleabyss} | total | `boon:undying_ember` + 40 Memories |
| 27 | **Four Silences** `four_silences` | Silence all four Wardens. | `bossDistinct` {ids:[the_wickeater,the_veiled_gardener,the_shard_abbot,the_lightless_ferryman]} | total | `boon:moonless_calm` + 60 Memories |
| 28 | **Many Flames** `many_flames` | Reach the Glasswater Vault with 3 different Wicks. | `reachZoneCharacters` {zone:glasswater,n:3} | total | 50 Memories |
| 29 | **The Light Comes Up** `light_comes_up` | Land the Pale Leviathan. | `victory` {} | total | 100 Memories |
| 30 | **The Complete Chronicle** `complete_chronicle` | Name every species in the Journal. | `journal` {n:32} (walking build: every species, 40) | total | 200 Memories |

*Totals: 30 challenges, 831 Memories; unlocks: 4 Wicks, 11 boons, 9 relics, 1 bait. The walking build's tier IV adds 10 challenges, 185 Memories, a Wick, 3 boons, 3 relics and 1 bait (§24.10).*

Run 1 typically pops 6–8 in the balance sim (First Light, First Dawn, Kindling, Unclenched, Shimmering, often Clockwork Wrist and Down the Sluice): a new boon in the pool and a relic within reach, so run 2 starts with something new. Every relic, boon, Wick and bait that a challenge unlocks names that challenge in its locked state ("Unlocked by: Unclenched — Break a Drowned Hand").

### 12.2 Challenge types → bus sources (progression)
| type | counts | source |
|---|---|---|
| `catch` | fish landed | `fish:landed` (total: meta.totalFish) |
| `journal` | species named | `journal:new` / meta.journal size |
| `nights` | Gloomtides endured this run | `phase:change` → dawn |
| `level` | level reached | `levelup` |
| `slay` / `slayNight` | kills lifetime / in one gloomtide | `enemy:slain` (reset per night on `phase:change` gloomtide) |
| `slayElite` | elites killed | `enemy:slain` where enemy.elite |
| `boss` / `bossDistinct` | Wardens killed / distinct ids | `boss:slain` |
| `reachZone` | lake reached | `zone:change` |
| `reachZoneCharacters` | distinct Wicks that reached a lake | `zone:change` + `run.character` (set in challengeProgress) |
| `nightNoDamage` | a gloomtide with no Ember lost (day ≥ minDay) | `phase:change` dawn with no `player:damage` since the gloomtide began |
| `boonLevel` / `kindle` | a weapon at level N / a level-6 kindle | `boon:chosen` + `BOON_BY_ID` |
| `nightCatch` | fish landed in one gloomtide | `fish:landed` while phase is gloomtide |
| `perfectHooks` | perfect hooks this run | `fishing:hook {perfect:true}` |
| `quality` / `weight` | a catch of that quality / weight | `fish:landed` |
| `shells` | Shells earned this run | `shells:change` with delta > 0 |
| `victory` | the final legendary landed | `victory` |

On completion: `meta.challenges[id] = true`, add `reward.memories` to meta.memories immediately, set `meta.unlocks[reward.unlock] = true`, emit `challenge:complete {challenge}` and `unlock {key, label}` (toast + sound). The challenges screen groups by tier and shows progress bars.

---

## 13. Merchant visits & shop

### 13.1 Old Murk's schedule
- Moors at the start of every calm at `world.getMerchantDock(day)` (day 1: 20 s into the calm, after the first-cast tip) → `actors.merchant.arrive(pos, yaw)`, `merchant:arrive`, the bell rings, an edge marker shows his green lamp.
- At 85% of the calm: a second bell and "Last call, little flame." At dusk: `actors.merchant.leave()`, `merchant:leave`.
- Trade within 5 m (E, the Trade pill, or tapping the barge). **The shop is blocking**, so browsing never costs clock time: the cost is *sailing to the dock*.
- After a descent during the calm, Murk follows and re-moors at the new lake's dock.
- Stock is never random: it depends only on the lake index (and unlocks).

### 13.2 Shop tabs
1. **Sell** — the creel, with each fish's price (`value × sellMult`); "Sell all non-legendary" button; legendaries show the Trophy-or-Toll choice.
2. **Gear** — UPGRADES (fixed prices; zone-gated items appear once that lake is unlocked this run). Raft cosmetics: `actors.setRaftLevel(min(3, floor(totalRaftUpgradeLevels / 2)))`.
3. **Bait** — general baits × `baitMult[zoneIndex]` ([1, 1.3, 1.6, 2.0]); the current lake's legend bait at its fixed price; unlocked baits only.
4. **Supplies** — × `supplyMult[zoneIndex]` ([1, 1.4, 1.9, 2.5]); per-visit limits.
5. **Ledger** — bounties (§15).

| upgrade | category | levels | costs (Shells) | effect per level | appears |
|---|---|---|---|---|---|
| **Ashwood Rod** `rod_ashwood` | rod | 3 | 40 / 120 / 300 | castMax +3 | always |
| **Whalebone Tip** `rod_whalebone` | rod | 3 | 45 / 130 / 320 | hookWindow +0.12, slackTime +0.3 | always |
| **Braided Gut Line** `line_gut` | line | 4 | 40 / 110 / 260 / 520 | lineStrength +0.15 | always |
| **Silverthread** `line_silver` | line | 2 | 480 / 800 | lineStrength +0.25, slackTime +0.2 | once Glasswater Vault is unlocked (so the finale line can be bought before the last toll) |
| **Brass Spool Reel** `reel_brass` | reel | 4 | 50 / 130 / 280 / 520 | reelSpeed +0.15 | always |
| **Whisper Drag** `reel_drag` | reel | 3 | 60 / 150 / 340 | sweetZone +0.02 | always |
| **Thick-Glass Chimney** `lantern_chimney` | lantern | 3 | 45 / 130 / 300 | oilDrain -0.012, maxOil +15 | always |
| **Searing Mantle** `lantern_mantle` | lantern | 4 | 55 / 140 / 300 / 560 | auraDps +0.4 | always |
| **Moth-Dust Lens** `lantern_lens` | lantern | 3 | 90 / 200 / 420 | lightRadius +1, flareRadius +1 | once Sporewood Pools is unlocked |
| **Flint Striker** `lantern_striker` | lantern | 3 | 55 / 150 / 330 | flareCooldown -1.5, flareCost -2, zapDamage +2 | always |
| **Woven Creel** `creel_wicker` | creel | 4 | 30 / 90 / 200 / 420 | creelSize +1 | always |
| **Frost-Moss Lining** `creel_frost` | creel | 3 | 100 / 240 / 480 | sellMult +0.12 | once Sporewood Pools is unlocked |
| **Rendering Brazier** `raft_brazier` | raft | 3 | 55 / 140 / 310 | oilYieldMult +0.2, foodMult +0.15 | always |
| **Barnacle Hull** `raft_hull` | raft | 3 | 110 / 250 / 520 | armor +0.07 | once Sporewood Pools is unlocked |
| **Long Oars** `raft_oars` | raft | 3 | 40 / 110 / 260 | moveSpeed +0.5, pickupRadius +0.5 | always |
| **Ember Hearth** `raft_hearth` | raft | 2 | 260 / 600 | maxHp +1, maxSatiety +15 | once Glasswater Vault is unlocked |
| **Glimmer Spoon** `lure_glimmer` | lure | 3 | 70 / 190 / 420 | rarityBonus +0.05, biteSpeed +0.08 | always |
| **Trembling Feather** `lure_feather` | lure | 2 | 80 / 220 | nibbleTells +1, hookWindow +0.08 | always |

*Buying every level of every upgrade costs **12,665 Shells**. In the balance sim (Appendix A) a winning skilled run earns ≈ 9,000 Shells (sales, bounties, drops, Wardens, legendary sales) and spends ≈ 38% of the catalogue on gear after tolls, legend baits and supplies, so every build is still a choice, and you can never max anything in the lake you are standing in.*

### 13.3 Supplies
| supply | base price | gives | stocked from | limit |
|---|---|---|---|---|
| **Murk's Lamp Oil** `oil_flask` | 18 | oil +30 | The Mossmere | — |
| **Lamp-Oil Cask** `oil_cask` | 50 | oil +100 | Sporewood Pools | — |
| **Dried Moss Cake** `moss_cake` | 14 | satiety +30 | The Mossmere | — |
| **Mushroom Loaf** `mushroom_loaf` | 38 | satiety +90 | Sporewood Pools | — |
| **Wax Patch** `wax_patch` | 45 | hp +1 | The Mossmere | 1 per visit |
| **Flare Powder** `flare_powder` | 30 | flareCharges +2 | The Mossmere | — |
| **Tide Chart** `tide_chart` | 40 | spots +2 | The Mossmere | 1 per visit |

### 13.4 Baits
General baits spend one charge per cast; a species whose `bait` names a bait is hard-locked to it; species on its `attract` list are ×2.5 likelier. Extra bonus keys (read with `?? 0`): `weightBias` (heavier fish), `shimmer` (quality score), `gloomDraw` (extra spawn rate while equipped). Equip from the HUD bait icon (cycles owned baits) or the creel screen.

| bait | price | count | stocked from | bonus | attracts (×2.5) | required by | unlock |
|---|---|---|---|---|---|---|---|
| **Mire Worms** `mireworm` | 8 | 8 | The Mossmere | biteSpeed +0.3 | gutter_crayfish, mossback_perch, weeping_carp, capshell_crayfish, plumgill_perch, bonecrook_crayfish | — | — |
| **Lumen Moss** `lumen_moss` | 18 | 5 | The Mossmere | rarityBonus +0.1 | candlefin_koi, prism_minnow, funeral_veil, pallid_wraithfin | Gloam Eel, Sleepspore Jelly | — |
| **Spore Cake** `spore_cake` | 26 | 5 | Sporewood Pools | hookWindow +0.15 | sporebelly_puffer, velvet_ray, plumgill_perch | Threadling Eel | — |
| **Ember Roe** `ember_roe` | 36 | 4 | Sporewood Pools | rarityBonus +0.15, weightBias +0.35, gloomDraw +0.2 | reedjaw_pike, mildew_angler, mirror_pike, shardspine_eel, gilt_eyed_eel | The Blind Scrivener, Lampwarden Angler | — |
| **Glass Larvae** `glass_larva` | 48 | 4 | Glasswater Vault | nibbleTells +1, shimmer +0.05 | glassblown_puffer, glassgill_perch, prism_minnow, shroud_ray | Chime Jelly | — |
| **Shimmerfly** `shimmerfly` | 40 | 3 | The Mossmere | shimmer +0.12, rarityBonus +0.04 | — | — | Heavyweight (`heavy_catch`) |
| **Heartmoss Ball** `heartmoss` | 40 | 1 | The Mossmere | legend bait (spent on hook) | — | The Belled Matriarch | — |
| **Glowcap Bulb** `glowcap_bulb` | 90 | 1 | Sporewood Pools | legend bait (spent on hook) | — | The Drifting Grove | — |
| **Prism Moth** `prism_moth` | 170 | 1 | Glasswater Vault | legend bait (spent on hook) | — | The Glass Sovereign | — |
| **Drowned Marrow** `pale_marrow` | 320 | 1 | The Pallid Deep | legend bait (spent on hook) | — | The Pale Leviathan | — |

---

## 14. Zones & gates

| # | lake | toll to enter | gate opens when | drain oil / satiety | gloom | valueMult | legendary | Warden | gate |
|---|---|---|---|---|---|---|---|---|---|
| 0 | **The Mossmere** `mossmere` — *Shallows of the Sunken Gate* | — | (start) | 1 / 1 | 1 | 1 | The Belled Matriarch | The Wickeater | The Moss Sluice |
| 1 | **Sporewood Pools** `sporewood` — *A Garden That Forgot the Sun* | 180 | Land the Belled Matriarch | 1.2 / 1.15 | 1.13 | 1.5 | The Drifting Grove | The Veiled Gardener | The Mycelium Veil |
| 2 | **Glasswater Vault** `glasswater` — *Where the Kingdom Kept Its Light* | 420 | Land the Drifting Grove | 1.4 / 1.3 | 1.27 | 2.2 | The Glass Sovereign | The Shard Abbot | The Vault Seal |
| 3 | **The Pallid Deep** `paleabyss` — *Where the Kingdom Laid Its Light to Rest* | 900 | Land the Glass Sovereign | 1.65 / 1.45 | 1.4 | 3 | The Pale Leviathan | The Lightless Ferryman | — (final lake) |

- **Gate requirements** (`unlock.requires` of the *next* lake): land the current lake's legendary **this run** (`run.legendaries`). When met: `run.gateOpen = true`, `world.setGateState('open')`, `gate:open {zone}`, toast. Until then the gate is `'sealed'` and the Descend dialog lists what is missing (`getGateInfo().requirements`).
- **Descend:** sail into the open gate (within 1.2 × its radius; walking build: in Glasswater walk to within r + 2.5 m) → interact "Descend" → `ui.openDescend()` shows the toll, the next lake's card, and a warning that the Gloom grows (+3 Heat). Allowed during **calm and dawn** only (the gate sleeps through dusk and the gloomtide). Confirm → `progression.travel(nextZone)`: pay the toll (first visit: `zone:unlock`), `zone:change {zone, prev}` (world rebuild, player respawn at the new spawn, area-title banner), `run.flags.zoneEnteredDay = day`, `run.gateOpen = false`. One-way. Boons, level, creel, upgrades and Shells carry over.
- **Waystone starts** (§17.3) pre-unlock every lake above the start.

---

## 15. Bounties (Old Murk's ledger)
- When Murk moors he offers up to 2 new bounties (max 3 active), auto-accepted, due at the end of day + 2. Failing costs nothing.
- Reward = `round(base × zone.valueMult × (1 + 0.04·(day − 1)))` (+ perN × n for species bounties), paid instantly on completion (`bounty:complete`). Each completed bounty adds 2 Memories at run end.
- Template pick: weighted, filtered by lake and day; the `warden` bounty only on boss nights; `legend_hunt` is offered once you can afford the lake's legend bait (+6 Memories). Species targets are chosen from the current lake's commons/uncommons reachable without bait; heavy targets use the 75th weight percentile.
- Shape: `{ id, templateId, text, zone, target, count, progress, reward:{shells}, expiresDay }`.

| template | type | text | params | base Shells | weight | from |
|---|---|---|---|---|---|---|
| `catch_species` | catchSpecies | Bring me {n} {species}. | {n:[2,3],rarities:[common,uncommon]}, +8/n | 18 | 3 | The Mossmere, day 1 |
| `catch_uncommon` | catchRarity | Land {n} uncommon fish. | {rarity:uncommon,n:2} | 35 | 2 | The Mossmere, day 1 |
| `catch_rare` | catchRarity | Land a rare fish. | {rarity:rare,n:1} | 45 | 2 | The Mossmere, day 2 |
| `heavy` | heavy | Land a {species} over {kg} kg. | {percentile:0.75} | 40 | 2 | The Mossmere, day 1 |
| `deep_water` | depthCatch | Land {n} fish from deep water. | {n:2,depthMin:0.75} | 30 | 2 | The Mossmere, day 1 |
| `perfect_hooks` | perfectHooks | Set {n} perfect hooks. | {n:[3,5]} | 30 | 2 | The Mossmere, day 1 |
| `streak` | streak | Chain {n} perfect hooks in a row. | {n:[3,4]} | 45 | 1 | The Mossmere, day 2 |
| `unscathed` | unscathed | Endure tonight's Gloomtide without losing an Ember. | {} | 50 | 2 | The Mossmere, day 2 |
| `disperse` | slayNight | Disperse {n} gloomlings in one Gloomtide. | {nBase:40,perHeat:12} | 30 | 2 | The Mossmere, day 1 |
| `no_flare` | noFlare | Endure the Gloomtide without a single flare. | {} | 40 | 1 | Sporewood Pools, day 1 |
| `quality` | quality | Bring me a fine fish, or better. | {quality:fine} | 35 | 2 | The Mossmere, day 1 |
| `night_fish` | nightFish | Catch something that only rises in the Gloomtide. | {} | 40 | 2 | The Mossmere, day 1 |
| `sell_visit` | sellVisit | Sell me {n} fish in a single visit. | {nBase:3} | 25 | 1 | The Mossmere, day 2 |
| `spot_catch` | spotCatch | Catch {n} fish from shimmering spots. | {n:3} | 30 | 2 | The Mossmere, day 1 |
| `break_hand` | slayElite | Break a hand that rises from the water. | {n:1} | 35 | 1 | The Mossmere, day 2 |
| `warden` | boss | A Warden rises tonight. Silence it. | {n:1} (boss nights only) | 60 | 4 | The Mossmere, day 1 |
| `legend_hunt` | legend | They say {legend} stirs. Land it. | {} | 60 | 0 | The Mossmere, day 1 |

---

## 16. Journal
- One page per species, grouped by lake (tabs). Discovered: the fish drawn in ink, name, epithet (legendaries), lore line, biggest weight, times caught, first day/run, its depth band, time and bait.
- **Undiscovered entries are ink silhouettes with a hint line** (species `hint`, or generated: "Rises only in the Gloomtide · deep water · answers Lumen Moss"). Hints are goals.
- **Rewards:** first catch ever: +round(1.0 × species.value) Shells immediately (non-legendary species only: `BALANCE.economy.newSpeciesLegendary` false) and +3 Memories at run end (`newSpecies`, with a "+3 Memories" toast now); half a lake (4 of 8): +10 Memories immediately; **a whole lake: a permanent perk** (below); 10 catches of one species: a gold-inked card and +2 Memories once; all 32: *The Complete Chronicle*.

| zone complete | perk | effect |
|---|---|---|
| The Mossmere | Moss-Reader | hookWindow +0.08 |
| Sporewood Pools | Spore-Cook | foodMult +0.1, oilYieldMult +0.1 |
| Glasswater Vault | Glass-Eye | rarityBonus +0.04 |
| The Pallid Deep | Bone-Counter | sellMult +0.08 |

---

## 17. Meta: Memories, Relics, Waystones

### 17.1 Memories (`memoriesFor(summary)`)
| breakdown line | formula |
|---|---|
| Nights endured | nightsSurvived × (3 + 1.0 × zoneIndex) |
| Deepest water endured | [0, 10, 25, 45][deepest lake where a full gloomtide was survived] (0 if none) |
| Fish landed | floor(fishCaught / 2) |
| New names in the Journal | 3 × newSpecies |
| Legends hauled up | 15 per legendary |
| Bounties honoured | 2 per bounty |
| Gloomlings dispersed | floor(enemiesSlain / 50) |
| Hands broken | 1 per elite |
| Wardens silenced | 15 per Warden |
| Trophies mounted | 10 / 20 / 35 per legendary kept to run end (by lake) |
| The light came up | +150 the first victory, +100 after |
| Remembrance | round(subtotal × memMult) as its own line |

Plus challenge Memories, paid the moment each challenge completes. All constants live in `BALANCE.memories`. Typical (balance sim): an average player's run 1 ≈ 165 (≈ 100 of it one-time challenge Memories), later runs ≈ 75–85; a skilled player's deep runs ≈ 300–400; a victory run ≈ 450–550. All Memories are banked on death; nothing is ever taken away.

### 17.2 Relics (Shrine of Drowned Lanterns)
"Every Wick that fell left something behind." Each relic hangs in the Shrine as a small drowned lantern that relights as it levels. Hidden relics appear as unlit lanterns with their reveal condition. `special` keys: `startShells:N` (+N starting Shells per level), `startKit` (I: 8 Mire Worms + 3 Lumen Moss; II: also the starting lake's legend bait), `shimmer:N` (quality score per level), `memMult:N`, `secondWick` (§6.7), `waystone:<zone>` (§17.3).

| relic | levels | costs (Memories) | effect per level | revealed by |
|---|---|---|---|---|
| **Cracked Oilskin** `oilskin_flask` | 3 | 40 / 110 / 245 | maxOil +15 | always |
| **Salt-Glass Lens** `salt_glass_lens` | 3 | 65 / 170 / 375 | lightRadius +0.6, auraDps +0.15 | always |
| **Bent Tin Spoon** `bent_tin_spoon` | 3 | 40 / 110 / 245 | maxSatiety +15, satietyDrain -0.006 | always |
| **Mended Creel** `mended_creel` | 2 | 50 / 230 | creelSize +1 | always |
| **Murk's Old Debt** `old_debt` | 4 | 30 / 80 / 170 / 340 | special `startShells:30` | always |
| **Heartwood Oar** `heartwood_oar` | 3 | 45 / 125 / 280 | moveSpeed +0.3 | always |
| **Line of Seven Knots** `seven_knots` | 3 | 45 / 140 / 310 | lineStrength +0.1 | always |
| **Stub of the First Wick** `first_wick_stub` | 2 | 140 / 400 | maxHp +1 | bestDay ≥ 3 |
| **Two-Headed Coin** `two_headed_coin` | 3 | 80 / 220 / 465 | rarityBonus +0.03, luck +0.1 | runs ≥ 2 |
| **Drifter's Bundle** `drifters_bundle` | 2 | 65 / 185 | special `startKit` | runs ≥ 2 |
| **Grandsire's Tinderbox** `tinderbox` | 3 | 50 / 140 / 310 | xpMult +0.05, pickupRadius +0.5 | bestLevel ≥ 8 |
| **Grandmother's Hook** `steady_hook` | 3 | 45 / 140 / 310 | hookWindow +0.08, sweetZone +0.012 | Clockwork Wrist (`perfect_10_run`) |
| **Barnacle Cloak** `barnacle_cloak` | 3 | 90 / 245 / 530 | armor +0.05 | Untouched (`untouched`) |
| **Ember in Resin** `ember_in_resin` | 3 | 65 / 170 / 375 | flareCooldown -1.5, flareRadius +0.5 | Bonfire Night (`bonfire_night`) |
| **Shimmering Scale** `shimmer_scale` | 3 | 80 / 220 / 465 | rarityBonus +0.02; special `shimmer:0.04` | Shimmering (`shimmering`) |
| **Remembrance** `remembrance` | 3 | 125 / 310 / 620 | special `memMult:0.08` | Kindled (`kindled`) |
| **The Listening Bobber** `listening_bobber` | 1 | 185 | nibbleTells +1 | Old Hand (`catch_100`) |
| **Torn Ledger Page** `torn_ledger` | 3 | 70 / 185 / 400 | sellMult +0.06 | Murk's Favourite (`shells_1000_run`) |
| **Gambler's Wick** `gamblers_wick` | 2 | 90 / 280 | rerolls +1 | What the Flame Remembers (`kindle_one`) |
| **Second Wick** `second_wick` | 1 | 465 | special `secondWick` | Into the Vault (`into_the_vault`) |
| **Waystone: Sporewood** `waystone_sporewood` | 1 | 185 | special `waystone:sporewood` | deepestZone ≥ 1 |
| **Waystone: Glasswater** `waystone_glasswater` | 1 | 400 | special `waystone:glasswater` | deepestZone ≥ 2 |
| **Waystone: Pallid Deep** `waystone_paleabyss` | 1 | 700 | special `waystone:paleabyss` | deepestZone ≥ 3 |

*All relics at max cost **12,050 Memories** (costs ×1.55 vs the first draft). In the balance sim a skilled player's first victory arrives at ≈ 25–30 relic levels (≈ 2,500–3,000 Memories, run ≈ 8).*

**Simulated Memories trajectory** (Appendix A): an average player banks ≈ 170 on run 1 (3–4 relic levels, most of it one-time challenge Memories), then ≈ 75 per run (1–2 levels); a learning player ≈ 90–190 per run (≈ 15 levels by run 8, Glasswater around run 9); a skilled player ≈ 300–500 per run (≈ 26 levels by run 8, first victory around run 8).

### 17.3 Waystones and the Kindling Draft
- Owning `waystone:<zone>` and `meta.deepestZone ≥` that lake's index lets the New Descent screen start there: day 1 in that lake (H = 3z), every lake above pre-unlocked, starting Shells + the **Descent Purse** (160 / 450 / 950), Murk moored at calm 0.
- **Banked levels** (9 / 18 / 28) are spent in a fast **Kindling Draft** before the first calm: consecutive pick-1-of-3 screens, no animations, rerolls not consumed, and an optional "auto-draft by archetype" button. Banked levels sit slightly below on-curve; you also miss the earlier Wardens' Heartwax. That is the price of skipping.

### 17.4 Records (meta.unlocks.records)
Biggest fish per species, best day, deepest lake, most Shells in a run, highest level, most kills in one night, longest perfect-hook streak. Broken records are listed on the death screen ("New record!").

---

## 18. Pacing targets

### 18.1 Run 1, minute by minute (The Wick, Mossmere)
| time | phase | what happens |
|---|---|---|
| 0:00 | Day 1 calm | Spawn in the south cove facing north (the gate up-screen). Tip: sail. A shimmer spot ≈ 20 m ahead. |
| 0:15–0:40 | | First cast (meter tip), nibble, plunge, **first fish**. *First Light* pops (+5 Memories in minute one). Catch card. |
| 0:20 | | Murk's bell; an edge marker points to the SE cove dock (≈ 30 m). |
| ~1:00 | | Second fish → **level 2 in daylight**: 2 weapons + 1 passive on offer, no pressure. |
| 1:00–1:50 | | Sail to Murk: sell 1–2 fish, buy worms or a Woven Creel (30), take a bounty. |
| 2:00 | Dusk | "The Light Thins." Sparse gloomlings at the edge. Tip: your light burns them. |
| 2:14 | **Gloomtide 1 (90 s)** | Build-up trickle. Tip: tap to zap. First cinders; tip: gather them. |
| 2:37 / 3:00 / 3:23 | | Levels 3, 4, 5, one every ≈ 23 s. Motes plus a new weapon online. |
| 3:26–3:37 | | Crescendo; first flare. Then the hush. |
| 3:44 | Dawn | Leftovers dissolve, cinders fly in. *First Dawn* pops (Tolling Bell enters the pool). Oil ≈ 30–45%. |
| 3:52–5:52 | Day 2 | New dock. The player learns they **must** render ≈ 2 fish. A bounty. |
| 6:06–7:42 | Gloomtide 2 (96 s) | Inkmites and moths. **First Drowned Hand ≈ 6:30**: the stain teaches movement. First Closing Ring. 0–2 hits. |
| 7:50–9:50 | Day 3 | "A bell tolls beneath the calm" (legend hint). Heartmoss (40) is affordable by day 2; the Sporewood toll (180) usually needs her sale plus savings. |
| 10:04–11:46 | **Gloomtide 3 (Warden)** | A creelsnatch steals a fish. **The Wickeater rises ≈ 10:40.** A weak build outlasts it at 2–3 Embers; a strong one kills it (Heartwax, Gift). *Three Long Nights* pops. |
| 11:54–13:54 | Day 4 | Low on Embers; the oil crunch. |
| 14:08–15:56 | Gloomtide 4 (108 s) | Two hands, two formations, ≈ 48 alive. **Median first death ≈ 15:00.** |
| 18:18–20:12 | Gloomtide 5 | Strong first runs die here (≈ 19:30). |

Something new arrives every 1.5–3 minutes: a species, a level, an enemy type, a formation, a bounty, a zone reveal, a challenge.

### 18.2 Run 5 (≈ 1 hour played)
≈ 5–7 relic levels, Taper and often Ashwick unlocked, 22 boons in the pool. Knows where the legend pool is, uses Burn-a-fish, flares hands mid-stain. Lands the Belled Matriarch on day 3 (calm), kills the Wickeater on night 3, pays the toll on day 4 → **Sporewood at H 6**: gloomlings jump from 8 to 13 hp, inkwells force movement, sporelings orbit. Dies Sporewood night 5–6, often to the Veiled Gardener. ≈ 24–28 minutes, ≈ 100–150 Memories, *Down the Sluice* unlocks Stub.

### 18.3 Run 10 (≈ 3–4 hours played)
10–14 relic levels, all five Wicks, has found Kindles, a Waystone to Sporewood. Either a full descent (Glasswater by day 7–8; ticks punish aura-only builds; the Abbot's Mirror teaches using light on purpose; strong runs reach the Pallid Deep on day 11) or a 30-minute Waystone attempt. Ends in the Pallid Deep (choir + Ferryman Eclipse) or a first victory in the run 12–20 window. A full victory ≈ 50–60 min (13–15 days); a Waystone victory ≈ 30–35 min.

### 18.4 QA targets (tune toward these)
| metric | target |
|---|---|
| median first-run death | night 4 (≈ 15 min); 80% of first runs end on nights 3–5 (sim: average player day 4, p10–p90 3–5; skilled day 7) |
| level-up cadence | every 23–35 s on nights 1–3; 30–40 s when descending on time; ~60 s when camping (sim: 24 s skilled, 32 s average on nights 2–3) |
| hits per night (on-curve) | N1 0 · N2 0–1 · N3 1–2 · N4–5 1–2 · first night in a new lake 2–3 |
| Warden kill time (on-curve) | 40–55 s |
| oil net per night | −30 to −70 (≈ 1.5–3 fish) |
| first Warden kill | runs 3–5 (sim: a skilled player kills on ≈ 48% of boss nights from run 1; a never-improving average player ≈ 4%) |
| first Sporewood / Glasswater / Pallid Deep | sim: learner (typical) runs 2 / 9 / 13+; skilled 1 / 1 / 3. Sporewood is often seen on run 1 and is usually fatal there |
| first victory | skilled ≈ run 8 (26% of runs win with 8 runs of relics); typical players after run 13 |
| death causes | Gloom ≈ 65%, darkness ≈ 25%, starvation ≈ 10% (sim: ≈ 100% Gloom; see Appendix A.5) |

**The five knobs to turn first:** (1) `director.ratePerHeat` 0.12 (count growth); (2) `hpLin / hpQuad` 0.24 / 0.025 (toughness; watch the R table); (3) oil drips interval and value (night oil net); (4) `xp.curve.quad` (pick cadence); (5) Warden base hp and `bossHpLin` (kill time). Rerun `node tools/balance-sim.mjs` after any change (Appendix A).

---

## 19. Art direction: "hand-inked melancholy", Starlit

### 19.1 Global rules
- **Starlit.** Every cave vault is a deep indigo-violet **starry night sky** over drowned ruins: lavender mist, a soft pink-magenta nebula glow, warm amber candle and torch light on pale stone, gold autumn foliage and fungus, and reflective water that mirrors the stars. (Colour and mood reference only, from the user's screenshots; no place, asset, shape or UI of any other game is recreated.) Reference palette: night ink #0A0C19, deep indigo #1D245D, violet dusk #433E74, lavender mist #7E81B4, nebula pink #D296AE, candle amber #ED9E3B, pale gold #E8BE77, autumn ochre #B8893A, pale stone #D6D6E4.
- **Silhouette first.** Near-black ink shapes with a pale rim light (`toon.toonMaterial` + `toon.addOutline`); faces are minimal: glowing eyes only.
- **Warm light.** The Wick's amber lantern (≈ #ffb347) is the only warm light that lights the water; its pool reads gold-amber. Elsewhere warm amber appears only as small **pinpoints on stone**: lit windows in the far ruins (the parallax rings' glow mask), candle-lit window slits and braziers on the hero landmarks, island lamp heads, statue orbs and candles on ruins (`palette.candle`); their accent lights lean pale gold and their reflections are gold threads, never pillars. Lamps *on the water* (dock and decor buoys, dock halos) stay cold (`palette.lamp`), so nothing at water level is mistaken for the lantern, its pool or a Cinder. Murk's lamp is a dim sage. The swarm reads as ink against the lantern's warm pool, rim-lit violet (#8a76bd). Warm light owns the pixels it touches: inside a light pool the water drains its cold cast to warm grey and warm lights lean gold, and the grade keeps its cold shadow tint off warm pixels, so the pool, embers and Cinders read amber-gold, never rose.
- **No ring.** The lantern's reach is shown by the soft pool of light alone: it fades out with a slightly wobbling, feathered edge where the reach ends. **No light ever draws a reach ring on the water**, day or night (the light-pool shader has no rim, notches or lip; `water.setLights` ignores any `ring`). Nothing else draws a persistent ring around the raft either: the Circling Cinders / Hearth Halo coals draw no orbit ring (the coals and their sparks trace the path), combat's old "cinder line" fallback is gone, and the cast range ring exists only while a cast is charging. Transient effect rings (flare, Ward, Gutter-burst, lantern relit, bobber ripple, spot pulse) may stay, pale gold-stone or lavender rather than orange: the flare's shock ring, its fainter dashed reach ring (alpha 0.45) and its sparks are pale gold (#f2d6a0 / #f6e2bc), survival's event rings pale gold (#f0d49c), the bobber's idle ripple pale gold-stone (#ead6a8); the bite ring stays red for readability.
- **The flare blooms, it never flattens the frame.** A flare's light is local: the lantern's pool brightens (×2.4) and swells, the lantern light and halo flare (×2.6), and a warm pale-gold glow (#e8be77, pale gold) blooms on the water from 0.5 R to 1.05 R and fades over 0.9 s (a mini-flare: 0.5 s, fainter); the bloom pulse is soft (+0.4). There is **no full-screen flash** on a flare: a flat light mix over a night frame lifts the ink to grey and washes out the stars, the swarm and the lake's colour. Other light full-screen flashes (boss slain, gate open, revive, victory) mix in a perceptual (square-root) space in the grade, so darks stay dark and the frame keeps its contrast; black flashes (fades) still mix linearly.
- **Starlight** (`starlight-glsl.js`, shared by two existing materials, zero extra draw calls). *Vault dome:* a horizon → zenith gradient (lavender haze → violet dusk → deep indigo → night ink), up to three lattice layers of point stars (never thinner than a pixel: a star widens and dims instead of aliasing; most pale lavender-white, a few pale gold, fewer pink; each twinkles on its own clock), denser along a faint lavender milky-way band and around the nebulae; one or two **nebulae** (domain-warped clouds, dark dust lanes, violet veil around a pink core with a pale rose heart) low just left of north, so the glow spills behind the hero landmark's flank and the title camera opens on it; faint vault rock only near the zenith; the ceiling cracks are soft moon-glows. *Far rings:* the haze in front of the far silhouettes picks up the nebula's pink in its direction. *Water:* the lake mirrors the same stars and nebula (`water.setSky`): looked up in a nearly flat mirror (stars glide with the camera like real reflections, stretched ≈ 1.5× vertically into short glints), at 60% of the vault's density, nudged a pixel or two by the swell and chop (the normal is flattened to 3.5% of its slope, so a star stays a round point and never smears into a streak) and broken up by a drifting ripple noise, strongest toward grazing water, faded under light pools (the lantern's pool keeps 8%), behind mirrored silhouettes and in foam and wakes; fog takes the far ones. Only the far, grazing water mirrors the low nebula (a soft pink-lavender sheen near the horizon line, never blotches on the near water). At night the water's stars *thin out* while the vault's thicken: brightness ×(1 − 0.32·night) and density ×(1 − 0.38·night) relative to the vault, so the night water reads as a reflected sky rather than a snowfall and gloomling eyes (in pairs, on an ink body inside a pale wake ring) stay readable; they scale with √`stars` rather than `stars` (Glasswater's water does not turn to glitter; the Pallid Deep's still shows a few). The water's sky reflection itself deepens from the fog colour at the horizon to ~40% of it toward the zenith, so near water reads deep and starry. Low quality: two dome layers and one water layer, no water nebula. `palette.stars` scales brightness and density per lake; stars brighten (×1.4) and thicken toward the Gloomtide and fade into the dawn.
- **Mist** (existing meshes, recoloured, no new draw call). Lavender mist is the fog itself (`palette.fog`, FogExp2) and everything that melts into it: the water's sky reflection (the fog colour at the horizon), 2–3 mist cards between the parallax rings and the rings' own bottom haze (`ringMaterial` `uMist`, which also picks up the nebula's pink in its direction), 6–12 instanced low **mist sheets** drifting over the water (`createMistSheets`, the fog colour lifted 22% toward `far` by day and 10% at night, amount 0.55 by day thickening to 1.05 at night), and the shore mist band. Dawn pulls the fog 22% toward a dawn mist that is half lavender mist #9a92c8, half the lake's own `far` colour (so the four dawns differ as much as the nights), with a breath of pale gold. At night each lake's mist keeps its own hue (lake fog ×0.38, only 22% toward ink-indigo #0b0d2e), so the Gloomtide is a deep version of the lake, not one shared blue-black.
- **Palette rule.** Green and teal (hue 65–195°) appear only as rare, deliberate trace accents: Old Murk's sage lamp (#a6d4a0) and a breath of sage on the Mossback Perch. No lake fog, water, grade, glow, lamp, candle, nebula, mote, spot, enemy eye, rarity, weapon or UI accent may sit in that band (`tools/validate-data.mjs` rejects any palette colour there), and cold glows stay at hue ≥ 200° (lavender, never aqua). Blue and violet carry each frame, amber and gold are the accents. Check new art with `tools/hue-report.mjs` (green+teal ≤ 1% pooled, ≤ 2% per frame).
- **Layered depth.** Inside the lake: islands and pillars (toon, outlined, fog on). At R: cliffs. Beyond the cliffs: **4–6 parallax silhouette rings** at R+15, +30, +50, +75, +100 m and a backdrop card at ≈ R+140, fading from `ink` to luminous `far` (lavender mist, so far silhouettes read violet). FogExp2 at ≈ 0.02 swallows anything past ≈ 90 m, so rings beyond 40 m use `toon.silhouetteMaterial(color, {fog:false})` with a pre-mixed value ladder: ring 1 `lerp(ink, fog, 0.35)` (fog on), ring 2 `lerp(ink, fog, 0.6)`, ring 3 (hero) `lerp(fog, far, 0.25)` with emissive `candle` window details, ring 4 `lerp(fog, far, 0.6)` with feathered bottoms, backdrop: the starlit vault. Between rings, 2–3 **mist cards** (wide planes at y 0–6, colour `fog`, opacity 0.25–0.4, slowly drifting canvas-noise alpha) sell the parallax; low lavender mist sheets drift over the water.
- **Composition.** The camera looks north, so each lake's **hero set piece sits beyond the north shore**, framed by darker flanking shapes, with clear negative-space windows onto the starry vault and the nebula. Ceilings read as open night sky with stalactites and hanging ruins as silhouettes against the stars.
- **Phase response** (world reads `survival.getPhaseInfo()`): *dusk* ambient ×0.75, light ×0.6, fog 20% toward `ink`, glow particles ×1.2 (the world lights its lamps), stars brighten; *gloomtide* (night → 1) ambient ×0.48, light ×0.28, fogDensity ×1.5, fog = the lake's fog ×0.38 with 22% of ink-indigo #0b0d2e, water = the lake's water ×0.66 (12% toward #0b0d2e) over its deep ×0.58, grade exposure ×0.86, saturation ×0.9, tint only 35% of the way to deep indigo #1e2466 (the lake's own tint carries the night) with tintAmount → 0.28, vignette +0.16, drifting motes ×0.45 except the lake's gloom tell, **vault stars ×1.4 and ~28% denser, nebula a little brighter, water stars thinner**. Each lake stays itself at night: the Mossmere violet-indigo, Glasswater sapphire, Sporewood plum-magenta, the Pallid Deep ink-violet — and light enough that ink silhouettes, wake rings and eyes read on the water around the light: the night fog and water have a luminance floor (linear 0.012; deep water 0.0018), hue kept, which lifts only the darkest lakes (the Pallid Deep ≈ ×1.5, Sporewood ≈ ×1.2); *dawn* a soft lavender-gold: fog 22% toward lavender mist #9a92c8 and a breath of pale gold, light 30% toward pale gold #f2cfa4 and ×1.3, then ease back; the grade warms the highlights (warm split-tone #f4cc96 → #f0c8a8, base 0.07, +0.16 at dawn) more than the shadows (tint only 20% toward rose-lavender #b898c0), stars fade (×0.3) — a pearl-and-gold dawn, never orange-brown.
- **Budget.** Merge each ring into 1–2 geometries or InstancedMesh (≈ 30–45 world draw calls), ≤ 2 world accent lights, light shafts as additive quads with `toon.glowTexture`. Starlight adds no draw call; amber pinpoints ride the existing glow mesh and halo points.

### 19.2 Palettes and grades (from `ZONES`)
| key | The Mossmere | Sporewood Pools | Glasswater Vault | The Pallid Deep |
|---|---|---|---|---|
| signature | starlit moat: violet-dusk water, lavender mist, pale stone, candle amber | ember garden: violet-magenta, autumn-ochre caps, gold spores, nebula pink | sapphire orrery: cobalt-sapphire water, lilac crystal, the most starlight | candle requiem: near-black violet, bone-pale stone, amber candles, few stars |
| `fog` | #3a3070 | #402258 | #172a7c | #2c2448 |
| `fogDensity` | 0.016 | 0.019 | 0.012 | 0.022 |
| `water` | #2e2664 | #2c1842 | #10226e | #1e183c |
| `waterDeep` | #0a081e | #0e0716 | #030921 | #07060e |
| `foam` | #d8d6e6 | #eed8e6 | #d6defa | #e6e0d6 |
| `glow` | #bab2ee | #e8ac4c | #a0aaf8 | #f0b45e |
| `accent` | #d6d6e4 | #e090bc | #d2baff | #e6e0d6 |
| `lamp` (cold, on the water; falls back to `glow`) | #b6b0f0 | #c8aee6 | #b6c0ff | #c6c0d8 |
| `candle` (warm, on stone; falls back to `lamp`) | #ed9e3b | #ed9e3b | #e8be77 | #ed9e3b |
| `nebula` | #d296ae | #e48cbc | #cc8ed0 | #a87a98 |
| `stars` | 1.0 | 0.8 | 1.5 | 0.7 |
| `ambient` | #4a3e88 | #5c3a7c | #24409a | #463e6c |
| `ink` | #08061a | #0d0614 | #02051b | #030206 |
| `far` | #8c84bc | #9c74b8 | #5c78d4 | #a89ec8 |
| `light` | #d4d0f2 | #f2d8ea | #d8e0ff | #ece2d2 |
| grade | exp 1.04, bloom 0.9/0.6/0.7, tint #40347e×0.2, vig 0.38, sat 1.0, grain 0.05 | exp 1.03, bloom 1.0/0.75/0.68, tint #5a2c78×0.2, vig 0.4, sat 0.92, grain 0.05 | exp 1.06, bloom 1.15/0.55/0.65, tint #203ca8×0.2, vig 0.35, sat 1.0, grain 0.04 | exp 0.97, bloom 0.95/0.8/0.7, tint #3a2c60×0.18, vig 0.5, sat 0.85, grain 0.07 |

Sky placement per lake (`world-art.js` SKY; azimuth from north, + = east; the title camera opens looking ≈ 30° west of north): the Mossmere nebula 1 at −0.55 rad / 9° up (strength 0.95), nebula 2 at +0.75 / 27° (0.4); Sporewood −0.3 / 11° (1.25) and +0.7 / 24° (0.7); Glasswater −0.5 / 11° (0.95) and +0.8 / 30° (0.85); the Pallid Deep a single dim cloud at −0.45 / 7° (0.5). Nebula masks fall off as cos⁸ (nebula 1) and cos¹⁴ (nebula 2) of the angle to their centre.

**Lakes stay distinct by hue, at every phase** (check with `tools/hue-report.mjs` on the `x-<lake>-<phase>` frames): the Mossmere is violet-indigo (fog/water hue ≈ 247–249°, the most violet of the blue lakes), Glasswater cobalt-sapphire (≈ 228°, the bluest and most saturated, under the starriest vault), Sporewood plum-magenta (≈ 280°+) with ochre and gold, the Pallid Deep a dark ink-violet (≈ 253°) lit by amber candles and bone-pale stone. The two blue lakes never share a fog or water hue within 15°.

### 19.3 The Mossmere (starlit moat: violet-dusk water, lavender mist, pale stone, candle amber)
- **Palette intent ("Starlit moat").** Violet-dusk water and sky (hue ≈ 248°: violet dusk #433E74 under lavender mist #7E81B4) under a clear starry vault; lavender mist banks and lavender far silhouettes; pale stone ruins (columns, statues, gate stones #8a8ca8 lit to pale stone), indigo-slate rock with violet-grey lichen; dun-ochre reeds and lily pads for a breath of autumn gold. Cold glows are pale lavender starlight (`glow` #bab2ee, `lamp` #b6b0f0 on the buoys); every lit window, lamp head, statue orb and candle on the ruins burns candle amber (`candle` #ed9e3b). One pink nebula hangs low behind the Sunken Gate's left tower. Green survives only as a trace (Old Murk's dim sage lamp, a breath of sage on the Mossback Perch), so the Wick's lantern is the one warm light on the water; Old Murk's umber hide is the one warm *surface*.
- **Hero (north, beyond the Moss Sluice):** *The Sunken Gate*: a colossal half-drowned round arch on box piers with a broken portcullis hanging askew; twin towers with four candle-lit window slits each and three braziers on the broken arch's crown; beside it a bell tower leaning 12° with a cracked bell glowing faint lavender (accent light #1).
- **In the lake:** the *Drowned Gatehouse* island (half-sunk tower), the *Toppled Bridge* piers with chains dangling from the break, pylons and statue stumps (amber orbs), the two *Sisters* rocks; big islands keep broken column drums with three candles still burning; the *Bell Pool*'s sunken temple bell visible as a dim shape under the water.
- **Shore & rings:** lichen-bearded cliffs, drowned arcades with hanging roots (TubeGeometry on Catmull-Rom curves) and lichen "beards" (alpha planes), a far colonnade with amber windows, a slow waterfall curtain (scrolling noise alpha) from a ceiling crack.
- **Floating:** notched dun-ochre lily pads (instanced 30–50, a few with pale-stone glow-buds), driftwood, a half-sunk pair of stone hands cupping an empty bowl.
- **Particles:** ≈ 380 small drowsy lavender-grey motes on slow sine paths (dimmer and greyer than enemy eyes and the lilac spot pulse, so neither is mistaken for a mote at night), ≈ 80 larger pale lavender and pale-stone motes. **Shafts:** 2–3 pale moonlight shafts, 15–25°, flickering.
- **Gloom tell:** motes die out except a handful; roots sway at 2× amplitude.

### 19.4 Sporewood Pools (ember garden: violet-magenta, autumn-ochre caps, gold spores, nebula pink)
- **Palette intent ("Ember garden").** Violet-magenta haze and water (hue ≈ 275°) under a pinker sky with the strongest nebulae (one low near the Mother Cap, one higher west); autumn-ochre caps (#5e3c1e → #b8893a) on pale stalks, gold spores and gills (`glow` #e8ac4c), nebula-pink pods and cap spots (`accent` #e090bc), lilac buoys. Fewer stars than the Mossmere (0.8): the spores do the twinkling.
- **Hero:** *The Mother Cap*: a fungal tower rising out of sight with 4–5 tiered shelf-caps (LatheGeometry), gold radial gill stripes under each cap (canvas texture), gold spore-lights hanging under each rim, spores pouring like slow snow (accent light #1 under the lowest cap).
- **In the lake:** the *Cap Reef* (four fallen ochre caps on a pale mycelium mat), lily caps, the *Stalk Groves* (giant thin-stemmed mushrooms); puffball pods with emissive pink dots.
- **Shore & rings:** gill-walls with glowing shelf fungus, drowned garden trellises swallowed by translucent pink mycelium veils, curled fern fronds, a far forest of stalks in misty orchid; amber windows in the far ruins; the starry vault with a low pink haze.
- **Ceiling:** downward pale caps and mycelium threads ending in glowing gold/pink droplets, silhouetted against the stars. **Floating:** fallen caps drifting like boats, bobbing puffballs.
- **Particles:** ≈ 250 spores (70% gold, 30% pink) rising in lazy spirals; occasional puff bursts. **Light:** soft glow pools under caps, one faint rose-white shaft.
- **Gloom tell:** cap glow drops to 30%; spores turn grey-violet and *fall*.

### 19.5 Glasswater Vault (sapphire orrery: cobalt-sapphire water, lilac crystal, the most starlight)
- **Palette intent ("Sapphire orrery").** The bluest, most saturated lake (cobalt-sapphire, hue ≈ 228°, clearly bluer than the Mossmere's violet) and the starriest vault (`stars` 1.5, two nebulae, the milky-way band crowded with fine stars); periwinkle crystal light (`glow` #a0aaf8, hue ≈ 233°: never aqua) with lilac crystal accents (#d2baff) that read against the sapphire water; the rings' windows burn pale gold (`candle` #e8be77), the only warm note besides the lantern.
- **Hero:** *The Prism Orrery*: a vast ring of instanced octahedra on a torus, hung by four long chains, turning at 0.02 rad/s around a pulsing lavender heart crystal (accent light #1).
- **In the lake:** six *Bookshelf Monoliths* (crystal slabs holding thin crystal "volumes") on the trench, the *Reliquary Ring* of pillars around the *Vault Seal* (a glass dome over the gate), shelf crystals near the shore; the trench reads as a darker ring of water.
- **Shore & rings:** faceted crystal cliffs, a colonnade of glass pillars with pointed arches (some shattered), a fallen chandelier half-sunk, a far forest of needle spires with violet-to-lavender edge gradients against the stars.
- **Floating:** drifting shards that bob and spin, sealed vials of bottled light, a few pale floating pages.
- **Particles:** ≈ 180 lavender/violet glints falling slowly with a twinkle. **Shafts:** 3–4 crisp narrow beams, each split into 2–3 tinted beams (refraction).
- **Gloom tell:** crystals go dark one by one from far to near; the Orrery stops turning.

### 19.6 The Pallid Deep (candle requiem: near-black violet, bone-pale stone, amber candles)
- **Palette intent ("Candle requiem").** The darkest lake: near-black violet water and haze (hue ≈ 253°; at night ink-violet, just light enough that the swarm's silhouettes and the bone-pale eyes read), bone-pale stone, ribs and candles (#ddd4c4), ash-lavender far mist (#a69cc0); the fewest stars (0.7) and one dim ash-rose nebula; warmth comes from amber memorial candles (`glow` #f0b45e on the floating candles, `candle` #ed9e3b on the terraces at the rib roots and on islands).
- **Hero:** *The Two Who Kneel*: the two veiled giant islands kneel facing each other over the Well, **no faces at all, only cloth**, their joined hands holding an extinguished lantern; overhead the *Old Ribcage*, 8–10 pairs of curved bone tubes arching across the ceiling against the stars (the Rib Arch pillars are its lowest ribs), memorial candles still burning at their roots. A thin crack-light falls on the dead lantern (accent light #1).
- **In the lake:** funeral barge wrecks, memorial posts with tattered ribbons, cairns topped with candles, vertebrae jutting from the water, the pale causeway.
- **Shore & rings:** bone-white terraces with rows of candles, a ruined funerary colonnade, huge iron chains descending into the water (some taut, as if holding something below), a sealed great door traced faintly in gold; the vault near-black with a few stars and an ash-lavender horizon band so the giants read as dark silhouettes against pale mist.
- **Floating:** memorial candles on tiny bone rafts (about 40% lit), paper boats, drifting pale petals.
- **Particles:** ≈ 220 falling bone-ash motes, ≈ 30 rare gold sparks drifting upward. **Shafts:** one thin pale-gold shaft (the hero) and a faint pale one near the raft.
- **Gloom tell:** the Ribcage "inhales" (scale y 1.0 → 1.02 over 6 s), gold dims, the water goes to pure ink; before the player owns Drowned Marrow, two gold eye-glints may open far out in the fog during the gloomtide. **Victory:** every memorial candle lights gold, one by one, from the raft outward.

### 19.7 Characters
- **The Wick** (≈ 0.6 m): an egg-shaped body in a **patched umber-rust cloak** (#4a2e24, hem frayed into 3–4 points) with a pale wax collar; head a short fat **ivory candle** (#e9dfc6) with a melted rim and 3–4 drips; a deep **hollow face recess** (ink-dark inset, no mask plate) holding **two small glowing amber eyes**. A living flame on top = vitality: tall amber when healthy, orange-red and shorter below 50%, a guttering pale blue (#a2c8ff) at 1 Ember; it flares 1.4× when eating or rendering. Stubby legs dangle over the edge while waiting; a long bent driftwood rod with a bone reel and a tiny brass bell. Idle: a wax drip falls (plip), the cloak breathes, the head tilts toward splashes, hands warmed at the brazier at dusk. *Not-the-Knight check:* no horns, no white mask, no black oval eyes, no grey-blue cloak. The candle head is the signature.
- **The raft:** lashed dark planks, a crooked pole with a hanging iron lantern (the main light), a tiny brazier, a lidded wicker creel, a bone rod-rest, an oar, an oxblood pennant, a small chime. Raft levels 1–3 add an outrigger, a second lantern hook, a canvas awning. Mounted trophies hang from the pole.
- **Old Murk:** a hunched, enormous umber toad (#575047, with tufts of rust-moss #7a5838 and ochre #a87e40 and pale lichen patches #c8bca2), warm against the cold water by temperature, not by light; heavy-lidded faintly glowing pale-yellow eyes (#e8e08a), a drooping lip, a moth-eaten shawl; a towering teetering pack (jars of murky bait, empty birdcages, coiled rope, dead lanterns, rods, a crooked umbrella, a fish-bone wind chime); a dim sage-green lamp (#a6d4a0, the game's one deliberate green light; its reflection on the water is a short, dim pinpoint, never a column) on a hooked pole; a withered autumn-bronze lily-pad barge (#8a6842 → #3a291b) with a hand bell on a post. Slow blinks, throat-sac swells before speaking, an occasional tongue-flick at a passing moth.
- **Gloomlings:** near-black ink bodies (#07080d) with a faint violet rim (#8a76bd) and distinctive eyes (per-lake eye colours in data; Mossmere eyes are moon-white or pale cold rose, never a mote's silver-grey, and never near danger red or the Cinder amber). *Gloomling*: a fist-sized curl of living ink, pinprick eyes, a smoke tail. *Inkmite*: soot-black ticks with one pale cold-rose glint (#f2b6c8), moving like spilled grain. *Duskmantle*: powder-violet moth whose wings carry two pale-blue painted eyes. *Creelsnatch*: a ribbon of shadow with hook-teeth and cold-rose eyes (#f2b6c8). *Sporeling*: puffball gloomlings trailing amber spores. *Weeping Inkwell*: a tall bowed figure with a swollen ink-sac under its chin, black tears running into the water. *Bell-Jar Tick*: a hound-sized tick under a cracked glass bell-jar, a pinned moth still inside. *Silent Choir*: tall veiled figures in rows; outside the light only gold pinpricks. *Drowned Hand*: a colossal dripping hand rising from an ink stain, tarnished brass rings on two fingers.
- **Wardens** (model `warden`): *The Wickeater*: a colossal hooded gloom with a hollow moon-lit maw and candle stubs in its hem like teeth. *The Veiled Gardener*: towering, draped in plum veils of mould, an amber glow where a face should be. *The Shard Abbot*: robed in shelved crystal like a walking library. *The Lightless Ferryman*: a hooded giant poling a boat that isn't there, a dull gold coin for each eye.
- **Weapon VFX** (toon glows and lines, additive): amber coals with ink comet-tails; pale seeds of light; a low orange ribbon of fire on black water; a barbed iron hook on a glowing thread; white-gold forks; an old bronze bell with frost-blue rings; the light itself throbbing outward as an ink-edged ring; cracked cork bobbers with ember light; an ink spiral rimmed with periwinkle foam (#9aa6ff, hot core #dcdfff); hard pale lighthouse shafts.

---

## 20. Audio direction (procedural WebAudio, original, melancholic)

**Synth recipes.** *Harp*: Karplus-Strong or a triangle with a 1.2 s exponential decay through a 2.4 kHz lowpass. *Bowed drone*: 2 detuned saws (±6 cents), lowpass 300–600 Hz, 0.07 Hz LFO on the cutoff. *Glass*: sine partials 1 / 2.76 / 5.4, 0.4 s attack, 4 s release. *Bell*: inharmonic partials 1 / 2.0 / 2.4 / 3.0 / 4.5, 6 s decay. *Choir*: saw into formant bandpasses (ah 700 / 1220 / 2600 Hz; oo 300 / 870 / 2240 Hz). *Drip*: sine blip 1800 → 600 Hz in 60 ms. *Reverb*: generated 4–7 s impulse, wet 0.35–0.5.

| lake | mode / root | tempo | colour | motif `[midi, beats]` |
|---|---|---|---|---|
| Mossmere | D Dorian | 58 BPM, 3/4 lilt | soft harp plucks, cello-like drone D2 + A2, random water drips on D F G A C, a distant G bell every 16 bars | `[62,1][65,1][69,1] [67,2][65,1] [64,3] [62,3]` |
| Sporewood | C♯ Aeolian | 66 BPM, 6/8 lullaby sway | music-box celesta, breathy pad, soft wooden knocks, pitched "pop" blips, gentle rubato | `[73,1][76,1][80,1] [78,1.5][76,1.5] [75,1][73,2]` |
| Glasswater | F Lydian | 50 BPM, free time | glass-harmonica pads, high crystalline pings with 6–8 s tails (F pentatonic + B), F1 sine sub-drone | `[77,2][84,1][83,2][81,1][76,4]` |
| Pallid Deep | C Phrygian | 42 BPM, very sparse | organ-like drone of stacked fifths (C1/G1/C2, lowpass 220 Hz), "oo" choir in long Cm(add♭2) chords, a funeral bell on C3 every 8 bars, a rare gold shimmer arpeggio | `[60,2][61,2][63,3][60,5]` |

**Moods** (`audio.setMood`, layered on the lake palette): *title*: solo harp plays the Mossmere motif at 50 BPM over drips. *calm*: the lake theme. *dusk*: master lowpass sweeps to 900 Hz, slow tremolo, melody density halves. *gloom*: the drone root drops a semitone with an added tritone; a two-thump heartbeat (55 Hz sine with pitch drop) from 66 BPM rising to 84 with enemy count; bandpassed-noise whispers; the melody becomes a low 4-note ostinato. *reel*: tempo ×1.25, a plucked ostinato whose pitch climbs with tension, a high shimmer while in the sweet band. *boss* (Warden or legendary hooked): 5/4 low thumps, low "brass" swells, a choir cluster, the lake motif in 4× augmentation. *dawn*: a rising chord resolving to a major third, an upward harp arpeggio, one bell. *death*: one harp line descending through the mode over an octave, a final low bell, then drips. *victory*: the mode brightens to Lydian, cascading bells, open "ah" choir, a harp glissando, a long chord with a gold shimmer arpeggio fading over ≈ 12 s.

**SFX** (contract list) with notes: `zap` a dry electric tick; `flare` a whoomph plus a bright sizzle tail; `aura_burn` a soft crackle, throttled ≤ 8/s; `enemy_die` an ink "pop" pitched by size; `xp_pickup` glass ticks rising in pitch within a 0.5 s chain (throttled); `levelup` a three-note harp rise; `boon_pick` a bell; `boss_roar` a low formant groan; `merchant_bell` always the same small brass bell (reads as Old Murk in every lake); `heartbeat` at hp ≤ 2; `line_strain` a creaking string rising with tension; `line_snap` a sharp twang + splash. Zone colour: bobber plop and splash pitch ×1.0 / 0.95 (+ spore puff) / 1.1 (+ glassy ping) / 0.85 (longer reverb).

---

## 21. UI/UX

### 21.1 Style
*Type, linework and panels are now set by §21.6 (UI style v2); the colour roles below still apply.*

Thin ornate **bone-white linework** (#e9e2cf at 80%) on **ink-wash panels** (near-black, 70–85% opacity, soft paper texture), serif type (Cinzel for titles, Cormorant Garamond for body; Georgia fallback), restrained motion (fades and 150–250 ms eases), rarity colours from `RARITY_COLORS`. Nothing loud; nothing that copies another game's HUD.

**Colour tokens** (Moonlit slate; the UI follows §19's palette rule: no mint, teal or lime anywhere, the only green is Murk's sage lamp marker and portrait lamp). The Fine badge, positive stat chips, lore toast title and shop kicker, banner/logotype/loader glows, panel haze, gate and spot markers, shallow depth label, reel shards, Murk portrait body and the `--zone-glow` / `--zone-accent` fallbacks must all move off mint/teal to these values; only the merchant marker and the portrait's lamp stay sage.

| token | value | used for |
|---|---|---|
| `--bone` / text | #e9e2cf (keep it warm) | linework, body text |
| `--muted` | #9aa3b4 (pewter) | secondary text |
| `--ink` | #06080c | outlines, deepest panel ink |
| `--bg` | #0b0e15 | screen backgrounds |
| `--panel` / `--panel-hi` | rgba(18,23,34,.82) / rgba(30,37,52,.9) | ink-wash panels |
| `--panel-haze` | rgba(70,82,110,.18) | the panel/modal radial haze (was a teal haze) |
| `--line` | rgba(196,206,226,.22) | hairlines on panels |
| `--zone-glow` / `--zone-accent` / `--zone-fog` / `--zone-lamp` | runtime from `palette.glow` / `.accent` / `.fog` / `.lamp ?? .glow`; fallbacks #a9b9f0 / #c4b8ec / #262f40 / #c8d2f0 | day-arc calm segment, zone cards, waystones |
| `--amber` / `--amber-hi` / `--ember` | #ffb347 / #ffd98a / #ff8a3d | the lantern, oil, Cinders, flare (readability: unchanged) |
| `--blood` / `--danger-deep` | #e0533d / #5a0a14 | danger, low HP (unchanged) |
| `--r-common` … `--r-legendary` | #d8d2c0 · #a6c6e6 · #b48cff · #ff8fc0 · #e8c66a | `RARITY_COLORS` (uncommon is a pale moonstone, apart from Glasswater's ice-blue) |
| `--q-fine` | #a6c6e6, border rgba(166,198,230,.5) | Fine quality badge (`QUALITY.fine`) |
| `--q-perfect` | #ffe2a8 | Shimmering quality |
| `--depth-shallow` / `-mid` / `-deep` | #a8c8f0 / #ffc27a / #b48cff | charge-meter depth label (matches the reticle) |
| `--chip-pos` | #d6e2f6, border rgba(170,190,235,.32) | positive stat chips |
| `--lore` | #ccc4ea (lilac-silver) | lore toast title, shop kicker |
| `--halo` | rgba(180,196,240,.35) | banner and logotype glow, loader title glow |
| `--mk-gate` | #c0bcf0, glow rgba(182,184,238,.45) | gate edge marker (the gate's periwinkle-lilac filigree); `ui-hud.onZone` re-derives it per lake from the filigree (glow/accent half and half, lifted 12% toward white), so it follows the gate in every lake (Mossmere #c0c1f0) |
| `--mk-spot` | #d0c8f4, glow rgba(208,200,244,.3) | spot edge marker (the lilac-moon spot pulse) |
| `--mk-merchant` | #a6d4a0, glow rgba(166,212,160,.4) | Murk's edge marker: the one sage-green UI trace (his lamp) |
| `--reel-shard` | #e8f4ff → #5cbcff, glow rgba(92,188,255,.85) | Glass Sovereign reel shards |
| loader | background #0c1018, title glow rgba(180,196,240,.35) | boot screen |
| Murk portrait | body #2a241e / #1e1a16 / #0f0c0a, strokes rgba(200,180,150,.5), lamp #d2ecc8 → #8fbf88, flame #e0f4d6 | shop and merchant portrait (umber toad, sage lamp) |
| fish-art fallback | body #6e7684, belly #d8dae0, fin #3c4452 | journal/catch art when a species has no model colours |

### 21.2 HUD (playing)
- **Bottom-centre "lantern cluster"** (the original signature layout): a vertical lantern-glass **oil gauge** (amber fill that dims and narrows as it empties; cracks glow at ≤ 25%); a curved **wax-drip satiety bar** hugging its left side; a row of small **Ember flames** in an arc above the lantern (the last one gutters blue). Flare cooldown is a ring around the lantern's cap on desktop.
- **Top edge:** a hairline **cinder ribbon** (XP) across the full width with a small diamond **level** medallion at its left end; owned boon icons in two tiny rows beneath it (weapons, then passives; level pips; Kindled icons gilded).
- **Top-centre:** the **day/phase clock**: a thin crescent arc with four segment ticks (calm, dusk, gloomtide, dawn), a moving bead, "Day N", the lake name small beneath. During the gloomtide the arc shows the hush tick near its end.
- **Top-right:** Shells (shell glyph), creel count (n / size), equipped bait (tap to cycle), perfect-streak flame pips; then 44 px Creel / Journal / Pause icons.
- **Right side (touch) / bottom-right (desktop):** Flare button (72 px with radial cooldown), Burn button (shows the fish to be burned), contextual Trade / Descend pill.
- **Edge markers** (off-screen, at the screen border with distance): Murk's green (sage) lamp, the gate (dim while sealed, bright when open), the nearest two spots (shimmer), the legend pool (gold, when active), elites and Wardens (red eye), a floating stolen fish.
- **World-space:** damage numbers (setting), "Warded", "Clean Cast", float texts, interaction prompts.

### 21.3 Fishing UI (from `fishing.view`)
- **Charge meter:** a slim curved bar beside the Wick that fills and empties with the ping-pong (gold flash in the clean zone), plus the depth reticle on the water (§5.1).
- **Waiting:** the bobber; a gold double-dip tell with nibbleTells; "!" on the bite with a shrinking ring showing `biteWindow`.
- **Reel gauge:** a horizontal ornate gauge (≈ 280 × 18 px) at ≈ 62% screen height: the pale **safe band** (0.15–0.85), the bright **sweet band** drifting, a tension needle, red danger glow from `danger`, the outline pulsing on `surgeWarn` with the ▼ / ▲ glyph, a progress arc around a small fish silhouette above it, the species name once hooked. Legendary phases show their name under the gauge.

### 21.4 Screens & modals
- **Catch card** (blocking): the fish model (`actors.showCatch`), name (+ epithet), weight, quality badge, sale / food / oil numbers with multipliers applied, **NEW** and **RECORD** ribbons, the lore line on first catch. Buttons: **Keep** (if full: a mini list to swap out a fish), **Eat (+X)**, **Render (+X)**, **Release (+luck)**. Legendaries: Keep (Trophy) or Release-to-Murk later.
- **Level-up picker** (blocking, auto-opens on `levelup`): 3–4 cards with rarity border, icon, name, "NEW" or "Lv 2 → 3", the level `note`, tags; Kindle cards gilded with both icons fused. Reroll (count) and Skip (+Shells) buttons; keys 1–4 / R / S.
- **Shop** (§13.2), **Creel** (fish list with Eat / Render / Release, bait equip), **Journal** (§16), **Descend** (§14), **Pause** (resume, settings, abandon run, title).
- **Title:** GLOOMWATER in Cinzel over the slow title camera; Continue / New Descent (character select with locked silhouettes + their challenge, Waystone choice) / Shrine / Challenges / Journal / Settings; the tagline.
- **Kindling Draft** (Waystone starts): fast consecutive pick screens with an auto-draft button.
- **Death:** the cause title ("Your Light Went Out"), an epitaph, day / lake / level, the Memories breakdown counting up, records, challenges completed this run, **near-miss lines** (toll distance, next relic cost, the legendary's escape progress, the next locked Wick's challenge progress), the top damage source with one tip; buttons Shrine / New Descent / Title.
- **Victory:** the victory text over the candle-lighting sequence; Return to the Surface / Keep Drifting (endless).

### 21.5 Banners, toasts, tips
- **Area-title banner** on `zone:change`: lake name + subtitle between two thin ornament lines, 3.5 s fade, then the lake's lore line as a `lore` toast on first visit.
- **Phase banners** (`TEXT.phaseBanner`), **Warden banner**, **Kindle banner**, small **formation banner**, **legendary hooked** banner.
- **Toasts** under the clock, max 3 stacked, kinds info / good / bad / lore (lore in italic serif).
- **Tips**: each shown once (`meta.seenTips`), as a toast with a small quill glyph; never during the level-up picker; at most one every 6 s.

| id | trigger | text |
|---|---|---|
| `sail_basics` | `run:start` | Sail with WASD or the left stick. Shimmering water marks a feeding spot. |
| `cast_basics` | `player:anchor` | Hold on the water to charge a cast. Release near the meter's peak. |
| `depth_read` | `fishing:cast` | Deeper water holds rarer fish. The reticle shows how deep you are casting. |
| `nibble_wait` | `fishing:nibble` | Only a nibble. Wait for the bobber to plunge, then tap. |
| `miss_early` | `fishing:miss:early` | Too eager. Nibbles are tests. Strike when the bobber sinks and '!' shows. |
| `miss_late` | `fishing:miss:late` | Too slow. Tap the instant it plunges. A fast hook earns a finer catch. |
| `miss_moved` | `fishing:miss:moved` | Moving the raft pulls your line. Stay still while you fish. |
| `reel_band` | `fishing:hook` | Hold to reel, release to ease. Keep tension in the pale band; the bright core doubles it. |
| `surge_release` | `fishing:surge` | It surges! Let go until the fury passes, or your line will snap. |
| `escaped_slack` | `fishing:escaped:slack` | A slack line lets them slip free. Always keep a little tension. |
| `escaped_snap` | `fishing:escaped:snap` | Snapped. Release during surges. Old Murk sells stronger line. |
| `catch_choice` | `fish:landed` | Eat it for Satiety, Render it for Oil, or Keep it to sell to Old Murk. |
| `merchant` | `merchant:arrive` | A bell across the water. Old Murk has moored. Sail to his green lamp. |
| `trade_prompt` | `interact:change:merchant` | Press E or tap Trade. Sell your creel, buy gear, take a bounty. |
| `dusk_warn` | `phase:change:dusk` | The light is thinning. Murk has gone. Fill your lantern while you can. |
| `gloomtide` | `phase:change:gloomtide` | Gloomtide. Your light burns what enters it. More oil, wider light. |
| `enemy_zap` | `enemy:spawn` | Tap a gloomling to zap it. Press F or Flare to burst everything near. |
| `cinders` | `enemy:slain` | Gloomlings leave cinders. Sail over them to grow your flame. |
| `levelup` | `levelup` | Your flame grows. Choose a boon: it lasts the whole descent. |
| `elite` | `enemy:spawn:elite` | Ink spreads under you: a hand is rising. Move, or flare it as it breaches. |
| `low_oil` | `resource:low:oil` | Your lantern gutters. Tap Burn (R) to render a fish into oil, now. |
| `lantern_out` | `lantern:out` | Your light is out. Render any fish to relight it before the dark bites. |
| `low_food` | `resource:low:satiety` | Your wax runs thin with hunger. Eat something from the creel. |
| `low_hp` | `resource:low:hp` | Two Embers left. Dawn mends one, a full belly mends another. |
| `steal` | `enemy:steal` | Something stole from your creel! Kill it before it flees to get the fish back. |
| `dawn` | `phase:change:dawn` | You outlasted the Gloomtide. Each night it returns hungrier. |
| `gate_open` | `gate:open` | The Descent Gate churns open. Pay its toll at the whirlpool to go deeper. |
| `warden` | `boss:spawn` | A Warden rises. Watch its tells, kite it, and keep your light wide. |
| `new_species` | `journal:new` | A new name in the Journal. Some fish answer only to certain baits. |
| `zone_unlock` | `zone:unlock` | Deeper waters pay more, and the dark there bites harder. |


### 21.6 UI style (v2): Drowned Filigree, with an ink-wash catch card
The player's choice (docs/v3/ui/CHOICE.md, "A, but with C's catch card"); it supersedes the type, line and panel rules of §21.1 (the colour roles of §21.1 still name what each accent is for). Every new screen follows it.

- **No boxes.** A modal is words floating on a soft pool of **night ink** (`.gw-panel::before`: `rgba(10,12,25,.84)` feathered on both axes) over a radially vignetted scrim; the world stays visible around it. No borders, no inset rings, no corner pieces, no boxed buttons or tiles.
- **Ornaments** (ui-icons.js, pale ink in `currentColor`): the **filigree crest** (hook curls, a cast line and reeds with a float in the centre; `#gw-crest`, `ORN.crest`) above every title and banner; a **flourish** (a drop over rings, line ending in curls; `#gw-flourish`) closing every panel, under banners and the death head, and as the small "chosen" mark under tabs, tiles and bait; the **hook curl** (`ORN.hookL/hookR`), twin curls on either side of a chosen button's label that **draw themselves in** (stroke-dashoffset, ≈1 s); the **line-and-curl rule** (`#gw-rule`) for section heads, toast titles, the HUD day line and the reel line's ends; the brushed **ring** for medals, markers and the joystick. Each exists as an SVG symbol in one sprite (`spriteSvg()`, injected once into `#ui`) and as a CSS mask (`--orn-*`). Never copy another game's shapes.
- **Chosen / focused**: the words go from dim lavender (`--ink-dim`) to ink (`--ink`) with a lavender glow (`0 0 18px rgba(160,150,240,.5)`) and the twin hooks draw in. Keyboard focus and the autofocused default show it; on touch the primary action keeps its hooks. Under `prefers-reduced-motion` nothing animates (the hooks simply appear).
- **Type**: **Marcellus SC** for titles, menu items, buttons, labels and every spaced capital (uppercase, tracking .12–.3em); **Alegreya** for reading text and numbers. Sizes (desktop / phone): logotype 104 / 36 px, panel title 40 / 29, menu items 30 / 23, buttons 19 / 17, body 19 / 18 (never under 17 on a phone), labels 14.5 / 13.5. Tap targets ≥ 44 px.
- **Colour tokens** (the reference palette): night ink `#0A0C19` (veils), deep indigo `#1D245D`, violet dusk `#433E74`, lavender mist `#7E81B4`, **nebula pink** `#D296AE` (rare moments: "new" kickers, the Gloomtide), **candle amber** `#ED9E3B` (the lantern, oil, embers, cinders), **pale gold** `#E8BE77` (trophies, prices and yields, handwriting), autumn ochre `#B8893A`, pale stone `#D6D6E4` (satiety, common rarity in the UI). UI ink: text `#ECEBF6`, dim `#AEACD0`, glow `rgba(160,150,240,.5)`. Zone-token fallbacks are lavender. No green or teal anywhere but Murk's sage lamp.
- **HUD** (A-hud-reeling): top-left the day in spaced capitals ("DAY II") with the lake and phase in italics, over the **day line** (one stretch per phase, a bead for the hour, ending in a curl) and the countdown; level ring and boon icons beneath. Top-right Shells, creel and journal count with thin line icons (creel and journal are buttons), pause, then bait. Bottom-centre the **lantern oil as a thin amber arc with a small candle flame**, satiety as the inner stone arc, Embers as small flames above it. Flare and Burn are dark pools in a ring with a thin amber cooldown arc; the interact prompt is a word between hook curls. The **reel line** is a hairline with curled ends, a pale safe band, a bright sweet band and an amber diamond marker; the species name above in spaced capitals, the hint in italics below.
- **Catch card = direction C, "Ink-Wash Field Journal"**: a feathered ink patch (an SVG path through turbulence + displacement, `#gw-ink-edge`) instead of a box; two columns on desktop, one on a phone. Left: the fish as a **pale ink sketch** (`drawFishInk`: the species' own illustration with its ink lines lifted out of the fills, through the `#gw-brush-fx` filter), a measuring line, and a **handwritten note** in pale gold (Cedarville Cursive) built from the catch: estimated length (from weight and body shape), a phrase for its state, the bait and the hour. Right: a kicker (pink for new / record, gold for legends), the species name in **IM Fell English SC**, a **red rubber stamp** for its class (LEGEND › RECORD › NEW › SHIMMERING › FINE › size: TROPHY / LARGE / FAIR / SMALL), length / weight / worth with handwritten values, one italic lore line, and the actions as words with a **brushed gold underline** under the chosen one (keys 1–4 and the arrows still work).

---

## 22. Originality notes
- **Inspiration is the art style only:** moody hand-inked melancholy, silhouettes, layered depth, bioluminescence, thin ornate UI.
- **Never used:** Hollow Knight names, characters, places, currencies, items, enemies, music or HUD layout. Avoided words include Geo, Soul, Charm, Vessel, Grub, Shade (UI says "gloomlings"), Husk, Lumafly, Dreamer, Mourner, Archives, Greenpath, Hallownest, Mask, Pale + material item names, Abyss as a display name, and any "Kingdom's ___" patterns.
- **Renames made for originality:** the final lake displays as **The Pallid Deep** (its id stays `paleabyss`; the contract fixes "Pale Leviathan"); the Sporewood Warden is **The Veiled Gardener** (earlier drafts' "Sporeshroud" and "Mourner" names were dropped); the Pallid Deep hand is **The Ringed Grasp** and its legend bait **Drowned Marrow** (no "Pale + thing" names beyond the contract-fixed Pale Leviathan); the lens upgrade is the **Moth-Dust Lens**; no "-song" boon names; XP is **Cinders** and health is **Embers**.
- **The Wick is not the Knight:** a round candle with a melted rim, an umber-rust cloak, amber eyes in a hollow recess, a flame that is its health. No horns, no white mask, no black oval eyes.
- **HUD:** vitals live in a bottom-centre lantern cluster with a full-width top XP ribbon; there is no top-left row of masks and no soul orb.
- **Audio:** original motifs in modes chosen per lake; nothing quoted.

---

## 23. Implementation notes

### 23.1 Who reads what
*Walking build (§24): who reads the v2 tables is listed in §24.12; CONTRACT §12 has the APIs. v3 (§25): the second table below lists what each module reads from the v3 tables and which §25 rules it implements; CONTRACT §13 has the APIs and §13.8 every v3 data export. v3 tables are applied only when `data.V3_ENABLED` is on; until then read every v3 field defensively.*

| module | reads from data.js | key rules in this doc |
|---|---|---|
| player | `BALANCE.move`, `STATS.moveSpeed`, `ZONES[].arena.spawn` | §4.1–4.2 |
| world | `ZONES` (arena, palette, grade, description) | §4.3–4.6, §19 |
| survival | `BALANCE.phases/drain/light/damage/heal/low`, `gloomtideLength`, `difficultyFor` (drainMult) | §6, §8.1 |
| combat | `ENEMIES`, `FORMATIONS`, `BOONS`, `BALANCE.combat/xp/light`, `difficultyFor`, `xpForLevel`, `weaponScale`, `heatFor` | §7, §8, §10 |
| fishing | `SPECIES`, `BAITS`, `BALANCE.cast/bite/reel/spots/legend/quality`, `QUALITY`, `RARITY_WEIGHTS`, `DEPTH_BANDS` | §5 |
| progression | `STATS`, `UPGRADES`, `SUPPLIES`, `BAITS`, `RELICS`, `CHARACTERS`, `CHALLENGES`, `BOUNTIES`, `JOURNAL_PERKS`, `BALANCE.economy/merchant/journal/travel/bounty`, `memoriesFor`, `fishXpFor` | §9, §11–§17 |
| ui | everything with text: `TEXT`, `TIPS`, `MERCHANT_LINES`, `EPITAPHS`, `RARITY_COLORS` | §3, §21 |
| audio | moods and SFX | §20 |

**v3 (§25) additions, by module** (v1 / v2 reads above stay; The Long Descent keeps them as they are):

| module | reads from data.js (v3) | key rules in §25 | phase |
|---|---|---|---|
| main | `V3_ENABLED`, `COVE` (feature detection with `progression.createExpedition`), `EXPEDITION.save` | §25.3.2 saving, §25.14.1 rollout | P1 / P3 |
| player | `EXPEDITION.homeward`, `COVE.arena` (walk, spawn, jettySpawn, moorings), `COVE.stations`, `COVE.tapToWalk` | §25.3.1, §25.4.1–§25.4.2 | P3 |
| world | `COVE` (arena, palette, grade, walls, wings, frames, waystones, seaGate, growth, budget), `MOSSMERE_V3` (via `ZONES[mossmere].arena.places / watchLamps`), `CONDITIONS.looks`, `PLACE_SYNC_V3` / `WALK_SYNC_V3` (applied), `ZONES[].homeward` | §25.4, §25.8 | P2 / P3 |
| water | `COVE.palette`, `MOSSMERE_V3.happening.clear`, `CONDITIONS.looks` | §25.4.6 pond pass, §25.8.4 Moonfall, §25.8.3 Glowtide | P1–P3 |
| render | `BALANCE.cameras`, `BALANCE.ceremony.camera`, `COVE.grade` | §25.4.5, §25.6.8, §25.7.5 | P1 / P3 |
| models / actors | `SPECIES[].size`, `SIZE_CLASSES`, `BALANCE.ceremony.poses`, `FISH_SHAPES_V3`, `COVE.pond`, `COVE.murkLook`, `ELDER_NAMES` | §25.7.1, §25.6.8, §25.4.6 | P1–P3 |
| survival | `EXPEDITION.phases` / `calmByMode` / `arrivalHush`, `BALANCE.oil`, `BALANCE.wellFed`, `BALANCE.farWater.nightBurn`, `BALANCE.nightModes` (snuffBy, lampWatch) | §25.3.2–§25.3.3, §25.5.2 | P1 / P3 |
| combat | `BALANCE.nightModes`, `BALANCE.xpModes`, `swarmTonight` / `swarmWindow`, `ANGLER_POOL`, `BOONS_V3`, `CHARACTERS[].fishing`, `EXPEDITION.deepStarts` | §25.5 | P1 / P3 |
| fishing | `BALANCE.size` (z, fight, reel, value), `BALANCE.favour`, `BALANCE.signs`, `BALANCE.bite` (v3 keys), `BALANCE.ceremony`, `BALANCE.residents`, `BALANCE.markedFish`, `BALANCE.placesV3`, `SPECIES[].size / style / family / prefers / weather / maxClass`, place fields, `CONDITIONS`, `TACKLE`, `LURES`, `COVE.fishing`, `COVE.testBuoy`; helpers `sizeLength`, `sizeWeight`, `sizeClassOf`, `isAncient`, `maxZFor`, `favourNotches`, `classOdds` | §25.6, §25.7, §25.8 | P1–P4 |
| progression | `EXPEDITION`, `LONG_DESCENT`, `TACKLE`, `OUTFIT`, `LURES`, `COMBAT_KIT`, `BALANCE.farWater`, `BALANCE.liveWell`, `BALANCE.records`, `BALANCE.tackleRating`, `MEMORIES_V3`, `ECONOMY_V3`, `RELICS` (shelves), `CHALLENGES` (48, tabs), `LEDGER`, `RUMOURS`, `TODAYS_RUMOUR`, `RENAMES` (save migration); helpers `fishValueV3`, `fishYieldV3`, `farWaterFor`, `tallyFor`, `frameFor` | §25.3, §25.7.3–§25.7.4, §25.9–§25.11 | P1–P3 |
| ui | `TEXT_V3`, `TIPS_V3`, `MERCHANT_LINES_V3`, `CHALLENGE_TABS_V3`, `SIZE_CLASSES` (seals), `BALANCE.favour.notches`, `BALANCE.nightModes[mode].hud`, `COVE.stations` | §25.4.2, §25.5.7, §25.6.1, §25.6.8, §25.14 (U-items) | P1–P4 |
| audio | (event-driven; no new tables) | §25.12 row 20, §25.14 (Au-items) | P1–P3 |

**`getStats(run)`** = STATS base + character effects + upgrades × level + relics × level + stat boons × level + journal perks + `run.flags.heartwax` (maxHp) + Mercy (rarityBonus), then clamp to each STATS `min…max`. Special relic keys are applied by `createRun` / `memoriesFor` / survival as described.

*v3:* with no run (the hub), `getStats()` = STATS base + the selected Wick + `meta.tackle` (absolute tier stats, `TACKLE`) + `meta.outfit` (`OUTFIT` × level) + relics (no Boons); during an expedition the same plus Boons, Well-fed and journal perks. `createExpedition({zone, nightMode, character, outing})` replaces `createRun` outside The Long Descent (CONTRACT §13.7); The Long Descent still uses `createRun` with its own purse and per-run UPGRADES.

**`createRun({startZone, character})`**: shells = 20 + 30 × old_debt level + character kit shells + Waystone purse; bait = character kit + Drifter's Bundle; `boons = {[startBoon]: 1}`; zonesUnlocked = all lakes ≤ start; hp/oil/satiety at max; `xpNext = xpForLevel(1)`; `flags = {zoneEnteredDay: 1, streak: 0, mercy: 0, heartwax: 0, wounded: {}}`; Waystone banked levels → Kindling Draft at run start.

### 23.2 Optional extensions (always read defensively)
`difficultyFor(…, {nightInZone})` and its extra return fields; enemy fields `flies, waterBound, pack, packPerHeat, maxAlive, auraTaken, telegraph, variants, zoneMods, abilities, phase2`; boon fields `kindle, proc, onPick, levels[].note`; character `quirk`; species `boss, hint, epithet, tier`; bait `zone, legend, attract, weightBias, shimmer, gloomDraw`; `fishing.view.surgeKind / decoy / shards / bandsHidden`; `fishing:escaped {cut:true}`; `progression.tryRevive?.()`; `survival.spawnEnemy?.()` for scripted summons; `ctx.debug.threat?.()`; ui's Burn-a-fish (R) and Kindling Draft; settings `reelToggle`, `reducedFlashing`. Balance-pass additions: `difficultyFor(…).bossHpMult` (Warden hp = base × bossHpMult), `heatFor(day, zoneIndex, nightInZone)` (linger Heat), `BALANCE.combat.director.{lingerFrom, lingerHeat, bossHpLin}`, `BALANCE.combat.legendPausesElites`, `BALANCE.heal.heartwaxOnce`, `BALANCE.economy.newSpeciesLegendary`, `BALANCE.memories` (all `memoriesFor` constants).

### 23.3 Debug hooks (contract §11) used by this design
fishing `forceBite()`, `instantCatch(id?)`; survival `skipPhase()`, `god(on)`, `setPhase(name)`; combat `spawn(idOrKind)`, `killAll()`, `levelUp()`, `giveBoon(id)`; progression `addShells(n)`, `addMemories(n)`, `unlockZone(id)`, `giveFish(id)`, `openGate()`, `completeChallenge(id)`; ui `ui()`.

## 24. Exploration on foot (v2, revision 2)

*The descent becomes a journey that changes how you move: the Mossmere is sailed, Sporewood Pools is sailed and walked, and the Glasswater Vault and the Pallid Deep are walked to interesting, unique fishing locations. Everything here ships behind one flag, `WALK_ENABLED` (CONTRACT §12.0): with it off every v1 table is bit-identical; with it on the walk tables merge in. Every number is in `src/data.js` (`BALANCE.walk / places / lamps / combat.foot`, `ZONE_V2`, `ARENA_V2`, `WALK_*`, `walkGridFor`). `node tools/walkmap.mjs <zone> [--open] [--variant=id]` prints the maps and walk times below straight from data; `node tools/validate-data.mjs` checks every v1 table and every rule in this section on the body-eroded walk grid; `node tools/balance-foot.mjs` runs the foot profile against v1 (Appendix B). §24.15 lists what changed in this revision and why.*

*v3 (§25) builds on this section and edits it in place: every v3 change is marked "v3" below and listed in §25.13. Where §24 says "descent" scope, v3 expeditions read "expedition" scope; The Long Descent keeps §24 exactly as written.*

### 24.0 Decisions at a glance

| # | decision | why |
|---|---|---|
| 1 | **Lake modes:** Mossmere `raft` (unchanged), Sporewood `mixed` (sail between four walkable islands, moor at jetties, walk to secluded pools), Glasswater `foot` (a walked rotunda; a small skiff is fenced into one moat sector), Pallid Deep `foot` (bone roads; the raft is beached). | The user's layout. Run 1 and the median first death (night 4) happen in the untouched Mossmere. |
| 2 | **One water plane at y = 0 is kept.** Height comes only from land (0.35–7 m, quantised to 0.1 m). Every "special" water is a y = 0 pool carved out of land, and **every hole has a low south rim** (a sill ≤ 1 m above the water) so the fixed camera can see into it. | Water, ripples, wakes, the depth bake, species depth bands, eels and the bobber all assume y = 0 (§24.4). The sill rule is what makes enclosed pools readable (§24.5). |
| 3 | **Fixed, hand-authored layouts** rasterised by one pure function (`walkGridFor`) that world, combat, the validator, the map tool and the simulator share — **plus per-descent variety**: one rolled map variant per walking lake (a bridge has fallen, a road is under water), an A/B twist per place, which place-kept fish are awake, and the daily Astir place. | Learnable like a metroidvania map, but not solved by run 5. |
| 4 | **Walking:** 0.84 × raft speed (5.0 m/s base) + `stride`; accel 6/s, decel 8/s (90% speed in 0.38 s, stops in ≈ 0.6 m) — the same short-window reach as the raft. No jump, no swimming, **no falling into water**. | Dodges still need anticipation; the kinematic check in Appendix B keeps foot nights within ±10% of raft nights. |
| 5 | **The lantern goes with the Wick** on a Lantern Crook; it is the only warm, flickering light in the game. | Oil = light = life follows the player; the same PointLight is re-parented. |
| 6 | **Places:** 21 unique fishing locations (6 / 8 / 7) from a 10-rule kit. Each has a base bonus, favoured species, one twist and a B variant of that twist; 8 hold **place-kept species** (Journal 32 → 40), 4 of them awake per descent. | "Interesting unique fishing locations" that pay for the walk and stay fresh. |
| 7 | **Sister-candles** (internal id `lamps`): fallen candles of Wicks who went out down here. You **share your flame** with one (12 × zone oil drain); it burns the rest of the descent in the lake's own **cold** colour, slows the swarm a little, halves the darkness tick inside its light and reveals the Silent Choir. Once each **dawn** you may **flame-leap**, free, to any sister you have relit. | Lighting the way is a real oil decision; the dawn leap means "choose where tomorrow starts", not teleport-fishing. The premise also explains the victory: every candle relights gold. |
| 8 | **Night on foot:** flyers unchanged; crawlers follow a flow field over the 0.5 m walk grid; eels reach only a Wick near open water. **Killers keep their raft values** (stain 3.2 m, telegraphs, inkwell hold 13–18 m); Warden attacks are aligned with walkways so a 1-D escape exists. | High ground and chokepoints are real tactics without softening what ends runs. |
| 9 | **Camera:** fixed yaw everywhere on foot (shop and death too); `walk` / `walkNight` framings with their own portrait numbers; the **pool framing** lifts the fish camera over the near rim; a dither cone and one x-ray proxy keep the Wick readable; a terrain clamp keeps the camera out of rock. | Readable on a 390 px phone; controls never drift. |
| 10 | **Day length unchanged** (120 s calm everywhere). **Arrival Hush** only where walking is long: +30 s on the first calm in Glasswater and the Pallid Deep, +10 s in Sporewood; no calm raid that day. **v3:** expeditions use calm 180 s (185 s in Glasswater and the Pallid Deep) and a +30 s Arrival Hush in every lake on expedition day 1 and on the first calm after passing a gate (§25.3.2); the values in this row stay for The Long Descent. | The dawn leap and the places' bonuses pay for the walking (Appendix B: catches and Shells per day within ±7% of v1). |
| 11 | **Cut on purpose:** wading, falls / "sputter", raised still pools, grapnels, Shell-cost repairs, camera yaw hints, a fog-of-war chart screen. | Scope and clarity (§24.14). |

### 24.1 Map modes

| | The Mossmere | Sporewood Pools | Glasswater Vault | The Pallid Deep |
|---|---|---|---|---|
| `mode` | `raft` | `mixed` | `foot` | `foot` |
| you start | on the raft (0, 46) | on the raft (0, 52) | on foot, Lower Gallery (0, 51) | on foot, Shore of Last Rafts (0, 68) (v3 name) |
| raft | free (as now) | free; moor at 4 jetties, tow-bells | `skiff`: moored at the Harbour Steps; fenced by the low spokes into the east / south moat; moors at the Skiff Steps on the hub | `beached` at (6, 72) among hundreds of others |
| gate | sail in (as now) | sail in: The Mycelium Veil (0, −53) | on foot: within r + 2.5 m of the Vault Seal | none (the finale is the Bottomless) |
| calm | 120 s | 120 s (+10 Arrival Hush) | 120 s (+30) | 120 s (+30) |
| calm in v3 expeditions (§25.3.2) | 180 s (+30 on day 1 / after a gate) | 180 s (+30) | 185 s (+30) | 185 s (+30) |
| walkable / pools / water | 0 / 0 / 100% | 30 / 1.9 / 68% | 49 / 2.2 / 49% | 17 / 0.3 / 83% |
| places | Bell Pool (legend, as now); v3: 8 + 1 secret (§25.8.4) | 6 | 8 | 7 (+ the Breathing Deep) |
| per-descent variant | — | — | one of three bridges has fallen | the Sunken Road, or one Pallbearers' Walk, is under water |
| night choice | open water vs. the Gatehouse | raft mobility vs. high ground (Gill Crown) | eel-free hub loop vs. the long gallery | the Brink (flat line, eels) vs. the Joined Hands (steep line, eel-proof) |

**Saving and continuing.** Walking lakes save the Wick's position, mode and raft (`run.flags.pos`, `run.flags.raft`) on every autosave (phase changes, catches, purchases, zone changes, every 30 s, hide / pagehide), plus the day's per-place counters (candle-rafts relit, the Last Ferry, the leap), the planted Stake Lantern and the Arrival Hush. A continue snaps to the nearest walkable cell (or raft water) and falls back to the nearest lit candle, so quitting is never a free escape from a dead end and never a teleport to the spawn at night. **v3:** expeditions save the position in `run.pos {zone, x, z, y, mode, mooring}` (CONTRACT §13.2), in every lake and including y; restore reads `run.pos ?? run.flags.pos`.

### 24.2 Controls & transitions

| action | touch | mouse & keyboard |
|---|---|---|
| walk | the same floating joystick (analog: half stick = half speed) | WASD / arrows |
| cast, hook, reel, zap, flare, burn | unchanged (§3) | unchanged |
| go ashore (raft → foot) | push into a jetty's glowing mooring ring (0.4 s, within 35° of its normal), or tap **Ashore** | push, or E |
| board (foot → raft) | walk onto the boarding tip and push toward the raft (0.4 s), or tap **Board** | same, or E |
| hop down a marked drop | push into the fallen-balustrade edge (0.4 s) | same |
| at dusk and in the Gloomtide | drops and Ashore / Board work **only** by pill or E (sliding along walls never crosses by accident) | E |
| ring a tow-bell, turn a winch, strike, pull a rope, make an offering, plant a Stake Lantern, Descend | the contextual pill (≥ 56 px) | E |
| share flame with a sister-candle (1.0 s), deeds that hold (0.6 s) | **hold** the pill (a ring fills) | hold E |
| flame-leap (once each dawn) | **Leap** pill at a lit candle → a radial of lit candles **in their true map directions** (56 px targets) | E, then 1–9 |
| fish here (optional) | within 2 m of a place's stand: hold the pill to charge a cast aimed at that place, release to cast | — (pointer casting works everywhere) |

**State machine** (player):
```
raft.sail ─ Ashore (within moor.range 3 m of a mooring slot, speed < 2 m/s, fishing idle) ─▶ hop 0.6 s ─▶ foot.walk
foot.walk ─ Board (|stand − slot| − raft radius ≤ 3 m, validated) ─▶ hop 0.5 s ─▶ raft.sail
foot.walk ─ push into a drop edge 0.4 s ─▶ drop (0.35 s + 0.08 s/m) ─▶ foot.walk
any switch: 3 s cooldown; crossing i-frames (0.3 s hop, 0.2 s drop) only in calm and dawn
```
- **Ashore / Board:** the raft glides to the slot and turns bow-out (`yawDeg`); the lantern PointLight is re-parented between the raft pole and the Lantern Crook; `player:mode {reason}`. Allowed in every phase (boarding at night is a legitimate escape in Sporewood), but not as an i-frame dance: no night i-frames and a 3 s cooldown.
- **Tow-bell** (every mooring): ringing it tows the raft to this mooring; ETA = clamp(path / 6, 3, 12) s.
- **Murk** still trades within 5 m of his barge, from the raft or on foot; his dock rotation is v1's. Every dock is open water ≤ 4 m from a reachable walkway, and ≥ 5.5 m from every stand (validated), so his pill never hides a stand's.
- **Interaction priority (one pill):** `gate > merchant > board | ashore > deed | candle | bell | leap | stake > fishHere`, except that **Fish here outranks Leap and a lit candle's pill within 2 m of a stand**. Candles stand ≥ 3 m from stands, docks 2.5 m, pill deeds 3 m, walk-through stations touchR + 1 m (validated), and never in the camera line south of a stand.
- **Holds:** the pill sends `player.interactHold(true/false)` on pointerdown / up and E sends it on keydown / keyup; damage cancels a hold. The Fish-here pill calls `fishing.onPointerDown({aimAt})` / `onPointerUp()` directly.
- **Never:** falling into water, swimming, ledge deaths, knock-offs. Knockback, ink-slick shoves, Grasps and the Ferryman's pull move the Wick only through player APIs, which slide along walkway edges (§24.8).
- **In the fiction:** on foot the Wick unhooks the iron lantern onto a crooked staff on its back and carries the creel as a basket.

### 24.3 On-foot controller

| `BALANCE.walk` | value | feel and reason |
|---|---|---|
| top speed | `stats.moveSpeed × 0.84 + stats.stride` | 5.0 m/s base; Long Oars and friends help on foot too; `stride` comes only from foot items. |
| accel / decel | 6 / 8 per s | 0 → 90% in 0.38 s; stops in ≈ 0.6 m. In the 0.4–1.0 s that dodges are decided the Wick covers what the raft covers (≈ 1.0 m in 0.4 s, ≈ 4 m in 1 s); it reverses faster but tops out lower. |
| turn rate | 12 rad/s (faces input above 0.15 m/s) | |
| body radius | 0.4 m | every reachability check runs on the grid eroded by this body (§24.4) |
| steps | **symmetric 0.45 m** up and down; ramps ≤ 0.5 rise/run; uphill × (1 − 0.2 · slope/0.5) | stairs are drawn as treads, collide as ramps |
| drops | one way, ≤ 3.55 m, at marked fallen balustrades only | shortcuts down, never back up |
| cast meter starts below | 1.0 m/s (no anchor brake on foot) | |
| High Cast | castMax + min(4, 0.5 × (standY − 1)) above 1 m | chapels and anchors are vantage points |
| **steep line** | standing ≥ 4.95 m above the bobber: sweet band −0.03, surge warning −0.1 s | height trades reach and eel-proof footing for a harder fight |
| interact range | 2.4 m (candles, deeds, bells, pills); trade 5 m | |

**Integration (per frame, player):**
```
dir    = rotateY(input.move + input.joy, render.getYaw()), |dir| ≤ 1       // yaw fixed: screen-relative
target = dir · topSpeed · uphill · (slick ? 0.6 : 1) · (locked | rooted | pinned | hopping ? 0 : 1)
v     += (target − v)(1 − e^(−(|dir| > 0.15 ? accel : decel)·dt));  ext *= e^(−4.5·dt)   // knock / push / pull velocity
world.moveFoot(position, (v + ext)·dt, {radius})   // displacement this frame; slides along edges; never leaves ground; sets y
```
**Fishing on foot** keeps §4.2: movement cancels charging / casting / waiting; bite / reeling / landing lock movement; holding movement 0.6 s while reeling cuts the line; `player:anchor` fires when planted. A planted Wick is never moved off its walkway.

**Casting from land.** Aim, meter, Clean Cast, bite, reel and quality models are unchanged. Additions (fishing):
- **Origin** = the rod tip (ground + 1.9 m); the arc ends on the water at y 0 and must clear land and props (sampled s = 0.15…0.95, fail where a solid is above the arc − 0.15 m); the target steps back 0.5 m along the ray as today. Casting over stone is fine.
- **Pool-scaled meter:** the meter maps onto the **first contiguous water run** along the aim ray when that run is shorter than the reach (near edge → far edge), so a 4 m font or the water inside the Coronet is as aimable as the open lake.
- **Locks drop in:** holes and greenhouse beds lock within 1.6 m; a locked cast (and a plumbed one) drops in from above, so it never needs a ballistic arc over the floor. Aim assist pulls the reticle up to 1 m toward a place target within 2 m, but **never** for reflections, drifters or moving targets.
- **Spots on walking lakes** spawn only on water within castMax − 2 m of a reachable walkway (and in foot lakes half of them inside a place's water ≥ 10 m from the Wick). Place and spot never stack (per field, the stronger applies).

### 24.4 Terrain & water model

**The water plane stays at y = 0 (decision).** Reasons: (1) water.js's swell, `getHeight`, ripples, wakes, reflections and the depth bake are built around one plane, and the fragment shader is near its uniform budget; (2) fishing (`groundPoint(ndc, 0)`, the arc and splash), fish depth bands, eels, mites and the spawn ring assume y 0; (3) a second plane would need another water mesh and shader, 3-D aiming against several planes and per-plane enemy rules, for little gameplay; (4) height variety does not need it: land runs y 0.35–7 m and every special water is a y 0 pool ringed by land, opened to the camera by its sill.

**Walk layout schema** (`ARENA_V2[zone].walk`, CONTRACT §12.4): `shapes[]` (disc / ring / rect / poly / path; per-point y makes a ramp; tags ground / ramp / jetty / bridge; `raftPass`; `needs` a shortcut), `holes[]` (enclosed pools, each with a `lip` — its south band of width w at y ≤ 1), `blocks[]` (props with a height), `variants[]` (per-descent fallen shapes, and which shortcut raises them). Ramps are listed after the platforms they climb onto, so they meet them flush (validated: every ramp can be walked end to end).

**Rasterisation (`walkGridFor(zone, {open, variant})`, 0.5 m cells, painter's order):** ground shapes → holes, then each hole's sill band → bridges → islands (at `obstacleRadius`, the same radius world collides with), pillars, blocks and candle posts set BLOCK. Heights are quantised to 0.1 m and every threshold sits on a half-step, so no rule ever compares within eps of a threshold; everyone compares through `walkHeightLE` / `walkStepOK`. Output: `top` (Float32, NaN = no ground), `flags` (GROUND, WATER, POOL, BLOCK, RAFTPASS, VOID, BRIDGE, SILL), `shape`, `pool`. One walkable layer per cell. The largest grid (Pallid, 320²) is ≈ 0.9 MB (≈ 2.5 MB with world's derived fields); the three lakes bake in 12–40 ms in Node on a desktop (budget 60 ms desktop / 200 ms phone); world bakes on `zone:change` under the zone flash and re-bakes only the changed box on `shortcut:open`.

**The cavern edge is one shape.** Walking lakes use the exact circle R (`shoreRFor`), not the noisy v1 shoreline: the grid is VOID beyond R − 0.5 and world's cliff base stands at ≥ R + 1.5 with outward-only noise and leans in only above 9 m, so land always ends ≥ 2 m inside the cliff base, and the walk grid, raft collision, depth, shore foam and cliffs agree. Raft lakes keep v1's shoreline.

**Movement rules on the grid** (player, crawler flow field, validator, map tool, simulator): 8-neighbour moves on walkable cells, no corner cutting, symmetric steps ≤ 0.45 m, authored drops. Every reachability check uses cells where the 0.4 m body fits (eroded grid). Player collision is the body circle against that boundary, smoothed with a bilinear distance-to-edge field (world's choice of algorithm; the contract fixes the result: smooth slide, no leaving ground, y = ground).

**Layers.** Under a bridge there are two surfaces; `surfaceY(x, z, layer)` and `getFlow(x, z, layer)` take the layer. Swimmers, cinders on the water, ripples, the bobber and the raft live on `'water'`; walkers on `'land'`. Non-`raftPass` bridges are solid for swimmers and the raft.

**Depth** (`world.getDepth`): 0 on land; inside a hole, the hole's depth; inside a place's water, clamped to `place.water.depth`; elsewhere today's recipe, faded to 0 within 2.5 m of land (shore foam along every walkway), with no fade inside POOL cells and a 256² bake on walking lakes so 2.4 m jetties do not grow foam halos.

**Raft navigation:** open water = WATER cells, or BRIDGE cells with RAFTPASS; `world.collideRaft` pushes the raft out of land with the land-distance field. The Hyphae Strand (y 6) lets the raft pass under; the Glasswater spokes (y ≈ 1.3) do not, which fences the skiff into its sector.

### 24.5 Camera & readability

| mode (render `MODES`; numbers in `BALANCE.walk.camera`) | elev° | dist m | aim | aimY | fov | ahead s | stiff |
|---|---|---|---|---|---|---|---|
| `walk` (day, on foot) | 40 (**v3: 34**, §25.12 row 19) | 12.5 | 3.0 | 0.9 | 50 | 0.35 | 4.4 |
| `walkNight` (Gloomtide on foot; blended by nightK) | 56 | 16.5 | 1.5 | 0.4 | 52 | 0.25 | 4.6 |
| portrait `walk` / `walkNight` (replace v1's portrait widening on foot) | 44 / 58 | 12 / 15.5 | | | 60 / 62 | | |
| high ground (blend from 3 m to 5 m) | + 3° | + 1.5 m | | | | | |

- **Yaw stays fixed** (screen-up = −Z) on foot in every mode, shop and death included. Every layout is authored for a camera looking north.
- **Focus height** follows the ground on a spring (5/s) that ignores steps under 0.25 m; `camPos.y ≥ max(1.2, focusY + 2.5)`. A **terrain clamp** samples grid tops along focus → camera and raises the elevation or shortens the distance when rock is in the way, and keeps the camera inside R − 2 (Murk's dock on the east terrace, the Shore of Last Rafts, the south-west terraces).
- **Pool framing (fish and reel).** On walking lakes the elevation is `clamp(max(base, max_i atan((top_i + 0.3) / d_i) + 8°), base, 75°)`, with `top_i` sampled every 0.5 m from the bobber toward the camera (+z) out to 12 m; whenever that lifts the camera above the base framing, or the Wick stands ≥ 2 m above the water, the focus moves to the bobber. Because every hole has a sill ≤ 1 m on its south side and its higher ground lies beyond the sill, the required elevation stays under 75°: validate-data checks that **≥ 60% of every stand's castable place water** is seen by this camera, and that ≥ 60% of each legend pool is both castable and seen from both of the Bottomless's stances.
- **Occlusion:** a dithered see-through cone from the camera to the Wick (r 0.8 → 2.6 m) discards 4×4 Bayer fragments of `occludable` world materials, never the floor at or below the Wick's feet; `occludable()` gives those materials their own program cache key and outline material, and the dither reads an instancing-aware world position. Backstop: **one x-ray proxy** (a billboard silhouette of the Wick and its lantern) drawn after world opaques and before the Wick, at 40% bone-white.
- **Authoring rules (validated):** within 14 m south of every stand (±4 m sideways) nothing rises more than 3.5 m above it; every hole's south 120° near rim is ≤ 1 m above the water; walkable spaces have no solid roofs (the Mirror Nave is roofed with open crystal ribs); each place's water lies within ±50° of up-screen or within 6 m of its stand, so the reticle never sits in the joystick corner.
- **Readability on foot:** at night the 0.6 m Wick body is small (≈ 2% of frame height on a 390 px landscape phone at 16.5 m), so the **ground ring** is what you find: 1.0 m with a heading notch, plus a thin amber rim on the Wick (both on the existing ring and outline, no new draw calls). The Wick's lantern is the **only amber, flickering light**: sister-candles burn a cold, steady light in the lake's accent colour with an ink-edged ground decal (one instanced draw) and light land through the lamp term in the land materials. Enemies within 10 m draw contact shadows on the surface below them, so height never lies about distance. QA #20: on a 390 px phone with 150 enemies and 3 candles on screen, a tester finds the Wick in under 0.5 s.

### 24.6 The three maps

Each map is printed by `node tools/walkmap.mjs <zone>` (shortcuts closed, base variant). Letters are the places in data order; times are walking times at 5.0 m/s on the body-eroded grid. Sister-candles are `L`; `,` marks a hole's low sill.

#### Sporewood Pools — "Raft & Root" (raft + walking), R 65

**Feel:** an archipelago. The raft is your horse; the four islands are groves hiding secret pools. Warm plum water, amber spores, cap tops and root cloisters.

```
x: -65 (left) … 65 (right); one char = 2.5 m, one row = 4 m; north (−z) is up-screen
 -65                     #############
 -61                ###~~~~~~~~~~~~~~~~~###
 -57             ##~~~~~~~~~~~~~~~~~~~~~~~~~##
 -53           ##~~~~~~~~~~~~~~G~~~~~~~~~~~~~~##
 -49         ##::.~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~##
 -45        #:oof:...~^^^^====~~=====^^*~~~~~~~~~~#
 -41      #...:,::::...~~~~~~~~~~~~~~L~~~::~.......##
 -37     #...::::L:::...~~~~~~@@@~~~~~~~..:::::......#
 -33    #.....::::::.....~~~~~@@@~~~~~...L:ooo::......#
 -29   #.....:::::::......~~~~~~~~~~~...::oooo::......##
 -25   #~....:.....:......~~~~~~~~~~.....:,,,,:.......~#
 -21  #~~~~................~~~~c~~~~.......:a....*...~~~#
 -17  ~~~~~~............~.~~~@@@@~~~~..............~~~~~#
 -13 #~~~~~~~~~~~~~~~~~~M~.~~@@@@@~~.~M~~~~.....~~~~~~~~~#
  -9 #~~~~~~~~~~~~~~~~~~~~~~R~~@~~R~~~~~~~~~~~~~~~~~~~~~~#
  -5 #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~@@@~~~~~~#
  -1 #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~@@@@~~~~~#
   3 #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~M~~~~~~~~~~~~~~~#
   7 #~~~~~~~~~~~~~~~~~~~~~~~@@@@~~~~~~~~~~~~~~~~~~~~~~~~#
  11 #~~~~~~~~~.~~~~~~~~~~~~~@@@@@~~~~~~~~~~~~~~~~~~~~~~~#
  15 #~~~~........b..~~~~~~~~~~@~~~~~~~~~~~~~....~~~~~~~##
  19  #~.......@.....~~~~~~~~~~~~~~~~~~~~..@.....@....~~#
  23  #..@...........~~~~R~~~~~~~~~~~~~~~.......*...@@.##
  27   #..@.@ooo.....~~~~~~~~~~@~~~~~~~~~.......o....*.#
  31    #...@ooo.....~M~~~~~~@@@@~~~R..........oooo...#
  35     #...d.L....~~~~~~~~~~@@@~~~~~~~~~....*ooo.*.#
  39      #........~~~~~@@~~~~~~~~~~~~~M~~.....Le...#
  43       #.....@@~~~~@@@@~~~~~~~~~~~~~~~~.@......#
  47        ##..*~~~~~~~~~~~~~~~~~~~~~~~~~~~.....##
  51          ##~~~~~~~~~~~~~~~S~~~~~~~~~~~~~~.##
  55            ##~~~~~~~~~~~~~~~~~~~~~~~~~~~##
  59               ##~~~~~~~~~~~~~~~~~~~~~##
  63                  ####~~~~~~~~~~#####
```

| piece | where (m) | what |
|---|---|---|
| **The Rootstool** (NE) | beach y 0.8 around **the Root Cloister** (32, −30) r 9.5, y 2.4 | the lagoon of **the Mother's Cup** r 5 (legend pool (32, −30)), its south rim broken into low water-steps (sill r 5–7, y 0.8). **Gill Climb** from the beach (19.5, −24) to the cloister's west side; **Root Ridge** (31, −38.5) → (21, −44) up to the east **Veil Anchor** (17.5, −44) y 6 with the **Swollen Counterweight**. **Rootfoot Jetty** (17, −18.5) → (10.5, −10.5). The hero Mother Cap rises beyond the NE shore. |
| **The Gillback** (NW, a fallen cap gills-up) | beach y 0.8; **Gill Crown** (−36, −36) r 9 y 4.2 with its north lobe, **the Veil Ledge** (−41, −45.5) | two ramps from the south beach; **Gill Ridge** to the west Veil Anchor; the **Crown Lip** drop (one way, 3.4 m) to the east beach; **Gill Jetty** (−16.5, −19.5) → (−10.5, −11.5). |
| **The Hyphae Strand** | (−15, −44) → (15, −44), y 6, the raft passes under | its middle (within 3.5 m of x = 0) grows once the counterweight is burst; frames the gate behind it. |
| **Lanternstalk Grove** (SW) | beach y 0.8 | **the Drowned Greenhouse** (−44, 31) 13 × 13 m at y 1.0 with four flooded beds; four Lanternstalks clear of every camera line; **Stalk Jetty** (−28, 25) → (−18.5, 24.5); the north beach is the Lullaby's foot stand. |
| **Bellcap Copse** (SE) | beach y 0.8 | **Harp Green** (43, 32) r 9, y 1.0 around the Gill Harp pool r 5.2 under the 14 m Bellcap; **Copse Jetty** (25, 30.5) → (16.5, 31). |
| **open water** | the Lullaby (−28, −1) r 11 @ 0.85; Murmur Basin (26, 4) r 11 @ 0.8; reef mat x ≈ 0, z −30…38 @ 0.15; the Veil Reach north channel @ 0.7 | Cap Reef rocks I–IV stay raft obstacles. |

- **Spawn** on the raft at (0, 52). **Gate:** the Mycelium Veil (0, −53) r 4.5, sailed into up the Veil Reach and under the Hyphae Strand. **Moorings:** Rootfoot, Gill, Stalk, Copse (each with a tow-bell; stand → slot ≤ 3 m + hull). **Murk's docks:** (20, 37.5) Copse side (day 1), (−23, 31.5) Stalk, (−16.7, −13.1) Gill, (16.9, −12) Rootfoot, (26, 4) Murmur Basin (raft-only). **Sister-candles (5):** the Mother's Cup, Gill Crown, the Greenhouse, the Gill Harp, Veil Anchor; in a mixed lake the moored raft also counts as safety for the dusk rule.
- **Walk times** from the island's jetty: the Mother's Cup 6.2 s, the Lullaby (north beach) 4.2 s, the Greenhouse 6.0 s, the Gill Harp 5.8 s, the Veilwater 9.7 s. Sailing between jetties takes 5–13 s.
- **Sample day 2 (≈ 115 s):** sail to the Copse Jetty (5 s) → walk to the Gill Harp (6 s) → Serenade (≈ 10 s) → 2 catches (36 s) → board, sail to the Stalk Jetty (7 s) → Greenhouse (6 s) → 2 catches → trade at the Stalk dock → dusk on the raft or on the Gill Crown.
- **Wayside:** puffballs along the island paths (4 a day, +2 satiety each, burst by walking into them).
- **First visit:** area banner, then tip `moor_walk` when the Ashore pill first shows. The Copse ring glows and the Gill Harp's curtains are visible from the water.

#### Glasswater Vault — "The Rotunda" (mostly on foot), R 70

**Feel:** a flooded rotunda library. Strong architecture, three wings, bridges in various states of repair, precise and puzzle-like fishing. Hub-and-spoke: once its spans are mended the Orrery Floor is never more than two bridges from anywhere.

```
x: -70 (left) … 70 (right); one char = 2.5 m, one row = 4 m; north (−z) is up-screen
 -70                       #############
 -66                  ##~~~~~~~:::::~~~~~~###
 -62               ##~~~:::::::::@:::::::::~~~##
 -58            ##~~~::::::::::::L::::::::::::~~~##
 -54          ##~~:::oo::::::::..:.::::::::::::::~~##
 -50         #~~::L:eoo::.................:::::::::~~#
 -46       #~~::::::,,,.....~~~~~=~~M~~....:::::::::~~##
 -42      #~~:::::::....~~~~~~~~*=*~~~~~~~~....:::::::~~#
 -38     #~~::::::....~~@@@@~~~*~~~*~~~@@@@~~....::::::~~#
 -34    #~~::::::...~~~@@@@@~~~=*~*~~~@@@@@@~~~...::::::~~#
 -30   #~~::@::...~~~~~@@@@@~~~~~a~~~~~@@@@~~~~~...::@@::~~#
 -26   #~:::::...~~~~~~~~~~~~~~~~=~~~~~~~~~~~~~~~~..::::::~#
 -22  #~::::::.*~===~~~~~~~~~~~~~=~~~~~~~~~~~~~===~..:::::~~#
 -18  #~:::::...~~~~~~~~~~~~~~.......~~~~~~~===~~~~..::::::~#
 -14 #~~:::::..~~~~~~~~==~~~....o=.....~~~==~~~~~~~~..:::::~~#
 -10 #~:::::...~~~~~~~~~~=...oo@...@o...==~~~~~~~~~~...:::::~#
  -6 #~:::::..~~~~~~~~~~~~..=.........o..~~~~~~~~~~~...:::::~#
  -2 #~::oo:..~~@@@@~~~~~...o...oGo...o..~~~~~@@@@@~~..:::::~#
   2 #~:,oo,..~~@@@@~~~~~...o...oGo...o..~~~~~~@@@@~~..::L::~#
   6 #~:L:b:..~M~~~~~~~~~~..=........=...~~~~~~~~~~M...:c^*:~#
  10 #~:::::...M~~~~~~~~~==..,o.....o,..==~~~~~~~~~M...::^:~~#
  14 #~~:::::..~~~~~~~===~~~...,,.,,...~~~=~~~~~~~~~..:::::~~#
  18  #~::::::..~~~===~~~~~~~~*.Lh...~~~~~~~~~~~~~~..::::::~#
  22  #~~:::::..~==~~~~~~~~~~~~~~=~~R~~~~~~~~~~f==...:::::~~#
  26   #~::::::..~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~.L.::::::~#
  30   #~~::@:::..~~M~~~@@@@~~~~~=~~~~~@@@@~~~~~...::@@::~##
  34    #~~::::::...M~~~@@@@~~~~~=~~~~~@@@@~~~~...::::::~~#
  38     #~~:::^^dL...~~~~~~~~~~~=~~~~~~~~~~~....::::::~~#
  42      #~~::^oo^:....~~~~~~~~~=~~~~~M~~~....:::::::~##
  46       ##~~:,,:::::.....~~~~~=~~R~~....:::::::::~~##
  50         #~~:::::::::........SL......::::::::::~~#
  54          ##~~::::::::::~~~~~~~~~~~:::::::::~~~##
  58            ##~~~::::::~~~~~~~~~~~~~::::::~~~##
  62               ##~~~~::~~~~~~~~~~~~~::~~~~##
  66                  ###~~~~~~~~~~~~~~~~~###
  70                       #############
```

| piece | where (m) | what |
|---|---|---|
| **Orrery Floor** (hub) | disc r 20, y 1.5 (above the crawler climb, so crawlers enter only by the spokes and the Skiff Steps) | the **Vault Seal** gate pool r 5 at the centre; **the Votive Font** channel r 12–14 crossed by six footbridges (30°, 90°, … 330°; r 11.4–15.8) with its south rim sunk into a low step; **six reliquary pillars at r 10 between the footbridges** (0°, 60°, … 300°), so every bridge lands on open floor and the Seal's Descend ring (r ≤ 7.5) is reachable. |
| **Moat of Volumes** | water r 20–48 (shelf 20–26 @ 0.45, trench 26–48 @ 0.92) | six Bookshelf Monoliths stand on the terraces. |
| **six spokes** | bridges r 20 → 48 at 30°, 90°, 150°, 210°, 270°, 330°; 3.5 m wide; y 1.5 → 1.2 | **S 90° The Sundered Span:** r 23–31 missing until the **Span Winch** on the hub (−6.5, 17.5) is turned. **ESE 30° The Broken Hymnal:** collapsed r 26–40 for good. **ENE 330° Copyists' Bridge** and **WSW 150° Mapmakers' Bridge:** intact (unless this descent's variant fells one). **N 270° Chandelier Causeway:** forks into **the Coronet**, a ring walk r 3.6–6 around the legend pool (0, −37). **WNW 210° The Tuned Bridge:** r 28–40 missing until the **Tuning Pillar** on the gallery (−45.8, −21.3) is struck (a crystal span grows in 3 s). |
| **Lower Gallery** | ring r 48–54, y 1.2, continuous | spawn (0, 51); the **Harbour Steps** mooring (8, 45). Crawlers climb onto it from the moat. |
| **Reading Terraces** | ring r 54–66, y 4, open in the south arc | eight ramps up from the gallery (20°, 60°, 120°, 160°, 230°, 270°, 300°, 340°). |
| **chapels and wells** | on the terraces | **Chapel of the Struck Hour** (60, 6) y 7 (its west window looks north-west over the moat); **Chapel of Unseen Hours** with **the Mirror Nave** (−58.5, 0) under open crystal ribs; **Ledger Stair** (−41, 41) r 5.5 y 7 around the Well of Ledgers shaft, whose south face has fallen in (a sill to y 0.8), reached by a ramp that ends 2 m inside the platform; **the Stilled Cascade** basin (−29, −51), open to the gallery on its south side. |

- **Per-descent variant (one of three, seeded):** *Mapmakers' Bridge has fallen*; *Copyists' Bridge has fallen*; *the Tuning Pillar is cracked* (the Tuned Bridge cannot grow). Every place, candle, deed, mooring, the gate and every dock stay reachable under each, with shortcuts closed and open (validated). The fallen bridge changes the day's routes and which moat sectors the skiff reaches.
- **The skiff:** moored at the Harbour Steps; the low spokes fence it into the east / south moat. Day 1: cross to the **Skiff Steps** on the hub in ≈ 5 s of sailing (instead of ≈ 20 s of walking) to turn the Span Winch; fish the south-east trench; a moat refuge at night (its raft nights use the water flow field, §24.8).
- **Gate:** the Vault Seal (0, 0) r 5: Descend within 7.5 m of its centre, on foot. On descending, the raft follows through the Seal's whirl and is beached at the Shore of Last Rafts.
- **Murk's docks** (in the moat, ≤ 4 m from a walkway): (15, 43.5) by the harbour (day 1), (44.5, 8) east, (8, −44.5) north, (−44.5, 8) west, (−33.5, 32) south-west. **Sister-candles (8):** Harbour Steps, Orrery Floor, North Terrace, and one at each of the Mirror Nave, the Bell-Chapel Window, the Well of Ledgers, the Stilled Cascade and the Broken Hymnal.
- **Three wings.** East (Broken Hymnal 12.3 s from spawn, Bell-Chapel Window 8.2 s beyond it, the Burning Glass), west (Well of Ledgers 14.6 s, Mirror Nave 8.0 s beyond it, the Stilled Cascade), centre (Votive Font, Fallen Chandelier). East ↔ west on foot costs 26–34 s, so a day picks a wing (the Astir place and Murk pull you) and the next dawn's flame-leap chooses where tomorrow starts.
- **Shortcuts:** spawn → hub (the Votive Font) 20.6 → 6.8 s and spawn → Fallen Chandelier 26.3 → 17.2 s once the Span is lowered; the Tuned Bridge makes hub → north-west wing direct.
- **Wayside:** drifting pages along the walkways (6 a day; 1–2 Shells, or a line of lore).
- **First visit:** tip `foot_spawn`; text "Your raft can't climb stairs. It can still cross the moat to the Skiff Steps." The raised Span leaf and the Winch's glint are visible across the moat.

#### The Pallid Deep — "Bone Roads" (mostly on foot), R 78

**Feel:** a pilgrimage. Long, lonely causeways over black water with memorial candles along every walkway. The finale is fought at **the Bottomless**, before two giants kneeling at the north wall, from the low Brink or high on their joined hands.

```
x: -78 (left) … 78 (right); one char = 2.5 m, one row = 4 m; north (−z) is up-screen
 -78                          ##############
 -74                     ##~~~~~~~~~~~~~~~~~~~###
 -70                 ##~@@@@@~~~~~~~~~~~~~~~@@@@@~##
 -66               #~~~@@@@@@@~~~~~~~~~~~~~@@@@@@@@~~##
 -62            ##~~~~@@@@@@@@@~~~~^^^~~~~@@@@@@@@@~~~~##
 -58           #~.~~~~@@@@@@@@@.::~~a~~::.~@@@@@@@@~~~~~~##
 -54         #~.~~.~~~~@@@@@@@~.~~~~~~~~~..@@@@@@@~~~~~~~~~#
 -50        #~~~.~.~~~~~~@@~..~.~~~~~~~~~.....@@~~~~~~~~~~~~##
 -46       #~~~~.~.~~~~....~~~~..~~~~~~~~.~~~~~.........~~~~~~#
 -42     #~~~~~~~~Lg.~~~~~~~~~~~..~~~~~..~~~~~~~~~~~L.@..~~~~~~#
 -38     #~~~~~~~~.~~.~~~~~~~~~~~~~.a.~L~~~~~~~~~~~~L.d.~~~~~~~~#
 -34    #~~~~~~~~.~~~~.~~~~~~~~~@~M~.~~~@~~~~~~~~~~.~~~~.~~~~~~~~#
 -30   #~~~~~~~~.~~~~~~.~~~~~~....~~~~~....~~~~~~~.~~~~~~.~~~~~~~#
 -26  #~~~:::::::~~~~~~~.~@~....~~~~~~~~~~~..~@~~.~~~~~~~~..~~~~~~#
 -22  #~~~::Lc:o:~~~~~~~~...~~~.o.~~~~~~~~~~~....~~~~~~~~.oo.~~~~~#
 -18  ~~~~::Lc:::~~~~~~~~..~~~~Lf*~~~~~~~~~~~~~.~~~~~~~~.~.eL~~~~~~#
 -14 #~~~~::::::::~~~~~~..~~~~~~..~~~~~~~~~~~~~..~~~~~.~~~~~~~~~~~~#
 -10 #~~~~~~~~~~~~~.~~@~.~~~~~~~~*~~~~~~~~~~~~~~.~@~..~~~~~~~~~~~~~#
  -6 #~~~~~~~~~~~~~~~.~..~~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~
  -2 #~~~~~~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~~
   2 #~~~~~~~~~~~~~~~~~.~~~~~~~~~~.~~~~~~~~~~~~~~.~~@@@~~~~~~~~~~~~~
   6 #~~~~~~~~~~~~~~~~~..@~~~~~~~~~.~~~~~~~~~~~@~.~~@@@~~~~~~~~~~~~#
  10 #~~~~~~~~~~~~@@@~~~.~~~~~~~~~~.~~~~~~~~~~~~.~@~~~~~~~~~~~~~~~~#
  14 #~~~~~~~~~~~~@@@~~~..~~~~~~~~~...~~~~~~~~~..~~~~~~~~~~~~~~~~~~#
  18  ~~~~~~~~~~~~~~~~~~~~~~.................~~~~~~~~~~~~~~~~~~~~~~#
  22  #~~~~~~~~~~~~~~~~~~~~~~~~~~.....L.~~~~~~~~~~~~~~~~~~~~~~~~~~#
  26  #~~~~~~~~~~~~~~~~~~~~~~~~~M.....L.M~~~~~~~~~~~~~~~~~~~~~~~~~#
  30   #~~~~~~~~~~~~~~~~~~~~~~~~~~~...~~~~~~~~~~~~~~~~~~~~~~~~~~~#
  34    #~~~~~~~~~~~~~~~~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~~~~~~~~~~~##
  38     #~~~~~~~~~~~~~~~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~~~~~~~~~~~#
  42     ##~~~~~~~~~~~~~~~~~~~~~~~~~.~~~~~~~~~~~~~~~~~~~~~~~~~~#
  46       #~~~~~~~~~~~~~~~~~~~~~~~~......~~~~~~~L~~~~~~~~~~~##
  50        #~~~~~~~~~~~~~~~~~~~~~~~.~~~~~~~~~....b~~~~~~~~~##
  54         #~~~~~~~~~~~~~~~~~~~~~~.~~~~~~~~~~~~~M~~~~~~~~#
  58           #~~~~~~~~~~~~~~~~~~~~.~~~~M~~~~~~~~~~~~~~~##
  62            ##~~~~~~~.......................~~~~~~~##
  66               ##~~~..........L.S............~~~~##
  70                 ###~...........S...........~~##
  74                     ###~~.............~~####
  78                          ##############
```

| piece | where (m) | what |
|---|---|---|
| **Shore of Last Rafts** (v3 name; was "Landing of Last Rafts"; ids `pd_landing`, `landing_lamp` unchanged) | bone-ash beach y 0.4 (south) | spawn (0, 68); the raft beached at (6, 72) among hundreds of others. |
| **The Spine** | vertebra causeway (0, 62) → (0, 31), 4 m, y 0.6–0.8 | the **Long Pier of Names** branches east (2, 46) → (34, 50). |
| **Cairn Plaza** | disc (0, 22) r 9, y 1 | **Pallbearers' Walks** west and east to the ends of the Rib Walk; **the Bier Road** north to the Bier Barge (−10, −20), its middle (**the Sunken Road**) under water until the **Bone Windlass** (−8.5, −11) is turned. |
| **The Rib Walk** | ring r 30.5–33.5, 150° → 390° through the north, y 1 | under eight ribs whose feet straddle the walk; branches: Plank Walk to the Almshouse, Slip Path, the Pilgrim Road to the Brink, Chain Walk, Belfry Pier. |
| **The Bottomless** | (0, −52) r 12 @ 1.0, legend pool r 3.2 at its centre | **the Brink**: a horseshoe r 12–15 at y 1 through the south (340° → 200°), with the Pilgrim Road arriving at its south and the Brink candle (6, −39). **The Kneeling West / East** (±25.5, −60.5) r 10 kneel at the north wall, facing the camera; their **forearms** rise from the Brink's two ends ((±12.7, −56.6) → (±2.4, −60.2), y 1 → 6) to **the Joined Hands** (0, −61) r 3.5, y 6, held out over the north half of the water. Brink + forearms + Hands form one ≈ 75 m loop. **Shroud Walks** leave the Brink's west and east sides, south of the giants, for the Ferry Slip and the Chain Garden. |
| **the outer places** | W: Drowned Almshouse (−58, −20) y 2.5 with the Wall Walk to the Ferry Slip; NW: Empty Ferry Slip (−42, −42); NE: Chain Garden plinth (44, −42) y 2 with the Rust Walk to the Sunken Belfry (56, −22) | |

- **Per-descent variant:** *the Sunken Road is under water* (weight 2; the windlass raises it), or *the west* / *the east Pallbearers' Walk is under water* (weight 1 each; the Sunken Road is up from the start and the windlass raises the drowned walk instead). Validated reachable under each.
- **Murk's docks:** (12, 58) Shore of Last Rafts (day 1), (34, 55.5) pier end, (−10.5, 25) and (10.5, 25) by the Plaza, (−5.5, −35.5) beside the Pilgrim Road (nearest the finale, 6.3 m from the Brink stand). **Sister-candles (9):** Shore of Last Rafts, Cairn Plaza, the Brink, and one at each of the Long Pier, the Bier Barge, the Almshouse, the Ferry Slip, the Chain Garden and the Sunken Belfry. There is deliberately no candle on the Joined Hands: relighting the giants' dead lantern is the victory.
- **Walk times:** spawn → Plaza 9.1 s, → Long Pier 11.3 s, → the Brink 29.4 s (24.4 s with the Sunken Road raised), → the Joined Hands 36.8 s. From the Brink: Bier Barge 6.9 s, Ferry Slip 10.3 s, Chain Garden 11.4 s, Almshouse 16.0 s, Sunken Belfry 16.5 s. Almshouse ↔ Ferry Slip 6.0 s; Chain Garden ↔ Belfry 5.4 s.
- **Wayside:** 48 memorial candles along the roads; walking past one lights it (+0.5 oil), it stays lit for the descent, marks the routes you have walked and feeds the victory cascade.
- **Finale flow:** buy Last Candle (v3 name; was Drowned Marrow) → reach the Brink or the Hands before the Gloomtide → hook during the Gloomtide (§24.8, "The finale on foot").
- **First visit:** the Spine leads straight at the giants, visible from the beach. Tip `foot_spawn`.

### 24.7 Places: the unique fishing locations

**How a place works (fishing).** When the bobber lands, `place = placeAt(zone, x, z)`:
```
base   : wait × 0.75, rarity +0.10, quality +0.06          (BALANCE.places.base; feeding spots are × 0.55 / +0.10 / +0.08)
astir  : wait × 0.55, rarity +0.25, quality +0.15          (today's Astir place, replaces base)
spot   : per field the STRONGER of place and feeding spot applies; they never stack
attract: per-species weight multipliers (× 1.5 … × 4)
mods   : per-place constants on the bite and reel model (waitMult, surgeEveryMult, erraticMult, hookWindowMult/Add, nibbleTells,
         bandAmpMult, bandNoiseMult, darterJumpMult, weightBias, quality, rarity, legendEnrageAdd, sweetAdd, surgeWarnAdd)
stance : standMods / altStand.mods (the Bottomless), and the steep line on any stand ≥ 4.95 m above the bobber
rule   : one twist from the kit below; `alt` = its B twist, run this descent with chance 0.5 (never on legend places)
place-kept species: eligible only here, under their `cond`, only while awake this descent (4 of 8), rolled as rare with weight × 8
```
Depth inside a place's water stays within `place.water.depth`. Every place yields at least one calm species without bait, has ≥ 60% of its castable water in view of the fish camera from every stand, and lies within ±50° of up-screen or 6 m of its stand (validated). **Discovery:** the Wick within 8 m of the stand or of the water shape, or a cast into it.

| rule `type` | parameters | what it does |
|---|---|---|
| `rhythm` | period, warn, live, burst?, near?, foul?, mods | a repeating window: casts landing while it is live get `mods`. `burst`: a bobber in the area when the warning ends is thrown out (bait refunded). `near`: only within r of listed points. `foul`: a hooked fish may wrap a chain (tension spike, clank 0.3 s before). |
| `sequence` | deed (walk-through stations, touchR), window, buff, failDim, mods | walk through the stations in today's order within `window` s → `mods` for `buff` s; a wrong one dims them all for `failDim` s. Stations stand ≥ touchR + 1 m from every stand, candle and mooring. |
| `deed` | deed, mode (`permanent` / `untilDusk` / `dawn` / `window`), perStep?, lockedBefore?, gloomInCalm?, mods | something done in the world boosts (or unlocks) the water; the deed's `resets` matches the mode (validated). Deeds are `pill` (hold or tap) or `touch` (walk past within touchR). |
| `targets` | targets[{rect/disc, depth?, attract?}], lock, lockPicks, lit? | sub-areas with their own depth and species; the lock picks a hole (or a bed) and the cast drops in. `lit`: one bed glows and a patch of light drifts along it; the meter shows a **tick** where the patch lies; releasing within ±0.08 of it gets `mods`. |
| `moving` | arc, speed, r, phases, mods | a travelling target; the bonus is decided at landing, so lead it (no aim assist). |
| `drifters` | lane, every, speed, hitR, perDay, give, nextBite | small floating targets cross a lane; landing within hitR of one triggers `give` and buffs the next bite (no aim assist). |
| `cue` | kind `chime` / `toll`, every?, lead, noPlunge?, mods | bites are announced differently: `chime` = a bite lands exactly `lead` s after a chime; `toll` = no plunge and no "!", a bell toll and a bone-white ring (shown with sound off). |
| `plumb` | depth, bottomAt, bottomMods | the bobber drops to the shaft centre; the charge picks the depth; charge ≥ bottomAt reaches the bottom ledger. |
| `reflection` | fish, hitR, wait, missWaitMult, flash, mirror, mods | fish are invisible; their silhouettes swim along the ribs and show mirrored on the water. Landing within hitR of a fish's true position guarantees a bite in `wait` s; elsewhere wait × missWaitMult. True positions flash for `flash` s on landing. Hit circles cover ≤ 15% of the pool (validated). |
| `phaseWindow` | phases, firstCastOnly, guarantee, wait, perDescent | during the listed phase the first cast is a guaranteed `guarantee` rarity, at most `perDescent` times a descent. |

#### Sporewood Pools (6 places)

| place | access · stand | water | favours | rule (twist) · B twist | rewards |
|---|---|---|---|---|---|
| **The Mother's Cup** *(legend pool)* — "The Mother Cap drinks here, ten breaths at a time." | foot · cloister south (32, −21.8), y 2.4, behind the water-steps | lagoon (32, −30) r 5 @ 0.90–0.95 | Velvet Ray × 2, Plumgill × 1.5; **The Drifting Grove** | **Root Breath** (`rhythm` 16 s): 1.5 s warning, 6 s exhale: wait × 0.6. *(legend: no B)* | the legend. **v3:** `holdsGiants` for non-legend casts (Velvet Ray and Mildew Elders); its breathing made visible (spores rain on the exhale, with a ring of rises) |
| **The Lullaby** — "Fish sleep here with their mouths open." | both · north beach of Lanternstalk Grove (−32, 13.5), casting north, or the raft | West Basin core (−28, −1) r 8 @ 0.60–0.85 | Sleepspore Jelly × 3 (Lumen Moss), Velvet Ray × 1.5 | **The Hum** (`mods`): surge interval × 1.3, erratic × 0.6, hook window × 0.85. B: deeper sleep (× 1.5 / × 0.5 / × 0.75). | Sleepspore farming. **v3:** the rule becomes `sight`: sleepers float visibly under a lily-cap canopy, mouths open; a soft cast (charge < 0.5) beside the one you want; `holdsGiants` |
| **The Puffball Vent** — "Every twenty breaths the reef sneezes." | raft · (0, −21.8) | reef patch (0, −25) r 5 @ 0.45–0.55 | Sporebelly Puffer × 3, Capshell × 1.5 | **Vent Burst** (`rhythm` 20 s, burst): 2 s hiss, a geyser throws out any bobber, then 6 s of settling water: rarity +0.25, wait × 0.7. B: a restless reef (14 s, 1.5 s hiss). | timing on the raft. **v3:** `maxClass` Prize (fry water); fires twice as often in Spore-fall |
| **The Drowned Greenhouse** — "Rows of glass, rows of water, and one row that still remembers the sun." | foot · south walkway (−44, 36.5), y 1.0 | 4 flooded beds (2 × 9 m) @ 0.40–0.50 | Capshell × 2, Plumgill × 2, Sporebelly × 1.5 | **The Lit Row** (`targets`): the lock picks a bed; one bed glows (rotates every 15 s) and a sun-patch drifts along it; release within ±0.08 of the meter's tick: wait × 0.5, quality +0.12. B: the sun flickers (every 9 s). | the food / oil tap; Shimmering farming. **v3:** + kept species **The Remembered Sun** on the Lit Row (P4) |
| **The Gill Harp** — "Walk the strings in the order she hums them." | foot · Harp Green south (43, 39.2) | pool (43, 32) r 5.2 @ 0.70–0.80 | Velvet Ray × 2.5, Threadling Eel × 2 (Spore Cake) | **Serenade** (`sequence`): three gill-curtains (east, west and north of the pool, touchR 1.2) pulse in a new order each day; walk through them in order within 15 s → 45 s of song: wait × 0.5, nibble tells +1. B: a quicker tune (10 s window, 60 s song). | **Harpstring Eel** (while it sings). **v3:** `holdsGiants` while it sings; its music-box notes carry 25 m as a sound beacon |
| **The Veilwater** — "A pool that kept its own night." | foot · Veil Ledge east (−36.3, −45.2), y 4.2, casting west | veiled pool (−40, −45) r 2.4 @ 0.75–0.85 behind fallen steps | Mildew Angler × 2, Sleepspore × 1.5 | **Burn the Veil** (`deed`, permanent): relight the Spent Sporelights on the other three islands (46, −22), (−38, 47), (56, 27) (pills); with all three the veil burns away: rarity +0.25, quality +0.15, gloom-only species bite in calm. B: one sporelight is already lit. | **Hushcap Koi**; a reason to visit every island. **v3:** Mildew Angler × 2; today's-rumour favourite at night |

#### Glasswater Vault (8 places)

| place | access · stand | water | favours | rule (twist) · B twist | rewards |
|---|---|---|---|---|---|
| **The Fallen Chandelier** *(legend pool)* — "It fell in one breath. It has been holding that breath ever since." | foot · the Coronet's south edge (0, −31) | trench inside the coronet (0, −37) r 3.5 @ 0.90–0.95 | Mirror Pike × 1.5, Shardspine × 1.5; **The Glass Sovereign** | **Lit Arms** (`deed`, resets at dawn): six arms on the Coronet (touchR 0.9) relight as you walk past: +0.04 rarity each; all six: nibble tells +1 and the Sovereign's enrage +15 s. | the legend. **v3:** `holdsGiants` (trench rim, non-legend casts) |
| **The Mirror Nave** — "Nothing swims in the water. Everything swims in the ceiling." | foot · chapel south (−58.5, 6.5), y 4, behind the fallen step | nave pool (−58.5, 0) r 3.8 @ 0.65–0.75 | Mirror Pike × 3 | **Reflection**: two silhouettes swim along the open crystal ribs and show on the water **mirrored across a north–south brass line** (x flips: the screen's sideways axis). Land within 0.9 m of a true position → a bite in 2–4 s (rarity +0.2); elsewhere wait × 1.6; true positions flash 0.5 s. Hit area ≈ 11% of the pool. B: three fish, 0.75 m. | **The Unreflected**. **v3:** the reflections are pre-rolled fish drawn at their true size: pick the biggest; `holdsGiants` |
| **The Bell-Chapel Window** — "Strike the hour and the water remembers." | foot · the chapel's west window (56.6, 6), y 7 (High Cast +3 m) | trench patch (44, −6) r 4, north-west of the sill | Chime Jelly × 3 (Glass Larvae), Mirror Pike × 2 | **The Struck Hour** (`deed` window): pull the bell rope (40 s cooldown): 12 s of shiver: wait × 0.4. B: 8 s, 25 s cooldown. | fast rares from an eel-proof perch (steep line). **v3:** no tackle gate; + kept species **The Sexton** during the Struck Hour (P4) |
| **The Well of Ledgers** — "Every depth was written down." | foot · shaft north rim (−41, 37.2), y 7 | shaft (−41, 41) r 2.2 @ 0.50–1.00, its south face fallen in | Blind Scrivener × 3 (Ember Roe), Mirror Pike × 1.5 | **Plumb Line**: the bobber drops to the shaft centre; the charge picks depth 0.5 → 1.0; a Clean Cast reaches the bottom ledger (rarity +0.1). B: 0.6 → 1.0, bottom at 0.9. | **The Footnote** (bottom ledger only). **v3:** `holdsGiants` on the bottom ledger (Clean Cast plumb) |
| **The Stilled Cascade** — "The falls froze mid-word." | foot · terrace west of the basin (−33.6, −49.6), y 4 | basin (−29, −51) r 4.2 @ 0.80–0.90, open to the gallery | Glassgill × 2, Prism Minnow × 1.5 | **Stillness** (`mods`): sweet-band drift × 0.25, band noise × 0.3, darter jumps × 0.5, quality +0.1, wait × 1.4. B: slightly less still, slightly quicker. | **Rainglass Darter** (calm). **v3:** in Shard-chime the frozen falls thaw for 40 s (a material scroll, no geometry): wait × 0.4, favour +0.3 |
| **The Broken Hymnal** — "The bridge sang as it fell, and never quite finished." | foot · outer stub end (35.2, 20.3) | trench beyond the stub (30.5, 13.5) r 6 @ 0.85–0.95 | Prism Minnow × 2, Mirror Pike × 1.5, Shardspine × 2 (night) | **The Unfinished Chord** (`cue` chime): shards chime every 3.5–5 s; bites land exactly 1.0 s after a chime: hook window +0.15, nibble tells +1. B: faster chimes, 0.6 s lead. | perfect-hook streaks. **v3:** Vesper Gar × 3 at night (P4) |
| **The Burning Glass** — "A lens the size of a chapel, still trying to light the water." | both · no fixed stand | a 3.5 m pool of focused light sweeping the north trench along r 29 from 250° to 340° and back at 0.65 m/s (≈ 70 s each way), calm only | — | **Focused Light** (`moving`): landing inside: rarity +0.2, wait × 0.6, quality +0.08. B: faster and smaller (1.0 m/s, 2.8 m). | a roaming bonus visible from anywhere. **v3:** P4: folded into the Alignment as the fan's brightest band |
| **The Votive Font** — "Votive fry, small as wishes." | foot · the hub south (0, 16.3), behind the font's low step | ring channel r 12–14 @ 0.20–0.30 | Prism Minnow × 2, Glassblown Puffer × 2 | **Quick** (`mods`): wait × 0.5, rarity −0.10. Eel-free. B: quicker and poorer. | the emergency oil / food tap. **v3:** `maxClass` Prize (fry water) |

#### The Pallid Deep (7 places + the Breathing Deep)

| place | access · stand | water | favours | rule (twist) · B twist | rewards |
|---|---|---|---|---|---|
| **The Bottomless** *(legend pool, the finale)* — "Two who kneel. One who breathes below." | foot · two stances: **the Brink** (0, −38.5), y 1, casting north 9–17 m over open water (**flat line**: sweet band +0.03; eels from the Bottomless reach you); **the Joined Hands** (0, −57.9), y 6, casting south 3–9 m (**steep line**: sweet −0.03, surge warning −0.1 s; eel-proof; crawlers only by the two forearms) | (0, −52) r 11.5 @ 0.95–1.00 | Lampwarden × 1.5 (gloom, Ember Roe), Shroud Ray × 1.5; **The Lantern-Swallower** (v3 name; was the Pale Leviathan) | the legend rule is unchanged; the two gold eye-glints still open at night before you own Last Candle (v3 name; was Drowned Marrow). **Its first surge breathes in every candle within 30 m.** **Victory:** the Wick's flame relights the giants' lantern, then every candle and memorial candle in the Deep relights gold, from the Wick outward. | the run. **v3:** `holdsGiants` for non-legend casts; P4: the Underdepth |
| **The Long Pier of Names** — "Every candle a promise someone couldn't keep." | foot · pier end (35.5, 50) | (39.8, 45.2) r 6 @ 0.75–0.85, north-east of the pier end | Shroud Ray × 1.5, Gilt-Eyed × 1.5 | **For the Named** (`drifters`): candle-rafts drift north → south past x 41 every 20–30 s; land within 1.5 m of one to relight it: +6 oil and the next bite +0.2 rarity; 3 a day. B: more, faster, smaller (4 a day, +4 oil). | oil on the long walk out. **v3:** + kept species **The Namesake** after relighting 3 candle-rafts in a day (P4) |
| **The Drowned Almshouse** — "Five rooms, five lives, and every one of them kept a fish." | foot · upper floor (−58, −20), y 2.5 | 5 floor holes r 1.4, each with a broken step on its south side: Cradle 0.3, Cookpot 0.4, Bed 0.6, Chest 0.8, Shrine 0.7 | Cradle → Ossuary Fry × 4, Cookpot → Bonecrook × 4, Bed → Wraithfin × 3, Chest → Gilt-Eyed × 3, Shrine → Funeral Veil × 3 (gloom) | **Five Rooms** (`targets`): aim near a hole and the reticle locks; the cast drops in. B: two pairs of rooms swap their fish. | species on demand |
| **The Chain Garden** — "Something turns over in its sleep." | foot · plinth (44, −36.5), y 2 | ring around the plinth r 6–12 @ 0.85–0.95 | Gilt-Eyed × 1.5, Lampwarden × 1.5 (night) | **The Thing Below Turns** (`rhythm` 30 s): 1.5 s warning, then for 8 s casts within 4 m of a chain get weight bias +0.6, rarity +0.15; 15% per surge to foul the line. B: 22 s, 25% foul. **v3:** at the Turn the Lantern-Swallower passes under the plinth as a 9 m shadow; casting at the chains during the pass gives **favour +0.6** (replaces weight bias +0.6; rarity +0.15 and the foul stay). | heavy-fish bounties. **v3:** `holdsGiants`; + kept species **Candlewake Sturgeon** at night (P4) |
| **The Sunken Belfry** — "The bell rings when something touches it." | foot · parapet (56, −18.4), y 1.0 (a dead end) | bell-mouth (56, −22) r 2.2 @ 0.85–0.95 | Lampwarden × 2 (night), Gilt-Eyed × 1.5 | **Rung from Below** (`cue` toll): no plunge, no "!"; the bell tolls and a bone-white ring pulses: rarity +0.2, hook window +0.1. B: the toll comes 0.4 s early. | **The Clapper** |
| **The Bier Barge** — "Give the dead a fish, and they open the hold." | foot · deck (−10, −17), y 1.5 | lidded hold (−10, −21.2) r 1.6 @ 0.75–0.85 | Funeral Veil × 2 | **Grave Goods** (`deed` offer, until dusk): lay your lowest-value fish on the bier; the hold opens until dusk: rarity +0.25, quality +0.15, gloom species bite in calm. B: the dead want your **best** fish (rarity +0.35, quality +0.2). | **The Wax-Bearer** |
| **The Empty Ferry Slip** — "At dusk the ferry comes. It brings no one." | foot · slip head (−42, −42.5) (a dead end) | the slip channel @ 0.85–0.95 | Shroud Ray × 1.5 (calm) | **The Last Ferry** (`phaseWindow` dusk, **once a descent**; v3: once an expedition): the first cast in during dusk is a guaranteed rare (the Unpaid Fare when awake) with a 2 s wait. The catch: you start the night at a dead end. B: the ferry comes at dawn. | **The Unpaid Fare**. **v3:** `holdsGiants` (the farthest water holds the biggest fish); at dusk the absent ferry is drawn as a faint additive outline |
| **The Breathing Deep** (the Deep's feeding spots, `spotStyle`) | anywhere | bubble domes r 3.5 placed by **path**: ≤ 8 s of walking to a point within castMax − 2 m of the dome; every 40 s (70 s at night) | — | 2 s warning, **12 s** live: rarity +0.3, weight bias +0.5 (**v3:** a live window, favour +0.4 instead of the weight bias); a dome that expires uncast respawns at half the interval. Tide Chart: 2 domes that breathe until dusk; domes count as feeding spots for `spot_catch`. | |

#### Place-kept species (WALK_SPECIES; Journal 32 → 40)

| species | lake · place · condition | time | depth | kg | value / food / oil | behaviour · tier |
|---|---|---|---|---|---|---|
| **Harpstring Eel** | Sporewood · Gill Harp · while it sings | any | 0.4–0.85 | 0.6–2.4 | 74 / 22 / 44 | darter · 3 |
| **Hushcap Koi** | Sporewood · Veilwater · veil burned | calm | 0.6–1 | 1–4 | 78 / 26 / 46 | darter · 3 |
| **The Unreflected** | Glasswater · Mirror Nave · reflection hit | any | 0.5–1 | 1–4 | 145 / 30 / 56 | darter · 4 |
| **The Footnote** | Glasswater · Well of Ledgers · bottom ledger | any | 0.9–1 | 2–6 | 140 / 40 / 54 | sinker (v3: *sulker*, P4) · 4 |
| **Rainglass Darter** | Glasswater · Stilled Cascade | calm | 0.75–0.95 | 0.3–1.2 | 135 / 20 / 60 | darter · 4 |
| **The Clapper** | Pallid · Sunken Belfry | any | 0.8–1 | 3–9 | 225 / 46 / 70 | thrasher · 4 |
| **The Wax-Bearer** | Pallid · Bier Barge · hold open | any | 0.7–0.9 | 2–6 | 220 / 30 / 80 | leaper · 4 |
| **The Unpaid Fare** | Pallid · Ferry Slip · the Last Ferry | calm | 0.8–1 | 4–12 | 240 / 50 / 78 | sinker (v3: *sulker*, P4) · 4 |

**v3:** sizes, styles and values for these eight follow the size model (§25.7.6 rows 21, 22, 33–35, 45–47); the kg column is the v1 / v2 weight range. **Awake per descent** (v3: per expedition; seeded, at zone entry): Sporewood 1 of 2, Glasswater 2 of 3, the Pallid Deep 1 of 3. An asleep species never bites; the Journal and Murk say so ("It sleeps this descent"), and `place_species` bounties only name awake ones. They count as rares everywhere else, pay ≈ 15% over each lake's rares and need no bait; Wick-Worms attract all eight. A lake's Journal perk needs its place-kept fish too.

### 24.8 Night on foot

Spawn rate, `maxAlive`, hp, speed, damage, drains, Heat, formation and elite timing all come from `difficultyFor()` **unchanged**. What changes is *where* enemies appear, *how* they cross terrain (`BALANCE.combat.foot`, `ENEMY_MOVE`), and *how the Wick is moved*:

| class (`ENEMY_MOVE`) | enemies | spawns | moves |
|---|---|---|---|
| `fly` | gloomling, duskmantle, sporeling, inkwell, choir, all four Wardens | the 22–34 m ring, 70% over water or void | unchanged; y = max(ground + hover, the approach blend toward the Wick's height within 14 → 6 m) |
| `crawl` | inkmite and re-skins, bell-jar tick (the `waterBound` ones) | on foot: **lake** water (never pools) 16–28 m away with walking path ≤ 40 m; they emerge over 0.9 s within 18 m path. **On the raft in mixed and foot lakes: only in the raft's water component, water path ≤ 40 m.** Summons (the Abbot's ticks, Ringed Grasps) use the same rule. | `world.moveCrawler`: the land flow field on foot, the water flow field on raft nights; climbs out of water or up any edge ≤ 1.25 m with a 0.8 s haul (× 1.5 aura taken); higher ground only by ramps and bridges; drops ≤ 3.55 m; × 0.9 on land |
| `swim` | creelsnatch | only while the Wick is within 6 m of open lake water and ≤ 3 m above it (else the credit re-rolls a flyer); the day's eel raid follows the same rule | leaps across the walkway; on stone it flops 1.2 s (zaps × 2) and wriggles back |
| `static` | the Drowned Hand | the stain spreads under the Wick: **r 3.2, as on the raft** | while standing (3 s) it blocks the walkway (`combat.blockers`) |

- **The Wick is moved only through player APIs** (CONTRACT §12.5): `knock`, `push`, `pull`, `root`, `pushOut(x, z, r)`, `pin(t, x, z)`. On foot they resolve through `moveFoot` and slide along walkway edges; the raft resolves them as v1 (raft lakes) or with `collideRaft` (walking lakes). Floats, stolen fish and cinders use `world.settle`; crawlers use `world.moveCrawler`. The v1 `world.collide` stays exactly as it is for the Mossmere.
- **Raft nights in walking lakes** (Sporewood, the skiff) use the bounded water flow field over the raft's water component, so crawler packs follow the Veil Reach and the reef gaps around the islands instead of grinding on a shore. The Mossmere keeps v1 circle steering.
- **Unreachable** (no path ≤ 40 m, e.g. the Wick on the Joined Hands with both forearms blocked): crawler credit re-rolls as flyers; a crawler with no path for 6 s despawns with 50% credit refunded. **Leash** for crawlers uses path distance (45 m).
- **Contact** on foot: 1.6 m and |Δy| ≤ 1.6 m (1.8 m on the raft). The aura and inside-light slow test horizontal distance with |Δy| ≤ 0.5 × light radius.
- **Cinders** that land on water drift (2 m/s) to the nearest walkable cell **of the Wick's own area within 12 m of path**, otherwise they fly to the Wick; stolen fish drift at 1 m/s. Pickup radius +0.5 m on foot.
- **High ground** (≥ 1.95 m above all adjacent water): zap range +3 m. That is all; globs are not slowed. Its cost is the dead end and the steep line.
- **Killers keep their raft values:** stain 3.2 m, every Warden telegraph as on the raft, inkwells hold at 13–18 m, but each perch keeps a reachable walkway within zap range − 2 m so they can be hunted. On foot the geometry is aligned instead of softened: the Shard Abbot's Hymn Ring keeps a gap within ±20° of the walkway tangent at the Wick; the Ferryman's Pole Sweep runs along the walkway; the Veiled Gardener's charge crosses the walkway (or stops at land edges) so a sidestep along it clears the lane; the Ferryman's inhale pulls along the walkway, never over an edge; Eclipse also darkens candles within 20 m for its 4 s.
- **Formations on foot** (`WALK_FORMATIONS`, from the same two picks per night): **The Stirring Edge** (a 4–10 m ring rising from water where ≥ 50% of the circle is lake; "Step inland, or flare as they rise.") and **Candle-Snuffers** (duskmantles fly to a lit candle within 25 m; 3 latched for 6 s darken it; a zap peels one and refunds 1 oil).

**Sister-candles (`BALANCE.lamps`).** Sporewood 5, Glasswater 8, Pallid 9 (validated: every reachable walkway ≤ 68 m of path from a candle — or, in Sporewood, from a mooring). **v3:** two candles per walking lake carry `watch: true` for lamp-watch (Lantern mode, §25.5.2): Sporewood `house_lamp` and `crown_lamp`, Glasswater `harbour_lamp` and `hymnal_lamp`, the Pallid Deep `plaza_lamp` and `pier_lamp` (data `WALK_SYNC_V3.watchLamps`; the Mossmere's are the dock buoy-lamps `se_buoy` and `w_buoy`). A watch candle's pool (r 6) exists only while it is lit; no `holdsGiants` water lies within 10 m of one (validated).

| rule | value |
|---|---|
| share flame | stand within 2.4 m and hold 1.0 s; costs **12 × zone oil drain (14.4 / 16.8 / 19.8 oil)**; any phase; damage interrupts it |
| lasts | the rest of the descent (`run.flags.lamps`); v3: the rest of the expedition (every Set Out starts with all candles unlit) |
| light | r 6 m (+1 per level of the Trimmer's Shears), cold and steady in the lake's accent colour; enemies inside move × 0.7 (the lower of this and your light's × 0.75 applies); the Silent Choir shows inside; **darkness ticks at half rate inside** (never stops); lights land (lamp term + one instanced decal) |
| also | sharing marks the 2 nearest undiscovered places; lit candles join `water.setLights` (the two nearest; still ≤ 6) |
| flame-leap | **once each dawn, free**, from any lit candle (or the moored raft) to any other lit candle; the radial shows them in their true directions; never in calm, dusk or the Gloomtide |
| darkened by | a hand slam within 4 m, 3 latched moths for 6 s, Eclipse (temporary), and **a gloom legendary's first surge (every candle within 30 m of its pool: "It breathes the candles in")**; relight 6 × zone drain |
| Known Places | a mastered place starts each later descent (v3: expedition) **discovered, with its candle's first share free** — you still walk there and hold |
| Stake Lantern | a supply you plant with a pill on any walkway (`run.flags.stake`): until dawn it slows what enters its 5 m light and shows the Choir; **no darkness shelter**; not a leap node |
| not a haven against | slams, globs, Wardens, eels: candles soften fodder, and fodder ends few runs |

**Vigil grounds** (validated: every stand except the designated dead ends — the Ferry Slip and the Sunken Belfry — is within 14 s of a vigil, and the dusk readout shows "Open ground 9 s"):

| lake | ground | why fight there |
|---|---|---|
| Sporewood | the raft (every mooring) | raft nights with the water flow field: the Veil Reach and reef gaps funnel crawler packs |
| | Gill Crown (−36, −36) r 8, y 4.2 | eel-proof, crawlers only by two ramps and the Veil Ledge; one-way drop out |
| | Harp Green loop (r 7.1, 45 m) | low, room to circle around the pool |
| Glasswater | inside the Votive Font (loop r 7.4, 46 m) | eel-free; crawlers only by the open spokes and the Skiff Steps; pillars split packs |
| | Lower Gallery (loop r 51, 320 m) | the long kiting circuit with 8 ramps and 6 spokes |
| Pallid | Cairn Plaza (r 8) and the Shore of Last Rafts (r 8) | room to circle; deep water all round (eels) |
| | the Rib Walk loop (≈ 175 m through the Plaza) | four branches; in the walk-under-water variants the Bier Road closes the loop instead |
| | the Brink and the Hands (≈ 75 m loop) | the finale ground: low Brink with eels, high Hands without |

**The finale on foot.** The Lantern-Swallower's (v3 name; was the Pale Leviathan) fight is unchanged (§5.6: no new elites while hooked, Grasping Dark summons two Ringed Grasps through the stone, Eclipse, the Ferryman cannot rise; **v3:** in Still and Lantern there are no spawns and Grasping Dark becomes two telegraphed snags, §25.5.6). You are anchored as on the raft, and a planted Wick is never moved off its ledge. **Its first surge breathes in every candle within 30 m**, so the fight is never fought inside a candle's slow or half-rate darkness, whichever stance you chose. The two stances are a real trade: **the Brink** gives a flat line (sweet band +0.03: skilled land ≈ 50% at line strength 1.9, against 43% on the raft) but eels leap from the Bottomless and crawlers come by three roads; **the Joined Hands** are eel-proof and reached only by the two forearms, but the line runs steep (sweet −0.03, warnings −0.1 s: ≈ 30%) and a slam there has nowhere to slide (`balance-foot.mjs --reel`). Because 72% of the Pallid swarm flies, funnelling crawlers trims only ≈ 20% of the bag: the finale stays gated by gear (Silverthread) and build. **Victory:** every candle and memorial candle in the Deep relights gold, from the Wick outward (folded into the existing candle beat).

**Dusk readout:** from Murk's 85% bell the HUD shows "Nearest sister-candle 34 m · ≈ 7 s" and "Open ground 9 s" with a faint ghost path. Starting dusk farther than 68 m from any lit candle or the moored raft shows (bad) "No candle within reach. Find open ground, or plant a Stake Lantern."

### 24.9 Risk/reward & progression hooks

**The core trade on foot:** the best water (place-kept fish, legend pools, deep edges) sits at dead ends and edges; the safest ground is not where the best fish are. Every walking choice costs calm seconds, and every candle costs oil.

| hook | rule | why it is fun |
|---|---|---|
| **Discovery** | the Wick within 8 m of a place's stand or water (or a cast into it) → `place:discover`, toast, a **Places** page in the Journal (rule line, vignette, place-kept silhouette, mastery stars); first time ever: +2 Memories at run end (v3: instantly) | curiosity pays; the map fills in across runs |
| **Astir** | each calm one non-legend place per walking lake is Astir (seeded; never twice running): wait × 0.55, rarity +0.25, quality +0.15; Murk names it on arrival | daily routing variety |
| **Variants & twists** | per descent (v3: per expedition): the lake's map variant (a fallen bridge, a road under water), each non-legend place's A or B twist, and which place-kept fish are awake (4 of 8) | fixed maps stay unsolved: the routes and the hunt change every descent |
| **Mastery** | 4 catches in one place in one descent (v3: expedition), at least one Fine → `place:mastered`, +10 Memories, and a **Known Place**: discovered from day 1 with a free first share of its candle in every later descent (v3: expedition) | map mastery that saves oil, not walking |
| **Place-kept species** | 8 rares tied to a place and a condition, weight × 8 when eligible and awake | a Journal hunt with clear, learnable puzzles |
| **Sister-candles & the dawn leap** | share flame with oil (§24.8); one free flame-leap each dawn to any lit candle | light the way on day 1, choose where each later day starts |
| **Shortcuts** | 4 (the Hyphae Strand, the Sundered Span, the Tuned Bridge, the Sunken Road): a free deed, usually on the far side, opens a route for the descent; the Surveyor's Chalk relic opens the one nearest your arrival. **v3:** opened shortcuts **persist across expeditions** (`meta.shortcuts`); the Chalk opens the shortcut nearest your arrival for good on your first arrival in that lake | metroidvania "open it from the other side" |
| **Deeds** | sporelights, harp curtains, the chandelier's arms, the bell rope, the bier offering | prepare a place for the night or the legend |
| **Wayside** | Pallid memorial candles (+0.5 oil, lit for the descent, mark your routes, feed the victory cascade), Glasswater drifting pages (1–2 Shells or lore), Sporewood puffballs (+2 satiety); the day's eel raid threatens walkway edges | the roads have something to do after discovery is spent |
| **Murk on foot** | his docks sit beside walkways; trading still costs the walk to his dock (never a leap destination) | the "spot vs. Murk" tension of §4.5 survives |

**Memories added (one-time):** challenges +185; place discovery 21 × 2 = 42; mastery 21 × 10 = 210; ≈ +437 against ≈ +960 of new relic sinks, so meta progression does not speed up.

**Records:** places mastered, biggest fish per place, most candles lit in one descent. **Death-screen lines:** "The Gill Harp: 1 catch from mastery." · "When the Gloomtide rose you were 48 m from the nearest candle." **Top-damage tips:** eels on foot → "Eels reached you at the water's edge 4 times. At night, fish enclosed pools or stand back from the edge."; slams on a walkway → "Hands caught you on a narrow walkway. Step along it, not sideways."

### 24.10 New content (data tables, merged with WALK_ENABLED)

**STATS:** `stride` (Stride, base 0, −2…3, m/s on foot only); `moveSpeed`'s label becomes "Speed".

| kind | id · name | numbers | unlock / where |
|---|---|---|---|
| upgrade | `boots_cork` **Cork-Soled Boots** (`feet`) | stride +0.35 per level; 45 / 120 / 280 Shells (v3: a persistent outfit item, 80 / 240 / 600, §25.6.6) | from Sporewood (v3: once the Sporewood Waystone is lit) |
| supply | `stake_lantern` **Stake Lantern** | 40 base; `give {stake: 1}`; planted with a pill; slow + Choir only | from Sporewood |
| bait | `wick_worm` **Wick-Worms** | 30, × 4; rarity +0.06; attracts the 8 place-kept species | *Strange Waters* |
| relic | `roadworn_soles` **Roadworn Soles** | stride +0.2 per level; 45 / 125 / 280 | *First Footfall* |
| relic | `trimmers_shears` **The Trimmer's Shears** | candle light +1 m per level (`lampRadius:1`); 90 / 245 | *A Place That Knows You* |
| relic | `surveyors_chalk` **The Surveyor's Chalk** | in each walking lake the shortcut nearest your arrival starts open (`shortcutStart:1`; v3: opened for good on the first arrival); 185 | *The Long Way Round* |
| weapon | `undertow_crook` **Undertow Crook** (common, 5 levels, tags foot, area, close) | a 2.5 m, 120° sweep every 1.8 s (L5: 3.2 m, 200°, 1.3 s), damage 6 → 15; **on foot it knocks crawlers off the walkway**: they re-haul for 0.8 s taking × 1.5 aura, and a fall of more than 2 m stuns them 1 s; on the raft it sweeps the deck edge. **Kindle** (with Vantage) **Riptide Crook**: a full-circle sweep every 1.2 s, damage 20, knock 4.5 m, 1.5 s stun on any fall, hauling crawlers take × 2 aura | *Held the Crossing* |
| boon | `vantage` **Vantage** (common, 3 levels, tags foot, light) | on high ground: zap range +2 / 4 / 6 m and **crawlers hauling up to you take × 1.5 / 2 / 2.5 aura** (L3 +0.5 m light) | *Hidden Waters* |
| boon | `kindred_flames` **Kindred Flames** (rare, 3 levels, tags light, foot) | lit candles burn enemies inside at 0.4 / 0.6 / 0.8 × your aura; share time 0.7 / 0.45 / 0.25 s; **first shares** cost × 0.75 / 0.5 / 0 (relights full price); L3: each candle fires one free flare per Gloomtide when something enters it | *Four Shared Flames* |
| Wick | `wayfarer` **The Wayfarer** — "Who Walked Every Road" (tier IV capstone) | stride +0.8, raft speed −1; starts with the Undertow Crook and 2 Wick-Worms; quirk **First Flame**: the first sister-candle you share with in each lake costs no oil; a re-tint of the base model; **v3:** + the fishing half *Shore Sense* (on foot, signs show from 50% farther), §25.5.5 | *Every Still Place* |

All of these are challenge-locked, so **the run-1 boon pool is unchanged** (18 of 32), and foot-tagged boons are **never** offered in raft-only lakes. New archetype tag **Kindred**: Kindred Flames, Tolling Bell, Lantern Pulse, Brighter Wick.

**Challenges, tier IV "Paths Underfoot"** (30 → 40; *The Complete Chronicle* asks for every species):

| # | challenge | goal | type · params | scope | reward |
|---|---|---|---|---|---|
| 31 | **First Footfall** | Step ashore from your raft. | `footAshore` {n:1} | total | `relic:roadworn_soles` + 5 |
| 32 | **Hidden Waters** | Discover 6 Places. | `placeFound` {n:6} | total | `boon:vantage` + 10 |
| 33 | **Four Shared Flames** | Share your flame with 4 sister-candles in one descent (v3: expedition). | `lampLit` {n:4} | run | `boon:kindred_flames` + 15 |
| 34 | **Strange Waters** | Land 3 different place-kept fish. | `placeSpecies` {n:3} | total | `bait:wick_worm` + 15 |
| 35 | **A Place That Knows You** | Master a Place. | `placeMastered` {n:1} | total | `relic:trimmers_shears` + 15 |
| 36 | **The Long Way Round** | Open 3 shortcuts in one descent (v3: "Open 3 shortcuts", scope total, since they persist). | `shortcutOpen` {n:3} | run | `relic:surveyors_chalk` + 10 |
| 37 | **Held the Crossing** | Disperse 60 gloomlings on bridges in a single Gloomtide (v3: Gloom tab). | `slayOnTag` {tag:bridge, n:60} | run | `boon:undertow_crook` + 20 |
| 38 | **Far From Any Candle** | Endure a Gloomtide on foot in the Glasswater Vault or deeper without standing in a sister-candle's light (v3: Gloom tab). | `nightNoLamp` {zoneMin:2} | run | 20 |
| 39 | **Every Candle in the Vault** | Share your flame with every sister-candle in the Glasswater Vault in one descent (v3: expedition). | `lampLitZone` {zone:glasswater} | run | 25 |
| 40 | **Every Still Place** | Master every Place in the three lower lakes. | `placeMastered` {n:21} | total | `character:wayfarer` + 50 |

Challenge sources: `footAshore` ← first `player:mode {reason:'ashore'}`; `placeFound` / `placeMastered` ← `place:discover` (first ever) / `place:mastered`; `placeSpecies` ← `journal:new` for a species with `place`; `lampLit` ← `lamp:lit {first:true}` (relights and free Known-Place shares do not count; they do count for `lampLitZone`); `shortcutOpen` ← `shortcut:open` (the Chalk's free one does not count); `slayOnTag` ← `enemy:slain` with `tag === 'bridge'`, reset each Gloomtide; `nightNoLamp` ← dawn with no frame inside a lit candle since the Gloomtide began, on foot, zone ≥ zoneMin.

**Bounties** (`WALK_BOUNTIES`, types in `WALK_BOUNTY_TYPES`; rewards use the §15 formula): `place_catch` "Bring me {n} fish from {place}." (26, w 3), `place_species` "They whisper of a {species} at {place}." (55, w 1, awake species only), `astir_catch` (34, w 2), `light_lamp` "Share your flame with the sister-candle at {lamp} before dusk." (20, w 2), `lamp_vigil` "Keep tonight's vigil inside the light of {lamp}." (50, w 1, foot lakes) (v3: combat modes only).

**Tips** (`WALK_TIPS`; every trigger validated against the event list and its discriminator): `moor_walk` (`interact:change:ashore`), `foot_basics` (`player:mode:ashore`), `foot_spawn` (`player:mode:spawn`, emitted only for foot spawns), `tow_bell`, `lamp_light`, `lamp_hop` (dawn leap), `place_found`, `high_cast`, `shortcut`, `edge_eels`, `astir`, `legend_snuff` (`lamp:snuffed:legend`). **Text:** `WALK_TEXT` (pills Share flame / Flame-leap / Plant…, banners, toasts), `TEXT.challengeTiers[4]`, `TEXT.memoryLabels.places`, `MERCHANT_LINES.astir`.

### 24.11 Tuning changes, with reasons

| key | before | after | applies | why |
|---|---|---|---|---|
| calm length | 120 | **120 (unchanged)**; v3 expeditions: 180 (185 in the foot lakes), §25.3.2 | everywhere | Appendix B: with the dawn leap and the places' bonuses, catches and Shells per day stay within ±7% of v1; the run length is the user's constraint. `ZONES[].phases.calm` stays as a knob. |
| Arrival Hush | — | +30 s in Glasswater and the Pallid Deep, +10 s in Sporewood, on the first calm in the lake; no calm raid that day; v3 expeditions: +30 s in every lake on day 1 and on the first calm after a gate | walking lakes | the first day in a lake is the exploratory one; Sporewood's walks are short and its arrival is the run-1 wall, so it gets only 10 s |
| drains | — | unchanged; sharing flame costs oil | — | walking costs time; light costs oil |
| foot speed / accel | — | 0.84 × raft speed; accel 6, decel 8 | on foot | short-window reach equal to the raft's; dodges need anticipation (Appendix B kinematics) |
| contact radius | 1.8 | 1.6 on foot | on foot | the Wick is a smaller target; its dodges are no easier |
| crawler spawn ring | 22–34 m | lake water 16–28 m with path ≤ 40 m; raft nights in walking lakes: the raft's water component | walking lakes | arrival time parity; no grinding on shores |
| crawler land speed | × 1 | × 0.9 on land, 0.8 s haul | on foot | a 5 m/s Wick can barely kite late mites |
| creelsnatch | depth ≥ 0.4 | also needs the Wick within 6 m of open water and ≤ 3 m above it; flop 1.2 s on stone | on foot | enclosed pools and inland ground are eel-free; edges are the risk |
| killers | — | **unchanged**: stain 3.2, telegraphs, inkwell hold 13–18 m | on foot | they end runs; only their geometry aligns with walkways |
| pickup radius | 4 | +0.5 m; water cinders drift to the Wick's own area or fly to it | on foot | level-up cadence stays at 24 / 32 s (Appendix B) |
| cast meter start | below 2 m/s | below 1 m/s | on foot | no anchor brake on foot |

**Explicitly unchanged:** the Heat model, `difficultyFor`, the XP curve, light and aura, reel / bite / quality models, tolls, valueMult, Warden hp, legend rules, every Mossmere number, raft handling and every v1 table while `WALK_ENABLED` is off. (**v3** changes the size, bite and reel models, XP per mode, the oil table and the Mossmere's places with `V3_ENABLED`: §25.)

#### Changes to existing rules (edited in place, marked "walking build" there)

1. **§2.5 / §5.4 / §12.1 / §16:** in the walking build the Journal holds **40** species (8 / 10 / 11 / 11), *The Complete Chronicle* asks for every species (`params.n` = `SPECIES.length`), the checklist holds 40 challenges in four tiers, there are 6 Wicks, and a lake's Journal perk needs its place-kept fish.
2. **§3:** E also drives the new contextual actions; holding E holds them.
3. **§4.4 / §4.6:** in the walking build `ARENA_V2` replaces the three lower lakes' islands, pillars, deep pools, legend pool, gate, spawn and docks (§24.6); the v1 table stays authoritative for v1 builds and for the Mossmere.
4. **§6.4:** contact radius is 1.6 m and |Δy| ≤ 1.6 m on foot (1.8 m on the raft).
5. **§14:** in Glasswater the gate is entered on foot (Descend within r + 2.5 m).
6. **CONTRACT §5:** walking lakes save the Wick's position (`run.flags.pos`).
7. **CONTRACT §7 "Space":** the water surface is still y = 0, but `player.position.y` is the ground on foot.
8. **`memoriesFor()`** gains a `placesNew` row (0 unless the walking build reports places).

### 24.12 Per-module implementation checklist (v2)

**Prerequisite (world, P0):** build every lake from its authored data — `islands` / `pillars` arrays, `deepPools`, `legendPool`, `gate`, `spawn`, `docks` (main's world now does) — then, with `WALK_ENABLED`, the walk layout and this descent's variant. Nothing in §24 lines up without it.

| module | work |
|---|---|
| **world** (+ `world-walk.js`) | Read `WALK_ENABLED`. On `zone:change` bake `walkGridFor(zone, {open, variant})`, a bilinear distance-to-edge field per walkable component (foot), a land-distance field (raft, spots, foam) and an open-water distance field (eels). Collision: `moveFoot` (displacement, body 0.4, `walkStepOK`), v1 `collide` kept for raft lakes, `collideRaft`, `moveCrawler`, `settle`. Flow fields: bounded Dijkstra (bucket queue, integer costs) on the 0.5 m grid to path 45 m, `land` and `water` layers, ≤ 9k cells / frame over ≤ 3 frames at ≤ 3 Hz, dusk + Gloomtide in mixed and foot lakes. Cavern: the exact circle (`shoreRFor`) for grid, collision, depth, foam radius and cliffs (base ≥ R + 1.5, lean-in only above 9 m). Land meshes from the grid (marching squares per height band; sills as broken steps; ink lips on drop edges; walkway-edge ink strips), drawn before water, `occludable`; lamp term + one instanced candle decal; one instanced place-FX mesh and one Points for every rule visual; wayside props instanced; deed props, candles (unlit / lit cold / darkened), the beached raft, the giants facing south. API per CONTRACT §12.5 (`surfaceY`, `getFlow(…, layer)`, `waterComponent`, `getVigils`, `getVariant`…). **No gameplay state**: progression owns deeds, candles, Astir and variants; world renders them. |
| **player** | `mode` raft / foot, the foot controller (§24.3: speed 0.84, accel 6 / decel 8), crossings (push 0.4 s within 35°, 3 s cooldown, night pill-only, no night i-frames), drops, tow-bells, the dawn flame-leap (once, free, angle-true radial data), deeds and candle shares through `interactHold`, Stake Lantern planting, `position.y` = ground, `raft {…}`, `topSpeed`, place proximity (stand or water within 8 m, 5 Hz) → `place:enter/leave`. The only movers of the Wick: `knock / push / pull / root / pushOut / pin` (on foot via `moveFoot`). `writeSave(flags)` / `restore(pos)` (snap to walkable or raft water, else the nearest lit candle). Events `player:mode` (spawn only on foot spawns), `player:step`, `player:hop`, `raft:called / arrive`, `walk:high`. |
| **actors / models** | Follow `player.mode`; walk cycle, hop / drop / kindle / offer / sweep poses; the lantern PointLight re-parented to the Crook (1.55 m); the 1.0 m ground ring with a heading notch and the thin amber rim on foot; contact shadows for enemies within 10 m on the blob-shadow instancing; the moored / beached raft with an empty hook; place-kept fish models from `SPECIES[].model`; the Wayfarer re-tint. |
| **render / water / toon** | `walk` / `walkNight` modes with their own portrait numbers; focus-y spring; the pool framing (land profile toward +z from the bobber, ≤ 75°, focus on the bobber); terrain clamp inside R − 2; fixed yaw in every mode on foot (shop and death included); occlusion uniforms; `pickSurface`. toon: `occludable()` with its own program cache keys and outline material, instancing-aware `vWorldPos`; the x-ray proxy (one billboard, after world opaques, before the Wick). water: land before water on walking lakes, `DEPTH_RES` 256 (or a land-distance channel), no shore fade in POOL cells, hull foam / wake only in raft mode, candles in `setLights` with their accent colour. |
| **fishing** | The place kit (§24.7) incl. awake species, `alt` twists, stance mods and the steep line; place-kept species only at their place, under `cond`, while awake. Rod-tip origin, High Cast, arc clearance (`world.castClear`), cast over stone, the first-water-run meter, locks that drop in, aim assist off for reflection / drifters / moving, the lit-row charge tick, plumb, reflection visuals (rib silhouettes, mirrored x), moving light, candle-rafts, chime / toll presentation, the Last Ferry (`perDescent`), the Breathing Deep by path, the Tide Chart on spotStyle lakes; the legend's first surge → `progression.snuffLamps(pool, 30, 'legend')`, victory → `relightAll('victory')`; `onPointerDown({aimAt})` / `onPointerUp()` for the Fish-here pill; events carry `{place, mode, height, stance}`. |
| **combat** | Never writes `player.position`: replace the four v1 call sites with `player.pull / pushOut / knock / pin` (CONTRACT §12.5 table). `ENEMY_MOVE` classes; land flow on foot, water flow on raft nights in walking lakes (spawns in the raft's component, path ≤ 40); v1 circle steering in raft lakes; crawler spawns on lake water by path, haul, land speed, unreachable → flyer, path leash; summons through the crawler rule; eel reach and flop; flyer height; contact 1.6 with |Δy|; cinder / float / fish settling via `world.settle`; killers at raft values with walkway-aligned Warden geometry and huntable inkwell perches; `WALK_FORMATIONS`; candle slow / darkening (via progression); Kindred Flames, Vantage, the Undertow Crook and its Kindle; foot-tagged boons never offered in raft lakes; `slayOnTag`; contact shadows data. |
| **survival** | `getPhaseInfo()` with `duration` (the only phase-length source) and `hush`; Arrival Hush per lake (recorded in `run.flags.hush`, no calm raid that day); darkness × 0.5 inside lit candles; `spendOil` for shares and relights; `getDuskLamp()` and `getOpenGround()` for the dusk readout; the Stake Lantern without shelter. |
| **progression** | Owns `run.flags.lamps / shortcuts / deeds / places / astir / variant / twists / awake / day / window / hush / stake / wayside` and `meta.places`; `rollDescent` at zone entry (variant, twists, awake, Known Places discovered, the Surveyor's Chalk); `lightLamp` (Known Place free first share, Kindred Flames first-share discount, the Wayfarer's First Flame), `snuffLamps`, `relightAll`, `doDeed`, `offerFish` (lowest, or highest under the B twist), wayside takes, new challenge types and bounties, the new upgrade / supply / relics / bait / boons / Wick, `placesNew` in the summary, mastery Memories, Journal Places tab data (asleep species). |
| **ui** | Pills (Ashore, Board, Ring Bell, Share flame with hold ring, Leap radial angle-true, Turn / Strike / Pull / Offer, Plant, Fish here) with `interactHold` and the Fish-here pointer path; the priority rule (Fish here over Leap / a lit candle within 2 m of a stand); edge markers (raft when ashore > 25 m, places, candles); Astir and variant banners; Places tab; the dusk readout (candle + open ground); reticle variants (locked hole, plumb depth, lit-row tick); HUD clock from `getPhaseInfo().duration`; tier IV challenges; tips. |
| **audio** | Footsteps per surface, hop / land, winch, crystal span, harp-curtain notes, shard chimes, the drowned toll, candle share / darken / leap, bell rope, crook sweep, page, puffball, memorial candle. |

**Performance (CONTRACT §12.6) — draw-call ledger per walking lake** (estimates for implementers to measure against; whole frame ≤ 150 at 150 enemies on a mid laptop and a mid phone):

| item | Sporewood | Glasswater | Pallid |
|---|---|---|---|
| v1 scene (water, sky, cliffs, swarm at 150, Wick, raft, Murk, fx, UI-in-scene) | ≈ 105 | ≈ 105 | ≈ 105 |
| land tops + sides (3 style materials) + their outlines | 6 | 6 | 6 |
| ink lips + walkway-edge strips (merged) | 1 | 1 | 1 |
| rails / posts / candle posts (instanced) + outlines | 2 | 2 | 2 |
| candle glow Points + one candle decal | 2 | 2 | 2 |
| place props (≤ 6 merged per lake) + deed props (≤ 3) | 4 | 5 | 5 |
| place-FX instanced mesh + rule Points | 2 | 2 | 2 |
| wayside instanced | 1 | 1 | 1 |
| x-ray proxy | 1 | 1 | 1 |
| contact shadows (on the blob-shadow instancing) | 0 | 0 | 0 |
| **total** | **≈ 124** | **≈ 125** | **≈ 125** |

No new dynamic lights (≤ 4); walk grid + derived fields ≈ 2.5 MB per lake; foot mover ≤ 0.15 ms / frame; flow fields ≤ 1.7 ms per frame for ≤ 3 frames at ≤ 3 Hz at dusk and in the Gloomtide in mixed and foot lakes (either mode); occlusion 0 draw calls.

### 24.13 QA scenarios

| # | scenario | expected |
|---|---|---|
| 1 | Mossmere run 1, and all four lakes with `WALK_ENABLED` off, with and without v2 code (seeded replay, `tools/scenario-full.mjs`) | identical camera, positions, fishing timings and director output |
| 2 | Sporewood: sail into the Copse ring at 1.5 m/s and push toward land 0.4 s | Ashore; lantern moves to the Crook; `player:mode {reason:'ashore'}`; tip `moor_walk` |
| 3 | Sporewood: ashore at the Copse, ring the Stalk bell; board / ashore / board quickly at dusk | towed in ≤ 12 s; the second switch waits 3 s; no i-frames at dusk |
| 4 | Sporewood: burst the counterweight, cross the Hyphae Strand, sail under it | the middle grows; the raft still passes under at y 6 |
| 5 | Relight the three sporelights, fish the Veilwater at noon | veil gone; rarity +0.25; a Mildew Angler can bite in calm; Hushcap Koi eligible if awake |
| 6 | Gill Harp: walk the curtains (east / west / north) in the right and a wrong order; walk from the Copse Jetty to the stand | right: 45 s song; wrong: all dim 5 s; the approach touches no curtain |
| 7 | Glasswater day 1: board the skiff, sail to the Skiff Steps, turn the Span Winch, walk to the Vault Seal and Descend | the Span lowers; the Descend ring is reachable from every footbridge |
| 8 | Glasswater: try to sail the skiff past a low spoke; repeat under each of the three variants | blocked by every standing spoke; the fallen bridge opens its sector |
| 9 | Mirror Nave: cast at a visible reflection vs at its true (x-mirrored) position | true: bite in 2–4 s, the Unreflected eligible if awake; reflection: wait × 1.6; true positions flash 0.5 s |
| 10 | Well of Ledgers: release at charge 0.5 and at a Clean Cast, watching the bobber | depths ≈ 0.75 and ≥ 0.95; the bobber visible through the fallen south face; the Footnote only on the latter |
| 11 | Night on the Joined Hands with Ash Mites in the water | no eel spawns; mites arrive only by the forearms; with both forearms blocked, mite credit re-rolls as flyers |
| 12 | Night on the Brink edge | eels may leap; a landed eel flops 1.2 s; zap × 2 |
| 13 | Hand slam beside a walkway edge, ink-slick shove, Grasp pin, Ferryman inhale (watch `player.position` writes) | only player APIs move the Wick; it slides along the edge; never enters the water |
| 14 | Share flame at dusk, stand in it at 0 oil; plant a Stake Lantern and stand in it at 0 oil | darkness ticks every 16 s in the candle, every 8 s in the stake; the Choir shows in both |
| 15 | Flame-leap in calm, at dusk, twice in one dawn | refused, refused, second refused |
| 16 | Pallid: offer a fish at the bier (A and B twists), fish the hold until dusk | lowest (A) / highest (B) fish removed; hold open until dusk; one offering a day |
| 17 | Ferry Slip at dusk on two days | day 1 first cast: guaranteed rare in 2 s; day 2: normal |
| 18 | Legend fights on foot (Mother's Cup, Fallen Chandelier with all arms lit, the Bottomless from the Brink and from the Hands) | §5.6 unchanged; candles within 30 m darken on the first surge; enrage 105 s with all arms; Brink sweet band +0.03, Hands −0.03 and warnings −0.1 s; victory relights every candle gold |
| 19 | Phone (390 px, touch): walk the gallery, cast into the Votive Font and an Almshouse hole, the Lullaby from the north beach | analog joystick; hole lock with a short press drops in; the bobber stays on screen and above the joystick corner |
| 20 | Performance: Pallid Deep, 150 enemies, on foot, high and low quality, **on a mid laptop and a mid phone**; find-the-Wick test with 3 candles on screen | ≤ 150 draw calls; ≥ 60 fps; flow-field frames ≤ 1.7 ms extra; the Wick found in < 0.5 s |
| 21 | Continue a saved run in Glasswater mid-Gloomtide, and at the Ferry Slip after the Last Ferry | resume where the Wick stood ≤ 30 s earlier, at night; the Ferry's use and the day's candle-rafts persist; candles, shortcuts, variant, twists and awake species as saved |
| 22 | `node tools/validate-data.mjs` | pass 1: v1 tables unchanged; pass 2: every rule of §24 on the eroded grid for every variant × shortcut state |
| 23 | `node tools/balance-foot.mjs` | every acceptance row PASS (Appendix B) |

### 24.14 Risks, knobs and cut ideas

**Risks**
1. **Scope:** three hand-built maps, a foot controller, ten place rules, occlusion and flow fields. Build order: (1) world builds from data; (2) walk grid, foot controller, camera (pool framing, clamp), x-ray proxy; (3) the Pallid Deep (simplest geometry, proves the finale on foot); (4) places with modifier-only rules, then `targets`, `plumb`, `rhythm`, `deed`; (5) Glasswater with shortcuts, variants and the skiff; (6) Sporewood with moorings, tow-bells and raft-night water flow; (7) the remaining rules, discovery, Astir, candles and the dawn leap; (8) the combat foot pass, re-running `balance-foot.mjs` after each.
2. **The foot profile is a model.** Appendix B drives the unmodified v1 model with walking's inputs; its assumptions (time inside candles, narrow-walkway share, place-cast shares) are listed in `FOOT_ASSUME` and must be replaced with playtest telemetry. It has already moved the calm (125 → 120 s), the foot speed (0.82 → 0.84) and Sporewood's hush (30 → 10 s).
3. **Glasswater's ring is big:** east ↔ west wings are 26–34 s apart. The hub, the dawn leap and Murk's walkway docks mitigate it; if day 1 still feels rushed, raise `ZONES.glasswater.phases.calm` toward 130.
4. **Precise casting on touch:** first-run meter, drop-in locks, the pool framing and the up-screen rule; playtest on a phone early.
5. **Merge order:** data can land before code because it is inert with `WALK_ENABLED` off; flip the flag only together with world, player and fishing v2.

**Knobs, in this order:** `BALANCE.lamps.darknessShelter` (0.5 → 0.7 makes oil bite harder; Appendix A.5.2's `oilDrain` stays the first darkness knob) · `walk.speedMult` (0.82–0.86) · `combat.foot.contactRadius` (1.5–1.8) · `ZONES[].phases.calm` (120–135) · `lamps.lightCost` (10–14) · `places.base` (0.7–0.8 wait, +0.08–0.15 rarity) · `combat.foot.crawl.landSpeed` (0.8–1.0) · `places.exclusiveWeight` (6–12) · `lamps.slow` / Kindred Flames `auraFrac`.

**Cut ideas (possible later add-ons):** wading fords; falls into water with an oil cost; raised still pools (a second water material); grapnel zip lines; Shell-cost bridge repairs; camera yaw hints; a fog-of-war "Lantern Chart" screen; a flowing-river drift place.

### 24.15 Revision 2: what changed after review

**Must-fix**

| # | finding | change |
|---|---|---|
| 1 | Glasswater gate / hub unreachable (pillars on the footbridges); Ledger ramp seam; validator ignored the body | Reliquaries moved to 0°…300° between the footbridges; footbridges run to r 15.8; the hub candle and Span Winch moved off the walking lines; the Ledger ramp is painted after its platform and ends 2 m inside it (slope ≤ 0.5). validate-data runs every reachability check (spawn / moorings, stands and alt stands, candles, deeds, moorings, the foot gate, docks) on the grid **eroded by the 0.4 m body**, for every variant × shortcuts closed / open (18 grids), and checks that every ramp can be walked end to end. |
| 2 | Finale stances could not cast and see | The giants kneel at the north wall ((±25.5, −60.5)), their forearms rise from the Brink's ends to the Joined Hands (0, −61) over the north water; the Pilgrim Road and the Brink candle stay south. The Brink is a horseshoe (no thin water crack anywhere; the Hands connect only by the forearms). The Brink stand casts north over open water; the Hands' stand casts 3–9 m south over open water. validate-data requires ≥ 60% of the legend pool castable (arc, minDist) **and** seen by the fish camera from both stances (now 90% / 95%). |
| 3 | The fish camera could not see into holes | The **pool framing** (render, §24.5) plus a data-backed **sill rule**: every fishing hole has a `lip` (south 120° band ≤ 1 m above the water; validated on the near rim); the Ledger shaft's fallen south face is real geometry (lip w 3.3); the Mirror Nave is roofed with open ribs. validate-data runs the same camera model and requires ≥ 60% of castable place water seen from every stand (worst now 76%, the Bell-Chapel Window). |
| 4 | Combat wrote `player.position` and called the raft-radius collide on the Wick | CONTRACT §12.5 names the four call sites and replaces them with `player.pull / pushOut / knock / pin`; on foot they resolve through `moveFoot`. world keeps `collide()` exactly as v1 for raft lakes and adds `collideRaft`, `moveCrawler` and `settle` for crawlers, floats, cinders and stolen fish. |
| 5 | Raft-night enemies could not path around polygon land | On the raft in mixed and foot lakes the same bounded flow field runs on a water layer of the raft's water component; crawler and eel spawns are restricted to that component with water path ≤ 40 m; the Mossmere keeps v1 circle steering; the perf budget now runs flow fields at dusk and in the Gloomtide in mixed and foot lakes in either mode. |
| 6 | Two cavern edges | Walking lakes use the exact circle (`shoreRFor`) everywhere (grid, raft collision, depth, foam, cliffs; cliff base ≥ R + 1.5, outward-only noise, lean-in above 9 m); `obstacleRadius()` is shared by the grid and world collision; validate-data checks no land beyond R − 0.5 and pad + cliffGap ≥ 2 m. The Pallid Landing poly was pulled inside the circle; the giants no longer touch the Brink. |
| 7 | Position and mode not saved | `run.flags.pos` / `run.flags.raft` written on every autosave; continue snaps to the nearest walkable cell (or raft water), else the nearest lit candle; per-day place counters, the Last Ferry's use, the leap, the stake and the hush are saved (CONTRACT §12.2). |
| 8 | Merging the data changed v1 | One flag, `WALK_ENABLED`, read by data and world. With it off every v1 table and arena field is bit-identical (validate-data pass 1 = the v1 validator's 22,295 checks); all replacements live in `ARENA_V2` / `WALK_*` and merge only with it on. Place-kept species exist only in the walking build, so no v1 fishing filter or perk exclusion is needed in the interim build. |
| 9 | Float32 thresholds, one-way edges | Heights are quantised to 0.1 m in `walkGridFor`; every threshold sits on a half-step (0.45, 1.25, 3.55, 3.05, 1.95, 4.95); one compare helper (`walkHeightLE` / `walkStepOK`, eps 0.02) for grid, mover, flow, validator and tools; steps symmetric (0.45 both ways). validate-data flags cells within eps of a threshold and any one-way pair (none). *Instead of authoring the gallery at 1.15, the climb threshold moved to 1.25: same effect (the 1.2 m gallery is climbable with a 0.05 m margin), and it holds for every height by construction.* |
| 10 | The Gill Harp stand on a curtain station | Curtains at 30° / 150° / 270° (east, west, north); sequence and light deeds carry `trigger` and `touchR`; validated ≥ touchR + 1 m from every stand, candle and mooring. |
| 11 | Foot nights softened the killers | Stain 3.2, telegraphAdd 0, no glob slowdown, inkwell hold 13–18 m with walkway-near perches; only alignment remains (Abbot gap, Pole Sweep, the Gardener's charge across the walkway). Foot accel 6 / decel 8, contact 1.6, crawler land speed 0.9; speed 0.84 (tuned, see 12). balance-foot.mjs replaces fixed dodge rates with a kinematic check (raft and foot, open water and walkways) and foot Embers lost per night land at −9% (Glasswater) and +4% (Pallid) of v1. validate-data asserts the killer values. |
| 12 | No simulation of foot days, nights or campaigns | `tools/balance-foot.mjs` (Appendix B): day routes on the eroded walk grid × 1.2, kinematic dodges, eel availability, crawler arrival by path, candle time share, corridor pinning, candle oil, Known Places across campaigns. Every acceptance row passes; it moved three numbers (speed 0.82 → 0.84, calm 125 → 120 everywhere, Sporewood hush 30 → 10). |
| 13 | Candles became a teleport map and a fortress | Flame-leap at dawn only, once, free, angle-true radial; Known Place = discovered with a free first share, not pre-lit; darkness at half rate inside (never stops); the Stake Lantern gives slow and Choir only; Kindred Flames L3: one free flare per candle per Gloomtide, discounts first shares only; share cost 12 × zone drain (14–20 oil). |
| 14 | The finale inside a lamp; stances no choice | A gloom legendary's first surge darkens every candle within 30 m; victory relights all gold. Brink flat line (sweet +0.03), Hands steep line (sweet −0.03, warnings −0.1 s, the general rule above 4.95 m); `--reel`: skilled ≈ 50% vs ≈ 30% (raft 43%). *I used ±0.03 instead of the suggested −0.05 / +0.05: those gave 25% vs 53%, which makes the Hands a trap rather than a choice.* The Mother's Cup candle moved 11 m from its stand. |
| 15 | The Wick is a dot at night; candles compete | walkNight dist 16.5, elev 56; portrait numbers of its own; 1.0 m ring with a heading notch and a thin amber rim; candles cold, steady, accent-coloured with an ink-edged decal (one instanced draw) and the land lamp term; only the Wick's light is amber and flickers; QA #20 adds the find-the-Wick test. |

**Should-fix**

| # | change |
|---|---|
| 1 | `occludable()` sets its own program cache keys and a separate occludable outline material; x-ray = one proxy after world opaques, before the Wick (or stencil); instancing-aware `vWorldPos` (CONTRACT §12.5 toon). |
| 2 | Land draws before water on walking lakes; `DEPTH_RES` 256 (or a land-distance channel); no shore fade in POOL cells. |
| 3 | `survival.getPhaseInfo().duration` is the only phase-length source; `.hush`; `run.flags.hush` persisted. |
| 4 | Ownership aligned: progression owns deeds, candles, Astir, variants; world renders. Place proximity = stand or water within 8 m. `player.interactHold(down)`; the Fish-here pill calls `fishing.onPointerDown/Up`. |
| 5 | `surfaceY(x, z, layer)` and `getFlow(x, z, layer, out)`; non-raftPass bridges solid for swimmers; separate water and land flow layers. |
| 6 | Flow fields on the 0.5 m walk grid, path ≤ 45 m, bucket queue with integer costs (`combat.foot.flow`); validated to share the walk cell. |
| 7 | Per-instance ground y for decals; explicit `ENEMY_MOVE` (Wardens fly, the Hand is static); summons through the crawler rule; flyer y over the ground; the Gardener charges across the walkway. |
| 8 | Fixed yaw in shop and death on foot; terrain clamp along focus → camera, inside R − 2. |
| 9 | All nine checks added to validate-data: tip triggers (fixed to `interact:change:ashore`, `player:mode:ashore`, a foot-only `player:mode:spawn` tip), pill overlaps (candles ≥ 3 m from stands, 2.5 m from docks, deeds 3 m, docks ≥ 5.5 m from stands, candle posts are blocks, never south of a stand), the 14 m south rule (two Lanternstalks moved), deed `resets` ↔ rule mode and `trigger`, `yawDeg` everywhere, stand → slot − hull ≤ board range (three moorings moved), bounty types, castable = reach + minDist + arc, Tide Chart / spot_catch on spotStyle lakes. |
| 10 | Lamp-light term in land materials (≤ 10 lights) + one instanced decal; the Stake Lantern is an item planted with a pill (`run.flags.stake`). |
| 11 | Partial darkness shelter, first on the knob list; the Last Ferry once a descent (and its "× 3 weight" text removed); foot boons weight 0 in raft lakes; place uplift measured in Appendix B. |
| 12 | Land meshes from the grid (marching squares per height band), memory restated (≈ 2.5 MB). |
| 13 | One instanced place-FX mesh + one Points for every rule visual; per-lake draw-call ledger (§24.12); QA #20 on a mid phone. |
| 14 | Locked targets drop in (no arc); the lit row is a charge tick, not a lateral line; assist off for reflection / drifters / moving; the meter's "pool" is the first contiguous water run along the ray. |
| 15 | Portrait numbers of their own (fov ≤ 62°), verified with `playtest.mjs --mobile`. |
| 16 | The Lullaby's foot stand moved to the north beach of Lanternstalk Grove (casting north); the Bell window looks north-west from the chapel's west wall; validated up-screen rule (±50° or ≤ 6 m), which also moved the Cascade stand and the Hymnal / Long Pier water. |
| 17 | Candles 3–11 m east / west of their stands (never south), validated ≥ 3 m; Fish here outranks Leap and a lit candle's pill within 2 m of a stand. |
| 18 | Mirror Nave: 2 fish, hit radius 0.9 (≈ 11% of the pool, validated ≤ 15%), mirrored across a north–south line (x flips), 0.5 s flash. |
| 19 | The greenhouse lock picks the bed; the bonus needs the charge within ±0.08 of the meter's tick. |
| 20 | Cinders drift to the Wick's own walkable area within 12 m of path, else fly to the Wick; cadence checked in Appendix B (24 s / 32 s unchanged). |
| 21 | Breathing Deep domes placed by path (≤ 8 s of walking), live 12 s, a missed dome respawns at half the interval. |
| 22 | No crossing i-frames at dusk or at night; 3 s between mode switches; push-to-cross 0.4 s within 35°; at dusk and night crossings only by pill or E. |
| 23 | Per-descent variants (Glasswater: one of three bridges down; Pallid: the Sunken Road or a Pallbearers' Walk under water), an A/B twist on every non-legend place, 4 of 8 place-kept species awake. All validated. |
| 24 | Wayside content: Pallid memorial candles (+0.5 oil, persist, victory cascade), Glasswater pages (1–2 Shells or lore), Sporewood puffballs (+2 satiety); the day's eel raid threatens walkway edges. |
| 25 | No head noun reused across lakes (validated, Mossmere included): the Mother's Cup, the Lullaby, the Veilwater, the Root Cloister, the Rootstool, Gill Climb, Veil Ledge, Harp Green, the Hyphae Strand; the Mirror Nave, the Votive Font, the Coronet, Copyists' Bridge, the Tuned Bridge, the Skiff Steps, Stillness, the Unfinished Chord; the Bottomless, the Brink, the Bier Road, the Sunken Road, the Pilgrim Road, Pallbearers' Walks, the Bone Windlass, For the Named. Waylamps are now **sister-candles** (Share flame, Flame-leap); Kindred Flames, the Trimmer's Shears, Four Shared Flames, Held the Crossing, Candle-Snuffers. |
| 26 | The Undertow Crook (a terrain weapon with its own Kindle), Vantage reworked (hauling crawlers burn hotter), the Surveyor's Chalk replaces the Floor-Map Rubbing, the Wayfarer Wick is the tier IV capstone. |
| 27 | Arrival Hush per lake: 10 s in Sporewood, 30 s in the foot lakes; average fresh Glasswater reach 0–1% (Appendix B). |
| 28 | Vigil grounds authored and validated: every stand except the two dead ends is within 14 s of a loop ≥ 40 m or a disc r ≥ 8 m (or a mooring in Sporewood); `survival.getOpenGround()` feeds the dusk readout. |
| 29 | Contact shadows under every enemy within 10 m on the blob-shadow instancing; the ring at the Wick's feet. |
| 30 | The Burning Glass moves at 0.65 m/s (≈ 70 s each way, as the text says). |


---

## 25. Fishing & discovery first (v3)

*v3 turns GLOOMWATER into a fishing-and-discovery game with a home: out-and-back **expeditions** from **the Landing**, a walkable lantern-lit 3D cove, into four hand-authored lakes full of remarkable places and resident giants, with a size model you can see and a night swarm you opt into. This section is the binding spec. Its source is the approved lead-design brief v3 (`tools/out/pivot/BRIEF-v3.md`, final revision after four panel proposals, three judges and two adversarial critiques); every rule, number, table, id and name of the brief is kept here and the argument is dropped (one short "why" per decision). The binding APIs are CONTRACT §13. Numbers are targets for `src/data.js`; land rates come from `reel-v3-sim.mjs`, sizes, odds and the value factor from `roster-v3.mjs` (both in `tools/out/pivot/`, adopted by `tools/sim/reel-v3.mjs` in T1). "Hour" always means **hours of play**, not hours of fishing.*

### 25.0 Decision log, precedence and vocabulary

#### 25.0.1 What the user asked for, and where v3 answers it

| # | the user's request (verbatim, in order) | v3 answer |
|---|---|---|
| 1 | "create me a really fun 3D fishing survival game in HTML with great graphics and really addictive progression but make sure the progression is challenging. Take inspiration from hollowknights art style." | §25.1 pillars 2 and 6; the challenge lives in Prize / Trophy / Elder fish, gear gates and Far Water (§25.6, §25.9); the mood only, never the content (§25.15.3) |
| 2 | Hybrid raft fishing by day + a survivors-like night swarm + roguelite meta (summary of the request) | kept whole: Gloomtide is a night mode (§25.5), The Long Descent is today's one-way roguelite (§25.3.7), Boons and levels per expedition (§25.3.5) |
| 3 | "a combination of raft fishing for some maps, raft and walking for some and mostly walking to interesting unique fishing locations for others" | still holds: the Mossmere raft-only, Sporewood raft and walking, Glasswater and the Pallid Deep mostly on foot (§24); the Landing is walked (§25.4) |
| 4 | "far too many green heus" (fixed by the Moonlit slate palette) | still holds, now for fish, glows, Old Murk and the home cove too: green and teal only as rare accents (§25.4.5, §25.7.7, A10) |
| 5 | "The focus has to be on the fishing and the beautiful interesting environment. Less about the combat its a nice to have but I want the experience to be finding cool locations with interesting fish species and big sizes etc" | sets the pillar order (§25.1): places, fish and visible size first; combat optional per expedition and never gates a fish (§25.5.3) |
| 6 | "Go with the expeditions and home base idea" | out-and-back Expeditions from a persistent home, the Landing, replace the one-way descent as the default; the descent survives as The Long Descent (§25.3) |
| 7 | "Yes, make the home base a 3D cove" | the Landing is a small, walkable, lantern-lit 3D cove, not a menu (§25.4) |

#### 25.0.2 The brief's open questions, answered by the user (all = the recommended defaults)

| # | question | answer (binding) | where |
|---|---|---|---|
| Q1 | Default night mode from the 2nd expedition | **Lantern** (a light swarm), with **Still** offered side by side on an equal card. The First Outing is always all-still. One data constant (`BALANCE.nightModes.default`) flips it to Still if playtests ask. | §25.5.1, §25.5.8 |
| Q2 | Tackle in The Long Descent | **Per-run gear and its own purse** (a pure roguelite): today's UPGRADES from Murk, a twig rod start, 20 starting Shells; persistent tackle, outfit and Shells are ignored. | §25.3.7 |
| Q3 | How hard the early lakes' biggest fish stay | **Hard until late-game tackle** (come back later): an Elder Reedjaw lands ≈ 0% on starter tackle, 55% on T3, 82% on T4; smaller species' Elders stay catchable on the lake's own tackle. | §25.6.6, §25.9.2 |

#### 25.0.3 Precedence and scope

1. **§25 overrides §1–§24 (and Appendix A / B) wherever they conflict.** The supersession table (§25.12) lists every earlier section as kept, modified, replaced or cut, with the §25 rule that wins. Anything §25 does not touch stays as written.
2. **§24 is edited in place** where v3 renames or retunes a §24 place, id, name or number; each such edit is marked "v3" there and listed in the sync table (§25.13). §24's remaining rules (foot controller, walk grid, places kit, night on foot) are the base v3 builds on.
3. **The Long Descent** (§25.3.7) is today's game: inside it, §1–§24's run rules (phases, Heat, `difficultyFor`, per-run UPGRADES, `memoriesFor`, per-descent §24 state) apply unchanged except where §25.3.7 says otherwise. v3's fishing model (size, favour, classes, ceremony, records) applies in every mode.
4. **Scope words:** wherever §1–§24 say "run" or "descent" scope (challenges, per-descent variants, twists, awake species, the Last Ferry, lit sister-candles), v3 reads **expedition** scope; The Long Descent keeps descent scope.
5. **Code names vs player names.** Players see *the Landing*. Code uses `hub` (the flow), `cove` (the zone id and camera mode) and `hub:enter` (the event), because `landing` is already a fishing state in eight modules. The §24 lamps are **sister-candles** (code `lamps`); where the brief says "Waylamp" it means a sister-candle.
6. **Two kinds of "marked" fish, kept apart in code:** a fish **marked for home** is a Prize+ catch you carry in a Live Well slot this expedition (`run.marked[]`, UI "Mark for home"); a **Marked Fish** (capitalised, "still out there") is an escaped Trophy+ fish that persists at its place across expeditions (`meta.markedFish[]`).

#### 25.0.3a Build-review resolutions (binding, recorded so they are not re-litigated)

Three reviewers checked this section, CONTRACT §13 and data against the code before the build wave. What changed, in one line each (details where they live):
- **Phases carry exactly their data** (`V3_PHASE`; §25.14.1, CONTRACT §13.0). P1 gets the renames with a Pg0 id migration; relic cuts, challenges and the welcome purse wait for P3.
- **P2 builds §24.7's place kit raft-first** (F14, Pg11, U16); **P3 builds the foot core** (S0, R0) if §24 has not; the cove's land has its own extrusion builder; Landing v0 is pill posts on the quay's parapet.
- **Geometry fixed against world-layout:** the Gatehouse Door (22, −2.5) with a wall-face dressing; the Ferry-Market (−21.4, −25.9) r 3.2; the Lily Maze (−40.5, 24.5) r 7.5; the Sluice lane from z −41; the Cupped Hands' bowl at water level; Homeward stones beside (not on) docks and stands; watch lamps at the drawn buoy positions with pool r 6; `getDepth` clamps to place depth in every lake.
- **Elder seals:** 143 (the capped Lampwarden has none); `giantsKept` and two shallow giant waters give every other seal a route; the pool is ≈ 4,550.
- **Numbers:** the yield factor 0.784 (rendered oil was ≈ 28% high); three new species retuned (Ancients ≤ 180 s); "≈ 3 min" Ancients checked at ≤ 207 s; the cumulative-Shells column recomputed.
- **Specs closed:** drag / absorb / Spooled and how tiers replace the stats base; the float's species-free μ; let it pass refunds the bait; the catch hand-off and the save on `fish:measured`; Set Out in two steps with a stored plan and a glide; the tray; hub pointer routing; the hard rule (no knockback, shove or zap release while hooked); the cinematic ceremony; the night camera follows the swarm; cameras in render's convention; the pond discard under a define; the mount batch's near / far pair; frame heights and mount views; `shoreNotch`'s schema; the cove's theme.

#### 25.0.4 Vocabulary added by v3 (every existing term is kept)

the **Landing** (home cove; code `hub` / `cove`) · **expedition** · **First Outing** · **Set Out** · **Homecoming** · **Snuffed** · **Scorched** · night modes **Still / Lantern / Gloomtide** (a quiet night is a **Stillnight**) · **Night Rise** · **Far Water** · **favour** (μ) · size classes **Small / Keeper / Prize / Trophy / Elder** (an **Ancient** is an Elder with z ≥ 3.2) · **Elder Log** · **Old Ledger** · **Marked Fish** · **resident** · **Tally Post** · **Long Wall** · **frame** · **keep-pond** · **Gear Bench** · **tackle** (Rod / Line / Reel / Creel tiers) · **outfit** · **Map Table** · **Homeward Waystone** · **Live Well** · **lamp-watch** · **tackle rating** · **proof catch** · **The Long Descent** · **Well-fed** · **Quayling** · **signs** · **the float's favour** · **Astir** (kept from §24) · **Murk's Ledger** · **today's rumour** · **the Lantern-Swallower** (was the Pale Leviathan) · **Last Candle** (was Drowned Marrow).

### 25.1 Pillars (ranked)

When pillars conflict, the higher one wins. These replace §1's pillar list; §1's premise and tone stay, and the loop sentence becomes "set out, find remarkable places, land remarkable fish, bring them home".

1. **Remarkable places, remarkable fish.** Every lake is a set of hand-authored *places*, each with a twist, a story and, at three per lake, a resident giant. Exploration means finding them; fishing means solving them.
2. **Size is the challenge, and you can see it.** Ordinary catches stay relaxing (commons land ≥ 97% for a novice). The challenge lives in **Prize, Trophy and Elder** fish, which need place, conditions, presentation, tackle and skill at once. The setup is readable (the float's favour notches, §25.6.1) and size is honest at every stage: bite, breach, fight, measuring cord, wall.
3. **Home grows with what you bring back.** The Landing is the visible spine of progression: one framed slot per species on the Long Wall, a pond of living trophies, lit Waystones, a tackle rack, a shrine of relit lanterns. Records are written at the measuring moment and kept forever. Mounts must survive the trip home.
4. **How far you dare to go.** Oil still equals light and light still equals life, but oil and the Live Well now measure *how long and how far* an expedition runs. **Far Water** makes every extra day out both more rewarding and more expensive, in every mode.
5. **Night is the big-fish hour, and the swarm is optional.** **Night Rise** brings giants shallow in every mode. Fighting is a per-expedition choice (Still, Lantern or Gloomtide) and never gates a fish, a place, a size class or the odds.
6. **Hand-inked melancholy, ours alone.** Silhouettes, rim light, ink outlines and bioluminescence, with original names, places, systems and HUD. Not Hollow Knight's content, not Dredge's loop, not a real fishing game's signature systems (§25.15.3).
7. **One thumb, one button.** Hold-to-reel stays the only core fight input. At most one new fight verb per lake, introduced one at a time; everything playable one-handed on a phone.

**Decisions that shape the pillars (with the short why):**

| decision | rule | why |
|---|---|---|
| Night is the climax of every day | Night Rise favour +0.25; ≥ 2 night-only species per lake; glow trails. In the default mode the swarm takes only the first half of every second night; the last 45 s of every night are always uninterrupted fishing. | request 5: night is a fishing opportunity first |
| Persistent collection is made visible | over the first 15 hours the felt spine is three tracks: **tackle tiers** (what you can hold), **Waystones** (where you can go), **the Landing filling up**; the Long Wall gives the long tail a visible slot per species | progress you can see and walk around in |
| Reuse what is built; cut what fights it | cut: the mid-fight drag dial, rod sweep, diver/snag world tags, count-down sink rigs, the net QTE, pointer-target scatter casting, lure sizes, diet tags, morphs, geometry-moving weather | each adds a verb or system the phone, the originality rules or the merged ring geometry cannot afford |
| Big sizes, honestly and stretched | true scale (a 22 cm minnow *looks* small next to a 0.85 m Wick), a stretched size tail (an Elder is 1.6–2.0× a typical Keeper's length), legendaries ≥ 1.4× anything else in their lake, frames sized per species, a camera that never zooms by class; the 1.45× mid-fight mesh boost goes | request 5's "big sizes" must read on screen |
| Failure stings without wiping the collection | §25.3.4: you lose the creel, the fish you were carrying home and half the expedition tally; never a record, a species, banked Shells, tackle, outfit, places, shortcuts or access | the sting lands on the fish you were proudest of |
| Challenge comes mainly from fishing, and stays | Elder fights get steeper above the Elder cut and every Elder plays one "old trick", so full tackle lands headline Elders only 69–82% (skilled) and Ancients 43–51% | request 1: progression stays challenging (Q3) |

### 25.2 Core loop and a typical session

#### 25.2.1 The loops (replaces §2)

| scale | loop |
|---|---|
| **cast** (5 s – 3 min) | read signs and the float's favour → cast → wait (the bite tell shows the class) → hook → fight (size-scaled) → **measure** (cord, chime, seal; records written) → keep / eat / render / release / **mark for home** |
| **day** (5 min) | calm 180 s: sail or walk to places, follow signs, Murk moors · dusk 20 s: *Last Light*, big fish start to rise · night 90 s: **Night Rise**, night species, the swarm only if your mode calls it · dawn 10 s: Murk's bell, tomorrow's forecast, banked Boon picks |
| **expedition** (3–5 days, 16–26 min) | at the Landing: choose lake, Wick, night mode (from the 2nd expedition), tray → **Set Out** through the sea-gate → days in the lake (optionally pass an open gate one lake deeper) → each dawn the water improves and the way home costs more (**Far Water**) → **Return home** at the lake's Homeward Waystone or on Murk's barge, *or* the lantern gutters (**Snuffed**) |
| **home** (1–3 min) | **Homecoming**: hang fish marked for home in their species' frames or release them into the keep-pond; Murk buys the rest; the tally is paid · fit tackle and outfit at the Gear Bench, try it on the test buoy from the jetty · relics at the Shrine · plan at the Map Table |
| **campaign** (15–40 h) | land each lake's legendary → its gate opens → pass through once (toll) → the next lake's Waystone lights at home · tackle tiers gated by **proof catches** · Elders and Ancients in every lake · the Long Wall's four wings fill · The Long Descent |

#### 25.2.2 First session, minute by minute (The Wick; the game at the end of P3)

| clock | where | beat |
|---|---|---|
| 0:00 | Landing | Title overlay over a slow orbit of the cove: one lit hearth, a bare specimen board on the harbour wall, a silted pond, the raft at the jetty. "Begin." |
| 0:05 | Landing | The Wick wakes by the hearth. Tip: *walk*. The jetty end glows; a test buoy bobs beyond it. |
| 0:15 | jetty | Tip: *hold on the water to cast*. The first cast goes into the cove. |
| 0:22 | jetty | A quick **double pop** (Small). A 4 s fight, then the **measuring moment**: palm pose, the cord ticks to 13 cm, "Quayling, Small". First Journal page (+3 Memories). Murk, from his barge: "Lives in my front yard. I don't buy those. The real water's through the gate." |
| 0:40 | Landing | Map Table → the **First Outing** card, fixed: The Mossmere · The Wick · "Every night of your first outing is still." No mode choice yet. Set Out. |
| 0:50 | Landing | The Wick boards the raft. A 3 s glide under the bare sea-gate arch, past the lit Mossmere Waystone. Zone flash. |
| 1:05 | Mossmere | Spawn in the south (day 1 calm: 180 + 30 s Arrival Hush). The Homeward Waystone glints at the south-east dock, 25 m away. |
| 1:20 | | Murk's bell. He moors at that dock, beside the Homeward stone. |
| 1:30 | | First lake bite: a Dusk Minnow (Small). |
| 1:40–3:40 | | 3–4 species. A **boil** near the Cupped Hands draws you east: first place ("The Cupped Hands", ink title card, 1.2 s). The aqueduct coughs, the bowl overflows, fry spill, and the float shows **◆◆◇◇◇** (place 0.15 + live window 0.4). A slow **drag-under** tell: the first **Prize**, a 31 cm Dusk Minnow (≈ 55% of players have a Prize within 5 minutes of the lake). Ink-stamp seal; record written; "Mark for home?" (1 Live Well slot, "keeps 3 nights"). |
| 3:50 | | Murk: rumour tier 1 ("When the old aqueduct coughs, the stone hands overflow."). Sell 2 fish. |
| 4:20 | dusk | *Last Light*: "The big ones come up at dusk." |
| 4:40–6:10 | night 1 | Still. Glowtide: wakes sparkle and a night fish shows as a moving light. Night Rise. *Lampsipper* rises to your lantern (new species). |
| 6:10 | dawn | Murk: "Moonfall twice tomorrow." Far Water ◆◇◇◇. |
| 6:20–9:20 | day 2 | **Moonfall** at 25% of the calm: the Ferry-Market goes glass-clear (moored barges, a toll-house clock, cart wheels). Four fish circle at true scale; you cast to the biggest, a 65 cm **Trophy** Candlefin (oxblood wax). The Belled Matriarch is visible in the Bell Pool. Under the Span is discovered. Heartmoss bought (40). |
| 9:40–11:10 | night 2 | Still (First Outing). A Gloam Eel (Prize) follows a glow trail. |
| 11:20–14:20 | day 3 | Matriarch attempt (sim on starter tackle: 56% novice / 82% skilled). Under the Span, a Trophy Reedjaw escapes at 84%: **near-miss card** ("Snapped at 84%. Your tackle is rated Trophy here, and that was a big one. Let go on the hiss."). It becomes a **Marked Fish**, still under the bridge. |
| ≈ 14:30 | | **Ride home** on Murk's barge (day 3 is a Murk day; he casts off at 85% of the calm, ≈ 14:53), or hold at the Homeward stone. |
| ≈ 15:00 | Landing | **Homecoming**: the Prize Dusk Minnow goes onto the Mossmere specimen board (close-up at 1.7 m with the Wick beside it, then a pull back to the whole wing); the Trophy Candlefin fills its plaque. Murk buys the creel. Memories ≈ 18: tally 10 (2 dawns × 3, 2 still nights, a Ledger request 2) + first mounts 8 (Prize 2, Trophy 6). Gear Bench: buy and fit **Braided Gut (Line T1, 120)** and try it on the test buoy. |
| ≈ 16:00 | | The Map Table now offers night modes (Lantern preselected). The session ends with two fish on the wall and a Marked Fish waiting "under the bridge". |

Notable events: ≈ 22 in 16 minutes (8 species, 4 places, 3 class firsts, PBs, two mounts, the first legend attempt), one every ≈ 45 s. Named species in the first 30 minutes stay ≤ 9 (Quayling, Dusk Minnow, Mossback, Crayfish, Weeping Carp, Candlefin, Reedjaw, Lampsipper, Gloam Eel).

#### 25.2.3 A mid-game session (≈ hour 5, Sporewood, Still mode, Tallow)

| clock | beat |
|---|---|
| 0:00–1:30 | Landing: a Trophy Plumgill goes into its plaque. Map Table: today's rumour says *an Elder Mildew Angler turns at the Mother's Cup rim*; the forecast says *Spore-fall tomorrow*. Fit Line T3 (Glass-Gut; proof was a Sporewood Trophy). Two test-buoy pulls. Set Out: Sporewood, Still. |
| 1:30–5:00 | Day 1 (210 s): moor at the Copse Jetty, walk to the Gill Harp, play the curtains (sequence), land a Harpstring Eel (Prize). Light two sister-candles. |
| 5:00–6:50 | Dusk and night at the Mother's Cup rim (a giant place) with Ember Roe at the bottom of the band: float **◆◆◆◆◇** (place 0.15 + Night Rise 0.25 + rumour 0.3 + bait 0.35 + depth 0.25 = 1.3 → Trophy 19%, Elder 9%). A water-dome tell: an Elder. With Line T3 on a T2 Rod and Reel a skilled player lands it ≈ 15–30% of the time (between the T2 and T3 rows of §25.6.6): it escapes at 71% and becomes a Marked Fish ("Old Hushwing, ~110 cm"). |
| 7:00–12:00 | Day 2: Spore-fall doubles the Puffball Vent. Far Water ◆◇◇◇ (+0.06). The Lullaby's sleepers: a Trophy Velvet Ray chosen by sight. Pressure (the float says "The water here has gone quiet") pushes you on every 3–4 catches. One Old Ledger record (Murk's bell rings across the lake). |
| 12:00–14:20 | Day 3, a Murk day. The Live Well holds the Velvet Ray (night 1 of 4) and a Prize Harpstring Eel. Staying to day 5 would mean no Murk on day 4 and oil at × 2 on day 5. You **ride home** at ≈ 14:20. |
| 14:40–16:10 | Homecoming: the Velvet Ray fills its arch, the Harpstring Eel goes to the pond. Memories ≈ 28 (tally 10, first mounts 8, the Old Ledger record 5, class firsts ≈ 5). The Map Table marks Old Hushwing at the Mother's Cup. |

#### 25.2.4 Time budget of a 4-day expedition (4 full days, 20.5 min in the lake + ≈ 2 min at the Landing)

| mode | exploring (sail, walk, places, sister-candles) | fishing (cast → measure, incl. night) | fighting | menus and ceremonies | fight share of play |
|---|---|---|---|---|---|
| **Still** | 7.5 min | 10.5 | 0 | 2.5 | 0% |
| **Lantern** (default from the 2nd expedition) | 7.5 | 9.6 | 1.35 (two 40.5 s swarm windows) | 2.05 | ≈ 6% |
| **Gloomtide** (21.1 min in the lake: nights 90 / 96 / 102 / 108 s) | 6.0 | 6.3 | 6.8 (four full nights + calm raids) | 2.0 | ≈ 29% |

### 25.3 Macro structure: expeditions from the Landing

**The decision.** The one-way roguelite descent of request 2 becomes **out-and-back expeditions**. Per-expedition risk, per-expedition Boons and levels and an optional swarm are kept. **Tackle, outfit, Shells, the Journal, records, places, shortcuts and lake access persist.** The original one-way descent is kept intact as **The Long Descent** (§25.3.7). The hybrid of request 2 (raft fishing by day, a survivors-like night, roguelite meta) is all still here; the meta now has a home you walk around in, and trophy hunting no longer resets every run.

#### 25.3.1 Reaching the four lakes: unlock order, travel, Waystones

| step | rule |
|---|---|
| **Waystones** (vocabulary kept, meaning sharpened) | Four standing stones at the foot of the Landing's sea-gate, one per lake. A lit Waystone is a lake you can **start an expedition in**. The Mossmere's is lit from the start. Waystone relics (purse, banked levels) are cut. |
| **Opening the next lake** | Land a lake's legendary (legend rule unchanged, §5.6) → its **Descent Gate opens for good**. |
| **Lighting the next Waystone** | During any expedition, pass through that open gate once and pay its **toll once** (180 / 420 / 900 Shells, unchanged). You arrive in the new lake *on that expedition*, and its Waystone lights at home for every later expedition. The first visit to each lake is always a journey, never a menu jump. |
| **Going deeper mid-expedition** | Any open gate whose Waystone is lit is a free passage one lake deeper: one-way within an expedition, calm or dawn only. **+10 tally per lake crossed, paid only if the expedition then completes a full calm in the destination lake** (no gate-hopping for Memories). The deeper lake's drains, Heat and fish apply. |
| **Travel out** | Map Table → **Plan** (the plan is stored and the chosen Waystone flares; nothing changes zone yet) → *Board* the raft (refused without a plan) or *Set Out now* (auto-walks and boards) → a scripted glide (3 s, `player.glide(COVE.setOutPath)`) east of Murk's barge, through the gap in the Waystone sill and north under the sea-gate arch → crossing the arch line calls `game.setOut(plan)` → zone flash → that lake's spawn. Murk follows and moors at 0:20 of day 1. |
| **Travel home** | **Homeward Waystone**: one lantern-stone per lake (r 0.6, it blocks the raft or the Wick), **≥ 25 m of path from the spawn** (validated), beside (not on) a dock or walkway: Mossmere 4 m from the south-east dock at (27.9, 39); Sporewood at the Copse Jetty's landward end (21.1, 30); Glasswater beside the Skiff Steps (3.2, 18); the Pallid Deep beside the Cairn Plaza sister-candle (4, 26). Each is ≥ 1.5 m from stands, slots, lamps, posts and buoys and ≥ 3.8 m from a barge pad, and cuts no walkway off (validated). Builds without §24 use `RAFT_FALLBACK_V3[lake].homeward` beside a dock. Within 4 m during **calm or dawn**, hold the pill for 1 s. Or **Ride home** from Murk's barge while he is moored (calm only). Both sleep through dusk and night, like the gate. |
| **Deep starts** | Starting in a deeper lake gives **3 / 6 / 9 banked Boon picks** (Sporewood / Glasswater / Pallid) in every mode: Angler-pool picks in Still; in Lantern and Gloomtide the full pool, with Angler-tagged picks capped at the same 3 / 6 / 9. Gloomtide also keeps today's Kindling Draft (9 / 18 / 28 levels), but **Draft levels may only take non-Angler offers**. |
| **Heat on deep starts** (combat modes) | Heat = max(day − 1, arrival offset) + 3 × zone, with offsets 0 / 4 / 8 / 12 by lake in Gloomtide and 0 / 2 / 4 / 6 in Lantern, so a Pallid start faces today's arrival Heat (≥ 18 in Gloomtide), not day-1 Heat. |

#### 25.3.2 The expedition

| phase | what happens |
|---|---|
| **First Outing** (expedition 1 only) | Fixed card: the Mossmere, The Wick, every night still. No mode cards. From expedition 2 the Map Table shows the three mode cards with **Lantern** preselected and a one-line explanation under each. |
| **Set Out** (Map Table) | Choose a lake (lit Waystones only), a Wick (unlocked), a **night mode** (Still / Lantern / Gloomtide, locked for the expedition) and a bait/lure **tray** (`meta.tray`: bait and supplies bought from Murk at home and owned lures; it moves into the run at Set Out, and nothing in it comes back). The card shows tomorrow's condition per lake, today's rumour, known residents and Marked Fish, and the **tackle rating** of your fitted set in that lake ("Mossmere: Trophy · Elders 15%"). |
| **Days** | Calm 180 s (185 s in the two foot lakes; **+30 s Arrival Hush** on day 1 and on the first calm after passing a gate, in every lake), dusk 20 s, night 90 s (Gloomtide: 90 + 6/day, max 120), dawn 10 s: 5 min per day, 5.5 min for day 1. Murk moors in the lake (days 1 and 2, then odd days only, §25.3.3): buys fish, sells bait, supplies and, in combat modes only, the combat kit; posts in-lake bounties; takes Ledger turn-ins. **Tackle and outfit are only sold and fitted at home.** |
| **Return home** | Homeward Waystone or Murk's barge, calm or dawn → Homecoming (§25.3.6). |
| **Snuffed** | Oil hits 0 → *Last Flicker* (+12, once per day) → 25 s of **guttering** (light 2.5 m; no casting because you cannot see the bobber; you can still move and render a fish to relight) → snuffed. **Only oil can snuff you in Still and Lantern.** In Gloomtide, Embers reaching 0 also snuffs (today's stakes). The *Second Wick* relic relights once per expedition in every mode. The Wick wakes at the Landing's hearth: "Murk found your raft drifting." |
| **Length** | Open-ended, shaped by Far Water. Built for 3–5 days (16–26 min); a one-day outing (≈ 6 min) is a first-class phone session. Combat modes keep the linger rule (+1 Heat per night after the 4th night in one lake). |
| **Saving** | Autosave every 30 s, on every phase change, on `visibilitychange: hidden` and on `pagehide`, including the Wick's position (`run.pos {x, z, y, mode, mooring}`), oil and the phase clock. *Continue* restores you exactly where you were (snapped to the nearest walkable or water cell by `walkGridFor`). A save made while guttering or at 0 oil resolves as Snuffed on load. Closing the tab never moves you closer to home. |

#### 25.3.3 Far Water: why "one more day" is a real decision (every mode)

The lake forgets you are there, and the lantern remembers how far you are from home. Both begin with the first dawn of an expedition (day 2). Knobs: `BALANCE.farWater`.

| | rule | day 2 | day 3 | day 4 | day 5 | day 6+ |
|---|---|---|---|---|---|---|
| **reward** | lake-wide favour (an *Hour* favour, §25.7.2) | +0.06 | +0.12 | +0.18 | +0.24 (cap) | +0.24 |
| | resident shows per calm at each giant place (§25.8.1) | +1 | +2 | +3 (cap) | +3 | +3 |
| **cost** | Murk moors | yes | yes | **no** | yes | odd days only |
| | Murk's oil price | × 1.0 | × 1.0 | — | × 2.0 | + 0.5 per day after day 3 |
| | oil from rendering a fish | 90% | 80% | 70% | 60% (floor) | 60% |
| | night oil burn (night n) | × 1.0 | × 1.15 | × 1.30 | × 1.45 | + 0.15 per night |
| HUD | the Homeward stone's distance and **Far Water ◆◆◇◇** next to the oil gauge | | | | | |

**The oil table** (`BALANCE.oil`; oil/s = 0.17 × zone oil drain × context × night factor; it replaces `BALANCE.drain.oilPhase` outside The Long Descent):

| context | calm / dawn | dusk | night |
|---|---|---|---|
| on the raft (sailing or moored) | 0.35 | 0.5 | **1.0** (all modes) |
| on foot | 1.0 | 1.0 | 1.4 |
| inside a lit sister-candle's light, or standing at the moored raft | 0.35 | 0.35 | 0.7 |

*Mossmere check (raft only):* a day burns 10.7 (calm) + 1.7 (dusk) + 15.3 (night) + 0.6 (dawn) = **28.3 oil** (30.1 on day 1). A rendered Mossmere common gives ≈ 17 oil at 100%. Commons you must render per day: 1.8 (day 1) · 1.9 (day 2) · 2.3 (day 3) · 2.8 (day 4) · 3.5 (day 5) · 3.7 (day 6), out of ≈ 5 fish landed. By day 5 you are eating most of your catch, with no Murk on day 4 and double-price oil on day 5. *Glasswater check:* 53 oil per day if you spend the night at a lit sister-candle, 68 in the open (both with ≈ 85 s of the calm spent inside candle light or at a mooring); a full 100-oil lantern on foot away from candles lasts 7 min by day and 5 min at night.

**The Live Well clock** (`BALANCE.liveWell`). A fish marked for home is alive and must reach home alive. It keeps for **3 nights** (Creel T0–T1), **4** (T2–T3) or **5** (T4) after it is marked. At the dawn after its last night you release it ("It had grown listless. You let it go."): the record stays, the mount does not happen. Legendaries need no Live Well slot and never expire. There is no spoilage, no value decay and no cargo grid (§25.15.3).

**Targets for the balance sim (T3):** snuffed ≤ 3% of expeditions for players home by day 3 and 6–10% for players who push past day 4 (Still); Lantern +2 points; median expedition still 3–5 days; ≥ 25% of expeditions end on Murk's barge.

#### 25.3.4 Exactly what persists across a failed expedition

| thing | written when | kept if you return | kept if **Snuffed** |
|---|---|---|---|
| Journal names, field notes (incl. your best setup per species), class seals, personal bests (cm and kg), Old Ledger records, the **Elder Log** entry | at the **measuring moment** (the seal stamp) | yes | **yes**: an Elder lost on the way home keeps the line "*Sank with the creel, night 4*" |
| Shells | the moment Murk pays (in-lake sale, bounty, Warden) | yes | **yes** (no unbanked Shells exist) |
| Memories from discoveries (species, class firsts, places, rumours, Old Ledger, legends, challenges, first releases) | the moment it happens | yes | **yes** |
| Tackle tiers, outfit tiers, lures owned, relics, Wicks, challenges, Waystones, open gates, **opened shortcuts**, Known Places, Tally Post records, residents, Marked Fish | on purchase or event | yes | **yes** |
| **Creel** (unsold fish) | — | sold to Murk at home | **lost** (it sinks) |
| **Fish marked for home** (Prize+ you chose to bring home; theft-proof; in Live Well slots) | — | hung in their species' frame or released into the keep-pond (first-mount Memories) | **lost**, with no mount and no first-mount Memories |
| **Expedition tally** (dawns, nights, lakes crossed, Ledger requests) | on return | 100% | **50%** |
| Bait, consumed lures, supplies, combat kit, level, Boons, Kindles, Heartwax, lit sister-candles, the lake's Astir state, Far Water | — | end with the expedition | end with the expedition |

A typical snuff costs **less than a day's catch plus whatever you chose to carry home**. The sting lands on *the fish you were proudest of*, never on the collection.

#### 25.3.5 How the existing roguelite systems map onto expeditions

| system | in v3 |
|---|---|
| **Memories → Relics** | Same currency and the same Shrine (now a 3D alcove at the Landing). Discoveries bank instantly; the expedition tally is paid on return. Relics split into a **Fishing & Exploration shelf** and a **Gloom shelf** (effects that only matter in combat modes). Cut: Waystone relics × 3 and Murk's Old Debt; their Memories are refunded on save migration. New relics: §25.10.4. |
| **Boons and Kindles** | Per expedition (they reset at home). Levels come from fish and discovery XP in every mode, and from Cinders in combat modes. **Level-ups earned while fishing, sailing or walking are banked** and offered on the next measuring card or at the dawn bell, never as a modal while you move or have a line in the water. Level-ups during a swarm keep today's immediate offer. **Angler pool**: the 9 existing fishing, movement and oil boons plus 6 new (§25.5.4). Kindles exist only in combat modes. |
| **Wicks (6)** | Chosen per expedition at the Map Table. Stats unchanged. Every quirk gets a fishing half (§25.5.5), including §24's sixth Wick, the Wayfarer. Unlocks get either-path requirements. |
| **Challenges** | Today's 30, plus §24's tier IV (10) and a new tier V *The Measure* (8) = **48**. "Run" scope becomes "expedition" scope. **Nine** combat-only challenges move to a **Gloom** tab and unlock only combat things (§25.10.5). |
| **Waystones** | The Landing's sea-gate stones (§25.3.1). |
| **Wardens, Heat, formations, elites** | Unchanged inside Gloomtide; scaled inside Lantern (§25.5.1); absent in Still. Heat uses the arrival offset (§25.3.1). |
| **Trophy or Toll** | Generalised into **Mark for home**: any Prize+ fish, and every legendary, can be marked. |
| **Records** (meta) | Extended: per species (length, weight, class firsts, best setup), per place (Tally Posts), the Elder Log (with Ancients), the Old Ledger, legend growth lines. |
| **The death screen** | Becomes the **Snuffed** summary: what was kept, what sank, near-miss lines, one tip. |
| **Per-run upgrades from Murk** | The four all-mode ones become persistent **outfit** tiers at the Gear Bench (§25.6.6). The five combat ones stay per expedition as Murk's **combat kit**, sold only in combat modes at 40% of today's prices. |

#### 25.3.6 Homecoming

1. The raft glides in under the arch along `COVE.homeInPath` (2 s, `setout` camera reversed) and moors at the jetty (2 s). Skippable at any point to step 4 (the Wick then stands on the jetty).
2. **Each fish marked for home**, biggest first: *Hang* (its species' frame; it replaces the mounted fish only if longer or of a higher class, otherwise the game asks), *Keep-pond* (≤ 1.4 m, if a slot is free) or *Sell*. Hanging plays the `hang` close-up: the camera flies to the frame (even one on the upper wall, 25 m away) and the Wick is *placed* at the wing's foot, not walked there; an iron-hook clink, a candle lights, then the pull back to the whole wing. The first time a species is brought home at a class (hung or kept in the pond): Prize +2 / Trophy +6 / Elder +15 Memories. Legendaries always hang under the arch.
3. Murk buys the rest of the creel at standard price (shown).
4. **Summary card**: days, nights, fish landed, PBs, class firsts, places, the tally lines, Marked Fish created, and one "next goal" line (e.g. "Line T2 needs a Mossmere Prize: done. 450 Shells."). Then you are free to walk, fish from the jetty, or try new tackle on the test buoy.

#### 25.3.7 The Long Descent (prestige mode)

| rule | value |
|---|---|
| unlock | all four Waystones lit |
| shape | **today's game**: Gloomtide every night, start in the Mossmere, descend through each gate, land the Lantern-Swallower to win. No return home except victory or snuff. Today's phases (calm 120, dusk 14, night 90 + 6/day, dawn 8), today's Heat and `difficultyFor`, no Far Water. |
| purse | its own: starts at **20 Shells** (`BALANCE.economy.startShells`). Shells earned in the descent stay in it; persistent Shells neither enter nor leave. |
| tackle | today's per-run UPGRADES catalogue from Murk (twig rod start). Persistent tackle and outfit are ignored (Q2). |
| fish | fish marked for home and mounts are off, except that a victorious run brings the Lantern-Swallower home on a gilded chain |
| what still counts | Journal, records, class seals, Elder Log, places, challenges, Memories (today's `memoriesFor` plus discoveries) |
| rewards | +200 Memories on the first win, the *Ashen Cloak* cosmetic for every Wick, a gilded fifth stone rising in the sea-gate, and its own records board (fewest days, deepest snuff) at the Trials Board |

*Why:* request-2 players keep the full roguelite with records that mean something, while the default structure serves request 5.

### 25.4 The Landing: a 3D cove you walk around in

**Name.** *The Landing*: plain, a little sad, and doubly true (where the last Wicks landed, and where you land fish). In code the flow is `hub` and the zone is `cove` (data export `COVE`, **not** in `ZONES`).

**Fiction.** An old ferry landing tucked under the kingdom's outer wall: a sheltered pocket of still water behind a broken **sea-gate arch**. The four Waystones stand at the arch's feet, and a channel beyond them runs out into the dark toward every lake. The harbour wall above the quay was where the ferrymen pinned their best catches; it is bare now. Old Murk keeps his barge here between expeditions. The Wicks who are not out on the water doze by the hearth.

#### 25.4.1 Layout

Coordinates follow the game's convention: x east, z south, −z is north (up-screen). The camera yaw is fixed, looking north, as everywhere else, so **everything you want to look at faces south**: the harbour wall (the Long Wall) on the land side and the sea-gate arch on the water side, **side by side**, 4 m apart.

```
                         N (up-screen)                 channel out into the dark (shoreNotch)
   cliff ─────────────────────────────────────────────┐          ║
   ┌─ UPPER GALLERY y 6.0 ── UPPER WALL z −21.5 ──────┐ │          ║
   │  [ Glasswater wing ][ Pallid wing ]  (sailcloth) │ │ ╔══ SEA-GATE ARCH z −18 ══╗  span x −2…14, crown y 9.5
   └──────────────────────────────────────────────────┘ │ ║ legends hang y 3.5–7.5  ║
  stair x −32 (silted until Glasswater lights)          │ ║ ◆W1  ◆W2   ◆W3  ◆W4     ║  Waystones on a sill, z −15
   ┌─ LOWER GALLERY y 1.8 ── LOWER WALL z −14.5 ──────┐ │ ╚═════════════════════════╝
   │ [ Mossmere wing ]▮chimney breast▮[ Sporewood ]   │ │
   └────────────── ramp x −10 ────────────────────────┘ │      THE COVE (raft water, depth 0.2–1.0)
   LOWER QUAY  y 0.6    [S]  [B] [T] [H]earth  [L] [M]ap      ▣ Murk's barge (4, −6.5)
                              (o) keep-pond          ═══ jetty ═══▶ raft (6, 2)    ⊙ test buoy (6, −2)
   ───── low parapet, bollard lanterns ≤ 1 m; shallows; nothing above 1 m for ≥ 14 m south ─────
```

| element | position (x, z) · height | notes |
|---|---|---|
| arena | **R 42** round cavern, seed 7707, layout `cove` (shallows 0.2–0.5, channel 0.6–1.0), theme `cove` (no lake set-pieces), one `shoreNotch` for the channel: a 278° (atan2(z, x) convention), w 14 m, depth 0.8, len 12 m, so the channel runs straight north through the arch's centre (x 6) | world's existing cliff ring, 3 parallax rings (2 on low), stalactites, 2 shafts |
| **Lower Quay** (walk `rect`) | x −30…−4, z −6…+8, y 0.6 | the main floor. A 1.2 m retaining wall along z −6 holds the hearth, bench and Trials Board; the south edge has a low parapet and bollard lanterns (≤ 1 m) |
| **Lower Gallery** (walk `rect`) | x −33.5…−6, z −14…−6, y 1.8 | viewing floor for the lower wall; ramp `path` (−10, −2.5, 0.6) → (−10, −6.5, 1.8), w 3 (slope 0.30) |
| **Lower wall** | south face z −14.5, x −30…−6, y 1.8 → 6.0 | **Mossmere wing** x −30…−19.5 (10.5 m), the **chimney breast** x −19.5…−16.5 (3 m: the hearth's stack, carried up the wall behind the Lower Gallery to the Upper Gallery's parapet; both Wanderer frames hang on it, one above the other), **Sporewood wing** x −16.5…−6 (10.5 m); 3 rows of frames each |
| **Upper Gallery** (walk `rect`) | x −33.5…−6, z −21…−15.5, y 6.0 | cut into the cliff. Stair `path` (−32, −7.5, 1.8) → (−32, −17.5, 6.0), w 2.4 (slope 0.42; 1.5 m north of the brief's (−32, −6) so its foot clears the gallery's south edge); silted shut until the Glasswater Waystone lights |
| **Upper wall** | south face z −21.5, x −30…−6, y 6.0 → 10.0 | **Glasswater wing** x −30…−18 and **Pallid wing** x −18…−6 (12 m each: the Pallid's widest row is 12.0 m) |
| **Sea-gate arch** | legs at x −3 and 15, z −18; crown y 9.5 | new geometry (§25.4.6). Three legendaries hang on chains beneath it at y 3.5–6.5; the Lantern-Swallower (8.5 m) hangs lengthwise above them at y ≈ 7 inside the 16 m span (the hung set spans y 3.5–7.5). You sail out beneath your legends on every expedition. |
| **Waystones** W1–W4 | (0, −15) (4.5, −15.3) (9, −15.3) (13, −15) on a low stone sill with a **gap between W2 and W3** (3.7 m clear) for the raft's glide | each glows its lake's colour when lit |
| **Jetty** and **raft mooring** | `path` (−4, 2) → (4, 2), w 2.6; raft at (6, 2) | §24 board / ashore with one mooring ring. **You can cast from the jetty** (§25.4.2). A **test buoy** is moored at (6, −2): 4.5 m from the jetty head, 27° from up-screen (inside §24.5's ±50° cast rule), clear of the glide and 4.9 m from Murk's barge. |
| **Glide paths** | `setOutPath` (6, 2) → (11, 1) → (11, −9) → (6.75, −13) → (6.75, −18) → (6.75, −24); `homeInPath` the reverse, mooring at the jetty | east of Murk's barge (≥ 3.9 m from its pad), through the sill gap, across the arch line z −18 between the legs (validated) |
| **Murk's barge** | (4, −6.5), Customs Steps `path` (−4, −3) → (0, −5) | trade within 5 m; his chalk tally board stands on deck |
| **Keep-pond** (walk `hole`, depth 0.7) | centre (−16, 3.5), r 2.8 (r 4.0 at pond tier 3), stone rim at y 0.6 | rendered by its own pond pass (§25.4.6) |
| **Map Table** + **Journal lectern** | (−9, 2) and (−6.5, −2) | the table top is a 512² chart canvas on its own material |
| **Hearth** | (−18, −4.5) on the quay against the z −6 retaining wall; its flue runs back under the Lower Gallery to the chimney breast on the lower wall (x −19.5…−16.5) | the cove's one warm PointLight; respawn point after a snuff; dozing Wicks; the two Wanderers' frames hang on the chimney breast |
| **Trials Board** | (−23, −5.4) on the retaining wall | pinned challenge cards |
| **Gear Bench** | (−26, −5) on the retaining wall | rod rack, line spools, reel vice, creel and Live Well, outfit pegs: all show your owned tiers |
| **Shrine of Drowned Lanterns** | (−30, 0), a small roofless alcove at the quay's west end | an iron frame with **one drowned lantern per relic level** (≈ 60, counted from data; one InstancedMesh) |

Walking distances from the hearth (at §24's base foot speed, 0.84 × 6 = 5.0 m/s): Trials Board 5 m, Gear Bench 8 m, keep-pond 8 m, Map Table 11 m, Shrine 12.8 m, Murk 14 m, the raft 25 m, the lower wall ≈ 12 m, the upper wall ≈ 26 m. Every station is within ≈ 5 s. **Tap-to-walk** (hub only): tap a station's glyph to auto-walk there (BFS on the tiny walk grid). `validate-data` runs §24's rules on `COVE.walk`: reachability, enclosure, and nothing above 1 m within 14 m south of any walkway (the quay's south edge is 21 m from the cliff at x −30; the portrait `cove` camera, ≈ 11.7 m behind the Wick, stays ≥ 9 m inside the ring).

#### 25.4.2 Stations, interactions and the screens they open

| station | interaction (one contextual pill, ≥ 56 px; E on desktop) | opens / does |
|---|---|---|
| **Map Table** | *Plan* | **Set Out** screen (replaces New Descent: First Outing card, then lake, Wick, night mode, tray, forecast, rumour, tackle rating). The chart of the selected lake shows discovered places, residents, Marked Fish, rumour "?" marks and your best fish per place. |
| **Raft** | *Board* / *Cast off* | with a plan from the Map Table (refused without one): board, then glide out under the arch past the chosen Waystone. "Set Out now" on the card auto-walks, boards and glides (≈ 6 s). |
| **Jetty** | cast (as in any lake) | **cove fishing**: one cove-only species, the **Quayling** (Small–Keeper only, a Journal entry, Memories only for its first catch, never sold), so the first cast and the first measuring moment happen at ≈ 0:20. Cast at the **test buoy** for a practice fight (a Reedjaw at z 1.4 that cannot escape, capped at 20 s) that shows your fitted tackle's tension band, drag preset and shock (no rewards). |
| **Murk's barge** | *Trade* | the existing **Shop** screen, minus the Gear tab: Sell · Bait · Supplies · **Murk's Ledger** (3 persistent requests) · Rumours · Cosmetics (post-game). |
| **Gear Bench** | *Tackle* | **Tackle** screen (built from the Shop's Gear tab): buy and fit Rod / Line / Reel / Creel tiers and the four outfit items, lures, proof-catch status, tackle rating per lake, drag preset (Reel T2+). |
| **Shrine** | *Shrine* | the existing **Shrine** screen (relics). The 3D lanterns mirror relic levels. |
| **Journal lectern** | *Journal* | the existing **Journal** (also on the HUD everywhere): field guide, size rulers, class seals, best setups, Elder Log, places, mount book. |
| **Trials Board** | *Trials* | the existing **Challenges** screen with tabs Fishing / Paths / The Measure / Gloom. |
| **The walls** | *Look* within 4 m of a wing (one station per wing on its gallery) | `wall` camera. Tap a frame (`world.pickFrame`, only in this camera): plaque (species, cm, kg, class, place, expedition, day, Wick; Elders show their name), *Swap* (another mounted fish of that species from the mount book) or *Empty*. |
| **Keep-pond** | walk to the rim | `pond` camera. Tap a fish (`actors.pond.pick`; a tap on the pond never starts a cast): name card, *Release to the cove* (frees a slot; the record stays). |
| **Hearth** | *Rest* | Settings, save, swap to a dozing Wick (the same as choosing at the Map Table). |
| **Pause menu** | — | at home: quick links to every station screen (accessibility and phone fast path), *Set Out*, *Title*. In a lake: Journal, Challenges, Settings and *Title* only (tackle and outfit are fitted only at home). |

The **title screen** is now only the boot overlay ("Begin" / "Continue" / Settings) over a slow orbit of the cove. *Continue* resumes a saved expedition at its saved position, or drops you at the hearth.

#### 25.4.3 The Long Wall: one framed slot per species

Each of the four wings holds **one frame per non-legendary species of its lake** (11 / 11 / 12 / 12; the two Wanderers hang on the chimney breast, sized from their largest reach: the Pilgrim Salmon's Pallid 206 cm; 48 frames in all). Every frame is a **painted ruler** for its species: width = 1.1 × the species' "said to reach" length, cm ticks, the Prize / Trophy / Elder bands in ink wash and the Old Ledger mark, with a Wick silhouette at true height (0.85 m) painted inside the frame, or beside it on the wall when the frame is shorter. **Mount view and height** (`COVE.frameHeight`, `data.frameFor`): side profile for most shapes (height = body-depth ratio × reach + 0.2 m, at least 0.45 m); **rays dorsal-up** (ratio 0.56: the Shroud Ray's frame is 1.33 m tall); **jellies hang bell-up** (height 1.1 × reach + 0.15, width 0.6 × reach + 0.2, at least 0.66 m). Wings pack in 2D: three rows whose heights plus two 0.15 m gaps fit the 3.6 m band. Until you name the species the frame shows a "?" ink silhouette; once named, its silhouette and name; once you bring one home, **your fish at true size** against the ruler. The frame's seal shows the best class mounted: an ink stamp (Prize), oxblood wax (Trophy), black wax with a ribbon (Elder), plus a gold thread for an **Ancient** (z ≥ 3.2).

| frame | used for species whose "said to reach" is | size | count |
|---|---|---|---|
| **specimen board** | ≤ 0.6 m | 1.2 × 0.6 m, up to 4 species of one lake | 1 per lake (+1 Wanderer) |
| **plaque** | 0.6–1.4 m | 0.7–1.5 m wide | 2–4 per lake |
| **arch** | 1.4–2.4 m | 1.5–2.6 m wide | 4–6 per lake |
| **great arch** | > 2.4 m | 3.3–4.1 m wide (Gilt-Eyed Eel, Wax-Bearer, Candlewake Sturgeon) | Pallid only |

Packing check (largest lowest): Mossmere rows 10.28 / 4.56 m and Sporewood 10.18 / 8.05 m in their 10.5 m wings; Glasswater 11.81 / 8.81 m and the Pallid 11.98 / 10.96 / 3.92 m in 12 m (the widest row is the Pallid's three great arches); the tallest stack is the Pallid's, 0.79 / 1.33 / 1.10 m of rows plus gaps = 3.52 of 3.6 m. `validate-data` packs every wing from data in 2D. In hour 1 the specimen board and a plaque fill first, so the first Homecoming shows a small fish on a small frame, not a speck in an empty arch.

#### 25.4.4 How the Landing grows (visible, tied to progress, never bought except the pond)

| trigger | what changes in the cove |
|---|---|
| **start** | One lit hearth and two bollard lanterns. The Mossmere Waystone glows rust and moon-silver; the other three are dark. The **Mossmere wing** shows 11 "?" frames; the Sporewood wing is under lashed sailcloth; the upper stair is silted shut. The keep-pond is silted and dark. The Map Table shows only the Mossmere. The rod rack holds the Willow Switch. |
| **each species named** | its frame inks in the species' silhouette and name |
| **each fish hung** | it appears at true size against its ruler, with a small candle beneath it (instanced emissive), so the wall literally glows brighter as it fills; the seal upgrades with class; Elders get a hand-lettered name card |
| **a wing completed** (every species of that lake mounted at Prize or better) | the wing's lintel lights in the lake's colour; the lake's Journal perk activates (same rule as today's perks) |
| **first live Prize+ brought home** | the Wick pulls the silt-gate (a 3 s beat): the pond clears and its floor lamp lights. Pond tier 1 holds **3** fish. |
| **pond tiers** (the only Landing purchases) | Tier 2: **5** fish, 300 Shells, needs 15 species named; stone steps, a second floor lamp. Tier 3: **6** fish and r 4.0, 1,200 Shells, needs the Glasswater Waystone; a painted drowned-mosaic floor. Pond fish are capped at **1.4 m** (bigger fish go to the wall). |
| **each Waystone lit** | the stone glows its lake's colour (Mossmere rust #b0603e with moon-silver #a9b9f0, amber #ffb46a, sapphire #5cbcff, ember-gold #e8c66a); one more bollard lantern; a keepsake from that lake (a rust buoy-bell, a potted amber glowcap, a singing crystal on the Map Table, 30 candle-rafts drifting in the cove); and **that lake's wing opens** (Sporewood: the sailcloth drops; Glasswater: the upper stair is dug out and the Upper Gallery opens; Pallid: its sailcloth drops) |
| **each legendary brought home** | it hangs under the sea-gate arch (the Lantern-Swallower along the lintel). Rematch landings update its weight plaque. |
| **relic levels** | one drowned lantern relights per relic level |
| **tackle and outfit tiers** | the rod rack, line spools, reel and creel switch to the owned tier's model (the rod geometry from `actors-wick`, retinted and rescaled); boots and chimney glass hang on pegs; the Long Oars appear on the moored raft |
| **Wicks unlocked** | they doze around the hearth as ink silhouettes (one merged static mesh) |
| **Old Ledger records beaten** | your name is chalked over the old figures on Murk's tally board |
| **places discovered / mastered** | the Map Table's chart inks vignettes and stars |
| **Wardens silenced** (combat modes) | a keepsake for each on the hearth mantel (cosmetic only) |
| **the Lantern-Swallower landed** | the ember from its belly: a warm shaft opens through the cove ceiling (the game's one warm daylight). Every lamp burns gold, and the title card changes. |

About **150 visible changes over 25–40 hours** (48 frames that fill and upgrade, ≈ 60 lanterns, 4 legends, 4 wings opening, keepsakes, pond tiers). The home keeps growing until the collection is done.

#### 25.4.5 Look, inside the less-green palette

**"Lamplit slate, hearth amber, oxblood wax."** Slate-ink water and stone, bone-white ink trim, umber wood, rust iron. The hearth's amber (#ffb347) is the one warm light, the same rule as the lakes. Oxblood (#8a3a3a) is the accent: wax seals, Murk's awning, the raft pennant. The only saturated colours are the lit Waystones and completed wing lintels, which are earned. Green and teal: **only** verdigris on Murk's hand bell (≤ 2% chromatic weight, checked by the hue report on a Landing screenshot **that includes Murk's barge**).

| `COVE.palette` key | value | | `COVE.grade` | value |
|---|---|---|---|---|
| fog / fogDensity | #1d2230 / 0.014 | | exposure | 1.0 |
| water / waterDeep | #1a1f2c / #06080d | | bloom str / radius / thr | 0.9 / 0.6 / 0.7 |
| foam | #d8dce6 | | tint × amount | #3a3048 × 0.14 (ink-violet) |
| glow (hearth) | #ffb347 | | vignette | 0.42 |
| accent (oxblood) | #8a3a3a | | saturation | 0.82 |
| ambient / ink / far | #404659 / #04050a / #6d7894 | | grain | 0.05 |
| light (crack light) / lamp | #e2d6c4 / #ffd8a0 | | | |

**Old Murk is recoloured (A10, P1):** skin #4d5a3f → grey-umber #5a5444; moss #5f7d36 → pale lichen flecks #b8b0a0; lichen #b9c79a → #c8c0b0; lamp glow, halo and PointLight #8fd47a → warm white #ffe2b0; the tip "Sail to his green lamp" becomes "Sail to his lantern". The palette merge already moved his skin, moss and lichen off green (today: skin 0x575047, moss 0x7a5838, lichen 0xc8bca2), so A10's remaining work is mainly the lamp (today 0xa6d4a0, sage); the targets above are binding. This retires "Murk's sage lamp" as the game's deliberate green trace (§19, CONTRACT §9); the only green left at home is the bell's verdigris.

**Mood.** No day/night clock at the Landing: a fixed "lamplit hush" grade. After a snuff it opens in a grey-dawn grade for the summary, then eases back.

**Lights (≤ 4 PointLights, unchanged budget):** the Wick's lantern, Murk's lamp, the hearth (world accent 1), and a Waystone light (world accent 2, coloured like the lake selected at the Map Table). Bollard lanterns, frame candles, shrine lanterns and pond lamps are emissive plus `water.setLights` streaks (≤ 6).

**Cameras (render `MODES`, numbers in `BALANCE.cameras`, in render's own convention).** render orbits the focus (the Wick's feet unless stated) at `elev` and `dist`, and looks at focus + `aim` along the view + `aimY` up, so the pitch is atan((dist·sin elev − aimY) / (dist·cos elev + aim)), not `elev`. Every preset carries elev / dist / aim / aimY / fov / ahead / stiff, and a `portrait {elev, dist, fov}` that replaces v1's widening in the cove (as §24.5 does on foot):

| mode | elev · dist · aim · aimY · fov · ahead · stiff | portrait | focus and trigger |
|---|---|---|---|
| `cove` | 26° · 13.5 · 0 · 2.4 · 50 · 0.2 · 2.6 | 33° · 14 · 60 | the Wick (hub walk) |
| `gate` | 12° · 11 · 0 · 5 · 50 · 0 · 2.0 | 16° · 13 · 62 | only during the Set Out / Homecoming glides, or while the Wick stands at the look spot on the jetty root (−3.5, 2) with no line out and the fishing state idle: never while fishing or boarding |
| `wall` | 14° · 6 · 0 · 2.1 · 46 · 0 · 2.4 | 18° · 7.5 · 60 | the nearest wing's centre on its gallery floor; aimY = that wing's middle frame band |
| `hang` | 10° · clamp(1.2 + 1.6·L, 1.6, 7) · 0 · 0 · 44 · 0 · 2.4 | — | the frame's centre on the wall face; the Wick is placed at the wing's foot; then a 1.2 s pull back to `wall` |
| `pond` | 55° · 6 · 0 · 0 · 44 · 0 · 2.4 | 62° · 7 · 58 | the pond's centre at water level |
| `setout` | 10° · 14 · 0 · 6 · 50 · 0 · 2.0 | — | the raft during the glide, looking up at the arch |
| `title` | a ping-pong arc, radius 24 m, 9 m up, around (−4, −6), looking at (−4, 4.5, −12), yaw −55°…+55° about north, 90 s; fov 42 | — | the boot overlay (the cove is authored for a north-looking camera, so the arc never swings round to look south) |

*Visibility check (render's model):* `cove` puts the camera 5.9 m above the Wick's feet (6.5 m above the quay's water) and 12.1 m south, pitched ≈ 16° down, so the top of the frame is ≈ 9° **above** the horizontal; at the arch (≈ 42 m from the camera) the frame reaches y ≈ 13 m: the whole arch (crown 9.5), the stones, the hung legends (y 3.5–7.5) and the lower wall's frames are on screen at 960×540. In portrait (33°, 14 m, fov 60) the top of the frame is ≈ 6° above the horizontal and still clears the crown. The upper wall reads from the Lower Gallery; the full arch also reads in every glide (`gate`). A phone-portrait screenshot is part of the P3 gate (T4).

#### 25.4.6 How it is built cheaply (reuse table)

| need | reuse / build |
|---|---|
| the cove itself | `world.setZone('cove')` resolves the `COVE` export in data.js: a zone's shape (arena, palette, grade, walk layout) that **is not in `ZONES`**. Every `zone:change` listener branches on `hub: true` (CONTRACT §13.3) so nothing falls back to `ZONES[0]`; world-layout and world-art take theme `cove` from `COVE.theme` (today's `themeOf` would clamp index −1 to the Mossmere and build its islands, hero landmarks, lamp-posts, lily pads and dock buoys here). world-art's builders cover cliffs, parallax rings (3; 2 on low), stalactites, shafts, mist, particles and foam rings. The `shoreNotch` (CONTRACT §13.8 schema: a, w, depth, len) is new world-layout support that ships with the cove (P3). |
| quay, galleries, ramp, stair | **the cove's own extrusion builder** (world-cove.js): rect boxes, path ribbons and ramp wedges straight from `COVE.walk` shapes (land meshes extend down to y −2), merged into 2 meshes. It needs neither §24's grid-to-land mesher nor its foot controller; `walkGridFor` (already in data) gives collision and tap-to-walk. The silted stair is built in both states and toggled (with a re-bake of the walk grid on `shortcut:open`). |
| the two walls | one procedural merged geometry (wall slabs, buttresses, the 3 m chimney breast with its stack), toon + outline: 2 calls. Frames: one merged mesh using a 1024² canvas atlas of painted rulers (silhouette, ticks, bands, seal): 1 call |
| sea-gate arch | **new** geometry from world-art's `taperTube` helper and the ink material (the Mossmere hero arch is a far, broken silhouette with towers 26 m apart and no crown, so it is not reused): 2 calls |
| Waystones | **new** small builder: 4 stones using the gate stones' geometry recipe, glyphs as vertex colours, and a per-stone emissive attribute driven by a 4-float uniform for lit state and colour (`buildGate` merges all glyphs into one zone-coloured material, so it cannot do per-stone colours): 2 calls |
| lamps, frame candles, shrine lanterns | dock lantern-post geometry and the raft lantern as InstancedMeshes: 3 calls |
| hearth | the raft brazier mesh at 2×, a flame sprite and the existing ember particles: 3 calls |
| bench, table, lectern, Trials Board, Murk's chalk board | models-kit box/plank builders, merged: 2 calls. The Map Table chart is its own material (512² canvas): +1 call |
| keep-pond | a §24 `hole` plus a stone torus rim, and **the pond pass** (Wa5): the global water shader discards fragments inside the pond disc (one `vec4 uPondHole`), **compiled only under a `POND_HOLE` define** set on `zone:change {hub: true}` and removed on leaving (a `discard` merely present in the lake's big opaque draw costs early-Z on tile-based phone GPUs in every lake), a floor-painting disc sits at y −0.7 (1 call), the pond fish swim between (normal opaque meshes, depth-tested), and a small transparent pond-surface mesh with ripples, fresnel reflection and a depth tint draws after them (1 call, no depth write). Without this the opaque lake plane (renderOrder −10, depth-writing at y 0) would hide the fish. |
| pond fish | `models.createFish(species, {z})` at true length (≤ 1.4 m), swum by **actors** on looping paths inside the hole (uSwim 0.6). Up to 6 (2 live on low; the rest rest on the floor, baked into the mount batch, visible through the pond pass). |
| mounted fish | **`models.buildMountBatch(entries)`** (new): every mounted fish and legend is built from its stored {species, z}, frozen in a mounting pose and merged by material: body skins packed into one 1024² atlas (skins are 256×128, 32 slots; a second atlas page past 32), an emissive atlas for skins that glow, fins on the shared fin atlas with colour in vertex colours, one translucent material for jelly and ghost bodies, bones and their outline, eyes, one outline (per-fish thickness in a vertex attribute), and lure glows as one instanced quad mesh. **≈ 9–12 draw calls whatever the count**, as a **near / far pair per wall**: the wing in view at full detail (≤ 12 fish, ≈ 2.3k triangles each with the outline) and one LOD batch (≤ 600 triangles per fish) for everything else, swapped by wing distance without a rebuild (≤ 80k triangles in view; 52 full-detail mounts would be ≈ 150k, today's whole frame). Rebuilt only on Homecoming, Swap, `pond:add` and `pond:release`. Mount view per frame: side profile, rays dorsal-up, jellies hanging. |
| Murk at home | `actors.merchant.arrive(dock, yaw, {instant:true})` plus a new `merchant.freeze()` that merges his static pack and barge (≈ 26 → ≈ 8 calls). Freeze also applies in the lakes whenever he is moored and the Wick is > 12 m away. |
| raft at the mooring | `actors.raft.freeze()` (≈ 4 calls) while the Wick is on foot |
| the Wick on foot | §24's foot controller, Lantern Crook, walk camera and occlusion cone, **scheduled in P3 as S0 / R0** (§25.14.4) if §24's own build has not landed them. The Landing is the simplest possible consumer (flat, three levels, one ramp, one stair, one hole, no drops or bridges), so it is the ideal first integration target for §24's foot core. |
| dozing Wicks | `setCharacter` looks rendered once, merged into one static silhouette mesh (2 calls) |
| survival, combat | idle in the hub (no phase clock, no drains, no swarm) |

#### 25.4.7 Phone budget (measured by `tools/perf.mjs` scenario `cove`)

| item | high | low |
|---|---|---|
| post-processing | 15 | 10 |
| water + pond pass (floor disc, pond surface) | 4 | 4 |
| cliffs and parallax rings | 5 | 4 |
| stalactites, shafts | 3 | 2 |
| quay, galleries, ramp, stair | 2 | 2 |
| walls + frame atlas | 3 | 3 |
| sea-gate arch + Waystones | 4 | 4 |
| lamps, frame candles, shrine lanterns | 3 | 3 |
| hearth (brazier, flame, embers) | 3 | 2 |
| bench, table, lectern, boards + Map Table chart | 3 | 3 |
| lake keepsakes (bell, glowcap, crystal, candle-rafts) | 4 | 3 |
| mantel keepsakes | 1 | 1 |
| dozing Wicks | 2 | 2 |
| particles (mist, motes, foam rings) | 3 | 2 |
| Wick on foot + lantern pool | 15 | 15 |
| moored raft (frozen) | 4 | 4 |
| Murk and barge (frozen) | 8 | 8 |
| mount batch (near + far per wall, legends) | 12 | 9 |
| pond fish (6 live high; 2 live low) | 36 when in view | 12 |
| **total (worst case: pond, lower wall and arch in one view)** | **≈ 130 (budget 140)** | **≈ 93 (budget 100)** |
| PointLights | 4 | 4 |
| zone build time | ≤ 150 ms desktop / ≤ 600 ms phone, hidden by the zone flash | |

**Fallback: Landing v0** (only if the foot controller, S0, slips; world then reports the cove's mode as `'raft'`, and `'foot'` once it is in the build). Honestly stated: the stations stand on the quay, 12–22 m from the water, out of the raft's 5 m reach, so v0 adds **pill posts** (bollard lanterns on the quay's south parapet, `COVE.v0.posts`: Shrine, Gear Bench, Trials, Hearth, Keep-pond, Long Wall, Map Table, Journal, ≥ 3 m apart, each within 5 m of raft-reachable water: validated). Murk, the raft mooring and the jetty are already at the water. The walls and the pond are shown by **flying** the `wall` / `pond` camera from their posts (the camera does not follow the Wick there). The quay, galleries and walls are drawn by the cove's own extrusion builder, so v0 needs nothing from §24; the layout, the land builder and every asset are the full Landing's, and the posts hide when the foot core lands.

### 25.5 Combat's place: night modes

#### 25.5.1 Three night modes, chosen per expedition at the Map Table (from the 2nd expedition)

The phase stays `gloomtide` internally, so gloom-time species, music and fishing rules keep working. The UI calls a quiet night a **Stillnight**. The camera does **not** follow the phase: render's night overview (elev 53°, 24 m) blends in only while a swarm is active (`combat.swarmActive`: a swarm window or a Gloomtide calm raid). Stillnights, Lantern's quiet nights and tail, and lamp-watches keep the sail and fish framings with the night grade, so true-scale fish and glow trails stay readable at the big-fish hour. Modes cannot be switched mid-expedition (otherwise players would flip to Still while carrying a trophy). The First Outing is always all-still. Data: `BALANCE.nightModes`.

| | **Still** | **Lantern** (default) | **Gloomtide** (classic) |
|---|---|---|---|
| swarm nights | none | even nights (2, 4, 6…); Murk forecasts it at dawn: "The Gloom stirs tonight." | every night |
| swarm window | 0 | **night k 0.05 → 0.50** (40.5 s). The last 45 s of every night are always quiet: Night Rise and glow trails, uninterrupted. | the whole night (90 s + 6 s per day, max 120), as now |
| intensity vs `difficultyFor()` | — | spawnRate × 0.55, hpMult × 0.8, maxAlive × 0.6, elite interval × 2 (first elite at Heat ≥ 3), 1 formation per swarm | × 1.0 (§7) |
| Wardens | none | every 2nd swarm night (nights 4, 8) at hp × 0.75; it withdraws when the window closes | nights 3, 6, 9, as now |
| what the swarm threatens | — | **your light and your unmarked fish, never a fight in progress**: fodder contact drains oil (not Embers); a creelsnatch takes one fish *not* marked for home and **never acts while a fish is hooked**; a hand slam costs Embers (and knockback only when no fish is hooked) but **never snaps the line**; Embers are lost only to telegraphed hits | Embers first (today's death model), then oil and the creel (never a fish marked for home); slams snap non-legendary lines, as now |
| Embers reach 0 | — | **Scorched**, never Snuffed: the swarm withdraws for the night, the lantern loses 30 oil, you keep a forced lamp-watch until dawn (anchored within 10 m of where you stand, or of where a fight in progress ends; fishing allowed; no Cinders), Embers mend at dawn | Snuffed, as now |
| night fishing | the full 90 s, with Night Rise | 4.5 s before the window, inside it (spawn × 0.8 while hooked, as now) and 45 s after | inside the swarm, as now |
| calm raids (day combat) | off | off | on, as now |
| Embers lost per swarm night (on-curve) | — | 0–1 | §18.4 table |
| snuffed per expedition (target) | ≤ 3% home by day 3; 6–10% past day 4 | Still + 2 points | 25–55% (first 5 h), 20–35% later |
| fight share of play | 0% | ≈ 6% (target 4–7%) | ≈ 29% (target 28–32%) |

#### 25.5.2 Lamp-watch: the in-world skip

(Renamed from "vigil" so it does not clash with §24's *vigil grounds*, which are where you fight.) At the moment dusk ends, if the Wick is **inside one of the lake's two watch-lamps' pools**, that night's swarm does not come. The Mossmere's watch-lamps are the buoy-lamps of the south-east and west docks, at the positions world-layout draws them (dock + buoy offset: (19.8, 37.8) and (−46.7, 10.1); ids `se_buoy`, `w_buoy` on `ZONES[mossmere].arena.watchLamps`, pool r 6); in the other lakes two sister-candles per lake are flagged `watch` (▲, §24.8: Sporewood `house_lamp` and `crown_lamp`, Glasswater `harbour_lamp` and `hymnal_lamp`, the Pallid Deep `plaza_lamp` and `pier_lamp`), and a watch candle's pool exists only while it is lit (r 6). Builds without §24 use two dock buoy-lamps per lake from `RAFT_FALLBACK_V3` (validated: 2 per lake in every phase and build). You may fish only within 10 m of the lamp (Night Rise still applies), and you earn no Cinders. **Leaving the pool by more than 10 m during the night cancels the watch:** the swarm window starts at the current night k (a forced Scorched watch is anchored and cannot be left). The cost is the location: the night's giants are where they are, and you are pinned to two spots per lake; **no `holdsGiants` water lies within 10 m of a watch lamp** (validated; the brief's Sporewood `harp_lamp` stood 3 m from the Gill Harp and was replaced by the Greenhouse lamp). **Lantern mode only**; Gloomtide ignores lamp-watch. Every other sister-candle keeps §24's rules exactly (shelter from darkness, slower fodder, never a safe night). The HUD shows "Nearest watch-lamp 34 m · ≈ 7 s" from Murk's 85% bell (§24.8's dusk line, reused).

#### 25.5.3 The hard rule

> **No species, place, size class, favour (μ) or fishing tool exists only with combat on.**

- **Cut:** Gloom-fed (a best-of-2 weight roll) and Ashwick's best-of-3.
- **Levels are normalised** across modes (§25.5.4), Angler-tagged offers are capped at the Still rate in combat modes, and Kindling Draft levels may only take non-Angler offers (§25.3.1).
- **Combat pays in combat-shaped things only:** Cinders and levels, +4 tally Memories per Lantern swarm night endured (Gloomtide: today's `nightsSurvived × (3 + zoneIndex)`), Wardens (Heartwax, Warden's Gift, Shells 40 / 80 / 140 / 220, Gloom-shelf relic reveals), Gloom-tab challenges (combat boons, Gloom relics, cosmetics: cloak dyes, raft pennants, Warden keepsakes on the Landing's mantel). The tally difference keeps Still's Memories/h within 15% of Lantern's (§25.10.4).
- **A fight in progress is untouchable in Still and Lantern:** while a fish is hooked (reeling or landing) no knockback, slam knock or Bulwark shove moves the Wick or the raft (so the line is never pulled past `castDist + 4` by combat), a zap tap never releases the reel, and a Scorched lets the fight finish before the forced lamp-watch anchors. In every mode a fish marked for home is theft-proof.
- **Murk's Ledger** offers combat requests only in combat modes. In-lake bounty templates that need a swarm (`unscathed`, `disperse`, `no_flare`, `break_hand`, `warden`, §24's `lamp_vigil`) are offered only in combat modes.

#### 25.5.4 Levels and Boons in each mode

| | Still | Lantern | Gloomtide |
|---|---|---|---|
| XP sources | fish XP × 1.4 with **no zone factor**; discoveries +2 per new species, +4 per new place, +2 per class first (≤ +12 per day) | fish XP × 1.0 (zone factor kept), Cinders on swarm nights, the same discoveries | as now (Cinders, fish XP × 1), the same discoveries |
| level-ups per day of an expedition | ≈ 3 · 2 · 1 · 1 on days 1–4 (Mossmere: 5 fish ≈ 29 XP a day against `xpForLevel` 5, 7.9, 11.4, 15.5, 20.2 …) | ≈ 3 · 2.5 · 1.5 · 2 (swarm nights add Cinders) | today's cadence |
| when offered | banked: on the next measuring card or at the dawn bell | banked while fishing; immediate during a swarm | as Lantern |
| offer pool | the Angler pool only (`BALANCE.nightModes.still.pool: 'angler'`) | weapons join from the first swarm night; Angler-tagged offers capped at the Still rate | today's pool, same cap |
| Kindles | — | yes | yes |

**Angler pool** = Steady Reel, Hungry Waters, Lucky Knot, Gutsfire, Lantern on the Line, Gilded Hook, Swift Oars, Slow Burn, Brighter Wick, plus 6 new: **Long Cast** (castMax +1.5 per level), **Patient Line** (slack grace +0.2 s), **Feather Touch** (hook window +0.06), **Night Eyes** (glow trails visible 50% farther; night bite speed +10%), **Wanderer's Stride** (stride +0.3; foot oil burn −10%), **Quiet Hands** (the Clean Cast window widens from charge ≥ 0.92 to ≥ 0.88). No boon adds favour directly or opens a place.

#### 25.5.5 Wick quirks get a fishing half (all modes)

| Wick | unlock (either-path) | fishing half (new) | combat half (combat modes, unchanged) |
|---|---|---|---|
| The Wick | free | *Curious*: places reveal from 16 m (not 8); the first new species each day gives +1 reroll | first level-up of each night offers 4 cards |
| Taper | Steady Hands (land 25 fish) | *Angler's Ember*: fish give double XP (as now) | flare cooldown refund (as now) |
| Stub | Down the Sluice (light the Sporewood Waystone) | *Quick Feet*: stride +0.4; a cast within 5 s of stopping counts as Clean at charge ≥ 0.8 | Fanned Flame |
| Tallow | The Long Vigil: **spend 5 nights out in one expedition** (any mode) | *Slow Melt*: oil burn × 0.8 on foot | i-frames, Gutter-burst |
| Ashwick | Unwarded: **silence a Warden or land 3 night-only species at Prize or better** | *Burned Once*: the first surge of every fight is telegraphed 0.3 s longer | Cinder Heart |
| The Wayfarer (§24) | Every Still Place: master every place in the three lower lakes (21) | *Shore Sense*: on foot, signs show from 50% farther; the first sister-candle lit in each lake costs no oil (§24's First Flame) | §24's start boon (Undertow Crook) |

#### 25.5.6 Legend fights without a swarm

In Still and Lantern, the Glass Sovereign's night fight runs without spawns, and the Lantern-Swallower's *Grasping Dark* becomes **two telegraphed snags**: a hand silhouette rises under the water 1 s ahead, then a +0.2 tension spike; release through it as you would a surge. In Gloomtide both fights are unchanged.

#### 25.5.7 The day screen carries no combat UI

| element | Still | Lantern | Gloomtide |
|---|---|---|---|
| lantern-aura ring | never | hidden in calm and dawn; fades in through dusk on swarm nights only | hidden in calm and dawn except during calm raids; on from dusk |
| Embers arc | hidden | shown from dusk on swarm nights, or for 4 s after any hit | always |
| Flare button | hidden | shown from dusk on swarm nights | always |
| Burn button | shown only when oil < 25% (as *Relight*) | same, plus during swarms | always |
| satiety bar | replaced by a small **Well-fed** glyph | same | same |

#### 25.5.8 The default: Lantern from the 2nd expedition, under four conditions

1. **The First Outing is all still**, so a new player's first ≈ 16 minutes are pure fishing, places and the first Homecoming.
2. **Still is offered without stigma**: an equal card on Set Out with a one-line explanation, no fishing penalty, and Memories within 15%.
3. **Lamp-watch is an in-world skip** (§25.5.2).
4. **In Lantern, combat never costs a hooked fish or the expedition**: no line snaps, no theft while hooked, Scorched instead of Snuffed, and the last 45 s of every night are quiet.

If playtests show players opting out in droves, flip the default to Still (Q1). It is one data constant (`BALANCE.nightModes.default`).

### 25.6 Fishing craft

#### 25.6.1 Reading the water: six signs and the float's favour

The **feeding-spot mote columns are cut** (they turned reading the water into "sail to the pillar" and added teal pillars). In their place, one vocabulary of **six signs**, each with a fixed meaning. At most 6 are alive at once, built from pooled decals plus the existing ripple and wake arrays: no new uniform arrays, no lights.

| sign | looks and sounds like | tells you | cast rule | effect |
|---|---|---|---|---|
| **Rise ring** | rings every 4–9 s; **ring radius ∝ the fish's length**; a "plip" (small) or deep "gulp" (big) | a surface feeder, and its class from the ring size | land within 2.5 m, ≤ 3 s after a rise | wait × 0.5; that pre-rolled fish bites |
| **Boil** | a dark back turns the surface; ellipse size = class (Prize / Trophy / Elder); a low "glunk" | **one big fish** (a pre-rolled Prize+, or a place's resident) | within 3 m in the next 8 s | that fish bites with 60% chance |
| **Nervous water** | fry skitter out of a patch | a predator under a bait ball | at the patch edge | predators × 3, favour +0.3 |
| **Strike splash** | one heavy slap, heard off-screen and panned | a big runner or leaper just fed | within 4 m in the next 10 s | favour +0.6, predators × 3 |
| **Bubble trail** | strings of bubbles creeping along the bottom | a bottom feeder or sulker (P4: also leads to secrets) | at the head of the trail | bottom feeders × 2, favour +0.2 |
| **Glow trail** *(night only)* | a moving light under the surface; brightness ∝ size | a pre-rolled night fish | lead it by 1–3 m | that fish bites 70% |

- **Spawn:** 2–4 signs alive in calm (the same slots, counts and lifetimes as `BALANCE.spots`, renamed in use to signs), within castMax + 15 m of the Wick, favouring places (≥ 50% inside place water in the walking lakes).
- **Visible shadows** stay special: inside `sight` places, in Glasswater's clear water, and as residents surfacing. Blind casting while reading signs is the main mode; there is no approach shadow before every bite.
- **The Pallid Deep** keeps the Breathing Deep domes (§24) as its sign style. **Legend pools** keep the faint still ring and the edge marker; the tall golden column becomes a low gold glimmer.
- **Murk's Chum** (supply, replaces the Tide Chart): 30 Shells × supplyMult, 1 per visit. Your next cast creates a nervous-water sign for 30 s (`fishing.armChum()`). The in-lake bounty "Catch 3 fish from shimmering spots" becomes "Catch 3 fish cast inside a sign" (`signCatch`), and the quality score's feeding-spot bonus becomes "cast inside a live sign".
- **One owner draws them:** fishing-fx draws every sign and pre-rolled fish from a per-fish instance buffer and asks water only for ripples and wakes; `sign:spawn` is informational (audio, tips).

**The float's favour (U13, P1).** The size odds the player is meant to master are shown, not hidden. When the bobber settles, the float icon shows **0–5 ink notches** for the float's favour μ. The species is rolled at landing in code, so the float must not reveal it: its μ is the **species-independent terms** (place, hour incl. Far Water and Hush, signs, pressure, Clean Cast, a bait's or lure's base term) plus **each species-specific term** (depth lower third, family lures, Cut Strip, Match condition, today's rumour) taken as the **maximum over the bait's eligible pool** at that point, or for the pinned (or today's) rumour species when it is eligible there (`BALANCE.favour.float`). The roll uses the rolled species' full μ, and the card lists the terms that actually applied. Bands: (bands < 0.15 · 0.15–0.45 · 0.45–0.8 · 0.8–1.2 · 1.2–1.6 · ≥ 1.6). Long-press (or hover) lists the active favours by family in plain words: "*Place: Astir · Hour: Night Rise, Far Water · Match: today's rumour · Tackle: Ember Roe, deep band.*" When a place's pressure reaches −0.36 (three catches there today) the float shows a dimmed glyph and the line "*The water here has gone quiet.*" The **measuring card prints the favours that applied** to that fish, and each species' Journal field note stores **your best setup** (the favours present when you set its PB). `fishing.view.favour = {mu, notches, terms: [{family, id, value}]}`. The families and values are in §25.7.2.

#### 25.6.2 Casting (kept)

The ping-pong meter (charge = distance), the depth reticle, the Clean Cast (charge ≥ 0.92: wait × 0.85, rarity +0.05, favour +0.1) and §24's pool-scaled meter, aim assist and locks are all unchanged. Pointer-target scatter casting and count-down sink rigs are **cut**.

#### 25.6.3 Bait and lures

- **Baits** stay consumables (existing BAITS, attract lists and legend baits). One addition: **Cut Strip**. In the creel screen, turn any fish into 3 strips; predators: attract × 2, favour +0.3. This gives "catch small to catch big" without a new system. A bait's `weightBias` becomes favour of the same value (Ember Roe 0.35).
- **Lures** are permanent tackle. You equip a lure *or* a bait. A snap loses the lure, and a new one costs 25% of its price. Each species gets **one** `family` tag (insect / predator / bottom / glow), read only by lures.

| lure | depth | family attract | favour | price | sold from |
|---|---|---|---|---|---|
| Feather Fly | surface | insect × 2; rise-ring casts get wait × 0.5 | — | 40 | start |
| Glimmer Spoon (was an upgrade) | mid | predator × 2.5 | +0.2 on predators | 90 | start |
| Bone Jig | bottom | bottom × 2.5 | +0.2 on bottom feeders | 120 | start |
| Moth Popper | surface | night species × 2 | +0.2 at night | 260 | Sporewood lit |
| Lantern Lure | mid–deep | glow × 2.5 | +0.4 | 1,200 | Glasswater lit |

#### 25.6.4 The bite and the hook

| class | bite tell (bobber animation + sound, readable with sound off) |
|---|---|
| Small | quick **double pop** |
| Keeper | the classic plunge (as now) |
| Prize | a slow 0.4 s **drag-under** before the "!" |
| Trophy | the bobber **lies flat**, then slides away |
| Elder | a **dome of water bulges up** under the bobber first |

- **Let it pass:** if the bite window lapses with no tap, the cast's general bait is refunded (`progression.refundBait`: bait is spent at the cast) and the next cast in the same water (the same place, or within 6 m of the lapsed bobber) gets favour +0.15 (cap +0.3, reset on a hook or after 60 s). The bite tell becomes a decision without slowing ordinary play.
- **Window:** Prize+ fish hold the bait 10% longer. The perfect-hook rule (≤ 0.4 × window) is unchanged; the Rod's hook-window multiplier widens it.
- **Hook-hold pips** (Prize+ only, shown on the hook icon): a perfect hook gives 3, a normal hook 2, and Rod T3+ adds +1. A pip is lost each time tension drops below 0.15 during a surge or leap. At 0 the hook is thrown. The existing slack escape stays. The pips make "almost had it" visible and fair.
- Nibbles, gold double-dip tells, feints and the spook rule are unchanged.

#### 25.6.5 The fight

**Size scales the species before `createReel`** (the reel core is unchanged). With g = e^(0.2·z):

| class (z used in the sim) | g | power × g^1.6 (sinkers, sulkers g^1.15) | stamina | surge time × √g | sweet band × g^−0.5 | erratic + 0.08·z | surge interval × g^−0.6 |
|---|---|---|---|---|---|---|---|
| Small (−0.8) | 0.85 | 0.77 | × g = 0.85 | 0.92 | 1.08 | 0 | 1.10 |
| Keeper (0.4) | 1.08 | 1.14 | 1.08 | 1.04 | 0.96 | 0.03 | 0.95 |
| Prize (1.4) | 1.32 | 1.57 | 1.32 | 1.15 | 0.87 | 0.11 | 0.85 |
| Trophy (2.2) | 1.55 | 2.02 | 1.55 | 1.25 | 0.80 | 0.18 | 0.77 |
| **Elder** (2.95) | 1.80 | **× 1.08 × g^(1.6 + age·(z − 2.65))** | **× g^1.3** = 2.15 | 1.34 | 0.75 | 0.24 | 0.70 |
| **Ancient** (3.35) | 1.95 | (same rule) | × g^1.3 = 2.39 | 1.40 | 0.72 | 0.27 | 0.67 |

**Above the Elder cut, fights get steeper and every Elder has one old trick.**
- *Elder age* is per lake: Mossmere 1.2 · Sporewood 0.9 · Glasswater 0.7 · Pallid Deep 0.35. Old water keeps its oldest fish hard: an early lake's Elders need late tackle (Q3), and a deep lake's Elders are already hard by species.
- *Fatigue clock* (all non-legendaries): after 60 s, power × max(0.6, 1 − 0.01·(t − 60)). For Elders the floor is **0.8**, so an Elder never simply gives up.
- *Old trick* (every Elder, once, when progress first passes 55%): a short-warning surge (warning × 0.6, power × 1.3) whose kind the player must read, followed 0.9 s later by a second surge. Each species' style dresses it: a **double run** (runners, darters), a **sulk under the place's feature** (sinkers, sulkers; at the Gatehouse Door and the Chain Garden a foul window), a **second leap after the reveal** (leapers), a **head-down bore** (thrashers, steady).

**Reel-model edits (fishing-reel.js):** global stamina × 1.4 (fights were 5–10 s, too short to have an arc; legends too); easing uses load, `target = −0.55 / (0.8 + 0.2·pw/LS)`, so a better line really lets you ease a big fish; the fatigue clock above; and **drag on every fight from T0**, which every land rate below depends on: while tension T is above the fitted drag point (`dragAt`: *Set* 0.80; Light / Set / Firm from Reel T2) and rising, the reel absorbs dT × `absorb` (Reel tier: .30 / .45 / .58 / .68 / .76) and progress slips 0.08 per unit absorbed. **Spooled** = progress back to 0 with a cumulative slip above 0.5, any species (the runner only makes it likelier). The Rod's **shock** multiplies the hold force by (1 − shock); **pips** = 3 / 2 + the Rod's pip bonus. The old trick's kind is a 50/50 pull / leap read, dressed by the species' style. **Stats:** in P3 the fitted tiers *replace* the STATS base (`data.tackleStats`: castMax, hook window, slack grace — T0 1.4 s, as simulated — line strength, reel speed, sweet band, creel) and add shock, pips, absorb and the drag point; Wick, relics, Boons and outfit then add. In P1–P2 runs and inside The Long Descent gear is today's per-run UPGRADES: those stats stay as today, and shock, pips, absorb, the drag point and the tackle rating come from an **effective tier per slot** (`data.upgradeTiers`: floor(4 × levels bought ÷ the slot's total levels), so F2, F4 and U4 are testable before P3). Fight lengths on full tackle (sim, skilled): Trophies 20–40 s, Elders ≈ 1–2 min, Ancients ≈ 3 min, the longest non-legend fights in the game (T1 targets: Elder median ≤ 120 s; Ancient ≤ 180 s, checked as ≤ 180 × 1.15 = 207 s with < 2% time-outs for **every** species that can be an Elder; Mirror Pike, Gilt-Eyed Eel, Vesper Gar, the Unreflected, the Rainglass Darter and the Clapper sit at 195–205 s; the brief's own gaps are listed in `BALANCE.size.reel.targets.knownGaps`). **Leap reveal:** the first breach of a Prize+ fish plays 0.25 s at timescale 0.35 with a rim-light flash; the size of what you have hooked is revealed there.

**Fight styles, one new verb per lake.** Hold-to-reel stays the only core input. Nothing is added mid-fight in the Mossmere.

| lake | styles in play | what is new | phase |
|---|---|---|---|
| The Mossmere | steady, darter, sinker, thrasher, leaper (all existing) | size scaling, bite tells, pips, old tricks; the **fouled line** at the Gatehouse Door (§24's existing `foul` rule: a clank 0.3 s before a +0.15 tension spike; release through it as you would a surge) | P1–P2 |
| Sporewood Pools | + **runner** (Velvet Ray, Pilgrim Salmon) | *let it run*: a 0.8 s line-hiss tell, then a run of surgeTime × 2√g. Holding drives T × 1.8 into drag slip; releasing loses progress at 0.05·pw/LS per s; after the run, 2 s of × 1.5 progress ("it turns"). Simulated in `tools/sim/reel-v3.mjs` first. | **P3, never cut** |
| Glasswater Vault | + **sulker** (Blind Scrivener, The Footnote) | *pump*: every 10–14 s a 4–6 s × √g sulk (the line goes still, a low thud, a ◆ glyph). Holding gains nothing and T creeps +0.3·pw/LS; release ≥ 0.3 s then hold, and each lift gives +0.04·RS/√g progress. | P4 |
| The Pallid Deep | heavy runners (Candlewake Sturgeon), heavy sulkers (Lampwarden, Unpaid Fare), fouled lines at the Chain Garden, toll cues | combinations, not new inputs | P4 |

**Drag** is a tackle setting, never a dial. Reel T0–T1 is fixed at *Set*. From T2, choose **Light / Set / Firm** (dragAt 0.70 / 0.80 / 0.90) at the bench, or tap the reel icon before casting (one tap cycles). Light makes runners safe but slow; Firm is fast but risky.

**Cut:** the mid-fight drag dial, rod sweep on the joystick, divers and snags (they need world tags and a simulated fish position), the cut-line button (cutting stays "hold movement 0.6 s"), the net ring QTE, the thrasher head-shake.

#### 25.6.6 Gear: tackle tiers and outfit (persistent, bought and fitted at the Gear Bench)

Tackle is sold **per slot**, so a tackle or outfit purchase lands every ≈ 15–90 minutes (§25.10.2). Tiers are kept forever. **T2–T4 need a proof catch.** Gear is earned by fishing, not grinding. `reel-v3-sim.mjs` simulates any mixed loadout; the numbers below are matched sets unless stated. Data: `TACKLE`, `OUTFIT`, `LURES`.

| tier | **Rod** (castMax · hook window · slack grace · **shock** · pips) | **Line** (strength) | **Reel** (reelSpeed · sweet band · drag · absorb) | **Creel** (slots · Live Well slots · nights kept) | price per slot (Rod / Line / Reel · Creel) | proof catch | on sale |
|---|---|---|---|---|---|---|---|
| T0 | Willow Switch 16 · ×1.00 · 1.4 s · 0 · — | Twine 1.00 | Wooden Winch 1.00 · .16 · fixed Set · .30 | Wicker 4 · 1 · 3 | start | — | — |
| T1 | Ashwood 17.5 · ×1.04 · 1.6 s · .08 · — | Braided Gut 1.15 | Brass Spool 1.12 · .17 · fixed Set · .45 | Lidded 5 · 1 · 3 | 120 · 70 | — | start |
| T2 | Whalebone 19 · ×1.08 · 1.8 s · .15 · — | Waxed Silk 1.32 | Clockwork 1.25 · .18 · presets · .58 | Double 6 · 2 · 4 | 450 · 270 | any **Mossmere Prize** | start |
| T3 | Glassreed 20.5 · ×1.12 · 2.0 s · .22 · +1 pip | **Glass-Gut** 1.52 (invisible in clear water) | Whisper Drag 1.40 · .19 · presets · .68 | Wellbox 7 · 2 · 4 | 1,400 · 840 | a **Sporewood Trophy** or a **Glasswater Prize** | Sporewood lit |
| T4 | Lantern-Spine 22 · ×1.16 · 2.2 s · .30 · +1 pip | Silverthread 1.75 (+0.2 s slack) | Tidewheel 1.55 · .20 · presets · .76 | Ferry Hamper 8 · 3 · 5 | 3,200 · 1,920 | a **Glasswater Trophy** | Glasswater lit |

*Shock* is the Rod's surge absorb (`surgeHoldMult × (1 − shock)`). *Nights kept* is the Live Well clock (§25.3.3).

**Outfit** (the four all-mode per-run upgrades, now persistent; no proof catch):

| item | per level | prices (levels I / II / III) | on sale |
|---|---|---|---|
| Thick-Glass Chimney | max oil +15, oil burn −5% | 80 / 240 / 600 | start |
| Rendering Brazier | oil and food from rendering and eating +10% | 80 / 240 / 600 | start |
| Long Oars | raft speed +0.5, pickup radius +0.5 | 80 / 240 / 600 | start |
| Cork-Soled Boots | stride +0.35 m/s on foot (§24) | 80 / 240 / 600 | Sporewood lit |

- **Catalogues:** tackle 18,610 Shells (Rod, Line and Reel 5,170 each, Creel 3,100); outfit 3,680; lures 1,710.
- **Clear water (Glasswater):** lines below Glass-Gut get wait × 1.12 and favour −0.1, so the clear lake asks for its own line.
- The creel range (4–8 slots) equals today's per-run Woven Creel range, so persistence adds no carrying power to Gloomtide.

**Tackle rating** (shown on the Gear Bench and the Set Out card): for your *fitted* set, the largest class a skilled player lands ≥ 50% of the time against the lake's **reference species** (Reedjaw Pike · Mildew Angler · Mirror Pike · Gilt-Eyed Eel), plus the land rate of the next class (from `--gate --k 400`; Glasswater T3 sits on the 50% line and reads Elder in some seeds). A generated table (`BALANCE.tackleRating`, 125 loadouts × 4 lakes, written by `tools/sim/reel-v3.mjs --write-rating`) holds mixed loadouts.

| matched set | Mossmere | Sporewood | Glasswater | Pallid Deep |
|---|---|---|---|---|
| T0 | Trophy (Elder 0%) | Prize (Trophy 20%) | Keeper (Prize 42%) | Keeper (Prize 39%) |
| T1 | Trophy (Elder 0%) | Prize (Trophy 46%) | Prize (Trophy 40%) | Prize (Trophy 27%) |
| T2 | Trophy (Elder 15%) | Trophy (Elder 12%) | Trophy (Elder 11%) | Trophy (Elder 2%) |
| T3 | Elder (55%) | Elder (51%) | Trophy (Elder 49%) | Trophy (Elder 37%) |
| T4 | Elder (82%) | Elder (75%) | Elder (79%) | Elder (69%) |

**The gear gate is real** (`reel-v3-sim.mjs --gate --k 400`, skilled; Prize / Trophy / Elder / Ancient land %):

| reference species | T0 | T1 | T2 | T3 | T4 |
|---|---|---|---|---|---|
| Reedjaw Pike (Mossmere) | 77/52/0/0 | 89/76/0/0 | 94/87/15/0 | 100/99/55/0 | 100/100/82/44 |
| Mildew Angler (Sporewood) | 56/20/0/0 | 61/46/0/0 | 77/58/12/0 | 99/88/51/0 | 100/94/75/51 |
| Mirror Pike (Glasswater) | 42/14/0/0 | 70/40/0/0 | 85/72/11/0 | 98/94/49/0 | 100/98/79/46 |
| Gilt-Eyed Eel (Pallid Deep) | 39/3/0/0 | 68/27/0/0 | 85/66/2/0 | 96/92/37/0 | 100/98/69/43 |

Full tackle lands headline Elders **69–82%** and Ancients **43–51%** (the Mossmere's 82% sits 2 points over the 65–80% target band, inside the sim's ±2.5% at k 400; T1 re-checks it once each Elder's real old trick is simulated). Not every species is this hard: commons and uncommons are landable as Elders on their own lake's tackle (Mossmere commons on T1: 64 / 84 / 89% novice / skilled / expert), which is where most first Elders come from. The **return trip** is real: with full tackle, the Mossmere's Elder Reedjaw is still a one-in-five loss and its Ancients a coin flip.

**Legendaries** (authored fights; novice / skilled / expert land %):

| legend | T0 | T1 | T2 | T3 | T4 | notes |
|---|---|---|---|---|---|---|
| The Belled Matriarch | 56/82/85 | 84/90/91 | 99/100/100 | 100 | 100 | fair on starter tackle |
| The Drifting Grove | 31/76/89 | 64/87/95 | 84/94/97 | 97/98/99 | 100 | |
| The Glass Sovereign | 4/47/74 | 20/64/86 | 38/80/93 | 85/98/99 | 100 | |
| The Lantern-Swallower | 0 | 0 | 0 | 0/14/50 | 27/83/98 | T3 Rod and Reel + **Line T4**: 5/41/78 · + Reel T4: 20/77/97 |

#### 25.6.7 Failure that teaches

| failure | readable cause | what you see |
|---|---|---|
| Snapped | T ≥ 1.0 for 0.12 s (as now) | the line whips, the lure is lost |
| Thrown hook | pips reach 0, or slack longer than the grace | the hook flies back with a glint |
| Spooled | progress reaches 0 with the drag slipping (cumulative slip > 0.5; any species, most often a runner's run) | the reel screams empty |
| Fouled | a chain wrap during a foul window (Gatehouse Door, Chain Garden) | the line goes dead, then parts |

- **Near-miss card** (always, for Prize+): silhouette, estimated class and length (±8%), % landed, cause, the tackle rating here, one tip. Example: "Reedjaw Pike · Trophy · ~108 cm. Snapped at 84%. Your tackle is rated Trophy here (Elders 0%). Let go on the hiss."
- **Marked Fish ("still out there")**: an escaped **Trophy+** fish keeps its z and lives at the place it escaped from, behaving like a resident there (§25.8.1; it replaces that place's resident if there is one), with a hook-glint on its shows. Its next fight starts at `min(0.3, 0.5 × P_escape)` (the legendary `wounded` rule, reused). Up to **6** persist in meta; the Map Table marks them.

#### 25.6.8 Landing and measuring: the signature beat

| t | beat (Small/Keeper ≈ 1.2 s, tap to skip · Prize ≈ 2.4 s · Trophy ≈ 3.5 s · Elder ≈ 5 s, skippable after 0.6 s) |
|---|---|
| 0.0–0.6 s | **scoop**: a water sheet and a splash at true scale; the `trophy` camera eases in to `clamp(1.2 + 1.6·L, 1.6, 16)` m and frames fish and Wick against the place's landmark |
| 0.6–1.4 s | **pose by length** (the Wick is 0.85 m): **Palm** < 0.25 m (cupped, close-up) · **Arms** 0.25–0.85 m (held up, as now) · **Hang** 0.85–2.0 m (head-up from the rod tip) · **Alongside** > 2.0 m and every legendary (it lies beside the raft or pier; on foot the Wick walks its length; on the raft, whose deck is ≈ 2 × 2.6 m, the Wick stays on deck while the cord unrolls along the fish and the camera tracks it; above 4 m the camera cranes to 50°) |
| 1.4–2.8 s | **the knotted cord** unrolls along the fish. The centimetres tick up with rising pitch, a chime rings as the count crosses each class threshold, and the **seal stamps**: Prize = a bone-white **ink stamp** of a knotted cord · Trophy = an **oxblood wax seal** · Elder = a **black wax seal with a ribbon** (Ancient: a gold thread), and the fish gets a name ("Old Ninefin", from per-species syllable tables) |
| at the stamp | **records are written** (PB, class first, place record, Old Ledger, Elder Log, best setup): never lost after this instant (`fish:measured`) |
| 2.8–3.6 s | banners: "New best: 112 cm (was 97)" · "First Trophy Reedjaw" · "Old Ledger beaten" (Murk's bell rings across the lake) |
| card | the favours that applied (§25.6.1) · **Keep** (Prize+: a "Mark for home" ribbon toggle; needs a free Live Well slot, shows its nights) · **Eat** · **Render** · **Release** (+luck, as now; the first release of a species at Prize / Trophy / Elder banks +1 / +3 / +8 Memories) · a banked Boon pick if one is waiting. Cut Strip lives in the creel screen. |

**The ceremony is a cinematic state.** From the scoop until the card opens, survival's phase clock and drains, combat's enemies and director, and fishing's bite timers are frozen; actors, render, ui and audio run in real time. During an active swarm window every class plays the short 1.2 s variant. The **trophy camera** frames fish and Wick against `data.landmarkOf(place)` (each Mossmere place has an authored `landmark`; §24's places use their own centre), swinging its yaw toward it by at most ±35° from north; on foot the occlusion cone and terrain clamp stay on; with no place (P1, or open water) it does not swing. **True scale has no clamps:** models' 0.12 m floor drops to 0.04 m and fishing's 6 m splash cap goes (a 0.08 m Cupbearer and an 8.5–9.7 m legend size truly).

**The hand-off in code** (CONTRACT §13.7): fishing calls `progression.makeFish` at the landing and holds the Fish, plays the ceremony, and calls `progression.measure(fish)` at the stamp, which does every duty today's `landFish` does (journal, records, Memories, XP, bounty and challenge hooks, the gate, victory) and emits `fish:measured` then `fish:landed` (the card). Main saves on `fish:measured`. A cove catch has no run: Journal and records only, and the card offers Release only.

P4 adds the **postcard catch card**: the ui-fishart plate painted over a silhouette strip of the place's landmark.

#### 25.6.9 Target land rates (hooked fish)

Lake columns are the sim's averages for that lake's *rare* species (novice / skilled / expert), today's 32-species data, on the lake's curve tackle T(i + 1) unless stated. The reel sim runs once per night mode (combat interrupts fishing).

| class | target | Mossmere T1 | Sporewood T2 | Glasswater T3 |
|---|---|---|---|---|
| Small and Keeper, commons | **≥ 97** / 99 / 100 | 100/100/100 | 100/100/100 | 100/100/100 |
| Keeper, rares | 85 / 95 / 99 | 97/97/99 | 99/100/100 | 98/100/98 |
| Prize | 70 / 90 / 97 | 77/93/95 | 88/87/91 | 92/91/94 |
| Trophy | 45 / 75 / 90 | 50/89/92 | 77/74/76 | 72/85/88 |
| Elder on curve tackle | **0–15 / 15–35 / 25–45** | 2/21/23 | 13/29/41 | 0/14/29 |
| Elder on arrival tackle T(i) | ≈ 0–10 (a wall: it becomes a Marked Fish) | T0: 0/14/21 | T1: 0/9/13 | T2: 0/0/0 |
| Elder on T4, reference species, skilled | **65–80** | 82 | 75 | 79 (Pallid: 69) |
| Ancient on T4, **every Elder-capable species**, skilled | median ≤ 207 s (180 × 1.15), < 2% time-outs | validated at k 160; the Bridgechain Sturgeon and Old Portcullis (stamina × 0.7: 42–43%, ≤ 172 s) and the Sexton (× 0.65: 40%, 145 s) were retuned for this | | |
| Ancient on T4, reference species, skilled | **40–55** | 44 | 51 | 46 (Pallid: 43) |

Known gaps (the sim says so): Keeper rares are too easy for novices until the runner (P3) and sulker (P4) land; the Blind Scrivener's Elder (33% on T4) and the Lampwarden (capped at Trophy, 65% on T4) are retuned when the sulker is simulated. Runner and sulker are added to `tools/sim/reel-v3.mjs` **before** their code.

### 25.7 Species and the size system

#### 25.7.1 One size model (replaces §5.8's weight roll)

On the bite, roll a **size score** `z ~ Normal(μ, 1)`, truncated to [−2.0, 3.6]. Then (data: `BALANCE.size`):

```
length L = L50 · e^(σ·z + 0.06·max(0, z − 1.04)²)     σ = the species' length spread (0.09 … 0.175)
weight W = k · L³                                     (k per body shape, so weight has the long tail)
class    = z < −0.25 Small · < 1.04 Keeper · < 1.88 Prize · < 2.65 Trophy · ≥ 2.65 Elder   (Ancient: an Elder with z ≥ 3.2)
```

The squared term **stretches the top of the curve**, so big fish look big: an Elder (z 3.0) is **1.6–2.0× the length of a typical Keeper** (z 0.4) for every species, and the "said to reach" ceiling (z 3.6) is 2.0–2.8× the median. Classes are cut on **z**, so a class means the same rarity on every species. **One ladder everywhere** (data, UI, Murk's lines, challenges): **Small · Keeper · Prize · Trophy · Elder.** An Elder always gets a name; an Ancient is an Elder with a gold thread on its seal, not a sixth rung. `sizeK` and the ±22% model scaling are cut.

| μ | Small | Keeper | Prize | Trophy | Elder* | (of which Ancient) | what it looks like |
|---|---|---|---|---|---|---|---|
| 0 | 38.7% | 46.0 | 12.2 | 2.7 | 0.4 | 0.1 | blind casting in open water |
| 0.5 | 22.2 | 48.2 | 21.2 | 6.9 | 1.5 | 0.3 | a place at dusk with the right bait |
| 1.0 | 10.5 | 41.3 | 29.6 | 14.1 | 4.5 | 0.9 | right place, right window, right lure |
| 1.5 | 4.1 | 28.8 | 33.1 | 23.1 | 10.9 | 2.7 | Astir place, condition matched, night, bottom of the band |
| 1.8 (cap) | 2.1 | 21.1 | 32.0 | 28.1 | 16.8 | 4.7 | everything at once |

\* **Elders exist only where giants live:** places flagged `holdsGiants` (3 per lake, §25.8), their **residents**, Marked Fish, and P4's Underdepth casts. Everywhere else z is clamped to 2.64 (a top Trophy). Fry water (the Puffball Vent, the Votive Font) caps at Prize; the Lampwarden caps at Trophy (so it has no Elder seal). **`giantsKept`**: at the nine places whose kept rare had no other Elder water (the Cupped Hands, the Gatehouse Door; §24's Drowned Greenhouse, Veilwater, Bell-Chapel Window, Stilled Cascade, Long Pier, Sunken Belfry, Bier Barge) the kept species alone may roll past the clamp and the place's maxClass; nothing else there can. **Every Elder seal has a route** (validated: a kept place with `giantsKept` or `holdsGiants`, or a giant place whose depth band and hours the species can use; the shallow commons got shallow giant water: the Lullaby's rim 0.4–0.85 and the Ferry Slip's ramp 0.45–0.95 ▲, the Under the Span lip 0.45 for the night Lampsipper). **Finding where the giants live is the exploration goal.** *The stopgap, per lake:* a lake whose places are not in the build (the Mossmere before P2; the other three whenever §24's lake builds are off, which P1–P3 and Landing v0 allow) uses `RAFT_FALLBACK_V3[lake].giants` as its holdsGiants water: the legend-pool rim (r 3.2–9), deep pools ≥ 15 m from it, and authored open-water discs to make **3 giant sources** (one resident each), so Elders exist from the first build in every lake; it ends per lake when that lake's places load (validated: 3 giant sources and 2 watch lamps per lake in every phase, with and without §24).

#### 25.7.2 Favour μ (one formula, shown on the float by family)

| family | source | favour |
|---|---|---|
| **Place** | inside any place / today's **Astir** place (instead) | +0.15 / +0.35 |
| | a place's live window (rhythm live, sight fish, the Turn, a dome…) | +0.2 … +0.6 (per place, §25.8) |
| **Hour** | dusk *Last Light* or dawn | +0.2 |
| | night: **Night Rise** (every mode) | +0.25 |
| | **Hush** condition (lake-wide, §25.8.2) | +0.2 |
| | **Far Water** (§25.3.3) | +0.06 per dawn out (cap +0.24) |
| **Match** | the species' field-note condition | +0.3 |
| | **today's rumour** target (that species at that place) | +0.3 |
| **Tackle** | bait / lure | Ember Roe +0.35 · Cut Strip +0.3 (predators) · Glimmer Spoon, Bone Jig, Moth Popper +0.2 (their family) · Lantern Lure +0.4 |
| | bobber in the lower third of the species' depth band | +0.25 |
| | Clean Cast | +0.1 |
| | line below Glass-Gut in clear water (Glasswater) | −0.1 |
| **Signs** | strike splash / nervous water / bubble trail | +0.6 / +0.3 / +0.2 |
| | let it pass | +0.15 per lapsed bite (cap +0.3) |
| **Pressure** | each catch from this place today | **−0.12** (floor −0.6, reset at dawn) |
| **cap** | | **+1.8** |

**Arithmetic check.** A *decent* cast (place 0.15 + dusk 0.2 + family lure 0.2 = 0.55, ◆◆◇◇◇) gives Prize 22%, Trophy 7.4%, Elder 1.7% where giants live. A *full setup* (Astir 0.35 + window 0.4 + night 0.25 + condition 0.3 + Ember Roe 0.35 + depth 0.25 + clean 0.1 = 2.0, capped at 1.8, ◆◆◆◆◆) gives Elder 16.8%, Ancient 4.7%. **Setup is what you master, and the float tells you how you are doing.**

**Pacing, in hours of play** (the pacing sim T5 owns these, with the setup-favour distribution and residents included): ≈ 65 casts per hour of play (≈ 27 min of fishing at ≈ 25 s per cast incl. fight and ceremony); about a third in giant water at an average favour ≈ 0.5 gives ≈ 0.3 Elder bites per hour; residents add ≈ 0.3–0.5 (≈ 1–1.5 resident hooks per expedition × 12.4% Elder × 2.67 expeditions per hour). So **≈ 0.6–0.8 Elder hooks per hour of play**. Targets: first Elder hooked h1–3; first Elder landed h2–6 (usually a common or uncommon species at a giant place); first headline-predator Elder (a lake's reference species) h6–10; first Ancient h12+.

**Legendaries** are single individuals with **authored** sizes (σ 0.02, so their records are to the gram), **each ≥ 1.4× the longest "said to reach" in its lake** (a `validate-data` rule). Each later landing is **+7% heavier** (length +2.3%), capped at × 1.5 weight.

#### 25.7.3 Value, food and oil from size

```
fish.value = round(species.value × 0.66 × clamp(e^(0.45·z), 0.6, 6) × classBonus × QUALITY.valueMult × streak)
             classBonus: Trophy 1.25, Elder 1.6, otherwise 1
fish.food / fish.oil = species.food / oil × 0.784 × clamp(e^(0.3·z), 0.7, 2.5) × QUALITY.yieldMult  (× Far Water on rendered oil)
```

The yield factor **0.784** = 0.942 / 1.201 does for food and oil what 0.66 does for value: over the same favour mix the size multiplier averages 1.201, so without it a Mossmere common would render ≈ 21.6 oil instead of the ≈ 17 that Far Water's arithmetic (§25.3.3) assumes (validated from the mix).

The factor 0.66 is normalised against the **real favour mix**, not μ = 0: over an assumed mix (25% of sold fish at μ 0, 30% at 0.3, 25% at 0.6, 15% at 1.0, 5% at 1.5; a third in giant water) the size × class multiplier averages **1.428**, and today's `sizeK` averages 0.942, so 0.942 / 1.428 = 0.66 keeps income per fish equal to today's (`roster-v3.mjs`). The balance sim (T3) recomputes it per lake from simulated favour. Example: an Elder Reedjaw (z 2.8) = 34 × 0.66 × 3.53 × 1.6 ≈ **127 Shells**, about two days of early Mossmere income from one fish. `sizeK` is cut. Quality tiers (Fine, Shimmering) and the perfect-hook streak are kept.

#### 25.7.4 Records (all written at the measuring moment, all permanent)

| record | rule |
|---|---|
| personal best | per species, length and weight; "New best: 112 cm (was 97)" |
| best setup | the favours present when you set the PB, stored in the species' field note |
| class seals | Journal grid: 48 non-legendary lake and Wanderer species × Prize / Trophy / Elder, minus the Lampwarden's Elder (it caps at Trophy; its cell is printed struck) = **143 seals**, plus 4 legend seals (the Quayling has no seals: it never grows past Keeper). The brief's 144 counted the capped Lampwarden; `data.sealsFor` is the rule. |
| **Elder Log** | every Elder: generated name, cm, kg, place, expedition number, day, Wick; Ancients marked. Lost-on-the-way-home Elders keep their line ("Sank with the creel, night 4"). |
| **Old Ledger** | a figure in Murk's ledger "since before the Fall" at **z 2.3** (mid-Trophy) for every species. Beating it rings Murk's bell across the lake and gives +5 Memories; your Wick's name is chalked over the old one on his barge at home. |
| said to reach | the ceiling (z 3.6), drawn as a dotted silhouette on the Journal ruler and on the species' wall frame once you land a Trophy of that species |
| the one that got away | biggest escape per species (estimated ±8%) |
| place records | your best fish per place, inked on that place's **Tally Post** in the world (§25.8.1) |
| legend growth | a growth line per legend ("Expedition 3: 241 kg · Expedition 9: 296 kg") |

#### 25.7.5 Size you can see (3D and UI)

| moment | what shows the size | cost |
|---|---|---|
| **bite** | class bite tells (§25.6.4); rise-ring radius, boil ellipse and glow-trail brightness scale with the pre-rolled fish | bobber animation variants; pooled decals |
| **fight** | **the 1.45× mid-fight boost is cut** (`fishing.js:663`), and so are the clamps: models' 0.12 m floor drops to 0.04 m (`models-fish.js:631`) and fishing's 6 m cap on splash and wake length goes (`fishing.js:662`). The model is the true length in metres (`createFish(species, {z})` → the stretched L). Splash (`0.6 + L·0.6`, existing), wake and the under-water shadow decal scale with length. **The reel camera pulls back by line distance and fight state only, never by class**, so an Elder looks bigger on screen than a Keeper. | 0 calls |
| **breach** | leap reveal for Prize+: 0.25 s at timescale 0.35, rim flash, a thump pitched by size | 1 tween |
| **landing** | pose by length (palm / arms / hang / alongside), the knotted cord with class chimes, the `trophy` camera at `clamp(1.2 + 1.6·L, 1.6, 16)` m framing fish and Wick against the place's landmark | actors poses + 1 cord mesh |
| **age marks** (P4) | one detail grows with class on 10 headline species: Mossback's lichen tuft blooms · Weeping Carp's barbels become ribbons · Gutter Crayfish gains buttons · Capshell's hat grows · Sporebelly becomes a perfect sphere · Reedjaw's scars · Shardspine's crest · Bonecrook's crown fragment · Bridgechain gains chain links · Candlewake lights one more scute-candle per class | parameters in `models-fish` and `ui-fishart` |
| **Journal** | per-species ruler: class bands in ink wash, ticks for your last 12 catches, your best, the Old Ledger mark, the dotted "said to reach". Plates show a small Wick silhouette at true relative scale. | canvas |
| **home** | your fish at true size against its species' painted ruler on the Long Wall; legends under the arch; pond fish swimming at true size | §25.4 |

*Scale note:* the built Wick is **0.85 m**. All "Wicks long" framing uses 0.85 m. An Elder Reedjaw (122–178 cm) is 1.4–2.1 Wicks; the Lantern-Swallower (850 cm) is 10 Wicks.

#### 25.7.6 The roster: 53 species

**Grammar** (learnable per lake): 3–4 everyday commons → uncommons → rares, of which **≥ 2 are night-only** → **3–5 place-kept** fish, each tied to one place and one condition → 1 legendary. Plus 2 Wanderers and the Landing's Quayling. **No filler: every new fish is tied to a place, a condition or the night.** Morphs (colour-variant checklists) are cut outright (they echo Dredge's aberrant collection and real hunting games' morph lists). Each lake has **two giant-tail species** (σ ≥ 0.16), whose Elders are about twice a Keeper's length.

| lake | commons | uncommons | rares (incl. kept) | legend | total | place-kept | night-only (non-legend) | giant-tail |
|---|---|---|---|---|---|---|---|---|
| The Mossmere | 4 | 2 | 5 | 1 | 12 | 3 | 2 (Lampsipper, Gloam Eel) | Weeping Carp, Bridgechain Sturgeon |
| Sporewood Pools | 3 | 3 | 5 | 1 | 12 | 3 | 2 (Nightbloom Carp, Mildew Angler) | Nightbloom Carp, Mildew Angler |
| Glasswater Vault | 3 | 2 | 7 | 1 | 13 | 4 | 2 (Shardspine Eel, Vesper Gar) | Mirror Pike, Blind Scrivener |
| The Pallid Deep | 3 | 2 | 7 | 1 | 13 | 5 | 3 (Funeral Veil, Lampwarden, Candlewake) | Gilt-Eyed Eel, Candlewake Sturgeon |
| Wanderers | | | 2 | | 2 | | 1 (Hearthfish) | |
| the Landing | 1 | | | | 1 | | | |
| **total** | 14 | 9 | 26 | 4 | **53** | **15** | **10** | 8 |

**Phasing:** today's 32 → **36** in P2 (the Mossmere's 4 new fish with its places) → **44** with §24's 8 place-kept fish (the §24 lake builds, `WALK_ENABLED`) → **47** in P3 (2 Wanderers and the Quayling) → **53** in P4 (6 more, each hung on an existing §24 place or the night).

Columns (all sizes from `roster-v3.mjs`): median = L50 / W50 · σ = length spread · Trophy from = z 1.88 · Elder from = z 2.65 · said to reach = z 3.6 (legends: fully grown, × 1.5 weight) · E/K = Elder (z 3.0) length ÷ Keeper (z 0.4) length · value = base Shells before × 0.66 and size. Styles in *italics* are re-mapped. Place references use §24 place ids and the §25.8.4 Mossmere ids. All palettes off-green (§25.7.7). The `id` column gives the data id (existing ids unchanged; new ids per the CONTRACT §13 data-exports table).

| # | species · `id` | lake · where / condition | rarity · time · depth | style | median | σ | Trophy from | Elder from | said to reach | E/K | value | look (signature trait · palette) | status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Dusk Minnow `dusk_minnow` | Mossmere · anywhere | C · any · 0–.55 | darter | 22 cm / 106 g | .12 | 29 / 238 g | 35 / 441 g | 50 / 1.3 kg | 1.72 | 5 | pewter schools flecked rust like thrown pennies | recolour |
| 2 | Mossback Perch `mossback_perch` | Mossmere · anywhere | C · any · .1–1 | steady | 36 / 607 g | .13 | 48 / 1.4 kg | 59 / 2.7 kg | 85 / 8.0 kg | 1.77 | 7 | slate perch; a pale lichen tuft that blooms with class (age mark) | recolour |
| 3 | Gutter Crayfish `gutter_crayfish` | Mossmere · shallows | C · any · 0–.45 | sinker | 19 / 206 g | .10 | 24 / 411 g | 29 / 727 g | 40 / 2.0 kg | 1.63 | 6 | drowned buttons on the shell, one more per class (age mark) | existing |
| 4 | **Lampsipper** `lampsipper` | Mossmere · shallows, × 2 inside your light | C · **night** · 0–.5 | darter | 26 / 176 g | .12 | 34 / 393 g | 42 / 728 g | 59 / 2.1 kg | 1.72 | 9 | upturned mouth, two moth-wing eye-spots; rises to your lantern | new · P2 |
| 5 | Weeping Carp `weeping_carp` | Mossmere · mid–deep | U · any · .35–1 | sinker | 56 / 2.8 kg | .16 | 79 / 7.9 kg | 100 / 16 kg | 148 / 52 kg | 1.91 | 15 | pewter and ivory, tear-streaks; barbels lengthen into ribbons (age mark) | recolour · giant tail |
| 6 | Candlefin Koi `candlefin_koi` | Mossmere · calm; × 3 Lily Maze | U · calm · .25–.85 | darter | 46 / 1.5 kg | .13 | 61 / 3.5 kg | 76 / 6.5 kg | 109 / 19 kg | 1.77 | 18 | ivory koi, fin edges lit with heatless flame | existing |
| 7 | Reedjaw Pike `reedjaw_pike` | Mossmere · deep | R · any · .55–1 | thrasher | 70 / 2.6 kg | .15 | 97 / 6.8 kg | 122 / 13.5 kg | 178 / 42 kg | 1.86 | 34 | slate-blue, reed-barred in ink; old ones carry pale scars (age mark) | recolour · reference species |
| 8 | Gloam Eel `gloam_eel` | Mossmere · deep · Lumen Moss; × 2 Buoy Lights | R · night · .4–1 | leaper | 72 / 597 g | .13 | 96 / 1.4 kg | 119 / 2.7 kg | 170 / 7.9 kg | 1.77 | 42 | ink eel with **moon-violet** photophores (was mint) | recolour, resized |
| 9 | **Old Portcullis** `old_portcullis` | Mossmere · **Gatehouse Door** target | R · any · .6–1 | sinker + fouled line | 58 / 3.1 kg | .15 | 80 / 8.3 kg | 101 / 16 kg | 147 / 51 kg | 1.86 | 40 | catfish whose barbels hang like a broken portcullis; iron-rust mottle | new · P2 (kept) |
| 10 | **Cupbearer** `cupbearer` | Mossmere · **Cupped Hands** bowl (1 m disc) while it is full | R · calm · .3–.5 | darter | 80 mm / 5 g | .09 | 99 mm / 10 g | 119 mm / 17 g | 164 mm / 44 g | 1.59 | 48 | thumb-sized, violet-gold veil fins; **measured in millimetres** | new · P2 (kept) |
| 11 | **Bridgechain Sturgeon** `bridgechain_sturgeon` | Mossmere · **Under the Span**, in Mirror Hush | R · any · .6–1 | sinker | 70 / 2.1 kg | .16 | 99 / 5.8 kg | 125 / 12 kg | 185 / 38 kg | 1.91 | 55 | rust scutes in a line like chain links (age mark); the Mossmere's longest | new · P2 (kept) · giant tail |
| 12 | The Belled Matriarch `belled_matriarch` | Mossmere · Bell Pool · Heartmoss | L · calm | steady (boss) | 260 / 230 kg | — | — | — | 298 / 345 kg | — | 140 | a harbour bell grown into her skull; tarnished-bronze scales, pale moon glow (was mint) | recolour, resized (1.41× the lake's longest) |
| 13 | Sporebelly Puffer `sporebelly_puffer` | Sporewood · shallows; × 3 Puffball Vent | C · any · 0–.6 | thrasher | 25 / 469 g | .10 | 31 / 935 g | 38 / 1.7 kg | 53 / 4.5 kg | 1.63 | 13 | sighs spores; Trophy+ puff into a perfect sphere (age mark) | existing |
| 14 | Plumgill Perch `plumgill_perch` | Sporewood · anywhere | C · any · .15–1 | steady | 40 / 832 g | .13 | 53 / 2.0 kg | 66 / 3.7 kg | 95 / 11 kg | 1.77 | 14 | bruise-plum gills | existing |
| 15 | Capshell Crayfish `capshell_crayfish` | Sporewood · shallows | C · any · 0–.45 | sinker | 24 / 415 g | .10 | 30 / 828 g | 37 / 1.5 kg | 51 / 4.0 kg | 1.63 | 12 | wears a mushroom hat that grows with it (age mark) | existing |
| 16 | Velvet Ray `velvet_ray` | Sporewood · mid–deep; × 2 `mothers_cup`, `gill_harp` | U · any · .35–.9 | *runner* | 67 / 3.6 kg | .14 | 91 / 9.0 kg | 113 / 18 kg | 164 / 53 kg | 1.81 | 32 | plum velvet wings, pale eye-rings | existing |
| 17 | Threadling Eel `threadling_eel` | Sporewood · Spore Cake | U · any · .3–.85 | darter | 86 / 1.0 kg | .13 | 115 / 2.4 kg | 142 / 4.6 kg | 203 / 13.5 kg | 1.77 | 34 | blind, root-like, stitched bands | existing, resized |
| 18 | **Nightbloom Carp** `nightbloom_carp` | Sporewood · anywhere | U · **night** · .3–1 | sinker | 58 / 3.1 kg | .17 | 83 / 9.2 kg | 106 / 19 kg | 158 / 64 kg | 1.96 | 40 | plum carp whose scales open like amber spore-lamps at night | new · P4 · giant tail |
| 19 | Mildew Angler `mildew_angler` | Sporewood · deep; × 2 `veilwater` | R · night · .5–1 | sinker | 60 / 5.4 kg | .16 | 85 / 15 kg | 107 / 31 kg | 158 / 99 kg | 1.91 | 66 | its lure is one soft lit mushroom | existing · reference · giant tail |
| 20 | Sleepspore Jelly `sleepspore_jelly` | Sporewood · Lumen Moss; × 3 `lullaby` | R · calm · .2–.75 | darter | 33 / 719 g | .09 | 41 / 1.4 kg | 49 / 2.3 kg | 68 / 6.2 kg | 1.59 | 62 | pink-white bell with a sleeping fry inside | existing |
| 21 | Harpstring Eel `harpstring_eel` | Sporewood · `gill_harp` while it sings | R · any · .4–.85 | darter | 82 / 882 g | .13 | 109 / 2.1 kg | 135 / 4.0 kg | 194 / 12 kg | 1.77 | 74 | rose-striped; its fins hum on the line | §24 (kept) |
| 22 | Hushcap Koi `hushcap_koi` | Sporewood · `veilwater`, its deed done | R · calm · .6–1 | darter | 50 / 1.9 kg | .13 | 67 / 4.4 kg | 82 / 8.4 kg | 118 / 25 kg | 1.77 | 78 | dusk-dark koi, lit only in the dark the place keeps | §24 (kept) |
| 23 | **The Remembered Sun** `the_remembered_sun` | Sporewood · `drowned_greenhouse`, Clean Cast within 0.6 m of the Lit Row's centre line | R · calm · .4–.5 | leaper | 45 / 1.4 kg | .13 | 60 / 3.2 kg | 74 / 6.1 kg | 106 / 18 kg | 1.77 | 80 | the one warm fish in the Pools: a pale-gold sun-disc on its flank | new · P4 (kept ▲) |
| 24 | The Drifting Grove `drifting_grove` | Sporewood · `mothers_cup` · Glowcap Bulb | L · calm | leaper (boss) | 300 / 320 kg | — | — | — | 344 / 480 kg | — | 320 | a meadow on her back that blooms when she dives | resized (1.47×) |
| 25 | Prism Minnow `prism_minnow` | Glasswater · shallows | C · any · 0–.6 | darter | 23 / 122 g | .12 | 30 / 272 g | 37 / 504 g | 52 / 1.4 kg | 1.72 | 24 | schools flash ice-blue at once (sapphire, not aqua) | recolour glow |
| 26 | Glassgill Perch `glassgill_perch` | Glasswater · anywhere | C · any · .15–1 | steady | 43 / 1.0 kg | .13 | 57 / 2.4 kg | 71 / 4.6 kg | 102 / 14 kg | 1.77 | 28 | a heart visible through its side | existing |
| 27 | Glassblown Puffer `glassblown_puffer` | Glasswater · shallows | C · any · 0–.55 | thrasher | 27 / 590 g | .10 | 34 / 1.2 kg | 41 / 2.1 kg | 57 / 5.7 kg | 1.63 | 26 | rings like a wineglass when it puffs | existing |
| 28 | Chime Jelly `chime_jelly` | Glasswater · Glass Larvae; × 3 `bell_window` | U · calm · .25–.85 | darter | 36 / 933 g | .09 | 44 / 1.8 kg | 53 / 3.0 kg | 74 / 8.0 kg | 1.59 | 56 | chimes when it brushes crystal | existing |
| 29 | Mirror Pike `mirror_pike` | Glasswater · deep; × 3 `mirror_nave` | U · any · .5–1 | *runner* | 75 / 3.2 kg | .17 | 108 / 9.4 kg | 137 / 20 kg | 205 / 65 kg | 1.96 | 62 | mirror flank that shows a tired little candle | existing · reference · giant tail |
| 30 | Shardspine Eel `shardspine_eel` | Glasswater · deep | R · night · .4–1 | thrasher | 85 / 983 g | .14 | 115 / 2.5 kg | 144 / 4.8 kg | 208 / 15 kg | 1.81 | 130 | crystal frost along the spine; the crest grows (age mark) | existing, resized |
| 31 | **Vesper Gar** `vesper_gar` | Glasswater · deep; × 3 `broken_hymnal` | R · **night** · .5–1 | darter | 70 / 2.6 kg | .15 | 97 / 6.8 kg | 122 / 13.5 kg | 178 / 42 kg | 1.86 | 135 | needle jaw; violet glass fins ring on every surge | new · P4 |
| 32 | The Blind Scrivener `blind_scrivener` | Glasswater · Ember Roe; `well_of_ledgers` | R · any · .6–1 | *sulker* | 64 / 6.6 kg | .16 | 90 / 18 kg | 114 / 37 kg | 169 / 120 kg | 1.91 | 120 | eyeless, one violet lure | existing · giant tail |
| 33 | The Unreflected `the_unreflected` | Glasswater · `mirror_nave`, reflection hit | R · any · .5–1 | darter | 60 / 2.8 kg | .13 | 80 / 6.6 kg | 99 / 13 kg | 142 / 37 kg | 1.77 | 145 | ice-pale and blind; casts no reflection | §24 (kept) |
| 34 | The Footnote `the_footnote` | Glasswater · `well_of_ledgers`, bottom ledger | R · any · .9–1 | *sulker* | 51 / 1.7 kg | .13 | 68 / 4.1 kg | 84 / 7.7 kg | 121 / 23 kg | 1.77 | 140 | tiny script-like marks along the flank | §24 (kept) |
| 35 | Rainglass Darter `rainglass_darter` | Glasswater · `stilled_cascade` | R · calm · .75–.95 | darter | 39 / 593 g | .11 | 50 / 1.3 kg | 61 / 2.3 kg | 86 / 6.3 kg | 1.68 | 135 | raindrop spots that catch the light | §24 (kept) |
| 36 | **The Sexton** `the_sexton` | Glasswater · `bell_window` during the Struck Hour | R · any · .85–.95 | thrasher | 66 / 4.6 kg | .15 | 91 / 12 kg | 115 / 24 kg | 168 / 76 kg | 1.86 | 150 | deep indigo, a pale bell-shaped patch per flank; a muffled toll each surge | new · P4 (kept ▲) |
| 37 | The Glass Sovereign `glass_sovereign` | Glasswater · `fallen_chandelier` · Prism Moth | L · night | leaper (boss) | 300 / 210 kg | — | — | — | 344 / 315 kg | — | 600 | each scale a window with no one behind it | resized (1.44×) |
| 38 | Ossuary Fry `ossuary_fry` | Pallid · shallows; Almshouse Cradle | C · any · 0–.6 | darter | 23 / 122 g | .12 | 30 / 272 g | 37 / 504 g | 52 / 1.4 kg | 1.72 | 42 | bone-pale and blind | existing |
| 39 | Pallid Wraithfin `pallid_wraithfin` | Pallid · anywhere | C · any · .1–1 | steady | 46 / 973 g | .13 | 61 / 2.3 kg | 76 / 4.4 kg | 109 / 13 kg | 1.77 | 48 | ghost-ribbon fins | existing |
| 40 | Bonecrook Crayfish `bonecrook_crayfish` | Pallid · shallows; Almshouse Cookpot | C · any · 0–.5 | sinker | 27 / 590 g | .10 | 34 / 1.2 kg | 41 / 2.1 kg | 57 / 5.7 kg | 1.63 | 44 | a shell of fallen things; a crown fragment at Trophy+ (age mark) | existing |
| 41 | Gilt-Eyed Eel `gilt_eyed_eel` | Pallid · deep | U · any · .4–1 | thrasher | 131 / 3.6 kg | .16 | 185 / 10 kg | 234 / 21 kg | 345 / 66 kg | 1.91 | 92 | two gold coins for eyes | existing · reference · giant tail |
| 42 | Shroud Ray `shroud_ray` | Pallid · deep | U · any · .45–1 | leaper | 82 / 6.6 kg | .14 | 111 / 17 kg | 139 / 32 kg | 201 / 98 kg | 1.81 | 88 | burial-cloth wings | existing |
| 43 | Funeral Veil `funeral_veil` | Pallid · mid; Almshouse Shrine | R · night · .3–.9 | darter | 42 / 741 g | .09 | 52 / 1.4 kg | 62 / 2.4 kg | 86 / 6.4 kg | 1.59 | 190 | widow-veil threads | existing |
| 44 | Lampwarden Angler `lampwarden_angler` | Pallid · Ember Roe; `sunken_belfry`, `the_bottomless` | R · night · .6–1 | *sulker* | 72 / 9.3 kg | .14 | 98 / 23 kg | — (caps at Trophy) | 122 / 45 kg (cap) | — | 210 | the last lamp hangs from its jaw | existing, capped |
| 45 | The Clapper `the_clapper` | Pallid · `sunken_belfry` toll cue | R · any · .8–1 | thrasher | 66 / 4.6 kg | .15 | 91 / 12 kg | 115 / 24 kg | 168 / 76 kg | 1.86 | 225 | bell-bronze carp; the bell rings when it turns | §24 (kept) |
| 46 | The Wax-Bearer `wax_bearer` | Pallid · `bier_barge`, hold open | R · any · .7–.9 | leaper | 127 / 3.3 kg | .13 | 169 / 7.7 kg | 209 / 15 kg | 300 / 43 kg | 1.77 | 220 | a drop of candle-wax on its brow | §24 (kept) |
| 47 | The Unpaid Fare `the_unpaid_fare` | Pallid · `ferry_slip` at dusk | R · calm · .8–1 | *sulker* | 87 / 6.6 kg | .14 | 118 / 17 kg | 147 / 32 kg | 213 / 97 kg | 1.81 | 240 | coin-eyed, dark ghost-ribbon body | §24 (kept) |
| 48 | **Candlewake Sturgeon** `candlewake_sturgeon` | Pallid · `chain_garden` during the Turn | R · **night** · .85–.95 | runner | 133 / 14 kg | .175 | 193 / 43 kg | 247 / 91 kg | 370 / 304 kg | 1.98 | 250 | bone scutes like unlit candles, one lit per class (age mark); the biggest non-legendary | new · P4 (kept ▲) · giant tail |
| 49 | **The Namesake** `the_namesake` | Pallid · `long_pier` after relighting 3 candle-rafts that day | R · any · .75–.85 | steady | 62 / 3.1 kg | .13 | 83 / 7.3 kg | 102 / 14 kg | 147 / 41 kg | 1.77 | 230 | bone-white with gold calligraphic marks; each catch logged under a name from the pier | new · P4 (kept ▲) |
| 50 | **The Lantern-Swallower** `lantern_swallower` (was the Pale Leviathan, `pale_leviathan`) | Pallid · `the_bottomless` · Last Candle `last_candle` (was Drowned Marrow, `pale_marrow`) | L · night | sinker (boss) | 850 / 3,200 kg | — | — | — | 973 / 4,800 kg | — | 2,500 | older than the kingdom; it swallowed the great lantern, and the ember still glows in its belly | renamed, resized (10 Wicks; 2.3×) |
| 51 | **Pilgrim Salmon** `pilgrim_salmon` | Wanderer · Sporewood and deeper: dawn and the first 30 s of calm within 20 m of the lake's Homeward Waystone; once per lake per **real day** | R · dawn · .3–.8 | runner | 66 / 2.2 kg (Sporewood) · 76 / 3.3 kg · 87 / 4.9 kg | .13 | 88 / 5.1 kg | 109 / 9.7 kg | 156 / 29 kg (Pallid: 206 cm) | 1.77 | 30 × lake valueMult | rust hooked jaw, frayed fins; grows each lake down | new · P3 |
| 52 | **Hearthfish** `hearthfish` | Wanderer · any lake: cast inside your own light with oil ≥ 75% | R · night · any | leaper | 32 / 492 g | .12 | 42 / 1.1 kg | 51 / 2.0 kg | 73 / 5.8 kg | 1.72 | 28 × lake valueMult | a coal-glow in its belly that brightens near your lantern | new · P3 |
| 53 | **Quayling** `quayling` | the Landing · cast from the jetty | C · any · any | darter | 14 / 27 g | .10 | — | — | 15.5 cm / 37 g (Keeper cap) | — | 0 (Murk won't buy it) | a quayside minnow with rust-flecked fins and one curious eye | new · P3 (cove only) |

Place-kept fish follow §24's rule: eligible only at their place and condition, rolled as rare with weight × 8, no bait needed (Wick-Worms attract them all). ▲ = a data-only addition to a §24 place (applied in §24, §25.13). Weights use W = k·L³ per body shape (minnow .010, perch .013, crayfish .030, carp .016, koi .015, pike .0075, eel .0016, angler .025, ray .012 incl. tail, puffer .030, jelly .020, ghost .010, sturgeon .006 g/cm³). **Legend rule check** (`roster-v3.mjs`): Matriarch 260 cm vs the Mossmere's longest ceiling 185 cm = 1.41×; Drifting Grove 300 vs 203 = 1.47×; Glass Sovereign 300 vs 208 = 1.44×; Lantern-Swallower 850 vs 370 = 2.30×. New shape needed: `sturgeon` (scutes and a shovel snout, from the leviathan profile; P2). Old Portcullis uses `carp` with long barbels, Vesper Gar uses `pike` with a needle snout, The Namesake and The Footnote share a `marks` pattern.

#### 25.7.7 Fish palettes: off-green, distinct per lake

The "changes" column gives the brief's targets (A3, binding). The "from" values are the pre-palette colours: the palette merge already moved these fish off green (e.g. Mossback 0x585e56, Reedjaw 0x474e58, Gloam Eel 0x161b2a with glow 0xb4c4ff, Prism Minnow glow 0x5cbcff today), so A3 only nudges them onto the targets below.

| lake | fish hue story | changes |
|---|---|---|
| The Mossmere | slate, pewter, rust, ivory | Mossback 0x4f6b4a → slate 0x585e66, rust fins; Reedjaw 0x3e5a4c → slate-blue 0x3e4a5c, ink bars; Weeping Carp 0x5d6e66 → pewter 0x646a74; Dusk Minnow 0x6f8f86 → pewter 0x7a8494; Gloam Eel body 0x14302c → ink 0x16142a, glow 0x6ff5c8 → moon-violet 0xb9a8ff; Matriarch 0x4a5e4f / glow 0x9ff0c0 → bronze 0x6a5a44 / pale moon 0xd8d0ff |
| Sporewood Pools | plum, amber, rose, cream | unchanged |
| Glasswater Vault | indigo, ice, violet; glows **sapphire, not aqua** | every glow in hue 150–190° (0x5ff2ff) → sapphire 0x5cbcff or violet 0xb48cff |
| The Pallid Deep | bone, ink, gold, one oxblood | unchanged |
| the Landing | the Quayling: pewter with rust fins | new |

`validate-data` rule: no fish model colour (body / belly / fin / glow) in the green-teal band. The brief's rule (hue 90–190°, saturation > 0.25) is subsumed by the stricter guard already in the validator (§19.1: hue 65–195° with saturation ≥ 0.15 fails, for fish models, character looks, zone palettes and rarity colours), which stays. Green survives only as a pale lichen fleck in the Mossback's texture (saturation ≤ 0.13).

### 25.8 World and locations

#### 25.8.1 Principles, new place fields and the shared kit

- **Fixed, hand-authored lakes** (§24 decision 3). Variety comes from **conditions × Astir × residents × night × rumours × Far Water**, so knowledge persists and pays. §24's per-descent variety (map variant, A/B twists, awake place-kept species) rolls **per expedition** (at the expedition's first entry into each lake).
- **Places carry the size game:** `holdsGiants` (exactly 3 per lake, not counting P4 secrets), one persistent **resident** at each of those three, and per-place **pressure**.
- **§24's 21 places are kept**, keyed by their ids (`mothers_cup`, `lullaby`, `puffball_vent`, `drowned_greenhouse`, `gill_harp`, `veilwater` · `fallen_chandelier`, `mirror_nave`, `bell_window`, `well_of_ledgers`, `stilled_cascade`, `broken_hymnal`, `burning_glass`, `votive_font` · `the_bottomless`, `long_pier`, `drowned_almshouse`, `chain_garden`, `sunken_belfry`, `bier_barge`, `ferry_slip`). v3's changes to them are data-only (▲) and are applied in §24 itself (§25.13). v3 adds the Mossmere's 8 raft places (§25.8.4) and 4 secrets (P4).
- **Structural changes to §24 (▲):** opened **shortcuts persist across expeditions** (`meta.shortcuts`; the lakes are fixed and every expedition starts at the same spawn, so re-opening the Sundered Span on every Glasswater trip would be a chore). **Lit sister-candles still reset** each expedition, so their oil stays a range decision; Known Places keep their candle's first share free, as in §24. Two sister-candles per lake are flagged `watch` (§25.5.2). The Pallid spawn area "Landing of Last Rafts" is renamed **"Shore of Last Rafts"** (name clash with the Landing). Flame-leaps follow §24 (dawn-only, once a day). Day lengths follow §25.3.2 (calm 180 / 185).
- **Budget:** §25.8.8. No new PointLights (lamps use `water.setLights`, ≤ 6), **one wow happening active per lake**, a low-tier off switch for floor paintings and the night sparkle. **No geometry-moving weather** (Highwater, The Low Breath and the Belfry lift are cut).

**New place fields and rules** (two new rule types and five fields; data on `arena.places[]`, CONTRACT §13.8):

| field / rule | meaning |
|---|---|
| `holdsGiants` | Elders may roll here (§25.7.1); 3 per lake; this place has a resident |
| `giantsKept` | only the place's kept species may roll past the elsewhere clamp and the place's maxClass here (no resident); on the 9 places whose kept rare had no other Elder water |
| `maxClass` | default `trophy` outside giant places; fry water `prize` |
| `tallyAt` · `landmark` | the Tally Post's spot (raft places: a flood-gauge stone in open water, collision r 0.4; §24's places use their stand) · what the trophy camera frames (`data.landmarkOf`: authored on the Mossmere's places; §24's places use their own centre) |
| `dropIn` | a locked target inside obstacle collision (the Cupped Hands' bowl, the Gatehouse Door): inside the rule's 1.6 m lock the cast lands at the target centre at y 0 without the arc, obstacle and open-water tests; the hooked fish is held inside the target (+0.7 m) and drawn only outside collision; its centre is open water (validated) |
| `resident` | **only at the 3 `holdsGiants` places**, persistent in `meta.residents[lake][place] = {species, z}`. Species from the place's favoured list (weights common 1, uncommon 2, rare or kept 3). **z ~ N(1.6, 0.6) truncated to [1.88, 3.6]**: always Trophy or better, **Elder 12.4%, Ancient 1.1%**, mean z 2.27. It shows itself twice per calm, once at dusk and once at night (that is, 2 calm shows + 1 dusk + 1 night; Far Water adds +1 calm show per dawn out, cap +3): a boil, a pass or a leap. A cast within 3 m of a show in the next 8 s gives it a 60% bite chance. Landing it gives the place record and a "Resident" stamp; **a new resident is rolled on your next Set Out to that lake**. A resident not landed re-rolls after **3 in-lake days spent in that lake** (counted across expeditions). A Marked Fish at a place replaces its resident. |
| `tally` | the Tally Post style (flood-gauge stone / notched cap stem / brass ruler / bone tablet) |
| rule `sight` | the place's fish are **visible** and pre-rolled (species and z), drawn at true size. Landing within 1.2 m of one means it bites in 2–4 s; others spook for 30 s. |
| rule `drift` | the bobber drifts along a lane at 1.5 m/s; each seam crossed +0.08 rarity; bites roll during the drift |
| `weather` on rules or species (the brief's `cond`) | live only in a named condition archetype (Hush / Drip / Mist); data names it `weather` because §24's `SPECIES[].cond` already names place states (buff, deed, reflection, plumbBottom, window) |

**One pre-rolled fish primitive** (fishing): `preroll({species, z, pos, path})`, drawn **on top of the water** with a depth tint (the lake plane is opaque). Today's silhouettes are 3 quads circling a slot centre, which cannot carry a per-fish path, length or species shape, so fishing-fx gets a per-fish instance buffer (position, heading, length, species-tinted silhouette; ≤ 10 live, +1 call) and is the **one owner** of every sign and pre-rolled fish; water only adds the ripples and wakes fishing asks for. A resident's *leap* is a short-lived `createFish` model inside the same +1. It drives rise rings, boils, glow trails, residents, `sight` places, Moonfall, the Mirror Nave's reflections and Marked Fish. One implementation serves every "see the big one" moment.

**Depth inside places, every lake:** `world.getDepth` inside a place's water is clamped to `place.water.depth` on raft lakes too (as §24.4 does on foot), so the authored bands hold whatever the recipe's noise says (the Mossmere recipe reads 0.06–0.43 at the Ferry-Market and the Buoy Lights).

**Place footprints are checked against the real arena** (world-layout's collision, validated): no place disc overlaps an island; ≥ 80% of each place's water is open (piers under the Span and the hands are part of their places); dropIn centres are open water; Tally stones stand in open water outside every place.

**Tally Posts.** Each place gets a lake-styled marker on which your best fish there is inked (species glyph, cm, kg), at `place.tallyAt` (raft places) or its stand. It persists across expeditions. Each is a 128×64 canvas sprite built on approach, at most 2 live. *The world remembers your fish.*

**Discovery** (§24.9, kept): within 8 m or casting in → a 1.2 s ink title card, the sound beacon swells, the Journal's Places page fills (+2 Memories, instantly). Mastery (4 catches in one expedition, one Fine+) → +10 and a Known Place.

**Astir:** §24's daily Astir place in the walking lakes, plus one Mossmere place per day (new).

**Rumours** (≈ 24, 6 per lake; data `RUMOURS`): three tiers, vague → the place → the condition. Sources: Murk (one per visit when you sell at least one fish; he prefers undiscovered places and unsolved conditions) and the Well of Ledgers' lines (plus Remnants in P4). Pin one at a time (edge marker). Solving one gives +3 Memories and a Journal stamp. Plus **today's rumour** (one per real date, at the Map Table, always naming a `holdsGiants` place and often its resident: "An Elder Velvet Ray turns in the Lullaby", favour +0.3 for that species at that place that day).

#### 25.8.2 Conditions: one system, three archetypes, per-lake looks

Each calm rolls: **none 40% · Hush 20% · Drip 20% · Mist 20%**, seeded by expedition, day and lake (data `CONDITIONS`). Every lake rolls every archetype; none is a lake's identity. Murk names tomorrow's at dawn, and the Map Table shows day 1's for every lake. The build is one fishing uniform set, a particle preset and a fog tweak (≤ 4 draw calls). Nothing moves geometry.

| archetype | effect | Mossmere | Sporewood | Glasswater | Pallid Deep |
|---|---|---|---|---|---|
| **Hush** | favour +0.2 lake-wide, wait × 1.2, `sight` range × 2 | *Mirror Hush* (swell × 0.2, sharp reflections) | *Damp Hush* (the Greenhouse glass fogs, every row glows dimly) | *Clear Hush* (shafts × 1.5) | *Breathless* (ash hangs still) |
| **Drip** | wait × 0.8, commons × 1.3, rhythm places faster | *Drizzle* (300 instanced streaks, 120 on low; the aqueduct coughs every 25 s) | *Spore-fall* (spores × 2 falling; Puffball Vent × 2) | *Shard-chime* (crystals pulse in a chord; ▲ the Stilled Cascade thaws for 40 s) | *Ash-fall* (ash × 2; Breathing Deep × 1.5) |
| **Mist** | rarity +0.08; gloom species may bite in calm at weight × 0.3; sound beacons × 1.5 | *Moonmist* (3 low mist cards; Moonfall lasts 30 s) | *Bloom-haze* | *Prism-fog* | *Pall* (fog × 1.3) |

#### 25.8.3 Night: the big-fish hour in every mode

- **Night Rise:** favour +0.25 on every night cast. Dusk *Last Light*: +0.2.
- **Glowtide visuals:** a water-shader sparkle term (noise × ripple and wake energy × `uGlowtide`, ≈ 8 ALU, 0 draw calls, off on low). Wakes, rain rings, the bobber and a thrashing fish light up. Night fish show as **glow trails**.
- **Night places:** the Buoy Lights (Mossmere, new), `veilwater` (Sporewood), `fallen_chandelier` and `broken_hymnal` (Glasswater), `long_pier` during the Candle Tide and `sunken_belfry` (Pallid).
- On a quiet night (Still, a Lantern still night, the Lantern window's quiet tail, a lamp-watch), gloomlings appear only as ink drifts far out, silhouettes against the glow, and **the camera keeps the sail and fish framings** (the night overview follows `combat.swarmActive`, §25.5.1).

#### 25.8.4 The Mossmere (raft only): 8 places + 1 secret

**Identity:** *the gate and the harbour.* The night the lantern fell, the ferries never left: the harbour drowned with its barges still moored, its bells still hung, its toll-gate still shut. Hushed, iron, tidal. **Palette** (the slate-and-rust rework): pewter-slate water #232b3a, **rust iron #8a4b3a as the leading accent** (chains, bells, buoys, the gate, the bridge), moon-silver #a9b9f0 as the secondary glow (Moonfall), lavender only in the Cupbearer's fins, verdigris only on the cracked bell. Distinct from Glasswater by saturation and value (low-saturation pewter and rust vs saturated sapphire and indigo). **Landmarks:** the Sunken Gate and its leaning toll-tower (N), the **Moon-Eye** ceiling fissure and its silver shaft (NW, over the Ferry-Market at (−21.4, −25.9): an authored crack in `arena.cracks`, read by world-layout before its procedural ones), the **Sluice Veil** (a curtain of water spilling from a broken aqueduct down the E cliff), the Toppled Bridge (W, the in-lake landmark).

**The harbour re-dress (W9, P2).** Today's Mossmere art is still partly the old "drowned high street", which §25.15.3 forbids, and the places need things that do not exist yet. W9 adds: **arch spans and a broken deck** over the Toppled Bridge's four free-standing piers, so Under the Span has arches and the chains hang from the break (+1 call, merged); **the Sluice Veil** as a scrolling water-curtain card down the east cliff with two aqueduct segments, the near one carrying the Cupped Hands' spout (+2); **street lamp-posts become rust bollards and buoy-lanterns** on the islands and the three lamp pylons (the dock-buoy InstancedMesh; the post, arm and hanging-lantern mesh is removed: 0 net); **a leaning toll-tower** on the Sunken Gate (+1). +4 calls, in §25.8.8.

**Signature wow: Moonfall** (P2). Twice per calm (at 25% and 70%), 20 s (30 s in Moonmist), the Moon-Eye shaft swings onto the Ferry-Market. The water there turns **glass-clear** over a drowned **ferry-market**: moored cargo barges, a toll-house clock stopped at the hour of the Fall, cart wheels, bollards and rust buoy-bells, and fish circling at true scale. Its second disc opens over **the Bell Pool**, 20 m away, where the drowned harbour bell lies on the pool's floor with the Matriarch circling it. *Build:* water shader `uClear[2]` discs (x, z, r, k), **each sampling its own cell of one painting atlas** (256² with 2 cells: the market and the bell; 128² cells and radius × 0.7 on low) mapped by the disc's world rect (`MOSSMERE_V3.happening.clear.discs[i].paint`), with view-ray parallax × depth; `water.setClear([{x, z, r, k, paint}])`. P4's Alignment is its own band-mask uniform (`water.setBand`), not a disc. The circling fish are pre-rolled silhouettes drawn as depth-tinted decals on top of the water (§25.8.1). The shaft is the existing additive quad over the authored Moon-Eye crack, swinging 14° toward the Bell Pool. **progression owns the schedule** and emits `moonfall`; world only renders it.

| # | place · `id` | where (x, z) | why it is cool | fish and giants | twist (rule) | class cap | build |
|---|---|---|---|---|---|---|---|
| a | **The Bell Pool** *(legend)* `bell_pool` | (−4, −14) | a drowned harbour bell 9 m down on the pool's floor, revealed by Moonfall's second disc with the Matriarch circling it **at today's rolled weight** | Weeping Carp × 2; the Belled Matriarch (legend rule unchanged) | Moonfall reveal; legend rule | Trophy | existing |
| b | **Under the Span** `under_the_span` | the Toppled Bridge's 3 arch gaps (−36.5, −2.5), (−29.5, 0.5), (−22.5, 3.5) | rust chains hang from the break; fish hold in the arches' shade | Mossback × 2, Reedjaw × 2; **Bridgechain Sturgeon** (kept, Mirror Hush); water 0.45–0.9 (the brief's 0.6–0.9 plus the shallow lip under the broken deck: the night Lampsipper's Elder water) | `targets` lock at 1.6 m on each gap; threading a gap with a Clean Cast: favour +0.3, rarity +0.2 | **Elder (holdsGiants)** | W9's arch spans and deck over the existing piers + merged chain strands |
| c | **The Cupped Hands** `cupped_hands` | (16, 18), stone hands 6 m tall (collision r 2.2) | a giant's hands hold a bowl under the broken aqueduct; when it coughs, the bowl overflows, fry spill, and the big fish wait below | the bowl (r 0.5 `dropIn` target): Dusk Minnow × 3, **Cupbearer** (kept, while full; `giantsKept`); below: Weeping Carp × 2, Reedjaw | `rhythm` 60 s (25 s in Drizzle), 3 s warning (the spout gurgles), 6 s live: in the spill ring (r 2.2–4) wait × 0.5, favour +0.4 | Trophy | **new** geometry: two hands cupping a pool **at water level** (y 0, §24.4's one water plane; no raised surface), the spout hanging from W9's aqueduct segment above it; "overflow" is the spill ring (inside W4, +1 call) |
| d | **The Gatehouse Door** `gatehouse_door` | the flooded threshold at (22, −2.5), 1.4 m disc, 10.5 m from the island's centre (outside its 8.84 m collision) | cast through a drowned door into the dark of a tower | **Old Portcullis** (kept, `giantsKept`), Weeping Carp × 2 | `targets` (`dropIn`, lock 1.6) + §24's `foul` (15% per surge: a clank 0.3 s before a +0.15 spike) | Trophy | the `gatehouse_face` dressing: a 4 m stone wall-face with a flooded door frame on the island's south rim at (22, −3.6) (inside its collision, 0 calls: merged into the island); the tower column art stays |
| e | **The Ferry-Market** `ferry_market` | between the Sisters, (−21.4, −25.9), r 3.2 (moved 4 m off the midpoint so the disc clears both islands) | the drowned market lies 3 m down: barges, the toll-house clock, cart wheels | in Moonfall: 3–5 pre-rolled fish (Candlefin × 2, Weeping Carp × 1.5; one Prize+ guaranteed, 25% one Trophy+); its resident circles among them | `sight` during Moonfall: pick the one you want | **Elder (holdsGiants, in Moonfall)** | Moonfall disc 0 (uClear + its atlas cell) |
| f | **The Sluice Run** `sluice_run` | lane (0, −41) → (0, −29) below the Moss Sluice, starting 8 m from the gate centre (clear of its 5.4 m Descend pill and 6.6 m stone ring) | water pours through the sluice's broken teeth: a lane of white seams | Reedjaw × 2; Gloam Eel × 2 at dusk (`gloomInCalm` at dusk) | `drift` 12 m along the lane | **Elder (holdsGiants)** | pooled foam-seam decals |
| g | **The Lily Maze** `lily_maze` | lee of Mossbell Isle (−40.5, 24.5), r 7.5 (its centre 15 m from the isle, clear of its collision) | notched pads with koi glowing under them like lanterns under snow | Candlefin × 3, Weeping Carp | `sight`: **the size of the glow is the size of the fish**. Open from day 1 at its edge; P4: the Reed Pole lets the raft push into the heart (r 3). | Trophy | existing instanced pads (local density × 2) + glow-buds |
| h | **The Buoy Lights** *(night)* `buoy_lights` | the old channel along the west shore, x −50…−46, z −14…+10 | at night the drowned channel-buoys' lanterns still burn *under* the water, in two rows | Gloam Eel × 2, Lampsipper × 2 | `targets` on the buoy rows, night only: favour +0.2, gloom species × 2 | Trophy | the lake plane is opaque, so the "under-water" lanterns are **on-surface, depth-tinted glow decals** (the pre-roll technique) under 24 small emissive float caps at y ≈ 0 (one InstancedMesh): 1 call |
| S1 | **The Moon Cistern** *(secret, P4)* `moon_cistern` | behind the Sluice Veil, E cliff (58, 4) | you sail straight through the falling water into a round cistern lit by its own moonbeam | its own resident (Reedjaw-weighted) | bites only inside a beam wandering at 0.3 m/s | Elder (a fourth giant place, secret, outside the count of 3) | an arena `shoreNotch` (a 0°, w 10 m, depth 0.8, len 12 m; CONTRACT §13.8) + a veil without collision. Clues: a bubble trail, Murk's rumour, the dock at (49, 6). **Reward: the Reed Pole.** |

The first hour has 8 places to find, solve and record: request 3's raft-only lake is kept, and it is no longer empty. The Mossmere's places live on `ZONES[mossmere].arena.places` (v3 data) with the §24 place schema plus the fields above; its three giant places are `under_the_span`, `ferry_market` and `sluice_run`.

#### 25.8.5 Sporewood Pools, Glasswater Vault and the Pallid Deep: changes to §24's places

All are data changes on §24's own place entries, already written into §24.7 (marked "v3") and listed in §25.13. Giant places: Sporewood `mothers_cup`, `lullaby`, `gill_harp`; Glasswater `fallen_chandelier`, `mirror_nave`, `well_of_ledgers`; Pallid `the_bottomless`, `chain_garden`, `ferry_slip`.

**Sporewood Pools** (*the gardens*, kept growing after the sun went out; warm, drowsy, overgrown; palette plum #2a1a2e, amber #ffb46a, rose #ff7fb0, rare cream mycelium). **Signature wow: The Bloom** (P4, at dusk): the Mother Cap's gills light from stem to crown in 6 s, amber spores fall, and hundreds of fish rise across the reef channels for 20 s (wait × 0.6, favour +0.2). *Build:* an emissive uniform swept by vertex y (0 calls), the existing spore system flipped to falling × 2, rises through `water.addRipple` at 6 per second, one instanced 200-quad glint mesh (1 call).

| §24 place | verdict | v3 change |
|---|---|---|
| `mothers_cup` The Mother's Cup *(legend)* | keep | ▲ `holdsGiants` for non-legend casts (Velvet Ray and Mildew Elders); its breathing made visible (spores rain on the exhale, with a ring of rises) |
| `lullaby` The Lullaby | **modify ▲** | becomes `sight`: sleepers float visibly under a lily-cap canopy, mouths open; a soft cast (charge < 0.5) beside the one you want. ▲ `holdsGiants`. ▲ water 0.4–0.85 (was 0.6–0.85): the sleepers' shallow rim is the Capshell Crayfish's only Elder water. |
| `puffball_vent` The Puffball Vent | keep | `maxClass` Prize (fry water). Fires twice as often in Spore-fall. |
| `drowned_greenhouse` The Drowned Greenhouse | keep | ▲ kept species **The Remembered Sun** on the Lit Row (P4); ▲ `giantsKept`; its lamp `house_lamp` is a watch lamp (32 m from the nearest giant water) |
| `gill_harp` The Gill Harp | keep | ▲ `holdsGiants` while it sings; its music-box notes carry 25 m as a sound beacon (its lamp is **not** a watch lamp: 3 m from giant water) |
| `veilwater` The Veilwater | keep | Hushcap Koi (kept), Mildew Angler × 2; today's-rumour favourite at night; ▲ `giantsKept` |
| *The Seed Vault* `seed_vault` (secret, P4 ▲) | new | through the Rootmat Shallows (needs the Reed Pole); rows of glowing seed-pods. **Reward: Seedlight Glass.** |

**Glasswater Vault** (*the keepers of light*, who could not let go; crisp, echoing, exact; palette indigo #141b46, sapphire #5cbcff (not aqua), violet #b48cff; a full spectrum appears only during the Alignment). **Signature wow: The Alignment** (P4, every 90 s of calm, 15 s): the Orrery ring locks onto the main shaft and the beam splits into a 7-band fan that sweeps the moat. The brightest band is the Burning Glass. The bands open the water through their own band-mask uniform (`water.setBand`, not `uClear` discs, which cannot draw a sweeping fan) at k 0.3, so fish show in the light. *Build:* 3 merged additive quads with a canvas spectrum gradient (1 call); the Orrery already rotates.

| §24 place | verdict | v3 change |
|---|---|---|
| `fallen_chandelier` The Fallen Chandelier *(legend)* | keep | ▲ `holdsGiants` (trench rim, non-legend) |
| `mirror_nave` The Mirror Nave | **modify ▲** | the reflections are pre-rolled fish drawn **at their true size**: pick the biggest reflection. ▲ `holdsGiants`. |
| `bell_window` The Bell-Chapel Window | keep | High Cast perch (no tackle gate); ▲ kept species **The Sexton** during the Struck Hour (P4); ▲ `giantsKept` |
| `well_of_ledgers` The Well of Ledgers | keep | ▲ `holdsGiants` on the bottom ledger (Clean Cast plumb) |
| `stilled_cascade` The Stilled Cascade | **modify ▲** | in Shard-chime the frozen falls thaw for 40 s (a material scroll, no geometry): wait × 0.4, favour +0.3; ▲ `giantsKept` (the Rainglass Darter) |
| `broken_hymnal` The Broken Hymnal | keep | Vesper Gar × 3 at night (P4) |
| `burning_glass` The Burning Glass | keep | P4: folded into the Alignment as the fan's brightest band |
| `votive_font` The Votive Font | keep | `maxClass` Prize; the quick food tap |
| *The Unlit Stacks* `unlit_stacks` (secret, P4 ▲) | new | a door in light-ink under the Ledger Stair that only the Seedlight Glass shows. **Reward: the Tuning Fork.** |

**The Pallid Deep** (*the farewells*: where the kingdom sent its dead, and finally itself; vast, still, reverent; palette near-black #14130f, ember-gold #e8c66a, bone #eae4d3, one oxblood ribbon colour). **Signature wow: The Candle Tide** (P4, from dusk): 600 memorial candle-rafts (200 on low) push off the bone terraces, drift on slow currents and gather around the Bottomless at night. The Long Pier's drifters come 3× as often. *Build:* one InstancedMesh with paths in the vertex shader and flicker in the fragment shader (1 call). The victory "every candle lights gold" reuses the uniform.

| §24 place | verdict | v3 change |
|---|---|---|
| `the_bottomless` The Bottomless *(legend, the finale)* | keep | ▲ `holdsGiants` (non-legend casts); P4: the Underdepth |
| `long_pier` The Long Pier of Names | keep | ▲ kept species **The Namesake** after relighting 3 candle-rafts in a day (P4); ▲ `giantsKept` |
| `drowned_almshouse` The Drowned Almshouse | keep | species on demand (five rooms) |
| `chain_garden` The Chain Garden | **modify ▲** | at the Turn, the Lantern-Swallower passes under the plinth as a 9 m shadow; casting at the chains during the pass: favour +0.6 (replaces weightBias +0.6). ▲ kept **Candlewake Sturgeon** at night (P4). ▲ `holdsGiants`. |
| `sunken_belfry` The Sunken Belfry | keep | no lift (geometry-moving events are cut); ▲ `giantsKept` (the Clapper) |
| `bier_barge` The Bier Barge | keep | ▲ `giantsKept` (the Wax-Bearer) |
| `ferry_slip` The Empty Ferry Slip | keep | at dusk the absent ferry is drawn as a faint additive outline; ▲ `holdsGiants` (a dead end at the lake's edge: the farthest water holds the biggest fish); ▲ water 0.45–0.95 (was 0.85–0.95): the slip's ramp runs up into the shallows, the Ossuary Fry's and the Bonecrook's Elder water |
| The Breathing Deep (sign style) | keep | its domes are live windows (favour +0.4, replacing weight bias +0.5) |
| *The Lantern Hold* `lantern_hold` (secret, P4 ▲) | new | opened by the Tuning Fork's note at the Belfry through a §24 `needs` shape (a walk-grid toggle, nothing moves). **Reward: the Deep Line.** |

#### 25.8.6 P4: Found Relics, Vistas, the Chart, Remnants

- **Found Relics** (found in secrets, never bought; a Shrine category shown as owned): **Reed Pole** `reed_pole` (the Lily Maze heart; the Rootmat Shallows), **Seedlight Glass** `seedlight_glass` (glints from +2 m; the light-ink door), **Tuning Fork** `tuning_fork` (the Belfry note; one extra Moonfall a day when struck at the Bell Pool), **Deep Line** `deep_line` (the **Underdepth**: one cast per legend pool per day in all four legend pools, favour +0.8 with Elders allowed). They give later expeditions reasons to return to earlier lakes.
- **Vistas** (2 per lake): **raise the lantern** (hold 1.5 s at a vista stand). The light sweeps out, places in line of sight get a "?" on the chart, +1 Memory the first time. *There is no sitting and no sketching* (too close to Hollow Knight's bench-and-quill ritual).
- **The Chart** at the Map Table. P3: the static lake outline (from arena data and `walkGridFor`) with discovered places, residents, Marked Fish, rumour marks and best fish. P4 ▲: fog-of-war **inked live as you move** (a 64×64 mask per lake in meta). Never updated at a rest point.
- **Remnants** (optional, 12: 3 per lake): a glinting object, a one-line vignette and a rumour.

#### 25.8.7 Reaching places on foot (unchanged)

§24.2–§24.6 (controls, foot controller, terrain, camera, the three maps) apply unchanged except the v3 edits marked in §24 (§25.13): Shore of Last Rafts, `walk` camera elevation, calm and Arrival Hush values, persistent shortcuts, watch candles.

#### 25.8.8 World budget (in-lake draw calls, high / low)

| item | technique | raft lakes (Mossmere; Sporewood's water) | walking lakes (Glasswater, Pallid) |
|---|---|---|---|
| today's world | — | 30–36 / 24–28 | 30–36 / 24–28 |
| §24 land (walkways, rails, lamps, place and deed props) | §24's own line | — (Sporewood's islands ≤ 12 / 10) | ≤ 20 / 16 |
| Mossmere place props (hands, chains, the gatehouse face, buoy float caps and glow decals) | merged into the ring geometry; one instanced buoy row | +4 / +3 | (inside §24's land line) |
| the Mossmere re-dress (W9: span arches and deck, the Sluice Veil card and aqueduct, toll-tower; bollards replace lamp-posts at 0 net) | merged meshes; one scrolling card | +4 / +3 | — |
| signs | pooled decals + the existing ripple and wake arrays | +2 / +2 | +2 / +2 |
| residents, `sight` fish, glow trails, Moonfall fish | the existing silhouettes and shadow decal, on top of the water | +1 / +1 | +1 / +1 |
| conditions | 1 instanced streak mesh + ≤ 3 mist cards | ≤ +4 / +2 | ≤ +4 / +2 |
| wow happening (one per lake) | §25.8.4–§25.8.5 | +1 / +1 | +1 / +1 |
| Tally Posts | canvas sprites, ≤ 2 live | +2 / +2 | +2 / +2 |
| Moonfall, Glowtide, Alignment light in water | water-shader terms | 0 / off or reduced | 0 |
| **world total** | | **≤ 54 / 42** (Mossmere with W9; Sporewood ≤ 62 / 49) | **≤ 66 / 52** |

**Frame check, the worst case** (night on foot in the Pallid, Lantern swarm, 2 Tally Posts, the Candle Tide): post 15 + water 2 + world 66 + Wick on foot 15 + beached raft (frozen) 4 + Murk (frozen beyond 12 m) 8 + hooked fish 6 + swarm 10 + combat fx 6 = **132 ≤ 150** (CONTRACT §10's frame target, §12.6). The re-dressed Mossmere (≤ 54 / 42) stays 12 under the walking lakes' world line, so this case still bounds every lake. T6 adds this scenario to `tools/perf.mjs`.

### 25.9 Progression and the challenge curve

#### 25.9.1 The tracks

| track | currency / gate | what you see | full by |
|---|---|---|---|
| **Tackle** (Rod, Line, Reel, Creel) | Shells + proof catches | the bench rack; tackle ratings per lake | Rod, Line and Reel T4 ≈ h13.3 (Creel T4 ≈ h16.7) |
| **Outfit** (Chimney, Brazier, Oars, Boots) | Shells | pegs at the bench, oars on the raft | ≈ h14.6 |
| **Waystones** (lake access) | land the legendary + pay the toll once | stones lit in the sea-gate, bollard lanterns, keepsakes, wings opening | Pallid lit ≈ h7.7; the Lantern-Swallower h10–14 |
| **The Landing** | bringing fish home | 48 frames filling and upgrading, 4 legends under the arch, a 6-fish pond, ≈ 150 visible changes | h25–40 |
| **Collection** | catching | 53 species, 143 class seals, the Elder Log (with Ancients), 29 places (+4 secrets), Old Ledger × 48, Tally Posts | h25–40 |
| **Relics** | Memories | the Shrine's ≈ 60 lanterns relight | fishing shelf ≈ h35; Gloom shelf extra |
| **Wicks, boons, baits** | challenges (either-path) | dozing Wicks at the hearth | ≈ h8 (the Wayfarer ≈ h15–20) |

#### 25.9.2 Gates

| gate | requirement |
|---|---|
| next lake | its legendary landed (gate opens for good) → pass through on an expedition, toll once (180 / 420 / 900) |
| tackle T2 / T3 / T4 | Shells + proof (a Mossmere Prize / a Sporewood Trophy or Glasswater Prize / a Glasswater Trophy) + the lake lit (T3 Sporewood, T4 Glasswater) |
| Elders | a `holdsGiants` place or resident + a favour setup + tackle: commons and uncommons are landable as Elders on their own lake's curve; **headline Elders need T3+** (≥ 50% skilled) and stay hard on T4 (Q3) |
| legendaries | the legend rule + tackle: Matriarch fair on T0, Grove T1–T2, Sovereign T2–T3, **the Lantern-Swallower needs Line T4** (with T3 Rod and Reel 5 / 41 / 78%; full T4 27 / 83 / 98%) |
| pond tiers | species named + Shells; tier 3 also needs Glasswater lit |
| The Long Descent | all four Waystones lit |
| secrets | Found Relics (P4) |

#### 25.9.3 Hour 1 / hour 5 / hour 15 (replaces §18.1–§18.3)

| | **Hour 1** | **Hour 5** | **Hour 15** |
|---|---|---|---|
| where | the Landing and the Mossmere (raft): the First Outing + 2 expeditions | Sporewood (raft + walking), a first look at Glasswater | the Pallid Deep, plus Elder and Ancient hunts back in earlier lakes; The Long Descent unlocked |
| tackle | T0 → T1 | T2 set, Line T3 (h5.1) | Rod, Line and Reel T4 (h13.3), outfit III (h14.6) |
| the Landing | the Mossmere board and 1–2 plaques filled, pond cleared, 1 Waystone lit | Mossmere wing ≈ 70% filled, Sporewood wing open, pond 3–5, 2–3 stones lit, ≈ 10 lanterns | all four wings open, ≈ 30–35 of 48 frames filled, 2–3 legends under the arch, pond 6, ≈ 25 lanterns |
| what is hard | reading signs and the float's favour, bite tells, first Prize and Trophy fights on starter tackle (Mossmere rare Trophies on T1: 50 / 89% novice / skilled); headline Elders are a wall (Reedjaw 0% on T1) and become Marked Fish; the Matriarch (56 / 82% on T0) | **conditions and places**: rhythm, sequence and deed twists; finding the kept fish (condition-locked); the runner verb; Trophies one tier under (Mildew Trophy 46% skilled on T1 → 58% on T2 → 88% on T3); Sporewood Elders (12% on T2); the Drifting Grove; **Far Water** decisions; saving 420 for the toll while buying T2 | **Elder recipes** (giant place + favour ≥ 1.2 + T4) and **Elder fights that stay hard on full tackle** (headline Elders 69–82%, Ancients 43–51%, each with an old trick); the Lantern-Swallower (27 / 83 / 98% on full T4); legend rematches that grow +7% each landing; deep-lake Old Ledger records; range on foot (5 min of lantern at night away from sister-candles); long Pallid expeditions under Far Water |
| typical failure | a late hook; holding through a surge; a Prize thrown at its last pip; an Elder Reedjaw snapping on starter tackle | a Trophy snapped one tier under; no kept species (wrong condition); a marked Trophy released at its last night because you stayed for day 5 | an Elder lost to its old trick at 60–80%; an Ancient snapped; guttering far from a candle; the Brittle Line phase |
| land rate of hooked fish | commons ≥ 97%, Prize 77–93%, Trophy 50–89% | Keepers ≥ 95%, Trophy 58–90%, Elder on curve 15–35% | Trophy ≥ 90%, headline Elders 65–80% (T4), Ancients 40–55% |
| new species / hour | ≈ 8 | ≈ 3 | ≈ 1 (53 by ≈ h20) |
| something notable | every ≈ 1 min | every 2–4 min | every 6–10 min at random, plus 1–2 headline goals per session (today's rumour, the Ledger, Old Ledger records, Marked Fish, empty frames) |
| snuffed | ≈ 1–3% (short expeditions, still nights) | ≈ 4–8% (Lantern) | ≈ 6–10% (Lantern, long foot expeditions) |

#### 25.9.4 What keeps it challenging

1. **Big fish are hard and stay hard.** Size scales the fight, Elders get steeper above the cut (per-lake Elder age, a fatigue floor of 0.8) and every Elder plays an old trick. Full tackle lands headline Elders 69–82% and Ancients 43–51%; the return trip to the Mossmere's Elder Reedjaw is still a one-in-five loss on T4.
2. **Giants live in specific places, under specific conditions.** Residents persist until landed; pressure (−0.12 per catch) stops camping; the float shows how good your setup is, so the recipe is learnable rather than luck.
3. **Gear is earned by fishing.** Proof catches make each tier a feat, not a purchase.
4. **Bringing it home is a risk in every mode.** Far Water squeezes oil and Murk's visits, the Live Well clock runs, and oil range matters on foot. Combat adds Scorched oil loss in Lantern and today's full stakes in Gloomtide.
5. **Legend fights are gear-and-skill walls** (the Lantern-Swallower: 27% for a novice even on full T4), and each one grows on rematch.
6. **Visible ceilings:** the Old Ledger mark (z 2.3) for every species, Elders (0.4% at base), Ancients (0.1%), and the dotted "said to reach" (z 3.6), a near-asymptote you see on the page and on the wall.
7. **Opt-in difficulty:** Lantern → Gloomtide → The Long Descent, each with its own records.
8. **Never hopeless:** commons always land, the bare hook is free, Last Flicker comes once a day, pity bites at low oil, Murk's Pity once per expedition, the near-miss card always names the cause and a fix, and Marked Fish come back weakened.

#### 25.9.5 QA pacing targets (replace §18.4 outside The Long Descent)

| metric | target |
|---|---|
| expedition length | median 20 min (3–5 days); a one-day outing ≈ 6 min; a home visit ≤ 2.5 min median |
| first cast and first measuring moment | ≤ 0:30 (the Landing's jetty) |
| first Prize / first Trophy | ≤ 5 min in the Mossmere for ≥ 55% of players / ≤ h1 for ≥ 60% |
| first Elder hooked / landed / headline-predator Elder / Ancient | h1–3 / h2–6 / h6–10 / h12+ (owned by T5) |
| legendaries (first landing) | 0.6–1.2 / 2.5–4 / 5–7 / 10–14 h |
| species named | ≤ 9 in the first 30 min · 44 by h12 · 53 by h20+ |
| notable events | every 1–3 min in hour 1; personal bests ≈ 2–4 per 20-min session until h10 (a 1/n record process; T5 measures); ≥ 1 Trophy per 2 sessions from h3 |
| places | Mossmere 6 of 8 by h2; all 29 by h14; first mastery by h2 |
| fight share | Still 0% · Lantern 4–7% · Gloomtide 28–32% |
| snuffed per expedition | Still ≤ 3% (home by day 3) / 6–10% (past day 4) · Lantern Still + 2 · Gloomtide 25–55% early |
| Memories / h | 120–180 (Still within 15% of Lantern) |
| Shells / h | §25.10.1 (Still +3%, Gloomtide −8%) |
| shortest profitable loop | no loop earns > 1.5× the median Memories/h or Shells/h (T3 checks gate hops, one-day outings, Ledger refreshes, the Pilgrim Salmon, cove fishing) |
| land rates | §25.6.9 per mode (the reel sim runs once per night mode, since combat interrupts fishing) |

### 25.10 Economy

#### 25.10.1 Income and expense per in-lake day (average player, Lantern)

Assumptions: a 5-minute day; a 4-day expedition plus 2 min at home = **10.7 in-lake days per hour**. Fish landed per day include night fishing and fall with depth (longer fights, more walking). Commons go to oil and food first. Shells per sold fish = the lake's sold-species mix × 0.66 × 1.428 (size and class, at the real favour mix, §25.7.3) × ≈ 1.15 (quality), which keeps income per fish equal to today's.

| lake | fish landed / day | eaten or rendered | marked for home | sold | Shells / sold fish | fish Shells | Ledger and bounties | gross | bait and supplies | **net / day** | **net / hour** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| The Mossmere | 5.0 | 1.2 | 0.3 | 3.5 | 17 | 60 | 15 | 75 | 8 | **67** | **717** |
| Sporewood Pools | 4.6 | 1.4 | 0.3 | 2.9 | 35 | 102 | 25 | 127 | 16 | **111** | **1,188** |
| Glasswater Vault | 4.2 | 1.8 | 0.3 | 2.1 | 69 | 145 | 40 | 185 | 38 | **147** | **1,573** |
| The Pallid Deep | 3.8 | 1.8 | 0.3 | 1.7 | 114 | 194 | 60 | 254 | 55 | **199** | **2,129** |

Mode adjustments: Still +3% (no combat kit); Lantern as shown (combat kit ≈ 60–120 Shells per expedition, roughly offset by Warden Shells); Gloomtide −8% (more kit, less fishing time). Long expeditions render more of the catch under Far Water (§25.3.3); the balance sim (T3) owns the per-day curve. **Satiety:** drain 0.10 × 0.5 × zone, so 15 per Mossmere day; one eaten common keeps you ≥ 60% (**Well-fed**: reelSpeed +0.08, sweetZone +0.01, +1 dawn mend in combat modes; data `BALANCE.wellFed`). There is never a starvation penalty.

#### 25.10.2 Cumulative Shells and the tackle timeline (check)

Lake time spans (average player): Mossmere 0–1.5 h, Sporewood 1.5–4.5 h, Glasswater 4.5–8.5 h, Pallid 8.5 h+. Cumulative net (incl. the 20 starting Shells): 1,096 at h1.5 · 4,660 at h4.5 · 10,952 at h8.5 · 22,661 at h14 · 26,919 at h16. Purchases in a sensible order, each placed at the first moment income covers it:

| hour | cumulative net | purchase | cumulative spend |
|---|---|---|---|
| 0.6 | 450 | T1 Line, Rod, Reel, Creel | 430 |
| 0.8 | 594 | Outfit: Chimney I + Brazier I | 590 |
| 1.0 | 737 | Heartmoss × 2 | 670 |
| 1.2 | 880 | Sluice toll | 850 |
| 1.7 | 1,333 | T2 Line (proof: a Mossmere Prize) | 1,300 |
| 2.1 / ≈ 2.4 / 2.7 | 1,808 / 2,165 / 2,521 | T2 Reel, T2 Rod, T2 Creel | 1,750 / 2,200 / 2,470 |
| 2.9 | 2,759 | Feather Fly, Glimmer Spoon, Bone Jig | 2,720 |
| ≈ 3.0 | 2,878 | Glowcap × 2 | 2,900 |
| 3.2 | 3,115 | Outfit: Oars I + Boots I | 3,060 |
| ≈ 3.4 | 3,353 | Pond tier 2 | 3,360 |
| 3.8 | 3,828 | Glasswater toll | 3,780 |
| 4.2 | 4,303 | Outfit: Chimney II + Brazier II | 4,260 |
| ≈ 5.1 | 5,603 | **T3 Line** (proof: a Sporewood Trophy) | 5,660 |
| ≈ 6.0 / ≈ 6.9 | 7,019 / 8,435 | T3 Reel, T3 Rod → the Sovereign at 85 / 98% | 7,060 / 8,460 |
| ≈ 7.1 | 8,749 | Prism Moth × 2 | 8,800 |
| ≈ 7.7 | 9,693 | Pallid toll | 9,700 |
| ≈ 8.4 | 10,794 | Moth Popper, T3 Creel | 10,800 |
| 10.0 | 14,145 | **T4 Line** (proof: a Glasswater Trophy) | 14,000 |
| 10.3 | 14,784 | Last Candle × 2 → Lantern-Swallower attempts (5 / 41 / 78%) | 14,640 |
| 11.8 / 13.3 | 17,977 / 21,171 | T4 Reel, T4 Rod (27 / 83 / 98%) | 17,840 / 21,040 |
| 13.5 | 21,597 | Outfit: Oars II + Boots II | 21,520 |
| 14.6 | 23,938 | Outfit III × 4 | 23,920 |
| 15.2 | 25,216 | Pond tier 3 | 25,120 |
| 15.8 | 26,493 | Lantern Lure | 26,320 |
| 16.7 | 28,409 | T4 Creel | 28,240 |

The cumulative net is recomputed from the income table (20 + Σ net/hour × time in each lake; the brief's printed column drifted by up to ≈ 110 Shells from its own table). **≈** marks the nine purchases that income covers a moment after the printed hour (at h2.43, 3.02, 3.41, 5.14, 6.03, 6.92, 7.13, 7.70 and 8.40: every one within 0.05 h; validate-data checks the hours to ± 0.1 h).

Income and the main sinks (28,240) meet at ≈ h16.7. Post-game Shells go to legend rematch baits and a **cosmetic shelf** at Murk (raft pennants, cloak dyes, lantern-glass tints, 200–1,500 each, ≈ 6,000 in all). These never touch fishing power.

#### 25.10.3 Price list (replaces §13.2's Gear tab and adds to §13.3–§13.4)

| item | price |
|---|---|
| tackle T1 / T2 / T3 / T4 per slot | Rod, Line, Reel 120 / 450 / 1,400 / 3,200 · Creel 70 / 270 / 840 / 1,920 (catalogue 18,610) |
| outfit (4 items × 3 levels) | 80 / 240 / 600 each (catalogue 3,680) |
| lures (permanent) | Feather Fly 40 · Glimmer Spoon 90 · Bone Jig 120 · Moth Popper 260 · Lantern Lure 1,200 (a lost lure costs 25% to replace) |
| baits | as today (Mire Worms 8 … Glass Larvae 48; × baitMult per lake) · Wick-Worms 30 (§24) · Cut Strip free (from a fish) |
| legend baits (per attempt) | Heartmoss 40 · Glowcap Bulb 90 · Prism Moth 170 · **Last Candle** 320 (was Drowned Marrow) |
| tolls (once per lake, forever) | 180 / 420 / 900 |
| supplies (× supplyMult; oil × Far Water from day 5) | oil flask 18 · oil cask 50 · moss cake 14 · mushroom loaf 38 · Stake Lantern 40 (§24) · **Murk's Chum** 30 (1 per visit) · combat modes only: Wax Patch 45, Flare Powder 30 |
| combat kit (per expedition, combat modes only, at 40% of today's prices) | Searing Mantle 22 / 56 / 120 / 224 · Moth-Dust Lens 36 / 80 / 168 · Flint Striker 22 / 60 / 132 · Barnacle Hull 44 / 100 / 208 · Ember Hearth 104 / 240 |
| moved to persistent tackle and outfit (removed from the run shop) | Ashwood Rod, Whalebone Tip, Braided Gut, Silverthread, Brass Spool, Whisper Drag, Woven Creel, Glimmer Spoon, Thick-Glass Chimney, Rendering Brazier, Long Oars, Cork-Soled Boots · cut: Trembling Feather, Frost-Moss Lining (the Torn Ledger relic covers sellMult) |
| the Landing | keep-pond tier 2: 300 · tier 3: 1,200 |

The Tide Chart supply is replaced by Murk's Chum (§25.6.1).

#### 25.10.4 Memories (replaces §17.1 outside The Long Descent)

| source | Memories | banked |
|---|---|---|
| new species | 3 | instantly |
| class first per species | Prize 1 · Trophy 4 · Elder 12 | instantly |
| first Ancient in each lake | 10 | instantly |
| first mount per species and class (hung or kept in the pond) | Prize 2 · Trophy 6 · Elder 15 | on return |
| first release per species and class | Prize 1 · Trophy 3 · Elder 8 | instantly |
| place discovered / mastered | 2 / 10 | instantly |
| rumour solved · Old Ledger beaten | 3 · 5 | instantly |
| legendary: first landing / rematch | 15 / 8 | instantly |
| challenges (48) | 1,171 in all (today's 831 + tier IV 185 + tier V 155; the brief printed 1,170) | instantly |
| **expedition tally** | 3 per dawn reached in the lake · 1 per still night (Still, the First Outing, a still Lantern night, a lamp-watch) or **4 per Lantern swarm night** (Gloomtide: `nightsSurvived × (3 + zoneIndex)`) · 10 per lake crossed (only if a full calm follows in that lake) · 2 per Ledger request | on return (× 0.5 if snuffed) |

**Mid-game hour (≈ h5):** species 9 + class firsts 13 + places 9 + rumours 3 + Old Ledger 4 + first mounts 8 + first releases 3 + tally 64 (Lantern: 12 + 10 + 2 = 24 per 4-day expedition × 2.67; Still: 18 × 2.67 = 48) + challenges ≈ 25 + legends ≈ 5 = **≈ 143/h in Lantern, ≈ 127/h in Still** (−11%, inside the ±15% target).

**Totals and the relic curve.** The one-time pool is ≈ 4,550 Memories (challenges 1,171 · species 159 · class firsts 804 · first mounts 1,089 · first releases 568 · places 348 · rumours 72 · Old Ledger 240 · legends 60 · Ancients 40; the brief's ≈ 4,600 counted the Lampwarden's Elder rewards, −35), plus the tally (≈ 48–64/h). Estimate: ≈ 2,700 earned by h15 and ≈ 4,800 by h35 (the Elder-heavy third of the pool comes late). **Relic shelves** (data: `RELICS[].shelf`, costs in `MEMORIES_V3.shelves`): the **Fishing & Exploration shelf** (kept relics plus §24's and the new ones, ≈ 46 levels) costs ≈ 8,800 at today's prices; **× 0.55 → ≈ 4,840**, so its first 25 levels (≈ 2,000) arrive by ≈ h12 and the shelf completes ≈ h35 if nothing is spent on the Gloom shelf. The **Gloom shelf** (Salt-Glass Lens, Stub of the First Wick, Grandsire's Tinderbox, Barnacle Cloak, Ember in Resin; ≈ 14 levels) costs ≈ 3,125 × 0.7 ≈ **2,190**, an extra sink for combat players (swarm-night tally, Wardens, 9 Gloom challenges ≈ 220). The Shrine's lantern count is the total relic levels, **read from data** (≈ 60). **Remembrance's** `memMult` multiplies the **expedition tally only**.

**P1–P2 (before the expedition tally exists):** discoveries bank instantly as above (new species, class firsts, first releases, places, rumours, Old Ledger); today's death screen still pays v1 `memoriesFor(summary)` but **without its species row** (already paid) and with **its nights row replaced per night by the tally's values** (a still night 1, a Lantern swarm night 4, a Gloomtide night v1's `nightBase + perZone`). Relic costs, shelves and the relic cuts stay v1 until P3, when `RELICS_V3` and the refund land together (data `MEMORIES_V3.interim`).

**New relics:** *Measuring Cord* `measuring_cord` (60 / 180: L1 the bite tell also shows an estimated length; L2 Prize+ hooks get +1 pip) · *Murk's Spyglass* `murks_spyglass` (150: forecast two days ahead in every lake; the Map Table marks known residents) · *Rumour Shell* `rumour_shell` (120 / 300: +1 rumour tier per Murk visit). *Second Wick* relights once per expedition in every mode. Seven Knots is halved (lineStrength +0.05 per level). **Cut and refunded on migration:** Murk's Old Debt, Waystone: Sporewood / Glasswater / Pallid Deep.

#### 25.10.5 Challenges: 48 (rewrites, the Gloom tab, tier V)

"Run" or "descent" scope = expedition scope. Rewrites (ids unchanged):

| # | challenge | v3 |
|---|---|---|
| 2 | First Dawn `first_dawn` | "Spend your first night out" (any mode) |
| 4 / 11 | Three Long Nights `three_nights` / The Long Vigil `long_vigil` | nights out in one expedition, any mode (11 still unlocks Tallow) |
| 9 | Unwarded `unwarded` | either path: silence a Warden **or** land 3 night-only species at Prize or better (Ashwick) |
| 10 / 25 / 26 | reach a lake (`down_the_sluice`, `into_the_vault`, `pallid_arrival`) | "Light the … Waystone" |
| 15 | Night Angler `night_angler` | land 3 fish during a single night (any mode) |
| 19 | Heavyweight `heavy_catch` | "Land a non-legendary fish over 15 kg" (Shimmerfly bait) |
| 21 | Murk's Favourite `shells_1000_run` | earn 1,000 Shells in one expedition |
| 22 | What the Flame Remembers `kindle_one` | either path: Kindle a weapon **or** raise an Angler boon to level 5 (Gambler's Wick) |
| 28 | Many Flames `many_flames` | "Land a Trophy in the Glasswater Vault with 3 different Wicks" |
| 29 | The Light Comes Up `light_comes_up` | "Land the Lantern-Swallower" |
| 30 | The Complete Chronicle `complete_chronicle` | 53 names (every species in the build) |
| §24: 33 / 36 / 39 | Four Shared Flames / The Long Way Round / Every Candle in the Vault | 33 and 39 per expedition; 36 becomes "Open 3 shortcuts" (they now persist) |
| §24: 40 | Every Still Place | master every place in the three lower lakes (21 places); unlocks the Wayfarer |

**Gloom tab** (combat-only, combat rewards only; 9): 5 Unclenched, 8 Gloombreaker, 12 Untouched, 13 Bonfire Night, 14 Full Flame, 24 Lamplighter's Vengeance, 27 Four Silences, §24's 37 Held the Crossing, 38 Far From Any Candle. The other tabs are Fishing (the remaining tiers I–III), Paths (§24's tier IV minus 37 and 38) and The Measure (tier V).

**Tier V *The Measure*** (new, 8):

| # | challenge · `id` | goal | reward |
|---|---|---|---|
| 41 | First Prize `first_prize` | land your first Prize | +5, reveals Measuring Cord |
| 42 | First Trophy `first_trophy` | land your first Trophy | +10 |
| 43 | First Elder `first_elder` | land your first Elder | +20 |
| 44 | Ten Trophies `ten_trophies` | land 10 Trophies | +15, reveals Rumour Shell |
| 45 | A Full Board `a_full_board` | a Prize of every non-legendary species in one lake | +30, the Knotted Rod Tassel `rod_tassel` (cosmetic) |
| 46 | Elders of Every Water `elders_everywhere` | an Elder in every lake | +40 |
| 47 | Older Than the Ledger `old_ledger_five` | beat 5 Old Ledger records | +20, reveals Murk's Spyglass |
| 48 | Brought Home `brought_home` | bring 3 marked fish home from one expedition | +15 |

(The brief names 41–44; the names of 45–48 are the data's.) §24's tier IV ids: 33 `shared_flame`, 36 `the_long_way_round`, 37 `held_the_crossing`, 38 `far_from_any_candle`, 39 `every_candle`, 40 `every_still_place`.

### 25.11 Retention hooks

| hook | rule | why it pulls |
|---|---|---|
| **The empty frame** | one frame per species on the Long Wall, a "?" until named, an ink silhouette until filled, a seal that upgrades Prize → Trophy → Elder (gold thread for an Ancient) | there is always a visible gap on the wall until the collection is complete |
| **Marked Fish: "still out there"** | escaped Trophy+ fish persist (≤ 6) at their place, with their size and progress, and come back weakened | the strongest one-more-expedition hook: "the 131 cm Reedjaw that broke your Braided Gut" |
| **Residents** | three giants per lake that stay until you land them (or 3 in-lake days pass), shown on the Map Table | a named target waiting at a known place |
| **Far Water** | each dawn out improves the water and raises the cost of the way home | "one more day" is a real decision every expedition |
| **Old Ledger records** | one figure per species at z 2.3; Murk's bell rings across the lake when you beat it; your name is chalked on his barge at home | concrete targets anchored to a character |
| **Today's rumour** (real date) | one Elder target per calendar day at the Map Table, always at a giant place, favour +0.3 there | a reason to play today |
| **Murk's Ledger** | 3 persistent requests (class, variety, condition, release, bring-home, Old Ledger); **one refreshes per completed in-lake day**, a lapsed slot after a real day; combat requests only in combat modes (data `LEDGER`) | medium-term goals that survive any snuff |
| **Rumours** | tiered (vague → place → condition), one pinned | the treasure map to places and kept fish |
| **The forecast** | Murk names tomorrow's condition ("Drizzle in the Mossmere tomorrow: the stone hands overflow every 25 s") | plan the next expedition before you leave this one |
| **Tally Posts** | your best fish inked on every place's post | "the world remembers your fish" |
| **Proof catches and the test buoy** | the Homecoming card names the next tier's proof and price; new tackle can be felt on the test buoy at once | gear progress always has a fishing goal and an immediate payoff |
| **Legend rematches** | each later landing +7% (cap × 1.5), with a growth line | bosses worth fighting again, with melancholy |
| **Collection** | 53 species, 143 seals, the Elder Log with Ancients, 29 places (+4 secrets), Old Ledger × 48 | the long tail |
| **The Landing grows** | ≈ 150 visible changes (§25.4.4) until the end | progress you can walk around in |
| **The Long Descent** | today's roguelite, with its own records | the prestige run for request-2 players |

In-lake bounties (§15) stay, re-weighted to ≈ 85% fishing templates (combat templates only in combat modes, §25.5.3); Murk's 3-slot Ledger is the persistent layer above them.

### 25.12 Supersession table: what happens to §1–§24

**Kept** = unchanged in v3 · **modified** = the section stands except for the listed change, and the §25 rule wins where they differ · **replaced** = the §25 rule replaces the section outside The Long Descent (inside it, the old section still applies) · **cut** = gone in every mode. Global renames apply everywhere in §1–§24 without further edits: *the Pale Leviathan* → **the Lantern-Swallower** (id `lantern_swallower`), *Drowned Marrow* → **Last Candle** (id `last_candle`), *Landing of Last Rafts* → **Shore of Last Rafts**, run / descent scope → expedition scope (§25.0.3).

| § | section | verdict | change | §25 rule |
|---|---|---|---|---|
| header | vocabulary | modified | add the v3 terms; keep every existing term; Shells are persistent outside The Long Descent; Waystones mean "lakes you can start an expedition in" | §25.0.4 |
| 1 | vision & pillars | **replaced** (premise and tone kept) | ranked pillars; loop sentence "set out, find remarkable places, land remarkable fish, bring them home" | §25.1 |
| 2.1 | the calm, moment to moment | modified | mote columns → six signs; Murk's lamp is a lantern, not green; the catch card adds Mark for home and the favours | §25.6.1, §25.6.8 |
| 2.2 | the Gloomtide, moment to moment | modified | a swarm only in combat modes (Lantern window, Gloomtide whole night) | §25.5.1 |
| 2.3 | per day | **replaced** | 180 (185) / 20 / 90 / 10 s, +30 s Arrival Hush | §25.2.1, §25.3.2 |
| 2.4 | per run (a descent) | **replaced** | out-and-back expeditions; the descent survives as The Long Descent | §25.3, §25.3.7 |
| 2.5 | meta | modified | persistent tackle, outfit, Shells, places, shortcuts; Waystones = sea-gate stones; Journal 53 | §25.3.4, §25.3.5 |
| 3.1–3.2 | controls | modified | Landing walking (§24 controls), tap-to-walk in the hub, the station pill, long-press on the float (favour list), tap the reel icon to cycle the drag preset (Reel T2+); no new mid-fight inputs; cutting stays "hold movement 0.6 s" | §25.4.2, §25.6.1, §25.6.5 |
| 3.3 | pointer priority | modified | in the hub: station glyph (tap-to-walk) → Murk's barge → fishing (jetty cast); no zap | CONTRACT §13.1 |
| 3.4 | accessibility | kept | bite tells are readable with sound off; the float uses notches, not colour | §25.6.4 |
| 4.1–4.2 | raft handling, anchoring | kept | — | — |
| 4.3 | arenas and the depth recipe | modified | + the `COVE` arena (R 42, layout `cove`, `shoreNotch`), not in `ZONES` | §25.4.1 |
| 4.4 | the four arenas | modified | Mossmere `arena.places` (8) and the buoy-lantern row; a Homeward Waystone per lake (≥ 25 m from spawn) | §25.8.4, §25.3.1 |
| 4.5 | how the arena creates decisions | modified | spots → signs and places; Murk on days 1–2 then odd days | §25.6.1, §25.3.3 |
| 4.6 | docks and gate | modified | gates open for good; Murk's docks kept; the Homeward stone | §25.3.1 |
| 5.1 | aim and the cast meter | kept | the Clean Cast also gives favour +0.1 | §25.6.2 |
| 5.2 | which fish bites | modified | favour μ and place caps feed the roll; z is rolled on the bite | §25.7.1, §25.7.2 |
| 5.3 | waiting, bite, hook window | modified | class bite tells; let it pass; Prize+ window +10%; hook-hold pips | §25.6.4 |
| 5.4 | species | modified | 32 → 53 with `size {L50, sigma, k}`, `family`, recolours, resizes, renames | §25.7.6 |
| 5.5 | the reel model | modified | size scaling before `createReel` with Elder age, step and stamina; stamina × 1.4; easing by load; fatigue clock (Elder floor 0.8); old tricks; Rod shock; drag presets; runner (P3) and sulker (P4) | §25.6.5 |
| 5.6 | legendaries | modified | authored sizes ≥ 1.4× the lake's longest; +7% growth per landing; Still and Lantern snags; legend rule unchanged | §25.7.2, §25.5.6 |
| 5.7 | feeding spots | **cut / replaced** | mote columns cut → six signs; Tide Chart → Murk's Chum | §25.6.1 |
| 5.8 | weight and quality | **weight replaced**, quality kept | stretched z model; value / food / oil from z (× 0.66); `sizeK` cut | §25.7.1, §25.7.3 |
| 5.9 | night fishing | modified | Night Rise in every mode; the slack budget only matters in combat modes | §25.8.3 |
| 5.10 | `fishing.view` | modified | + `favour`, `sizeClass` (after the first breach), `pips`, `biteTell` | §25.6.1, CONTRACT §13.7 |
| 6.1 | day phases | modified | 180 (185 foot lakes) / 20 / 90 / 10; +30 s Arrival Hush on expedition day 1 and after a gate; no clock at the Landing | §25.3.2 |
| 6.2 | drains | modified | the oil context table (raft / foot / candle × calm / dusk / night; raft night 1.0 in all modes) and Far Water | §25.3.3 |
| 6.3 | the light | kept | guttering keeps a 2.5 m light | §25.3.2 |
| 6.4 | damage, i-frames, armor | modified | Embers only in combat modes; starvation cut | §25.5.1, §25.10.1 |
| 6.5 | healing | modified | satiety → Well-fed (+1 dawn mend in combat modes) | §25.10.1 |
| 6.6 | warnings | kept | — | — |
| 6.7 | death and Second Wick | **replaced** | Snuffed (oil only in Still and Lantern; Embers too in Gloomtide), Scorched in Lantern; wake at the Landing's hearth; Second Wick once per expedition | §25.3.2, §25.5.1 |
| 6.8 | anti-frustration | kept | plus Murk's Pity once per expedition | §25.9.4 |
| 7 | night swarm | kept (demoted) | night-mode multipliers on `difficultyFor`, `swarmWindow(k)` (Lantern k 0.05 → 0.50), the Lantern Warden cadence, fodder → oil in Lantern, no snaps or hooked theft in Lantern, Heat arrival offsets | §25.5.1, §25.3.1 |
| 8.1–8.4, 8.6 | lantern combat | kept | aura ring hidden in calm and dawn; Flare and Embers hidden in Still; Burn shows as *Relight* below 25% oil | §25.5.7 |
| 8.5 | oil through the night | modified | outside The Long Descent the passive burn follows the oil context table (raft night 1.0, foot 1.4, inside a candle's light 0.7) × the Far Water night factor; the table's burn column stays for The Long Descent | §25.3.3 |
| 9.1 | fish → Shells, food, oil | **replaced** | value / food / oil from z | §25.7.3 |
| 9.2 | the creel is your battery | modified | the creel is carry capacity with Live Well slots and nights; Trophy-or-Toll → Mark for home | §25.3.3, §25.6.6 |
| 9.3 | daily budget | **replaced** | the oil table, Far Water and the per-lake income table | §25.3.3, §25.10.1 |
| 10.1–10.2 | XP, offers, rerolls | modified | XP per mode; the Angler-offer cap; banked level-ups; deep-start picks | §25.5.4, §25.3.1 |
| 10.3–10.6 | weapons, Kindles, passives, archetypes | kept (combat modes) | Kindles only in combat modes; the Angler pool +6 boons | §25.5.4 |
| 11 | characters | modified | quirks gain fishing halves (incl. the Wayfarer); either-path unlocks; Ashwick's Gloom-fed variant does not exist | §25.5.5 |
| 12.1 | the checklist | modified | 30 → 48 (+§24 tier IV, + tier V *The Measure*), a Gloom tab (9), rewrites | §25.10.5 |
| 12.2 | challenge types → bus sources | modified | expedition scope; new types for tier V | CONTRACT §13.5 |
| 13.1 | Murk's schedule | modified | in-lake days 1 and 2, then odd days; at home between expeditions; lamp warm white | §25.3.2, §25.3.3, §25.4.5 |
| 13.2 | shop tabs, upgrades | modified | the Gear tab moves to the Gear Bench (Tackle screen); the UPGRADES table becomes TACKLE / OUTFIT / LURES and the combat kit (per expedition, combat modes, 40% prices); Trembling Feather and Frost-Moss Lining cut | §25.4.2, §25.6.6, §25.10.3 |
| 13.3 | supplies | modified | Tide Chart → Murk's Chum; Wax Patch and Flare Powder combat modes only; oil × Far Water from day 5 | §25.10.3 |
| 13.4 | baits | modified | + Cut Strip; Drowned Marrow → Last Candle; `weightBias` → favour | §25.6.3 |
| 14 | zones and gates | modified | gates open for good; toll once; Waystones lit by legend + toll; the crossing tally rule; `COVE` (not in `ZONES`) | §25.3.1 |
| 15 | bounties | modified | in-lake bounties ≈ 85% fishing templates (combat templates only in combat modes) + Murk's 3-slot persistent Ledger; in-lake bounties pay Shells only (the old +2 Memories per bounty is replaced by +2 tally per Ledger request) | §25.11, §25.5.3, §25.10.4 |
| 16 | Journal | modified | ruler, class seals, field notes and best setup from your own catches, Elder Log, places page, rumours, mount book; a lake perk needs a Prize of every non-legendary species in that lake (= a completed wing); the first-catch Shells, the half-lake +10 and the 10-catch card +2 stay (outside the §25.10.4 pool estimate, ≈ +136 one-time) | §25.7.4, §25.4.4 |
| 17.1 | Memories | **replaced** | instant Memories + the expedition tally (crossing rule) | §25.10.4 |
| 17.2 | relics | modified | shelves (× 0.55 / × 0.7); new relics; lantern count from data; `memMult` on the tally only; Old Debt and Waystone relics cut and refunded; Seven Knots halved | §25.10.4 |
| 17.3 | Waystones and the Kindling Draft | **replaced** | Waystones = sea-gate stones; Descent Purse cut; banked levels → deep-start Boon picks; the Kindling Draft kept in Gloomtide (non-Angler offers only) | §25.3.1 |
| 17.4 | records | modified | extended per species, per place, Elder Log, Old Ledger, legend growth | §25.7.4 |
| 18.1–18.3 | runs 1 / 5 / 10 | **replaced** | first session, mid-game session, hour 1 / 5 / 15 | §25.2.2, §25.2.3, §25.9.3 |
| 18.4 | QA targets | **replaced** (kept for The Long Descent) | v3 QA pacing targets | §25.9.5 |
| 19 | art direction | modified | the palette rule stays (validator guard hue 65–195°, sat ≥ 0.15); fish recolours; the Mossmere as a rust-and-iron harbour; the Landing palette; Murk off green (§19.1's "Old Murk's sage lamp" trace and §19.7's Murk colours become A10's: the only green left is bell verdigris); camera presets sail 24° / 15 m / aimY 1.4 / fov 52, fish 28° / 13 m, walk 34°, plus `trophy`, `cove`, `gate`, `wall`, `hang`, `pond`, `setout`, `vista`; per-lake hue pairs with verdigris ≤ 2% | §25.7.7, §25.8.4, §25.4.5 |
| 20 | audio | modified | measuring cord ticks and class chimes, seal stamp, bite-tell sounds, Night Rise motif, Stillnight bed, cove ambience, Homecoming and mount stings, sign sounds, condition loops; no "descend" sting on hub transitions | §25.14 (Au1–Au3) |
| 21 | UI | modified | day HUD by mode; the float's favour; Far Water and Live Well readouts; new screens Set Out, Tackle, Homecoming, Snuffed, near-miss card, measuring overlay, mount and pond dialogs; the title becomes the boot overlay over the Landing; Murk's edge marker (`--mk-merchant`) and portrait lamp turn warm white with A10, and the `merchant` tip reads "Sail to his lantern"; edge markers point at signs, residents and the Homeward stone instead of spots | §25.5.7, §25.14 (U1–U15) |
| 22 | originality | modified | + §25.15.3; renames (Last Candle, the Lantern-Swallower); the Mossmere's harbour re-theme | §25.15.3 |
| 23.1 | who reads what, `getStats`, `createRun` | modified | v3 rows added; `createExpedition` replaces `createRun` outside The Long Descent (copies `meta.tackle` and `meta.outfit` into stats via `getStats`); flow `hub` | §23.1, CONTRACT §13 |
| 23.2–23.3 | optional extensions, debug hooks | modified | v3 fields read defensively; v3 debug hooks | CONTRACT §13.11 |
| 24 | exploration on foot | kept (owner), **edited in place** | calm 180 / 185 and a 30 s Arrival Hush in v3; shortcuts persist; lit sister-candles reset per expedition; 2 `watch` candles per lake; "Shore of Last Rafts"; place fields `holdsGiants` / `maxClass` / `resident` / `tally`; rules `sight` and `drift`; 4 kept-species additions (P4); `walk` camera 34°; a static Chart (P3) and fog-of-war (P4); 3 secrets (P4) | §25.13 |
| App. A | balance sim | modified | the expedition and fishing-economy model with per-mode profiles (T3); the reel sim becomes `reel-v3-sim.mjs` (T1); the pacing sim (T5) | §25.14 (T1, T3, T5) |
| App. B | the foot profile | kept | re-run with v3 day lengths when T3 lands | §25.14 (T3) |

### 25.13 §24 sync table: the edits made in §24

Every edit is marked "v3" in §24. Ids are unchanged everywhere (saves and data keep them); only display names and numbers move.

| §24 location | before | after (v3) | why |
|---|---|---|---|
| intro | — | a note that v3 edits are marked in place and listed here | traceability |
| §24.0 #10, §24.1 calm row, §24.11 calm and Arrival Hush rows | calm 120 s; Arrival Hush +10 s Sporewood, +30 s foot lakes | v3 expeditions: calm 180 s (185 s in Glasswater and the Pallid Deep), +30 s Arrival Hush in every lake on expedition day 1 and the first calm after a gate; §24's values stay for The Long Descent | §25.3.2 day lengths |
| §24.1, §24.5, §24.6 (Pallid pieces, Murk's docks, candles, the Glasswater descent), §24.8 vigil grounds | "Landing of Last Rafts", "the Landing", "the Pallid landing" | **Shore of Last Rafts** (ids `pd_landing`, `landing_lamp` unchanged) | name clash with the Landing (the hub) |
| §24.1 saving | `run.flags.pos` | v3 expeditions save `run.pos` (CONTRACT §13.2); restore reads `run.pos ?? run.flags.pos` | one position field for expeditions and the hub |
| §24.5 camera table | `walk` elev 40° | **34°** (portrait 44° and `walkNight` unchanged) | §25 camera presets (§19 row of §25.12) |
| §24.6 Pallid finale flow, §24.7 the Bottomless, §24.8 the finale on foot | the Pale Leviathan; Drowned Marrow | **the Lantern-Swallower**; **Last Candle**; in Still and Lantern its Grasping Dark becomes two telegraphed snags | renames; §25.5.6 |
| §24.7 Sporewood places | — | `mothers_cup` `holdsGiants` (non-legend) and visible breathing; `lullaby` becomes `sight` (soft cast, charge < 0.5) and `holdsGiants`; `puffball_vent` `maxClass` Prize and × 2 in Spore-fall; `drowned_greenhouse` + The Remembered Sun (P4); `gill_harp` `holdsGiants` while it sings, 25 m beacon; `veilwater` Mildew Angler × 2 and today's-rumour favourite at night | §25.8.5 |
| §24.7 Glasswater places | — | `fallen_chandelier` `holdsGiants` (trench rim); `mirror_nave` reflections are true-size pre-rolled fish, `holdsGiants`; `bell_window` + The Sexton (P4), no tackle gate; `well_of_ledgers` `holdsGiants` on the bottom ledger; `stilled_cascade` thaws 40 s in Shard-chime (wait × 0.4, favour +0.3); `broken_hymnal` Vesper Gar × 3 at night (P4); `burning_glass` folded into the Alignment (P4); `votive_font` `maxClass` Prize | §25.8.5 |
| §24.7 Pallid places | Chain Garden weight bias +0.6; the Breathing Deep weight bias +0.5; the Last Ferry once a descent | `the_bottomless` `holdsGiants` (non-legend), the Underdepth (P4); `long_pier` + The Namesake (P4); `chain_garden` favour +0.6 during the Turn's pass, + Candlewake Sturgeon (P4), `holdsGiants`; `ferry_slip` `holdsGiants`, the ferry's outline at dusk, the Last Ferry once an expedition; the Breathing Deep's domes favour +0.4 | §25.8.5 |
| §24.7 water depths and Elder routes (▲, review fixes) | Lullaby 0.6–0.85; Ferry Slip 0.85–0.95; kept rares capped with their places | **Lullaby 0.4–0.85, Ferry Slip 0.45–0.95** (the shallow commons' Elder water); **`giantsKept`** on `drowned_greenhouse`, `veilwater`, `bell_window`, `stilled_cascade`, `long_pier`, `sunken_belfry`, `bier_barge` (their kept species alone may roll Elders there); the Sporewood watch lamp is `house_lamp`, not `harp_lamp` (3 m from the Gill Harp) | every Elder seal has a route; a lamp-watch costs the giants (§25.7.1, §25.5.2) |
| §24.7 place-kept species | awake per descent; the Footnote and the Unpaid Fare `sinker` | awake per expedition; both become *sulkers* in P4; v3 sizes from §25.7.6 replace the kg column | §25.7.6, §25.6.5 |
| §24.8 sister-candles | lit for the rest of the descent; Known Places each later descent | the rest of the expedition (reset on every Set Out); Known Places each later expedition; two candles per walking lake carry `watch` (lamp-watch): Sporewood `house_lamp`, `crown_lamp`; Glasswater `harbour_lamp`, `hymnal_lamp`; Pallid `plaza_lamp`, `pier_lamp` (data `WALK_SYNC_V3.watchLamps`) | §25.8.1, §25.5.2 |
| §24.9 hooks | discovery Memories at run end; shortcuts for the descent; the Surveyor's Chalk each descent; variants, twists and awake per descent | discovery Memories instantly; shortcuts persist (`meta.shortcuts`); the Chalk opens the nearest shortcut for good on your first arrival in that lake; variants, twists and awake roll per expedition | §25.8.1, §25.10.4 |
| §24.10 content | Cork-Soled Boots 45 / 120 / 280 per run; challenges 33 / 36 / 39 per descent; 37 / 38 on the main list; `lamp_vigil` in every mode; the Wayfarer's quirk | Boots = outfit, 80 / 240 / 600, persistent, from Sporewood lit; 33 and 39 per expedition, 36 "Open 3 shortcuts"; 37 and 38 on the Gloom tab; `lamp_vigil` only in combat modes; + the fishing half *Shore Sense* | §25.6.6, §25.10.5, §25.5.5 |

### 25.14 Phase plan and per-module work list

**The places come before the home.** Request 5 is "finding cool locations with interesting fish species and big sizes", and the Mossmere's raft places need nothing from §24's foot controller, while the cove does. They do need §24.7's **place kit** (place membership, the `targets` / `rhythm` / `foul` rules, discovery, mastery, Astir, Known Places), and no §24 code exists yet, so **P2 builds that kit raft-first** (F14, Pg11, U16) and §24's walking lakes reuse it. So the order is **P1** (the feel shift inside today's run structure) → **P2** (the Mossmere's places and giants) → **P3** (expeditions and the walkable 3D cove, the Landing; needs §24's foot core) → **P4** (wonder and depth). P1 + P2 deliver request 5 inside today's run structure; P3 delivers requests 6 and 7; P4 is content on a working loop.

Effort: **S** ≤ 2 days · **M** 3–6 days · **L** 1–2 weeks (one implementer). Ids are the brief's (R render, Wa water, W world, A actors / models, F fishing, S player / survival, C combat, Pg progression, U ui, Au audio, D data, T tools). An item split across phases (C6, Pg3, U11, T1, T2, T5, F10) is listed in each phase with its part.

#### 25.14.1 Phases, gates and how the game stays playable

| phase | goal | length (parallel modules) | playable after the phase | gate (all must pass) |
|---|---|---|---|---|
| **P1: the feel shift** | angler-first inside today's run structure, testable at once: cameras, no combat UI by day, honest stretched size, the z model with the **float's favour**, bite tells, pips, steeper Elders with old tricks, drag on every fight, the ceremony, night modes (Lantern window, no snaps, Scorched, lamp-watch at the buoy-lamps), the oil table, Well-fed, signs, recolours (Murk too), banked level-ups, the renames with the Pg0 id migration, and the **per-lake stopgap** (`RAFT_FALLBACK_V3`: 3 giant waters per lake) so Elders exist from the first build | ≈ 2–3 weeks | today's runs (title → New Descent → run → death screen), now with the night-mode cards on New Descent from run 2 (run 1 is all-still, the First Outing rule), the v3 day clock, size classes, the ceremony and Snuffed in place of the darkness death | the common gate below, plus: reel-sim targets §25.6.9 and §25.6.6 (Mossmere and Sporewood on 32 species); `tools/scenario-run.mjs` full flow in each night mode with 0 page / console errors |
| **P2: the Mossmere's places and giants** | the place kit (membership, rules, discovery, mastery, Astir, Known Places), the 8 places and their props, the harbour re-dress (W9), `holdsGiants` and `giantsKept`, persistent residents, `sight` and `drift`, the pre-roll primitive, `uClear` and **Moonfall**, conditions, rumours, today's rumour, forecasts, Tally Posts, Marked Fish and the near-miss card, the Mossmere's 4 new species (→ 36) | ≈ 3–4 weeks (no §24 code: it builds §24.7's place kit raft-first, F14 / Pg11 / U16) | P1's runs, with a Mossmere full of places, residents and Moonfall; residents, Marked Fish, places and Tally records persist in meta across runs | the common gate, plus: the T5 pacing sim on the Mossmere (first Prize ≤ 5 min for ≥ 55%, places 6 of 8 by h2); Moonfall and the wow-event draw calls inside §25.8.8 |
| **P3: expeditions and the Landing** | the hub flow and contract, the cove, the walls and mount batch, the pond pass, Homecoming and Snuffed, persistence, tackle and outfit at the Gear Bench, Far Water and the Live Well, First Outing and Set Out, Continue with position, the Ledger, 48 challenges, relic shelves, The Long Descent, save migration, cove fishing, **the runner** with Sporewood, §24's place data ▲, species → 47 | ≈ 4–5 weeks (+ ≈ 2 weeks for S0 / R0 if §24's foot core has not landed; fallback Landing v0) | the full v3 game: boot → the Landing → Set Out → expedition → Homecoming / Snuffed → the Landing; The Long Descent from the Map Table once all four Waystones are lit; an old save migrates and continues | the common gate, plus: the balance sim T3 (snuff rates, Memories/h, Shells/h, the shortest profitable loop, the tackle timeline §25.10.2); perf scenario `cove` ≤ 140 / ≤ 100 calls; the hue report on a Landing shot including Murk's barge; a phone-portrait shot showing the arch, stones and legends |
| **P4: wonder and depth** | the sulker, the other three wow happenings, species → 53, age marks, Found Relics and secrets, Vistas, the Chart's fog, legend growth, Remnants, the postcard card | ≈ 4–6 weeks (content) | the full game plus content; each P4 item ships independently (cut order §25.15.4) | the common gate, plus: the sulker in `tools/sim/reel-v3.mjs` before its code (Blind Scrivener Elder and Lampwarden retuned); perf scenario night on foot (T6) ≤ 150 calls with the Candle Tide |

**The common gate** (every phase): `node tools/validate-data.mjs` (both passes, plus the v3 pass), `node tools/check.mjs`, the hue report (≤ 2% green-teal chroma per lake and on the Landing, Murk included), the draw-call scenarios (`tools/perf.mjs`; §25.4.7, §25.8.8), the reel-sim land-rate targets (§25.6.9) and, from P3, the balance sim (T3).

**Rollout rules.**
1. **Data first, behind a flag and a phase.** v3 tables merge into data.js behind `data.V3_ENABLED` (the same pattern as `WALK_ENABLED`, CONTRACT §13.0): with it off every v1 / v2 export hashes identically to c0e0ab9 (validate-data passes 1 and 2, `tools/tests/v1-exports.json`). `data.V3_PHASE` (1–4) decides **which data lands when**, so a phase's build never carries a later phase's species, places, cuts or renames (CONTRACT §13.0's table; validate-data builds every phase with and without §24). The flag turns on, at phase 1, in the commit that lands P1's fishing, survival, combat and ui code; each later phase raises the phase number in the commit that lands its code.
2. **P1 and P2 run inside today's run structure.** "Expedition" in P1–P2 means today's run; `run.nightMode` is chosen on the New Descent screen (run 1 = `meta.runs === 0` is the First Outing, all still); a snuff ends the run through today's death flow (the screen is titled *Snuffed*); records, class firsts and Memories bank at the measuring moment (Memories per `MEMORIES_V3.interim`; relic costs stay v1 until P3); residents, Marked Fish, places and Tally records (P2) persist in meta. Gear is today's per-run UPGRADES, with shock, pips, absorb, drag and the tackle rating from `data.upgradeTiers`. Nothing is marked for home before P3: every creel fish is "not marked" (the legendary trophy slot stays theft-proof). Pg0 renames the ids in saves; relics, challenges and Waystone deep starts stay v1 until P3.
3. **P3 switches the structure by feature detection**, not a second flag: main enters the hub only when `ctx.progression.createExpedition` and `data.COVE` exist (CONTRACT §13.1); until then the title and New Descent flow stay. The cove's land comes from its own extrusion builder; the Wick on foot needs §24's foot controller (S0 / R0 build it in P3 if §24 has not); Landing v0 (pill posts on the quay's parapet, the Wick on the raft) is the fallback while S0 is missing.
4. **P4 items are independent**; each can ship or be cut on its own (§25.15.4).

#### 25.14.2 P1 work list: the feel shift

| id | module | item | effort | depends on | acceptance test (what the QA scenario checks) |
|---|---|---|---|---|---|
| D1 | data.js | `BALANCE.size` (cuts, tail 0.06, truncation, favour table, value factor 0.66, yield factor 0.784, Elder age per lake, step, stamina exponent, fatigue floor, old trick, drag), species `size` / `family`, phases, the oil context table, `wellFed`, `nightModes`, cameras (render convention), recolours, `RAFT_FALLBACK_V3` (stopgap giants, raft watch lamps), `V3_PHASE` gating, `upgradeTiers` / `tackleStats` **(done on this branch)** | M | — | validate-data v3 pass: σ in 0.09–0.175, ceiling ≤ 2.8× median, ≥ 2 giant-tail species per lake, legend length ≥ 1.4× the lake's longest ceiling, favour cap 1.8, no green-teal fish colour; pass 1 bit-identical with `V3_ENABLED` off |
| T1 (P1) | tools | **(done on this branch)** `tools/sim/reel-v3.mjs` adopts `reel-v3-sim.mjs` (the brief's T1 adoption into `tools/sim/`) (z scaling, Elder age / step / stamina, fatigue, old tricks, pips, Rod shock, per-slot loadouts, no net check) and writes `BALANCE.tackleRating` | M | — | `node tools/sim/reel-v3.mjs --gate --k 400` reproduces the §25.6.6 gate table within ±2.5 points; `--rating` writes 125 loadouts × 4 lakes; Elder median fight ≤ 120 s, Ancient ≤ 180 s |
| T2 (P1) | tools | **(done on this branch, with the per-phase builds and the flag-off fingerprint)** `validate-data` P1 rules: σ range, ceiling ratio, giant-tail count, legend rule, green-teal fish colours (the existing stricter guard), favour cap | S | D1 | the validator fails a seeded bad species (σ 0.2, a teal glow, a legend 1.3× the longest) and passes the real data |
| R1 | render | camera presets read from `BALANCE.cameras` with render's full parameter set: sail 24° / 15 m / aim 6.5 / aimY 1.4 / fov 52; fish 28° / 13 m; **the reel camera follows line distance and fight state only, never size class**; **the night overview blends in only while `combat.swarmActive`** (not on the phase) | S | — | screenshots at 960×540 and 390 px portrait match `BALANCE.cameras`; a forced Keeper and a forced Elder at the same line length give the same reel-camera distance (± 0.1 m); on a Stillnight and in a lamp-watch the camera stays at the sail / fish framing; in a Lantern swarm window it blends to `night` |
| R2 | render | `trophy` mode (distance `clamp(1.2 + 1.6L, 1.6, 16)` m, yaw toward `data.landmarkOf(place)` by ≤ ±35° from north, none without a place; crane to 50° above 4 m) | S | F3 | landing a forced 0.2 m, 1.2 m and 8.5 m fish puts the camera at 1.6, 3.12 and 14.8 m, cranes to 50° on the last; with no place the yaw stays north; the leap reveal (via `ctx.game.slowmo`) runs 0.25 s at timescale 0.35 |
| Wa1 | water | Glowtide sparkle term with a low-tier switch | S | — | at night the raft's wake and a hooked fish sparkle on high; the term is absent on low; 0 added draw calls |
| Wa2 | water | sign decals through the existing ripple and wake arrays (no new uniform arrays) | S | F6 (lands with it) | six sign kinds render with ≤ 6 alive; shader uniform count unchanged; +2 draw calls at most |
| W1 | world | remove the mote-column visuals; the legend pool's column becomes a low glimmer; `getWatchLamps()` (the Mossmere's drawn dock buoy-lamps, raft fallbacks for §24's lakes without §24, §24 lamps with `watch`) with a faint r 6 pool decal; `getGiantSpots()` (the stopgap) | S | F6 | no mote column in any lake screenshot; the legend pool shows a still ring and a low gold glimmer; the edge marker still points at it; `getWatchLamps()` returns 2 per lake at the drawn buoy positions; `getGiantSpots()` returns 3 per lake with no places |
| A1 | actors / models | honest stretched scale: `createFish(species, {z})` → L50·e^(σz + 0.06·max(0, z − 1.04)²) in metres; remove the ±22% weight scaling; the 0.12 m floor drops to 0.04 m | S | D1 | a Dusk Minnow at z 0.4 measures 0.231 m and at z 3.0 measures 0.397 m in the scene (bounding box ± 3%); a 0.08 m Cupbearer measures 0.08 m (P2 species, forced) |
| A2 | actors / models | measuring poses palm / arms / hang / alongside; the knotted-cord prop | M | — | forced catches at 0.2 / 0.6 / 1.5 / 3.0 m play palm / arms / hang / alongside; the cord spans the fish's length |
| A3 | actors / models | recolour the green fish and glows (data) | S | D1 | the hue report on a Mossmere and a Glasswater catch close-up: ≤ 2% green-teal chroma; the §25.7.7 targets in data |
| A10 | actors / models | **Old Murk off green**: skin #5a5444, lichen flecks #b8b0a0, lamp glow, halo and PointLight #ffe2b0; the merchant tip says "his lantern" | S | — | a screenshot with Murk moored passes the hue report; the tip text reads "Sail to his lantern" |
| F1 | fishing | stretched z model (replaces `rollWeight`), the favour stack by family, classes and Ancient, place caps, pressure, Elders only in giant water (`holdsGiants` and the stopgap `arena.giantSpots`) | M | D1 | 10,000 seeded rolls at μ 0 / 1.0 / 1.8 reproduce the §25.7.1 class table within ±1 point; z never exceeds 2.64 outside giant water; pressure −0.12 per catch floors at −0.6 and resets at dawn |
| F2 | fishing | size → difficulty before `createReel` (Elder age per lake, step × 1.08, stamina g^1.3, old tricks as a 50/50 pull / leap read); reel edits (stamina × 1.4, easing by load, fatigue clock with the Elder floor 0.8, **drag absorb and slip on every fight, Spooled for any species**, Rod shock, pip bonus); stats from `data.upgradeTiers` in P1–P2 | M | T1 | the in-game reel driven by the sim's skilled bot on a forced Elder Reedjaw, with stats from `data.tackleStats(T0 / T2 / T4)`, lands within ±5 points of the sim; every Elder plays exactly one old trick after 55% progress; a held line above the drag point slips progress 0.08 per unit absorbed |
| F3 | fishing | cut the 1.45× boost (`fishing.js:663`) and the 0.12 m / 6 m clamps on splash and wake length (`fishing.js:662`); leap reveal for Prize+ | S | A1 | a hooked fish's mesh length equals `createFish` length at every moment of the fight; a forced 8.5 m legend's splash uses 8.5 m; a Prize+ breach triggers the reveal once |
| F4 | fishing | class bite tells, let it pass (refund through `progression.refundBait`; same place or within 6 m), hook-hold pips | M | F1 | each class shows its tell with sound off; a lapsed bite refunds the bait and adds favour +0.15 to the next cast within 6 m (cap +0.3, reset on a hook or after 60 s); pips start at 3 / 2 (+ the Rod's pip bonus: +1 at upgrade tier 3+ in P1) and a throw happens at 0 |
| F5 | fishing | the catch hand-off (CONTRACT §13.7): `progression.makeFish` at the landing, the ceremony as a cinematic state, `progression.measure` at the seal stamp (`fish:measured` then `fish:landed`); favours on the card; best setup per species | M | A2, U3, Pg1, M1 | `fish:measured` fires exactly once per landed fish, before the card; main saves on it, so reloading the page after the stamp keeps the PB and class first; the card lists the favour terms that applied; no enemy moves and no oil drains during the ceremony |
| F6 | fishing | signs replace feeding spots; fishing-fx is their one owner (per-fish instance buffer; water only gets ripples and wakes); `armChum()`; the quality score's spot bonus becomes "cast inside a live sign" | M | Wa2 | 2–4 signs alive in calm within castMax + 15 m; each sign's cast rule gives its effect (e.g. a boil cast within 3 m in 8 s bites 60% over 500 seeded casts); buying Murk's Chum makes the next cast spawn a 30 s nervous sign |
| F7 | fishing | Night Rise; mode rules (Still / Lantern: slams never snap, no knockback or shove and no zap release while hooked, `lineBroken` ignores combat displacement, no creelsnatch while hooked; the slack budget only in combat modes) | S | C1 | every night cast carries favour +0.25 in each mode; in Lantern a scripted slam and a Bulwark shove during a fight neither snap the line nor move the raft, and a creelsnatch never targets while hooked |
| F13 | fishing | `fishing.view.favour {mu, notches, terms[]}` from the float's μ (species-independent terms + species terms as the max over the eligible pool: the float never reveals the rolled species); the "gone quiet" flag at pressure ≤ −0.36 | S | F1 | notches follow the six bands; two seeded bites of different species at the same point show the same notches; three catches at one place in a day raise the "gone quiet" flag |
| S1 | survival | phases 180 (185) / 20 / 90 / 10, +30 s on expedition day 1 | S | D1 | `getPhaseInfo().duration` reads 210 / 20 / 90 / 10 on Mossmere day 1 and 185 in a foot lake's later calm; the HUD clock matches |
| S2 | survival | the oil context table; guttering → snuffed; only oil snuffs in Still and Lantern | S | D1 | a Mossmere raft day burns 28.3 ± 0.5 oil (30.1 on day 1) with no casts; 0 oil → Last Flicker (+12, once a day) → 25 s guttering (no casting) → Snuffed; Embers at 0 in Still / Lantern never snuff |
| S3 | survival | satiety → Well-fed (no starvation) | S | D1 | satiety 0 for a full day causes no damage; satiety ≥ 60% shows Well-fed and applies reelSpeed +0.08, sweetZone +0.01 |
| S6 | survival | lamp-watch detection at dusk end (2 watch-lamps per lake, pool r 6, from `world.getWatchLamps`); leaving the pool by > 10 m cancels it; Scorched while hooked waits for the fight | S | C1, W1 | in Lantern, standing in a Mossmere dock buoy-lamp's pool when dusk ends cancels that night's swarm; casts beyond 10 m are refused; no Cinders drop; sailing 11 m out of the pool starts the swarm window at the current k; Embers reaching 0 mid-fight anchor the watch where the fight ends |
| C1 | combat | night modes: `difficultyFor` multipliers, `swarmWindow(k)` (Lantern 0.05 → 0.50), the Lantern Warden cadence, fodder → oil, lamp-watch; the First Outing all still | M | D1 | in Lantern, spawns only on even nights between k 0.05 and 0.50 at the scaled rates, Wardens on nights 4 and 8 at hp × 0.75; Still spawns nothing; run 1 is all still |
| C2 | combat | aura ring hidden in calm and dawn; Flare and Embers by mode | S | U1 | the §25.5.7 table holds in screenshots of each mode at calm, dusk and night |
| C3 | combat | XP per mode (Still × 1.4, no zone factor, discovery cap), the Angler-offer cap, 6 new Angler boons, **banked level-ups** outside swarms | M | D1 | no level-up modal opens while moving or with a line out; banked picks appear on the next measuring card or at dawn; Still offers only Angler-pool Boons |
| C4 | combat | Still and Lantern legend snags (the Lantern-Swallower) | S | — | in Still and Lantern, Grasping Dark produces two telegraphed snags (1 s warning, +0.2 tension) and no spawns; Gloomtide unchanged |
| C6 (P1) | combat | Lantern stakes: **Scorched** (oil −30, forced lamp-watch, no Cinders), slams never snap, no knockback or shove while a fish is hooked, taps never release the reel, no creelsnatch while hooked (and never on a fish marked for home, every mode) | S | C1 | Embers to 0 in Lantern → Scorched: swarm withdraws, oil −30, anchored within 10 m until dawn, Embers mend at dawn; the run continues; a scripted slam while reeling moves neither the Wick nor the raft |
| Pg1 | progression | value / food / oil from z (value × 0.66, food and oil × 0.784); `makeFish` (called by fishing) and `measure` (every duty of today's `landFish`); class firsts; instant Memories; first-release Memories; `refundBait`; P1–P2 Memories per `MEMORIES_V3.interim` | M | F1 | an Elder Reedjaw at z 2.8 sells for 127 ± 1 Shells at normal quality; a Mossmere common renders ≈ 17 oil on average; class-first and first-release Memories bank at once (visible in meta before the run ends); the death screen pays no species row and the per-night tally values |
| Pg0 | progression | save migration, ids only: `pale_leviathan` → `lantern_swallower`, `pale_marrow` → `last_candle`, `tide_chart` → `murks_chum` in journal keys, `run.legendaries`, `run.bait` and unlocks; `meta.v3ids` | S | — | a v1 save with a landed Pale Leviathan, Drowned Marrow in the bait bag and its unlock loads with the Lantern-Swallower in the Journal, Last Candle in the bag and the unlock kept; a second load changes nothing |
| Pg12 | progression | `createRun({…, nightMode, outing})`: `outing: 'first'` and all-still when `meta.runs === 0`; `run.nightMode` locked for the run; stats via `upgradeTiers` | S | D1 | run 1 is still every night with no mode choice; run 2 starts in the chosen mode; `getStats()` carries shock / pipBonus / absorb / dragAt from the owned upgrades |
| M1 | main | `startNewRun({character, nightMode})`; `ctx.cinematic` (survival and combat get dt 0 during the ceremony); `ctx.game.slowmo`; save on `fish:measured`; `core.loadSave()` returns the envelope `{version, meta, run}` | S | — | during a forced Elder ceremony in a Lantern swarm no enemy moves and oil does not drain; a reload right after the stamp keeps the record; the leap reveal restores timeScale 1 |
| U1 | ui | day HUD by mode (no ring, Embers or Flare in calm; the Well-fed glyph) | S | — | calm screenshots in all three modes show no combat UI; the satiety bar is replaced by the glyph |
| U2 | ui | bite-tell legibility, pips, a class estimate after the breach, catch card (class, cm, kg, favours; Mark for home arrives in P3, U8) | M | F4 | on a 390 px phone the tell, the pips and the class estimate are readable; the card shows cm, kg, class and favours |
| U17 | ui | New Descent mode cards: run 1 shows only the First Outing card; from run 2 Still / Lantern / Gloomtide with Lantern preselected and one line each | S | Pg12 | a fresh save sees only the First Outing card; the second run offers three cards with Lantern selected |
| U18 | ui | the death screen titled *Snuffed* (oil); the *Scorched* card (Lantern, Embers at 0; the run continues); pause quick links in a lake: Journal, Challenges, Settings, Title | S | S2, C6 | a snuff shows "Snuffed"; Embers at 0 in Lantern shows the Scorched card and play continues |
| U3 | ui | measuring overlay (cord ticks, seals, record banners) | M | — | the overlay timings match §25.6.8 per class and are skippable (tap; Elder after 0.6 s) |
| U13 | ui | **the float's favour**: 0–5 ink notches, long-press list by family, the "gone quiet" line | S | F13 | long-press lists the terms by family in plain words; notches update when a sign or the hour changes the favour |
| U14 | ui | banked Boon picks on the measuring card and at the dawn bell (never a modal while moving or with a line out) | S | C3 | a scripted level-up while reeling shows its pick on the next card |
| Au1 | audio | cord ticks and class chimes, seal stamp, bite-tell sounds ("plip" vs "gulp"), Night Rise motif, Stillnight bed | S | — | each sound fires on its event; a Stillnight plays the bed, not the gloom mood |

#### 25.14.3 P2 work list: the Mossmere's places and giants

| id | module | item | effort | depends on | acceptance test |
|---|---|---|---|---|---|
| D3 | data.js | Mossmere places (checked against world-layout), `giantsKept`, `tallyAt`, `landmark`, Moonfall discs and atlas cells, the Moon-Eye crack, the re-dress list; conditions; ≈ 24 rumours; species → 36 **(done on this branch)** | M | — | validate-data: exactly 3 `holdsGiants` places per lake (secrets excluded), in reachable water; no place disc on an island; every Elder seal has Elder water; every place has a no-bait calm species; every kept species has a rumour and a condition |
| T2 (P2) | tools | **(done on this branch)** validate the place fields (incl. world-layout footprints and Elder routes), rumours, kept-species conditions and giant-place count | S | D3 | seeded bad data (4 giant places, a kept species with no rumour) fails |
| T5 (P2) | tools | pacing sim on the Mossmere (the naturalist roster sim on places, conditions, residents and the favour distribution): first Elder, PBs per session, Trophies per session | M | D3 | first Prize ≤ 5 min for ≥ 55% of simulated players; Mossmere places 6 of 8 by h2; first Elder hooked h1–3 |
| Wa3 | water | `uClear[2]` discs, each sampling its own cell of one painting atlas by its world rect (`setClear([{x, z, r, k, paint}])`; 256² with 2 cells, 128² and radius × 0.7 on low); the Alignment's band mask (`setBand`) waits for P4 | M | — | disc 0 shows the Ferry-Market painting and disc 1 the Bell Pool's bell, each with parallax at 960×540; low tier uses 128² cells and the smaller radius; uniform budget respected |
| Wa4 | water | condition hooks (Hush swell × 0.2, Drizzle ripples) | S | W5 | Mirror Hush flattens the swell to 20%; Drizzle adds rain rings |
| W4 | world | Mossmere place props (the Cupped Hands cupping a water-level pool, chains, the `gatehouse_face` on the island's south rim, the buoy row as surface glow decals + float caps), Tally Post stones at `place.tallyAt` (collision r 0.4) and their sprites; world-layout reads `arena.cracks` (the Moon-Eye); `getDepth` clamps to `place.water.depth` in every lake | M | D3 | each prop sits at its §25.8.4 coordinates; ≤ +4 / +3 calls; Tally Posts ≤ 2 live, each showing the best fish there; `getDepth` at the Ferry-Market centre reads 0.4–0.7 |
| W9 | world | **the Mossmere re-dress**: arch spans and a broken deck over the bridge's four piers; the Sluice Veil (scrolling water-curtain card) and two aqueduct segments; street lamp-posts → rust bollards and buoy-lanterns (island lamps and the three lamp pylons); a leaning toll-tower on the Sunken Gate | M | — | a Mossmere screenshot shows no street lamp-post; the Span has arches; the Cupped Hands' spout hangs from an aqueduct; ≤ +4 / +3 calls (§25.8.8) |
| W5 | world | conditions: 3 archetypes × 4 lake presets (particles, fog, uniforms), no geometry movement | M | D3 | `debug.condition(id)` shows each preset in each lake; ≤ 4 calls; no mesh moves |
| W6 | world | Moonfall's rendering (`setMoonfall`): the Moon-Eye shaft swings 14° toward the Bell Pool, both `uClear` discs with their atlas cells | M | Wa3, F9, Pg9 | on progression's `moonfall` (25% and 70% of the calm, 20 s; 30 s in Moonmist) both discs open and 3–5 pre-rolled fish show, one Prize+ guaranteed; world holds no schedule of its own |
| A5 | actors / models | `raft.freeze()` and `merchant.freeze()` (≈ 26 → 8 and → 4 calls): at home, and in lakes whenever moored with the Wick > 12 m away | S | — | draw calls drop by the stated amounts when frozen and return on unfreeze with no pop |
| A8 | actors / models | `sturgeon` shape, `marks` pattern, barbel and needle-snout flags | M | — | the Bridgechain Sturgeon, Old Portcullis and a `marks` fish render with their traits in a catch close-up |
| F8 | fishing | near-miss data; Marked Fish (the `wounded` rule; ≤ 6 in meta; resident behaviour at their place) | S | Pg3 (meta) | an escaped Trophy+ becomes a Marked Fish at its place with its z; its next fight starts at `min(0.3, 0.5 × P_escape)`; a seventh replaces the oldest |
| F9 | fishing | the pre-rolled fish primitive (fishing-fx's per-fish instance buffer, on top of the water; a leap as a short-lived `createFish`); rules `sight` and `drift`; **persistent residents** (N(1.6, 0.6) truncated at 1.88; re-roll on landing or after 3 in-lake days); `holdsGiants`, `giantsKept`; `resident:show` carries `sizeZ` | M | D3, F14 | 10,000 resident rolls give Elder 12.4% ± 1 and Ancient 1.1% ± 0.3; a resident shows twice in each calm, once at dusk and once at night (+1 calm show per dawn out, cap +3); `sight` bites in 2–4 s within 1.2 m; `drift` adds +0.08 rarity per seam |
| Pg3 (P2) | progression | meta: residents and Marked Fish | M | — | residents and Marked Fish survive a reload and a death; the Map Table data lists them |
| Pg9 | progression | persistent places, Tally records, rumours, today's rumour, forecasts, **the Moonfall schedule** (`getMoonfall`, emits `moonfall`) | M | D3, Pg11 | today's rumour is the same all day (real date) and always names a giant place; Murk gives one rumour per visit when you sell; tomorrow's condition is announced at dawn; `moonfall` fires at 25% and 70% of each Mossmere calm |
| F14 | fishing | **§24.7's place kit, raft-first**: place membership through `data.placeAtV3`; the `targets` (incl. `dropIn`: lock, centre landing at y 0, the hooked fish held in the target), `rhythm` and `foul` rules; place-kept species gated by `place` / `cond` (`target`, `live`); place favour and pressure | M | D3 | casting within 1.6 m of the Gatehouse Door lands on the door's centre and can hook Old Portcullis; a cast into the bowl while the aqueduct is live can hook the Cupbearer; nothing kept bites outside its place |
| Pg11 | progression | discovery (8 m or casting in: +2 Memories at once), mastery (4 catches in one run, one Fine+: +10, a Known Place), Astir (one Mossmere place per day), Known Places in meta | M | F14 | sailing within 8 m of a place discovers it once; four catches there with one Fine+ master it; one Mossmere place is Astir each day |
| U16 | ui | the place title card (1.2 s ink card on discovery) and the Astir marker | S | Pg11 | discovering a place shows its card once; the Astir place is marked on the HUD |
| U4 | ui | near-miss card (with the tackle rating) | S | F8 | every Prize+ escape shows silhouette, class, length ±8%, % landed, cause, rating and one tip |
| U11 (P2) | ui | Places page and rumours | M | Pg9 | the Journal's Places page fills on discovery; a pinned rumour shows an edge marker |
| Au3 | audio | condition loops, sign sounds (a panned strike slap), Moonfall shimmer, place beacons (≤ 2 live) | S | — | a strike splash off-screen pans to its side; ≤ 2 beacons play at once |

#### 25.14.4 P3 work list: expeditions and the Landing

| id | module | item | effort | depends on | acceptance test |
|---|---|---|---|---|---|
| D2 | data.js | `TACKLE`, `OUTFIT`, `LURES`, `COVE` (arena, walk, palette, grade, wall wings and chimney breast, frame heights, stations incl. walls, glide paths, test buoy, v0 posts, growth table), `BALANCE.farWater`, `liveWell`, relic shelves, 48 `CHALLENGES`, Ledger templates, the tally, the Quayling and Wanderers (→ 47), `tackleRating`, `RENAMES` (Pg3 rules), Homeward stones; §24's place data ▲ (giant places, `giantsKept`, depths, `sight`, `maxClass`, `watch` candles) **(done on this branch)** | M | — | validate-data: catalogues 18,610 / 3,680 / 1,710; every wall wing packs in 12 × 3.6 m; `COVE.walk` passes §24's reachability, enclosure and 14 m south rules; each Homeward stone ≥ 25 m of path from spawn |
| T2 (P3) | tools | **(done on this branch)** validate the cove walk (incl. v0 posts, glide paths, test buoy), the wall packing, the Homeward stones, the watch lamps (two per lake) | S | D2 | seeded bad data (a Homeward stone 20 m from spawn, an oversize wing) fails |
| T1 (P3) | tools | the runner in `tools/sim/reel-v3.mjs` before its code | M | — | Velvet Ray and Pilgrim Salmon land rates on T1–T3 inside §25.6.9's bands; Keeper rares for novices move toward 85% |
| T3 | tools | `balance-sim`: expedition and economy model with Still / Lantern / Gloomtide profiles (Shells/h, Memories/h, snuff rate by expedition length, fight share, the tackle timeline, Far Water, the value factor per lake, the **shortest profitable loop**) | L | D2 | snuffed ≤ 3% (home by day 3) and 6–10% (past day 4) in Still, Lantern +2; median expedition 3–5 days; ≥ 25% of expeditions end on Murk's barge; Memories/h 120–180 with Still within 15%; no loop > 1.5× median |
| T4 | tools | perf scenario `cove` (≤ 140 / ≤ 100 calls), the hue report on Landing shots including Murk's barge, a phone-portrait screenshot | S | W2 | `tools/perf.mjs --scenario cove` reports ≤ 140 high / ≤ 100 low with pond, lower wall and arch in one view |
| T5 (P3) | tools | the pacing sim on all lakes | M | D3 | §25.9.5 targets (species 44 by h12, all 29 places by h14, first headline Elder h6–10, first Ancient h12+) |
| T6 | tools | perf scenario night on foot (Pallid, Lantern swarm, Tally Posts, the wow event): ≤ 150 calls | S | W7 or a stub | ≤ 150 calls on high with a stubbed or real Candle Tide |
| R0 | render | **§24.5's walk camera** (if §24 has not landed it): `walk` / `walkNight` presets and portrait numbers, fixed north yaw, the occlusion cone, the terrain clamp | M | — | on the cove's quay the Wick stays readable behind the retaining wall; the camera never enters the cliff |
| R3 | render | `cove`, `gate`, `wall`, `hang`, `pond`, `setout` modes from `BALANCE.cameras` (render's convention, portrait per mode); `gate` only in glides or at its look spot; `title` orbits a southern arc | S | W2 | each mode's numbers match §25.4.5; from the quay the stones and hung legends are on screen at 960×540 and in portrait; casting from the jetty never switches to `gate` |
| Wa5 | water | **pond pass**: `uPondHole` discard in the lake shader **compiled only under `POND_HOLE`** (set on entering the cove, removed on leaving), floor-painting disc at y −0.7, transparent pond surface drawn after the pond fish (+2 calls) | S | W2 | pond fish are visible through the pond surface from the `pond` camera; outside the disc the lake renders as before; a lake's water material has no `POND_HOLE` define and `tools/perf.mjs` shows no frame-time change in either lake |
| Wa6 | water | `applyZonePalette` resolves `COVE` on `zone:change {hub:true}` (no `ZONES[0]` fallback) | S | D2 | the cove's water uses `COVE.palette` (fog #1d2230, water #1a1f2c); no Mossmere colour leaks |
| W2 | world | **COVE builder**: `world.setZone('cove')` resolves `COVE` with theme `cove` (no lake set-pieces); world-layout support for `shoreNotch` (a, w, depth, len) and authored `cracks`; quay, galleries, ramp and stair from **the cove's own extrusion builder** (world-cove.js; both stair states built, the walk grid re-baked on `shortcut:open`); the two walls with the chimney breast and the frame atlas (2D-packed frames, mount views); the new sea-gate arch (`taperTube`); 4 new Waystones on a sill with the glide gap (per-stone emissive); instanced lamps, candles and shrine lanterns; hearth, bench, table, lectern, boards, the chart material; pond rim; keepsakes; `pickFrame(ndc)`; the Landing v0 pill posts. Budget §25.4.7. | L | Wa5, A4 (not §24: S0 only for the Wick on foot) | the cove builds in ≤ 150 ms desktop / ≤ 600 ms phone; every element at its §25.4.1 position; no Mossmere island or lamp-post appears; the channel runs straight through the arch; draw calls inside §25.4.7 |
| W3 | world | Landing growth states from meta flags (visibility and emissive only: frames, wings, sailcloth, stair, lanterns, keepsakes) | M | Pg3 | seeded metas (start, one Waystone lit, all lit, the Lantern-Swallower landed) show the §25.4.4 states; nothing is rebuilt except the mount batch and the stair's walk-grid re-bake |
| A4 | actors / models | **`models.buildMountBatch(entries)`**: frozen mounting pose by mount view (side, rays dorsal-up, jellies hanging); body and emissive atlases, fins on the shared atlas with vertex colours, one translucent material, bones and outline, per-fish outline thickness attribute, instanced lure glows; **a near (full detail, per wing) / far (≤ 600-triangle LOD) pair per wall**, swapped by wing distance; ≈ 9–12 calls | M | A1 | 48 mounts + 4 legends draw in ≤ 12 calls and ≤ 80k triangles in view; rebuilt only on Homecoming, Swap, `pond:add` and `pond:release`; walking from the quay to the wall swaps batches without a rebuild; a second atlas page past 32 skins |
| A6 | actors / models | `actors.pond`: up to 6 fish (≤ 1.4 m) on looping paths inside the pond hole (2 live on low, the rest resting in the batch); `pond.pick(ndc)` | M | A1, A4, Wa5 | 6 fish swim on high, 2 on low; none leaves the hole; a 1.5 m fish is refused for the pond; tapping a pond fish in the `pond` camera opens its card and never starts a cast |
| A7 | actors / models | dozing Wicks: one merged static silhouette | S | — | unlocked Wicks appear by the hearth in 2 calls |
| F10 (P3) | fishing | the runner surge kind | M | T1 | the line-hiss tell 0.8 s before each run; holding drives drag slip; releasing loses progress at 0.05·pw/LS per s; "it turns" gives 2 s of × 1.5 progress; Spooled when progress hits 0 |
| F12 | fishing | cove fishing: the Quayling pool (a run-less `measure`: Journal and records, Release only), the test-buoy practice fight (`COVE.testBuoy.practice`), no sale | S | S4 | a jetty cast lands a Quayling (never above Keeper, never sellable) and its card offers Release only; a test-buoy cast runs a Reedjaw z 1.4 practice fight (no escape, ≤ 20 s) with no rewards |
| S0 | player | **§24's foot controller** (if §24 has not landed it): `moveFoot` on the `walkGridFor` grid with heights and the body radius, board / ashore at a mooring, interact range, `getMode()` | L | — | on the cove's grid the Wick walks the quay, ramp and galleries, cannot pass blocks or the pond hole, boards the raft at the jetty and steps ashore |
| S4 | player / survival | hub mode (no clock or drains), foot movement (S0; Landing v0 on the raft with the pill posts), tap-to-walk to stations, station pills (wall wings 4 m), `player.glide(path)` for the Set Out / Homecoming glides, spawn by `from` (on the raft for the Homecoming glide-in) | M | S0 (v0 without it) | in the hub oil and satiety never change; tap a station glyph and the Wick walks there (≤ ≈ 5 s from the hearth); spawn at the hearth after `boot` / `snuffed`, on the raft for Homecoming (the jetty when skipped), on the jetty after `title`; the Set Out glide crosses the arch line and calls `game.setOut` |
| S5 | player / survival | Homeward Waystone (≥ 25 m from spawn) and Ride home; gate passage within an expedition; the crossing tally rule | S | Pg2 | a 1 s hold within 4 m at calm returns home; refused at dusk and night; a gate crossing pays +10 tally only after a full calm in the new lake |
| S7 | player / survival | **Far Water** (favour, resident shows, Murk's odd days, oil price, rendered oil, night burn) and the **Live Well clock** | M | Pg2 | days 2–6 apply the §25.3.3 table exactly; a fish marked on night 1 with Creel T0 is released at the dawn after night 3 |
| S8 | player / survival | save and restore `run.pos`, oil and the phase clock on autosave, phase change, `visibilitychange` and `pagehide`; snap with `walkGridFor`; guttering or 0 oil → Snuffed on load | S | Pg2 | reload mid-calm resumes within ≤ 30 s of position and clock; reload while guttering resolves as Snuffed at the hearth |
| C5 | combat | off in the hub; The Long Descent = Gloomtide + per-run UPGRADES + its own purse | S | Pg8 | no spawns, aura or Cinders in the hub; a Long Descent run uses today's phases and Heat |
| C6 (P3) | combat | Heat arrival offsets, deep-start picks, Draft levels non-Angler | S | C1 | a Gloomtide Pallid start faces Heat ≥ 18 on night 1; a Glasswater start banks 6 picks; Draft offers contain no Angler boon |
| Pg3 (P3) | progression | meta: shells, tackle, outfit, lures, mounts, pond, Landing flags, Waystones, shortcuts, Elder Log, places, Ledger, `tray`, `pendingSetOut`; **save migration Pg3** (CONTRACT §13.2: legacy vs fresh detection on the raw envelope; fresh 20 Shells and the First Outing; legacy keeps the Journal and records, refunds cut relics, adds 200 Shells once, sets `firstOutingDone`, opens gates only for lakes whose legendary the Journal holds, grants no tackle; a run in progress becomes a return home, its run Shells added and paid by v1 `memoriesFor`) | M | Pg0 | a v1 and a v2 save load: Journal, records, relics, Wicks and challenges kept; Old Debt and Waystone relic Memories refunded; 200 Shells added once; no First Outing; the old run becomes a return home; a brand-new player starts with 20 Shells and the First Outing |
| Pg2 | progression | **expedition lifecycle**: `planSetOut` / `cancelSetOut` (the plan in meta), `createExpedition` (moves `meta.tray` into the run), First Outing, Homecoming, Snuffed summary, gate passage, tally rules; event order per CONTRACT §13.4 (Set Out in two steps) | L | Pg3, S4 | the CONTRACT §13.4 event order holds for Set Out (plan → board → glide → arch line → `setOut`), return home, Snuffed, Scorched and Continue (bus trace in `tools/scenario-run.mjs`); *Board* is refused without a plan; a snuff loses the creel, fish marked for home and half the tally, nothing else |
| Pg4 | progression | tackle tiers and outfit, proof catches, `BALANCE.tackleRating` | M | T1 | T2 is refused until a Mossmere Prize is measured; the rating shown matches `tackleRating` for the fitted loadout |
| Pg5 | progression | Murk's 3-slot Ledger (refresh per completed in-lake day); in-lake bounties re-weighted (combat templates by mode) | M | — | three requests persist across expeditions and a snuff; one refreshes per completed in-lake day; no combat request in Still |
| Pg6 | progression | 48 challenges, rewrites, the Gloom tab (9) | M | — | `getChallenges()` returns 48 with tabs Fishing / Paths / The Measure / Gloom; Gloom-tab rewards are combat-only |
| Pg7 | progression | relic shelves (× 0.55 fishing, × 0.7 Gloom), new relics, lantern count from data, `memMult` on the tally only | S | — | shelf costs are the old costs × 0.55 / × 0.7 (rounded); the Shrine lantern count equals total relic levels in data |
| Pg8 | progression | The Long Descent | S | Pg2 | unlocks with four Waystones; starts with 20 Shells and the twig rod; persistent Shells unchanged by it; victory adds +200 Memories once and hangs the Lantern-Swallower |
| U5 | ui | hub HUD (Shells, Memories), the station pill, tap-to-walk glyphs | M | S4 | pills ≥ 56 px; the lake HUD is hidden in the hub |
| U6 | ui | **Set Out** screen (First Outing card; modes from the 2nd expedition) | M | Pg2 | expedition 1 shows only the First Outing card; expedition 2 shows three mode cards with Lantern preselected, the forecast, today's rumour and the tackle rating |
| U7 | ui | **Tackle** screen (tiers, outfit, tackle rating per lake) | M | Pg4 | buying and fitting update the bench models and the rating; proof status is shown per tier |
| U8 | ui | Homecoming and Snuffed summaries; mount and pond dialogs (`openMount` from `world.pickFrame`, `openPond` from `actors.pond.pick`); **the Mark-for-home toggle** on the catch card (nights, Live Well slots) | M | Pg2 | Homecoming hangs biggest first and asks before replacing a better mount; the Snuffed summary lists kept and sunk items; the card's toggle shows the nights left and refuses without a free slot |
| U9 | ui | Journal: ruler, seal grid, best setup, Elder Log, field notes, mount book | M | Pg1 | the seal grid shows 48 × 3 cells with the Lampwarden's Elder struck (143 earnable) + 4 legend seals; the ruler shows the last 12 catches and the dotted "said to reach" after a Trophy |
| U10 | ui | the title as the boot overlay over the cove; pause quick links (hub: every station; lake: Journal, Challenges, Settings, Title) | S | R3 | boot shows Begin / Continue / Settings over the cove orbit; pause at home lists every station screen and in a lake only the four |
| U11 (P3) | ui | the Chart at the Map Table | M | Pg9 | the chart shows the lake outline, discovered places, residents, Marked Fish, rumour marks and best fish per place |
| U15 | ui | HUD: Far Water ◆ gauge, the Homeward stone's distance, Live Well nights | S | S7 | from day 2 the gauge and distance show beside the oil; each Live Well fish shows nights left |
| Au2 | audio | cove ambience (hearth, lapping water, far bell, harp motif), Homecoming and mount stings; no `descend` sting on hub transitions | S | — | entering the cove never plays `descend`; Set Out plays `setout` |

#### 25.14.5 P4 work list: wonder and depth

| id | module | item | effort | depends on | acceptance test |
|---|---|---|---|---|---|
| D4 | data.js | species → 53; secrets; Found Relics; Vistas | M | §24 owner | validate-data: 53 species; legend rule holds with Candlewake (850 vs 370 = 2.30×); every secret has a clue and a reward |
| T1 (P4) | tools | the sulker in `tools/sim/reel-v3.mjs` before its code; retune the Blind Scrivener's Elder and the Lampwarden | M | — | Blind Scrivener Elder on T4 and Lampwarden Trophy on T4 inside §25.6.9's bands |
| T2 (P4) | tools | validate secrets, Found Relic gates, Vistas, the P4 species' places and conditions | S | D4 | seeded bad data (a secret with no clue) fails |
| F10 (P4) | fishing | the sulker surge kind (pump) | M | T1 | every 10–14 s a 4–6 s × √g sulk with a ◆ glyph; holding gains nothing; each lift after a ≥ 0.3 s release gives +0.04·RS/√g |
| F11 | fishing | legend growth (+7% per landing, cap × 1.5) | S | Pg3 | each rematch landing weighs 7% more, capped at × 1.5; the growth line is recorded |
| R4 | render | `vista` mode (raise the lantern) | S | — | a 1.5 s hold at a vista stand plays the sweep; places in line of sight get "?" on the chart |
| W7 | world | The Bloom, The Alignment, The Candle Tide (one per lake, ≤ 1 call each) | L | Wa3 | each fires on its schedule with ≤ 1 call; 600 (200 on low) candle-rafts |
| W8 | world | secrets (`shoreNotch`, §24 `needs` shapes), 12 Remnants | M | §24 owner | each secret opens only with its Found Relic or note; Remnants give a vignette and a rumour |
| A9 | actors / models | age marks on 10 headline species | M | A1 | each of the 10 shows its detail growing from Keeper to Elder |
| Pg10 | progression | Found Relics; the Chart's fog mask | M | W8 | a 64×64 fog mask per lake inks live as you move and persists; Found Relics show as owned in the Shrine |
| U12 | ui | postcard catch card (landmark strip) | S | — | the card paints the place's landmark strip behind the fish plate |

The six P4 species (Nightbloom Carp, The Remembered Sun, Vesper Gar, The Sexton, Candlewake Sturgeon, The Namesake) are data plus models (D4, A8) on existing places.

#### 25.14.6 External dependencies

§24's foot controller and walk camera for the Wick on foot at the Landing: **scheduled here as S0 and R0 (P3)** if §24's own build has not delivered them by then (`walkGridFor` is already in data; the cove's land does not need §24's grid mesher); fallback Landing v0 (§25.4.7) · §24's lake builds for every non-Mossmere place change (until then those lakes use `RAFT_FALLBACK_V3`) · the palette rework for lake palettes (Murk's recolour is A10 here).

### 25.15 Risks, cuts and originality

#### 25.15.1 Risks

| risk | mitigation |
|---|---|
| §24's foot controller lands late, and the Landing cannot be walked | S0 / R0 build it in P3 against `walkGridFor` (already in data); the cove's land has its own extrusion builder; Landing v0 (pill posts on the quay's parapet, the Wick on the raft, the same assets) if S0 slips. P1 and P2 need no §24 **code**: P2 builds §24.7's place kit itself (F14, Pg11, U16), and the three §24 lakes use the raft stopgap until their builds land. |
| Scope: 53 species, 29 places, 4 wow happenings, the cove | Phasing. **P1 + P2 deliver request 5 inside today's run structure**; **P3 delivers the expeditions-and-home decision**; P4 is content on a working loop. |
| Landing draw calls (pond, wall and arch in one view) | The mount batch (A4) is the linchpin, so measure it in week 1 of P3. Fallback: the 12 nearest mounts in 3D, the rest as painted plates in the frame atlas. |
| The pond pass misbehaves on some GPUs, or its `discard` costs early-Z in every lake | The discard is compiled only under `POND_HOLE` while in the cove (measured in `tools/perf.mjs`). The alternative is ready: a stencil pre-pass on the pond disc, or pond fish drawn after the water with depth test off, clipped to the pond disc, with a depth tint via `onBeforeCompile`. |
| True scale makes small fish hard to read in the water | Splash and wake by length, bite tells, the `trophy` camera, the palm pose, the float's favour; a phone QA pass in P1 |
| The lower camera hurts cast-distance judgement on phones | Phone QA in P1; fallback fish preset 30° / 13.5 m; the depth reticle and range ring stay |
| Steeper Elders feel unfair on arrival tackle | The bite tell (water dome) and the tackle rating warn first; *let it pass* keeps the bait; an escaped Elder becomes a Marked Fish that comes back weakened; commons and uncommons stay landable as Elders early |
| Far Water and the Live Well read as punishment | Both are shown on the HUD from day 2, the reward side is shown first (favour, resident shows), and the knobs are data (`BALANCE.farWater`, `liveWell`) with T3 targets |
| Persistent Shells inflate | Tackle 18,610 + outfit 3,680 + lures, tolls, pond and legend baits (28,240) meet income at ≈ h16.7 (§25.10.2); a post-game cosmetic shelf; T3 owns the numbers |
| Gloomtide balance drifts with persistence | Heat arrival offsets, Draft levels non-Angler, the creel range equals today's, combat kit stays per expedition, The Long Descent has its own purse and ignores persistent tackle |
| Drift toward Dredge (home port, sell, night danger, lose cargo, encyclopedia) | Selling is *not* why you go home (Murk buys in every lake). Home is a walkable cove of mounts at true size and living fish. No grid, no aberrant fish or morphs, no panic or sanity, no spoilage or value decay (the Live Well limits nights for a living fish). Size classes, the measuring ceremony, on-foot places, legend boss fights, run Boons and lantern oil as light come first. |
| The snuff sting is too soft or too harsh | Knobs: the tally loss (0.5), loss of fish marked for home (100%), Live Well nights, Far Water costs |
| Lantern as default annoys players who want calm | The First Outing is all still; one constant flips the default to Still (Q1) |
| Save migration for current players | Keep the Journal, records, relics, Wicks and challenges; refund cut relics; renames mapped; a 200-Shell welcome purse; the current run ends at the next title as a "return home" |
| Novice Keeper rares stay too easy until P3 and P4 (sim) | Runner in P3, sulker in P4, both simulated first; until then the challenge sits on Prize+ as designed |
| Tone of mounting fish in a tender world | Mounts are framed as keeping a memory (a candle under each frame, plaques with the Wick's name); a "likeness" fiction is a writing choice, not a system change |

#### 25.15.2 Already cut (decided)

Morphs (all 56) · geometry-moving weather (Highwater, The Low Breath, the Belfry lift) · the mid-fight drag dial · rod sweep · divers and snags · the cut-line button · count-down sink rigs · the net ring QTE (and the sim's net check) · pointer-target scatter casting · lure sizes and diet tags · the Live Fry well · Lamp Moths · moth fall · the thrasher head-shake · Gloom-fed and Ashwick's best-of-3 · approach shadows on every bite · the "Raise Lantern to reveal shadows" verb · the taxidermy fee · a Homecoming currency · Grand Astir · Waystone relics and Murk's Old Debt · per-expedition outfit purchases · line snaps and hooked theft in Lantern · the Bell-Chapel tackle gate · sit-and-sketch Vistas · the Wishing Font · the Moon-Eyed Koi · the Grey Stilt guide and the ambient-life set (optional later) · 40 rumours (now ≈ 24) · 36 commissions (now 3 Ledger slots) · satiety starvation · the feeding-spot mote columns · the Mossmere's "drowned high street" imagery (fountain, street lamp-posts), the Weeping Curtain and rain as its identity · the name "the Pale Leviathan".

#### 25.15.3 Originality guardrails (add to §22)

- **Hollow Knight:** the mood only (ink, rim light, silhouettes, melancholy). No rest-point map updating, no buying maps, no sit-and-sketch ritual (the Vista is *raising the lantern*; the Chart inks live). The Mossmere is a **drowned ferry harbour** (rust, iron, barges, a toll-gate, buoy-lanterns), not a rain-soaked city: no fountain, no street lamp-posts, no perpetual rain as a lake's identity (Drip is one condition every lake can roll). No "Pale + noun" names (the finale is the Lantern-Swallower), no masks, no "Archives". Avoid "bottled light" phrasing in new text.
- **Dredge:** no grid cargo, no mutated or aberrant fish (morphs cut), no panic or sanity meter, no spoilage or value decay, and Murk is never called a "collector". Drowned Marrow → Last Candle ("Marrow" echoes Dredge's home-port names now that we too have a home).
- **Real fishing games:** no bronze / silver / gold / diamond medal ladder (our seals are an ink stamp, oxblood wax and black wax with a ribbon), no per-species leucistic or melanistic morph checklist, and shadow-picking is never the main loop (blind casting plus signs and the float's favour is). The Live Well and drag presets are genre conventions.

#### 25.15.4 Cut order if the schedule slips, and the never-cut list

**Cut in this order:** 1. Remnants · 2. Vistas · 3. the Chart's fog (keep the static chart) · 4. secrets and Found Relics (and the Underdepth) · 5. The Candle Tide, The Alignment, The Bloom (Moonfall stays) · 6. the six P4 species (Nightbloom Carp, The Remembered Sun, Vesper Gar, The Sexton, Candlewake Sturgeon, The Namesake; if Candlewake goes, the Unpaid Fare moves to σ 0.16 as the Pallid's second giant-tail species) · 7. age marks · 8. the sulker (size scaling and old tricks still carry Glasswater) · 9. the pond's tier-3 floor painting · 10. today's rumour · 11. legend growth.

**Never cut:** **the Mossmere's places and giants** (P2, including Moonfall and persistent residents); all of P1, including the float's favour and the steeper Elders; the size model and the ceremony; the Landing's core (Long Wall frames, keep-pond and its pond pass, Map Table, Gear Bench, Murk, raft, sea-gate, jetty casting); Far Water and the Live Well; night modes and the hard rule; the runner.

---

## Appendix A. Balance simulation (audit pass)

`tools/balance-sim.mjs` is a seeded Monte-Carlo model of whole runs and whole campaigns. It reads every number from `src/data.js` and follows the rules in this document. Treat it as a **relative** instrument: it shows where a curve bends and which knob moves it. It does not replace playtests. `tools/validate-data.mjs` checks the data against CONTRACT §8 and the cross-references (22,295 checks).

### A.1 Rerun

```
node tools/validate-data.mjs                 # schema + cross-references; exit 1 on any failure
node tools/balance-sim.mjs                   # full report, seed 20261104 (≈ 4 min)
node tools/balance-sim.mjs --quick           # smaller samples (≈ 2 min)
node tools/balance-sim.mjs --reel            # per-species fight table: P(land) and time at on-curve gear
node tools/balance-sim.mjs --trace=skilled   # one annotated run, night by night
node tools/balance-sim.mjs --runs=800 --campaigns=60 --len=14 --seed=7 --json
```

### A.2 What is modelled

| layer | model |
|---|---|
| reel (`tools/sim/reel.mjs`) | The §5.5 per-frame tension model at 30 Hz: bands, drifting sweet band, surges with warnings, leaps, sinker drag, snap and slack, tiring, enrage, and the legendary phase mechanics (double surge, shrink, decoy, flicker, mixed surges, brittle, drag, no-slack dive). It is driven by a bot angler with a perception delay, perception noise, missed warnings, misread leaps and attention lapses. Results are memoised per species × gear × skill. |
| fishing day | Cast, flight, wait (§5.3), nibbles, feints and early taps, a lognormal hook reaction against the bite window, depth-band species picks with rarity weights, spots, bait, quality and weight. Catch rule: eat if satiety < 40%, render if oil < 40%, otherwise keep and sell to Murk. Top up oil from the creel at dusk. One Murk trip per calm. |
| economy | Gear is bought greedily by value per Shell, keeping a reserve for the legend bait or the toll. Supplies, Wax Patch and general bait are bought as needed. Bounties use expected value. Elite and Warden Shells, Trophy or Toll, Murk's Pity. |
| night | A 0.25 s step. Enemy cohorts spawn from `difficultyFor()` on the 22–34 m ring and walk in. The aura (auraDps × oil fraction) burns everything inside the light. All 10 weapon types and their Kindles are modelled. Single-target projectiles carry a 0.8 efficiency factor, and chain or bounce targets depend on how dense the swarm is. Zaps, flares, hands (stain, breach, slam, stagger), Wardens, formations, moths, eels, inkwells, ticks, the choir, i-frames, armor, Gutter-burst, Last Flicker, darkness, starvation, Burn-a-fish and the cinder magnet are included. Cinders become levels, and each level is a boon pick under the §10.2 offer rules. |
| meta | `memoriesFor()` plus challenge rewards, then greedy relic purchases. Challenge unlocks feed the boon pool. Each relic profile is a snapshot of 48 simulated campaigns after 0, 3, 8 or 12 runs. |

**Player assumptions** (`SKILLS` in `tools/sim/model.mjs`):

| | average | skilled |
|---|---|---|
| reel perception delay / noise | 0.22 s / 0.05 | 0.14 s / 0.025 |
| surge warnings noticed / leaps misread | 80% / 30% | 95% / 8% |
| hook reaction (median) | 0.36 s | 0.27 s |
| casts into spots | 55% | 85% |
| slam / glob / lunge dodge | 75% / 80% / 12% | 92% / 93% / 32% |
| zaps per second / flare when ≥ N close | 0.22 / 6 | 0.40 / 8 |
| cinder collection | 62% | 85% |
| descent policy | after 1 night in a lake with ≥ 60% Embers (or after 4 nights) | takes the lake's Warden night unless untouched (or after 4 nights) |

A third player, the **learner**, starts with the average skill and closes 6% of the gap to skilled each run, up to 60%. It stands in for the typical player in the campaign rows.

### A.3 Final results (seed 20261104; 500 runs per profile; 48 campaigns × 13 runs per skill)

| profile | relic lv | death day med (p10–p90) | reach Spore / Glass / Pallid | win % | Memories/run | level med |
|---|---|---|---|---|---|---|
| average · fresh | 0 | 4 (3–5) | 58% / 1% / 0% | 0% | 170 | 13 |
| average · after 3 runs | 7.0 | 4 (3–5) | 65% / 0% / 0% | 0% | 74 | 14 |
| average · after 8 runs | 12.4 | 4 (3–5) | 77% / 1% / 0% | 0% | 72 | 14 |
| average · after 12 runs | 15.8 | 4 (3–5) | 86% / 2% / 0% | 0% | 76 | 14 |
| skilled · fresh | 0 | 7 (5–9) | 100% / 86% / 9% | 1% | 491 | 27 |
| skilled · after 3 runs | 16.3 | 8 (5–12) | 100% / 97% / 46% | 7% | 284 | 34 |
| skilled · after 8 runs | 26.4 | 9 (7–12) | 100% / 99% / 74% | **26%** | 338 | 41 |
| skilled · after 12 runs | 32.6 | 9 (7–12) | 100% / 100% / 84% | 45% | 373 | 41 |

**Shells per day by lake** (all sources): average 135–148 in the Mossmere and 142–177 in Sporewood; skilled 234–259 / 403–574 / 608–968 / 932–1,138 from the Mossmere down to the Pallid Deep. A winning skilled run earns ≈ 9,000 Shells and spends ≈ 38% of the gear catalogue.

**Night pacing** (fresh profiles):

| | Embers lost N1 / N2 / N3 / N4 / N5 / N6 | oil net per night N1–N5 | level-up cadence, nights 2–3 | Warden killed |
|---|---|---|---|---|
| average | 0.0 / 1.4 / 3.2 / 2.9 / 3.2 / 4.0 | −22 / −33 / −63 / −42 / −42 | every 32 s | 4% of boss nights |
| skilled | 0.0 / 0.1 / 1.1 / 1.0 / 2.8 / 2.1 | −39 / −40 / −34 / −45 / −40 | every 24 s | 48% (median 53 s) |

**Where Embers are lost:**

| | swarm contact | hand slam | inkwell glob | Warden | eel |
|---|---|---|---|---|---|
| average · fresh | 5% | 58% | 15% | 20% | 2% |
| skilled · fresh | 18% | 20% | 51% | 10% | 1% |
| skilled · after 8 runs | 4% | 22% | 62% | 12% | 0% |

**Campaigns** (median run of the first arrival): average — Sporewood run 1, never Glasswater within 13 runs; learner — Sporewood 2, Glasswater 9, Pallid Deep > 13 (15% by run 13); skilled — Sporewood 1, Glasswater 1, Pallid Deep 3, **first victory run 8** (54% of skilled campaigns have won by run 8 and 96% by run 13).

**Degenerate-strategy probes** (skilled):

| meta | strategy | death day med | win % | Memories/min |
|---|---|---|---|---|
| fresh | baseline | 7 | 1% | 17.2 |
| fresh | render every fish | 7 | 0% | 16.0 |
| fresh | all Shells on Searing Mantle | 6 | 0% | 16.8 |
| fresh | zap spam ×3 | 7 | 0% | 16.9 |
| fresh | never descend (camp) | 15 | 0% | 9.6 |
| 8 runs | baseline | 9 | 28% | 8.5 |
| 8 runs | never descend (camp) | 19 | 0% | 5.7 |
| 8 runs | all Shells on Searing Mantle | 9 | 0% | 6.9 |

No single strategy dominates. Rendering every fish is capped by maxOil and starves the Shell economy. A mantle-only build cannot buy line for the legendaries. Zap spam burns oil. Camping dies around day 15–19 to linger Heat and earns about 45% fewer Memories per minute than descending.

**Targets:** fresh average median death on day 4 ✓ (3–6); fresh average reaches Glasswater 1% ✓; fresh skilled median day 7 ✓ (6–8); skilled with 8 runs of relics wins 26% ✓ (10–40%); the average player buys 3.3 relic levels after run 1, which includes the one-time challenge burst, and 1.2 per run after that ✓ (1–3); every degenerate-strategy probe passes ✓.

### A.4 Changes made in this pass (before → after)

| area | change | why |
|---|---|---|
| first-catch Shells | `newSpeciesShells` 1.5 → **1.0**, and **no first-catch Shells for legendaries** (`newSpeciesLegendary: false`) | A run-1 Matriarch paid 210 Shells on top of her sale, so the first toll was free and 72% of first-time players reached Sporewood on day 3 |
| tolls | 120 / 300 / 650 → **180 / 420 / 900** | A legendary's sale (≈ 130–180, 320, 600) now covers only part of the next toll. Trophy or Toll stays a real choice and the gate is a real economic barrier |
| zone `valueMult` (bounties, elite Shells) | 1 / 1.8 / 3 / 4.5 → **1 / 1.5 / 2.2 / 3** | Deep-lake bounties paid 150–240 Shells each, and deep Shell income ran 4–5× this document's §9.3 table |
| Heartwax | **once per Warden per run** (`heal.heartwaxOnce`) | A camper killed the Wickeater every 3rd night and stacked maxHp to the clamp of 12, which made camping immortal |
| linger Heat | **+1 Heat per night beyond a lake's 4th** (`director.lingerFrom` 4, `lingerHeat` 1; `heatFor(day, z, nightInZone)`) | Fresh skilled campers survived to day 22–28 and earned more Memories per run than descenders |
| Warden hp | hp × hpMult → hp × **bossHpMult = 1 + 0.3·H**; base 1200 / 1500 / 1500 / 1600 → **1000 / 1100 / 1200 / 1400** | Under quadratic hpMult the simulated kill rates were 8% / 4% / 0% / 0% (target: 40–55 s on-curve). Now skilled kills in ≈ 53 s at the median |
| Wickeater contact | 2 → **1** Ember | It killed 55–60% of first-time players on night 3 on its own. Now it teaches tells; its maw still costs 2 |
| elite floor | `eliteMin` 15 → **22** s | With pairs of Ringed Grasp every 15 s, a hand was always slamming; the first Pallid night was 85–100% fatal |
| hits worth more | `damageStep` 8 → **12** (hands 3 Embers from H 12, everything 2 from H 24) | At H ≥ 16 every glob cost 2 and every slam 4, a cliff at exactly the finale |
| legendary fights | **no new elite hands while a legendary is hooked** (`combat.legendPausesElites`); a hooked gloom legendary holds the Gloomtide open until it resolves | An anchored Wick cannot dodge (dodge × 0.35), so night legend fights were decided by hands, not by the fish |
| Silverthread | appears from **Glasswater** (was Pallid Deep) | Players had no way to buy finale line before the 900 toll plus the 320 bait |
| Pale Leviathan | stamina 38 → **44** | Paired with the night extension, the first attempt stays a coin flip for a geared skilled player (≈ 50% at LS 2.1, ≈ 78% once wounded) |
| Weeping Inkwell | hp 14 → **11**, lob every 4 s → **5 s**, cap +1 per 6 H → **+1 per 8 H** | It was the top killer for every skill from Sporewood on. Only zaps and hunting reach it, and its hp grows quadratically while zap damage grows linearly |
| swarm toughness | `hpLin` 0.20 → **0.24** | The swarm almost never reached the raft (≤ 5% of Embers lost); this pushes it toward the "build matters" intent |
| Memories per run | nights 3 + 1.5z → 3 + **1.0**z; depth 15/35/60 → **10/25/45**; legends 20 → **15**; bounties 4 → **2**; kills /25 → **/50**; hands 2 → **1**; trophies 15/30/50 → **10/20/35** (now `BALANCE.memories`) | Skilled players earned 450–650 per run, 2–3× the §17 trajectory |
| challenge Memories | perfect_10_run 15 → 10, shimmering 10 → 5, naturalist 15 → 10, untouched 15 → 10, down_the_sluice 20 → 15, unwarded 20 → 15 (861 → 831 total) | The run-1 burst for an average player bought 4–5 relic levels |
| relic costs | all costs × 1.35 × 1.15 ≈ **× 1.55** (7,775 → 12,050 total) | Skilled players won 46–60% after 8 runs; the target is 10–40% |

### A.5 Findings and risks for implementers

1. **The swarm itself rarely kills.** Fodder makes up 4–18% of Embers lost. Weapons and the aura win the raw damage race by about 3–6× at every Heat for an on-curve build, and fodder only leaks when a build lags far behind or the light collapses. Deaths come from telegraphed hits: hand slams (55–60% for average players) and inkwell globs (50–60% for skilled players). **The night's difficulty therefore rests on tell readability and dodge windows.** Playtest the stain (1.4 s + 0.6 s breach) and the glob ring (1.2 s) early. If fodder should matter more, the knobs are `hpLin` (now 0.24), `ratePerHeat` (0.12) or projectile damage.
2. **Darkness and starvation never kill in the sim** (§18.4 wants about 25% and 10%). Oil sits at 50–65% through each night: renders, drips, elite oil and Burn-a-fish cover the burn. If the oil pillar should bite harder, raise `oilDrain` (0.14) before touching yields. `oilDrain` 0.17 together with `hpLin` 0.26 was tested and still met every target, with skilled players winning 15% after 8 runs.
3. **Inkwell targeting.** Nearest-first weapons never shoot inkwells that hold 13–18 m away. Combat may give homing motes and the hook a 25% chance to prefer an artillery target; if it does, rerun the sim, because inkwells are the main skilled-player killer.
4. **Legendary fights at night.** Implement `legendPausesElites` and keep the Gloomtide open while a gloom legendary is hooked. Leviathan fights run 85–125 s. DESIGN previously did not say what happens to a fight at dawn.
5. **The Pale Leviathan is a gear gate.** Skilled landing chance is ≈ 2% at line strength 1.6, ≈ 30% at 1.9 and ≈ 50% at 2.1; a learner at 50% skill is ≈ 15% at 1.9 and ≈ 30% at 2.1. Silverthread from Glasswater is what makes it reachable. The wounded carry-over is large (a 0.3 start roughly doubles the chance), so get `woundedCarry` right.
6. **Formation ambiguity.** `tide.packSize {base:18, perHeat:1}` is simulated as a **total** of 18 + H mites split into 3–4 packs. Read as a per-pack size it is 3–4× that. Formations bypass `maxAlive` in the sim.
7. **The skill axis outweighs relics.** A player who never improves stays at a median death on day 4 even with 16 relic levels, though Sporewood arrivals rise from 58% to 86%. The learner reaches Glasswater around run 9. Most of the gap is dodge rates, so readable tells and the death-screen tips (§6.8) matter more than numbers.
8. **The economy is richer than §9.3 claimed.** Fish sales are about 2× higher because elite oil means fewer fish need rendering. The gear catalogue is still only ≈ 38% buyable in a winning run, so every build remains a choice.
9. **Integration.** `difficultyFor` gains `bossHpMult`, and `heatFor` takes `nightInZone` (combat should pass it). Progression must apply `heartwaxOnce`, no first-catch Shells for legendaries, and `BALANCE.memories`.

## Appendix B. The foot profile (walking build)

`tools/balance-foot.mjs` drives the unmodified v1 model (`tools/sim/model.mjs`) twice on the same seeds: once as today (raft everywhere) and once with the walking build's inputs per lake. It reads every number from `src/data.js` and the walk maps through `walkGridFor`. Like Appendix A it is a **relative** instrument.

```
node tools/balance-foot.mjs                  # v1 vs walking build, two seeds pooled (≈ 10 min)
node tools/balance-foot.mjs --quick          # smaller samples
node tools/balance-foot.mjs --route          # day routes from the walk maps
node tools/balance-foot.mjs --kin            # kinematic dodge table
node tools/balance-foot.mjs --reel           # the Pale Leviathan from the Brink and from the Hands
```

| layer | what the walking build changes in the model |
|---|---|
| days | A day plan per lake on the body-eroded grid: dawn candle (the free flame-leap lands at the candle nearest today's Astir place) → the Astir place → the nearest other place → Murk's dock of the day → a vigil candle, path time × 1.2. Walking replaces the raft's relocation between catches and its Murk trip (Sporewood: the walking legs come on top of 60% of v1's sailing). Casts in places count as feeding spots by strength (base place 0.6, Astir 1.2 spot-equivalents; outside places 30% of v1's spot casts). Sharing flame costs 12 × zone drain per candle (2 a stay for average, 4 for skilled), Known Places make first shares free run to run, memorial candles give oil back, Arrival Hush on the first calm in a lake. |
| nights | Kinematic dodges: escape probability from a hand stain (3.2 m, 2.0 s), an inkwell glob (2.4 m ring, 1.2 s, 0.6 s lead) and a Warden lane (1.5 m half-lane, 1.0 s; aligned with walkways) for the raft (top 6 m/s, accel 3/s, glide) and for the Wick (top 5.0 m/s, accel 6/s) in the open and on walkways (one-dimensional escapes), with each skill's reaction time and missed tells; the model's calibrated raft dodge rates are scaled by the ratio of kinematic failures. Contact 1.6 m; crawlers × 0.9 land speed × straight / path distance; eels only within reach of open water; darkness at half rate for the share of the night spent inside a candle; kiting slowed on narrow walkways. Sporewood nights are half on the raft. |
| campaigns | 48 campaigns × 13 runs per skill and seed; Known Places accumulate; the tier IV relics are not bought (their Memories go to v1 relics, which errs toward harder). |

Assumptions the maps cannot give (`FOOT_ASSUME`): share of a night on walkways narrower than 4 m (Sporewood 15%, Glasswater 30%, Pallid 50%); within reach of open water (80 / 55 / 85%); inside a lit candle (average 30%, skilled 50%); casts in places (60 / 85%) and in the Astir place (20 / 35%); crawler straight / path ratio (0.85 / 0.8 / 0.75). Replace them with telemetry.

**Day routes** (walking per day, × 1.2): Sporewood 8 s (jetty legs; sailing as v1), Glasswater 42 s, the Pallid Deep 41 s — against ≈ 41 s of relocation and Murk trips on the raft for a skilled player.

**Kinematic dodges** (escape once the tell is seen; raft / foot open / foot walkway): average — slam 93 / 92 / 88%, glob 76 / 70 / 56%, Warden lane 74 / 69 / 71%; skilled — slam 98 / 98 / 97%, glob 95 / 95 / 93%, Warden lane 92 / 94 / 95%.

**Results** (seeds 20261104 and 7 pooled; 300 runs per profile and 48 campaigns × 13 runs per seed):

| profile | death day med (p10–p90) | reach Spore / Glass / Pallid | win % | level-up every |
|---|---|---|---|---|
| v1 · average fresh | 4 (3–5) | 63% / 0% / 0% | 0% | 32 s |
| walk · average fresh | 4 (3–5) | 60% / 0% / 0% | 0% | 32 s |
| v1 · skilled fresh | 7 (5–9) | 100% / 84% / 9% | 0% | 24 s |
| walk · skilled fresh | 7 (5–10) | 100% / 85% / 19% | 0% | 24 s |
| v1 · skilled after 8 runs | 9 (6–12) | 100% / 99% / 70% | 22% | 24 s |
| walk · skilled after 8 runs | 10 (7–12) | 100% / 99% / 81% | 25% | 24 s |

First victory (median run of the skilled campaigns): v1 9 (44% won by run 8, 85% by run 13) · walk 9 (49%, 95%). The learner first reaches Glasswater at run 9 (v1) / 10 (walk) and never reaches the Pallid Deep within 13 runs in either build.

| lake (skilled, fresh + after 8 runs) | catches / day | Shells / day | Embers lost / night | oil net / night |
|---|---|---|---|---|
| The Mossmere | 6.0 → 6.0 (0%) | 237 → 239 (+1%) | 0.1 → 0.1 | −43 → −43 |
| Sporewood Pools | 6.0 → 6.4 (+7%) | 452 → 457 (+1%) | 1.2 → 1.2 (−4%) | −50 → −49 |
| Glasswater Vault | 5.7 → 5.8 (+2%) | 727 → 742 (+2%) | 3.1 → 2.8 (−9%) | −56 → −55 |
| The Pallid Deep | 5.8 → 5.8 (+1%) | 1014 → 1042 (+3%) | 5.0 → 5.1 (+4%) | −37 → −44 |

**Acceptance** (all PASS): average fresh median death day 4 (3–5); average fresh Glasswater reach ≤ 3%; skilled fresh day 7; skilled after 8 runs wins 10–40% (25%); first win in runs 7–9 (9); the learner reaches the Pallid Deep at run ≥ 12; Embers lost per night within ±10% of v1 in Glasswater and the Pallid Deep; catches and Shells per day within ±10% of v1 in all three walking lakes; level-up cadence within ±10%; darkness's share of deaths does not drop (it is 0% in both builds — the model's oil economy never lets darkness kill, Appendix A.5 #2 — so the knob for it stays `oilDrain`, then `lamps.darknessShelter`).

**What the profile changed.** With the first revision's day numbers (speed 0.82, calm 125 s in the foot lakes, +30 s hush in Sporewood) foot days came out 5–18% richer than v1 while skilled campaigns first won about one run later (median run 10–11 against 9–10), mostly from slower Glasswater nights on narrow walkways. Dropping the calm overrides brought every lake's catches and Shells within ±7%; speed 0.84 (with accel 6 / decel 8 and Warden lanes aligned with walkways) brought the night and campaign rows back to v1's. Per-seed results swing by ±1–2 runs on the first win; the pooled pair is the number to trust.

**The Bottomless's stances** (`--reel`, line strength 1.9, reel 1.45, sweet zone 0.2): skilled land 43% from the raft (v1), ≈ 50% from the Brink (flat line) and ≈ 30% from the Joined Hands (steep line); the average player is at 2–3% everywhere (the finale is a skill and gear gate).
