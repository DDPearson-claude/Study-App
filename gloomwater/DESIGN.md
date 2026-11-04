# GLOOMWATER: Game Design Document

*Sail · fish · survive the swarm. A lantern-lit 3D fishing-survival roguelite in a single HTML file.*

> **How to read this document.** `src/data.js` is the single source of truth for every number, and every table in this document is generated from it. When prose and a table disagree, the table (and data.js) wins. Section numbers (§) match the comments in data.js. The binding module APIs, events and state schema live in `CONTRACT.md`; this document specifies *behaviour*. "Optional extension" means a field or call outside the contract that consumers must read with `?.` / `??`.

**Vocabulary (ours, always):** the **Wick** (player), **Old Murk** (toad merchant), **Shells** (run currency), **Embers** (health, shown as small flames), **Cinders** (XP dropped by gloomlings; the contract's "embers (XP)" are called Cinders in-game so they never clash with health), **Memories** (meta currency), **Relics** (permanent upgrades), **Boons** (level-up picks), **Kindles** (level-6 weapon fusions), the **Gloom** and **Gloomtide** (the night), **gloomlings** (night enemies; never "shades" in UI text), **Wardens** (night bosses), **Waystones** (start deeper), the **Shrine of Drowned Lanterns**.

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
- **Reticle.** On the water at `raft + dir · max(minDist, charge·castMax)`: a thin bone-white ring, tinted and labelled by `DEPTH_BANDS` of `world.getDepth` there (shallow < 0.35 pale teal, mid < 0.75 amber, deep violet with a gold rim). A dotted range ring at `castMax` around the raft. A spot under the reticle brightens. `view.hint` = 'shallow' | 'mid' | 'deep'.
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

## 19. Art direction: "hand-inked melancholy"

### 19.1 Global rules
- **Silhouette first.** Near-black ink shapes with a pale rim light (`toon.toonMaterial` + `toon.addOutline`); faces are minimal: glowing eyes only.
- **One warm light.** The Wick's amber lantern (≈ #ffb347) is the only warm light in each cold lake; Murk's lamp is a dim green. The swarm reads as ink against the lantern's warm pool, rim-lit violet (#6b5b8f).
- **Layered depth.** Inside the lake: islands and pillars (toon, outlined, fog on). At R: cliffs. Beyond the cliffs: **4–6 parallax silhouette rings** at R+15, +30, +50, +75, +100 m and a backdrop card at ≈ R+140, fading from `ink` to luminous `far`. FogExp2 at ≈ 0.02 swallows anything past ≈ 90 m, so rings beyond 40 m use `toon.silhouetteMaterial(color, {fog:false})` with a pre-mixed value ladder: ring 1 `lerp(ink, fog, 0.35)` (fog on), ring 2 `lerp(ink, fog, 0.6)`, ring 3 (hero) `lerp(fog, far, 0.25)` with emissive `glow`/`accent` details, ring 4 `lerp(fog, far, 0.6)` with feathered bottoms, backdrop: vertical gradient (top `fog × 0.5`, horizon band `far`, bottom `fog`). Between rings, 2–3 **mist cards** (wide planes at y 0–6, colour `fog`, opacity 0.25–0.4, slowly drifting canvas-noise alpha) sell the parallax.
- **Composition.** The camera looks north, so each lake's **hero set piece sits beyond the north shore**, framed by darker flanking shapes, with clear negative-space windows. Ceilings at 25–35 m with stalactites and hanging details.
- **Phase response** (world reads `survival.getPhaseInfo()`): *dusk* ambient ×0.75, light ×0.6, fog 20% toward `ink`, glow particles ×1.2 (the world lights its lamps); *gloomtide* ambient ×0.45, light ×0.25, fogDensity ×1.35, fog 35% toward `ink`, grade exposure ×0.85, saturation ×0.8, tint toward #1c1838 (+0.15), vignette +0.12, most glow particles ×0.4 except the lake's gloom tell; *dawn* light 30% toward #ffe0b8 and ×1.3, then ease back.
- **Budget.** Merge each ring into 1–2 geometries or InstancedMesh (≈ 30–45 world draw calls), ≤ 2 world accent lights, light shafts as additive quads with `toon.glowTexture`.

### 19.2 Palettes and grades (from `ZONES`)
| key | The Mossmere | Sporewood Pools | Glasswater Vault | The Pallid Deep |
|---|---|---|---|---|
| `fog` | #1a3436 | #2b1b30 | #131a3c | #1c1b18 |
| `fogDensity` | 0.016 | 0.019 | 0.012 | 0.022 |
| `water` | #1f3d3b | #2a1a2e | #131c3e | #14130f |
| `waterDeep` | #081719 | #0d0710 | #04061a | #030302 |
| `foam` | #bfe3d4 | #f3d3e0 | #c9e8ff | #e9e2cf |
| `glow` | #6ff5c8 | #ffb46a | #5ff2ff | #e8c66a |
| `accent` | #d6f59a | #ff7fb0 | #b48cff | #eae4d3 |
| `ambient` | #3d6662 | #5b3f63 | #2f3a78 | #3a3833 |
| `ink` | #050c0d | #0b060d | #03040e | #020202 |
| `far` | #5a9488 | #80588a | #5062b0 | #a8a18c |
| `light` | #cff7e6 | #ffd9c4 | #d8e8ff | #f0dca0 |
| grade | exp 1, bloom 0.85/0.6/0.72, tint #2e6b63×0.18, vig 0.38, sat 0.85, grain 0.05 | exp 1.02, bloom 1.05/0.75/0.68, tint #6b3a6e×0.2, vig 0.4, sat 0.9, grain 0.05 | exp 1.05, bloom 1.15/0.55/0.65, tint #2a3a8a×0.2, vig 0.35, sat 0.95, grain 0.04 | exp 0.95, bloom 0.9/0.8/0.7, tint #5a4e2a×0.12, vig 0.5, sat 0.6, grain 0.07 |

### 19.3 The Mossmere (moss-teal, mint glow, lime lichen)
- **Hero (north, beyond the Moss Sluice):** *The Sunken Gate*: a colossal half-drowned round arch on box piers with a broken portcullis hanging askew; beside it a bell tower leaning 12° with a cracked bell glowing faint mint (accent light #1).
- **In the lake:** the *Drowned Gatehouse* island (half-sunk tower), the *Toppled Bridge* piers with chains dangling from the break, pylons and statue stumps, the two *Sisters* rocks; the *Bell Pool*'s sunken temple bell visible as a dim shape under the water.
- **Shore & rings:** moss-bearded cliffs, drowned arcades with hanging roots (TubeGeometry on Catmull-Rom curves) and moss "beards" (alpha planes), a far colonnade, a slow waterfall curtain (scrolling noise alpha) from a ceiling crack.
- **Floating:** notched lily pads (instanced 30–50, a few with mint glow-buds), driftwood, a half-sunk pair of stone hands cupping an empty bowl.
- **Particles:** ≈ 150 drowsy mint motes on slow sine paths, ≈ 60 falling moss flecks. **Shafts:** 2–3 pale mint shafts, 15–25°, flickering.
- **Gloom tell:** motes die out except a handful; roots sway at 2× amplitude.

### 19.4 Sporewood Pools (dusky plum, amber spores, pink accent)
- **Hero:** *The Mother Cap*: a fungal tower rising out of sight with 4–5 tiered shelf-caps (LatheGeometry), amber radial gill stripes under each cap (canvas texture), spores pouring like slow snow (accent light #1 under the lowest cap).
- **In the lake:** the *Cap Reef* (four fallen caps on a pale mycelium mat), lily caps, the *Stalk Groves* (giant thin-stemmed mushrooms); puffball pods with emissive pink dots.
- **Shore & rings:** gill-walls with glowing shelf fungus, drowned garden trellises swallowed by translucent pink mycelium veils, curled fern fronds, a far forest of stalks in misty plum; backdrop with a low amber spore haze.
- **Ceiling:** downward pale caps and mycelium threads ending in glowing amber/pink droplets. **Floating:** fallen caps drifting like boats, bobbing puffballs.
- **Particles:** ≈ 250 spores (70% amber, 30% pink) rising in lazy spirals; occasional puff bursts. **Light:** soft glow pools under caps, one faint rose-white shaft.
- **Gloom tell:** cap glow drops to 30%; spores turn grey-violet and *fall*.

### 19.5 Glasswater Vault (indigo, cyan crystals, violet accent)
- **Hero:** *The Prism Orrery*: a vast ring of instanced octahedra on a torus, hung by four long chains, turning at 0.02 rad/s around a pulsing cyan heart crystal (accent light #1).
- **In the lake:** six *Bookshelf Monoliths* (crystal slabs holding thin crystal "volumes") on the trench, the *Reliquary Ring* of pillars around the *Vault Seal* (a glass dome over the gate), shelf crystals near the shore; the trench reads as a darker ring of water.
- **Shore & rings:** faceted crystal cliffs, a colonnade of glass pillars with pointed arches (some shattered), a fallen chandelier half-sunk, a far forest of needle spires with violet-to-cyan edge gradients; an indigo backdrop with slow cyan aurora bands.
- **Floating:** drifting shards that bob and spin, sealed vials of bottled light, a few pale floating pages.
- **Particles:** ≈ 180 cyan/violet glints falling slowly with a twinkle. **Shafts:** 3–4 crisp narrow beams, each split into 2–3 tinted beams (refraction).
- **Gloom tell:** crystals go dark one by one from far to near; the Orrery stops turning.

### 19.6 The Pallid Deep (near-black, bone-white, sickly gold)
- **Hero:** *The Two Who Kneel*: the two veiled giant islands kneel facing each other over the Well, **no faces at all, only cloth**, their joined hands holding an extinguished lantern; overhead the *Old Ribcage*, 8–10 pairs of curved bone tubes arching across the ceiling (the Rib Arch pillars are its lowest ribs). A thin sickly-gold crack-light falls on the dead lantern (accent light #1).
- **In the lake:** funeral barge wrecks, memorial posts with tattered ribbons, cairns topped with unlit candles, vertebrae jutting from the water, the pale causeway.
- **Shore & rings:** bone-white terraces with rows of dead candles, a ruined funerary colonnade, huge iron chains descending into the water (some taut, as if holding something below), a sealed great door traced faintly in gold; backdrop near-black with a bone-ash horizon band so the giants read as dark silhouettes against pale mist.
- **Floating:** unlit memorial candles on tiny bone rafts, paper boats, drifting pale petals.
- **Particles:** ≈ 220 falling bone-ash motes, ≈ 30 rare gold sparks drifting upward. **Shafts:** one thin gold shaft (the hero) and a faint pale one near the raft.
- **Gloom tell:** the Ribcage "inhales" (scale y 1.0 → 1.02 over 6 s), gold dims, the water goes to pure ink; before the player owns Drowned Marrow, two gold eye-glints may open far out in the fog during the gloomtide. **Victory:** every memorial candle lights gold, one by one, from the raft outward.

### 19.7 Characters
- **The Wick** (≈ 0.6 m): an egg-shaped body in a **patched umber-rust cloak** (#4a2e24, hem frayed into 3–4 points) with a pale wax collar; head a short fat **ivory candle** (#e9dfc6) with a melted rim and 3–4 drips; a deep **hollow face recess** (ink-dark inset, no mask plate) holding **two small glowing amber eyes**. A living flame on top = vitality: tall amber when healthy, orange-red and shorter below 50%, a guttering pale blue (#9fd8ff) at 1 Ember; it flares 1.4× when eating or rendering. Stubby legs dangle over the edge while waiting; a long bent driftwood rod with a bone reel and a tiny brass bell. Idle: a wax drip falls (plip), the cloak breathes, the head tilts toward splashes, hands warmed at the brazier at dusk. *Not-the-Knight check:* no horns, no white mask, no black oval eyes, no grey-blue cloak. The candle head is the signature.
- **The raft:** lashed dark planks, a crooked pole with a hanging iron lantern (the main light), a tiny brazier, a lidded wicker creel, a bone rod-rest, an oar, an oxblood pennant, a small chime. Raft levels 1–3 add an outrigger, a second lantern hook, a canvas awning. Mounted trophies hang from the pole.
- **Old Murk:** a hunched, enormous mossy toad (#4d5a3f with lichen patches #b9c79a), heavy-lidded faintly glowing pale-yellow eyes (#e8e08a), a drooping lip, a moth-eaten shawl; a towering teetering pack (jars of murky bait, empty birdcages, coiled rope, dead lanterns, rods, a crooked umbrella, a fish-bone wind chime); a dim green lamp (#8fd47a) on a hooked pole; a lily-pad barge with a hand bell on a post. Slow blinks, throat-sac swells before speaking, an occasional tongue-flick at a passing moth.
- **Gloomlings:** near-black ink bodies (#07080d) with a faint violet rim and distinctive eyes (per-lake eye colours in data). *Gloomling*: a fist-sized curl of living ink, pinprick eyes, a smoke tail. *Inkmite*: soot-black ticks with one lime glint, moving like spilled grain. *Duskmantle*: powder-violet moth whose wings carry two pale-blue painted eyes. *Creelsnatch*: a ribbon of shadow with lime hook-teeth. *Sporeling*: puffball gloomlings trailing amber spores. *Weeping Inkwell*: a tall bowed figure with a swollen ink-sac under its chin, black tears running into the water. *Bell-Jar Tick*: a hound-sized tick under a cracked glass bell-jar, a pinned moth still inside. *Silent Choir*: tall veiled figures in rows; outside the light only gold pinpricks. *Drowned Hand*: a colossal dripping hand rising from an ink stain, tarnished brass rings on two fingers.
- **Wardens** (model `warden`): *The Wickeater*: a colossal hooded gloom with a hollow teal-lit maw and candle stubs in its hem like teeth. *The Veiled Gardener*: towering, draped in plum veils of mould, an amber glow where a face should be. *The Shard Abbot*: robed in shelved crystal like a walking library. *The Lightless Ferryman*: a hooded giant poling a boat that isn't there, a dull gold coin for each eye.
- **Weapon VFX** (toon glows and lines, additive): amber coals with ink comet-tails; pale seeds of light; a low orange ribbon of fire on black water; a barbed iron hook on a glowing thread; white-gold forks; a green-bronze bell with frost-blue rings; the light itself throbbing outward as an ink-edged ring; cracked cork bobbers with ember light; an ink spiral rimmed with foam; hard pale lighthouse shafts.

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
Thin ornate **bone-white linework** (#e9e2cf at 80%) on **ink-wash panels** (near-black, 70–85% opacity, soft paper texture), serif type (Cinzel for titles, Cormorant Garamond for body; Georgia fallback), restrained motion (fades and 150–250 ms eases), rarity colours from `RARITY_COLORS`. Nothing loud; nothing that copies another game's HUD.

### 21.2 HUD (playing)
- **Bottom-centre "lantern cluster"** (the original signature layout): a vertical lantern-glass **oil gauge** (amber fill that dims and narrows as it empties; cracks glow at ≤ 25%); a curved **wax-drip satiety bar** hugging its left side; a row of small **Ember flames** in an arc above the lantern (the last one gutters blue). Flare cooldown is a ring around the lantern's cap on desktop.
- **Top edge:** a hairline **cinder ribbon** (XP) across the full width with a small diamond **level** medallion at its left end; owned boon icons in two tiny rows beneath it (weapons, then passives; level pips; Kindled icons gilded).
- **Top-centre:** the **day/phase clock**: a thin crescent arc with four segment ticks (calm, dusk, gloomtide, dawn), a moving bead, "Day N", the lake name small beneath. During the gloomtide the arc shows the hush tick near its end.
- **Top-right:** Shells (shell glyph), creel count (n / size), equipped bait (tap to cycle), perfect-streak flame pips; then 44 px Creel / Journal / Pause icons.
- **Right side (touch) / bottom-right (desktop):** Flare button (72 px with radial cooldown), Burn button (shows the fish to be burned), contextual Trade / Descend pill.
- **Edge markers** (off-screen, at the screen border with distance): Murk's green lamp, the gate (dim while sealed, bright when open), the nearest two spots (shimmer), the legend pool (gold, when active), elites and Wardens (red eye), a floating stolen fish.
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
*Walking build: who reads the v2 tables is listed in §24.12; CONTRACT §12 has the APIs.*

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

**`getStats(run)`** = STATS base + character effects + upgrades × level + relics × level + stat boons × level + journal perks + `run.flags.heartwax` (maxHp) + Mercy (rarityBonus), then clamp to each STATS `min…max`. Special relic keys are applied by `createRun` / `memoriesFor` / survival as described.

**`createRun({startZone, character})`**: shells = 20 + 30 × old_debt level + character kit shells + Waystone purse; bait = character kit + Drifter's Bundle; `boons = {[startBoon]: 1}`; zonesUnlocked = all lakes ≤ start; hp/oil/satiety at max; `xpNext = xpForLevel(1)`; `flags = {zoneEnteredDay: 1, streak: 0, mercy: 0, heartwax: 0, wounded: {}}`; Waystone banked levels → Kindling Draft at run start.

### 23.2 Optional extensions (always read defensively)
`difficultyFor(…, {nightInZone})` and its extra return fields; enemy fields `flies, waterBound, pack, packPerHeat, maxAlive, auraTaken, telegraph, variants, zoneMods, abilities, phase2`; boon fields `kindle, proc, onPick, levels[].note`; character `quirk`; species `boss, hint, epithet, tier`; bait `zone, legend, attract, weightBias, shimmer, gloomDraw`; `fishing.view.surgeKind / decoy / shards / bandsHidden`; `fishing:escaped {cut:true}`; `progression.tryRevive?.()`; `survival.spawnEnemy?.()` for scripted summons; `ctx.debug.threat?.()`; ui's Burn-a-fish (R) and Kindling Draft; settings `reelToggle`, `reducedFlashing`. Balance-pass additions: `difficultyFor(…).bossHpMult` (Warden hp = base × bossHpMult), `heatFor(day, zoneIndex, nightInZone)` (linger Heat), `BALANCE.combat.director.{lingerFrom, lingerHeat, bossHpLin}`, `BALANCE.combat.legendPausesElites`, `BALANCE.heal.heartwaxOnce`, `BALANCE.economy.newSpeciesLegendary`, `BALANCE.memories` (all `memoriesFor` constants).

### 23.3 Debug hooks (contract §11) used by this design
fishing `forceBite()`, `instantCatch(id?)`; survival `skipPhase()`, `god(on)`, `setPhase(name)`; combat `spawn(idOrKind)`, `killAll()`, `levelUp()`, `giveBoon(id)`; progression `addShells(n)`, `addMemories(n)`, `unlockZone(id)`, `giveFish(id)`, `openGate()`, `completeChallenge(id)`; ui `ui()`.

## 24. Exploration on foot (v2, revision 2)

*The descent becomes a journey that changes how you move: the Mossmere is sailed, Sporewood Pools is sailed and walked, and the Glasswater Vault and the Pallid Deep are walked to interesting, unique fishing locations. Everything here ships behind one flag, `WALK_ENABLED` (CONTRACT §12.0): with it off every v1 table is bit-identical; with it on the walk tables merge in. Every number is in `src/data.js` (`BALANCE.walk / places / lamps / combat.foot`, `ZONE_V2`, `ARENA_V2`, `WALK_*`, `walkGridFor`). `node tools/walkmap.mjs <zone> [--open] [--variant=id]` prints the maps and walk times below straight from data; `node tools/validate-data.mjs` checks every v1 table and every rule in this section on the body-eroded walk grid; `node tools/balance-foot.mjs` runs the foot profile against v1 (Appendix B). §24.15 lists what changed in this revision and why.*

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
| 10 | **Day length unchanged** (120 s calm everywhere). **Arrival Hush** only where walking is long: +30 s on the first calm in Glasswater and the Pallid Deep, +10 s in Sporewood; no calm raid that day. | The dawn leap and the places' bonuses pay for the walking (Appendix B: catches and Shells per day within ±7% of v1). |
| 11 | **Cut on purpose:** wading, falls / "sputter", raised still pools, grapnels, Shell-cost repairs, camera yaw hints, a fog-of-war chart screen. | Scope and clarity (§24.14). |

### 24.1 Map modes

| | The Mossmere | Sporewood Pools | Glasswater Vault | The Pallid Deep |
|---|---|---|---|---|
| `mode` | `raft` | `mixed` | `foot` | `foot` |
| you start | on the raft (0, 46) | on the raft (0, 52) | on foot, Lower Gallery (0, 51) | on foot, Landing of Last Rafts (0, 68) |
| raft | free (as now) | free; moor at 4 jetties, tow-bells | `skiff`: moored at the Harbour Steps; fenced by the low spokes into the east / south moat; moors at the Skiff Steps on the hub | `beached` at (6, 72) among hundreds of others |
| gate | sail in (as now) | sail in: The Mycelium Veil (0, −53) | on foot: within r + 2.5 m of the Vault Seal | none (the finale is the Bottomless) |
| calm | 120 s | 120 s (+10 Arrival Hush) | 120 s (+30) | 120 s (+30) |
| walkable / pools / water | 0 / 0 / 100% | 30 / 1.9 / 68% | 49 / 2.2 / 49% | 17 / 0.3 / 83% |
| places | Bell Pool (legend, as now) | 6 | 8 | 7 (+ the Breathing Deep) |
| per-descent variant | — | — | one of three bridges has fallen | the Sunken Road, or one Pallbearers' Walk, is under water |
| night choice | open water vs. the Gatehouse | raft mobility vs. high ground (Gill Crown) | eel-free hub loop vs. the long gallery | the Brink (flat line, eels) vs. the Joined Hands (steep line, eel-proof) |

**Saving and continuing.** Walking lakes save the Wick's position, mode and raft (`run.flags.pos`, `run.flags.raft`) on every autosave (phase changes, catches, purchases, zone changes, every 30 s, hide / pagehide), plus the day's per-place counters (candle-rafts relit, the Last Ferry, the leap), the planted Stake Lantern and the Arrival Hush. A continue snaps to the nearest walkable cell (or raft water) and falls back to the nearest lit candle, so quitting is never a free escape from a dead end and never a teleport to the spawn at night.

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
| `walk` (day, on foot) | 40 | 12.5 | 3.0 | 0.9 | 50 | 0.35 | 4.4 |
| `walkNight` (Gloomtide on foot; blended by nightK) | 56 | 16.5 | 1.5 | 0.4 | 52 | 0.25 | 4.6 |
| portrait `walk` / `walkNight` (replace v1's portrait widening on foot) | 44 / 58 | 12 / 15.5 | | | 60 / 62 | | |
| high ground (blend from 3 m to 5 m) | + 3° | + 1.5 m | | | | | |

- **Yaw stays fixed** (screen-up = −Z) on foot in every mode, shop and death included. Every layout is authored for a camera looking north.
- **Focus height** follows the ground on a spring (5/s) that ignores steps under 0.25 m; `camPos.y ≥ max(1.2, focusY + 2.5)`. A **terrain clamp** samples grid tops along focus → camera and raises the elevation or shortens the distance when rock is in the way, and keeps the camera inside R − 2 (Murk's dock on the east terrace, the Landing, the south-west terraces).
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
- **Gate:** the Vault Seal (0, 0) r 5: Descend within 7.5 m of its centre, on foot. On descending, the raft follows through the Seal's whirl and is beached at the Pallid landing.
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
| **Landing of Last Rafts** | bone-ash beach y 0.4 (south) | spawn (0, 68); the raft beached at (6, 72) among hundreds of others. |
| **The Spine** | vertebra causeway (0, 62) → (0, 31), 4 m, y 0.6–0.8 | the **Long Pier of Names** branches east (2, 46) → (34, 50). |
| **Cairn Plaza** | disc (0, 22) r 9, y 1 | **Pallbearers' Walks** west and east to the ends of the Rib Walk; **the Bier Road** north to the Bier Barge (−10, −20), its middle (**the Sunken Road**) under water until the **Bone Windlass** (−8.5, −11) is turned. |
| **The Rib Walk** | ring r 30.5–33.5, 150° → 390° through the north, y 1 | under eight ribs whose feet straddle the walk; branches: Plank Walk to the Almshouse, Slip Path, the Pilgrim Road to the Brink, Chain Walk, Belfry Pier. |
| **The Bottomless** | (0, −52) r 12 @ 1.0, legend pool r 3.2 at its centre | **the Brink**: a horseshoe r 12–15 at y 1 through the south (340° → 200°), with the Pilgrim Road arriving at its south and the Brink candle (6, −39). **The Kneeling West / East** (±25.5, −60.5) r 10 kneel at the north wall, facing the camera; their **forearms** rise from the Brink's two ends ((±12.7, −56.6) → (±2.4, −60.2), y 1 → 6) to **the Joined Hands** (0, −61) r 3.5, y 6, held out over the north half of the water. Brink + forearms + Hands form one ≈ 75 m loop. **Shroud Walks** leave the Brink's west and east sides, south of the giants, for the Ferry Slip and the Chain Garden. |
| **the outer places** | W: Drowned Almshouse (−58, −20) y 2.5 with the Wall Walk to the Ferry Slip; NW: Empty Ferry Slip (−42, −42); NE: Chain Garden plinth (44, −42) y 2 with the Rust Walk to the Sunken Belfry (56, −22) | |

- **Per-descent variant:** *the Sunken Road is under water* (weight 2; the windlass raises it), or *the west* / *the east Pallbearers' Walk is under water* (weight 1 each; the Sunken Road is up from the start and the windlass raises the drowned walk instead). Validated reachable under each.
- **Murk's docks:** (12, 58) Landing (day 1), (34, 55.5) pier end, (−10.5, 25) and (10.5, 25) by the Plaza, (−5.5, −35.5) beside the Pilgrim Road (nearest the finale, 6.3 m from the Brink stand). **Sister-candles (9):** Landing, Cairn Plaza, the Brink, and one at each of the Long Pier, the Bier Barge, the Almshouse, the Ferry Slip, the Chain Garden and the Sunken Belfry. There is deliberately no candle on the Joined Hands: relighting the giants' dead lantern is the victory.
- **Walk times:** spawn → Plaza 9.1 s, → Long Pier 11.3 s, → the Brink 29.4 s (24.4 s with the Sunken Road raised), → the Joined Hands 36.8 s. From the Brink: Bier Barge 6.9 s, Ferry Slip 10.3 s, Chain Garden 11.4 s, Almshouse 16.0 s, Sunken Belfry 16.5 s. Almshouse ↔ Ferry Slip 6.0 s; Chain Garden ↔ Belfry 5.4 s.
- **Wayside:** 48 memorial candles along the roads; walking past one lights it (+0.5 oil), it stays lit for the descent, marks the routes you have walked and feeds the victory cascade.
- **Finale flow:** buy Drowned Marrow → reach the Brink or the Hands before the Gloomtide → hook during the Gloomtide (§24.8, "The finale on foot").
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
| **The Mother's Cup** *(legend pool)* — "The Mother Cap drinks here, ten breaths at a time." | foot · cloister south (32, −21.8), y 2.4, behind the water-steps | lagoon (32, −30) r 5 @ 0.90–0.95 | Velvet Ray × 2, Plumgill × 1.5; **The Drifting Grove** | **Root Breath** (`rhythm` 16 s): 1.5 s warning, 6 s exhale: wait × 0.6. *(legend: no B)* | the legend |
| **The Lullaby** — "Fish sleep here with their mouths open." | both · north beach of Lanternstalk Grove (−32, 13.5), casting north, or the raft | West Basin core (−28, −1) r 8 @ 0.60–0.85 | Sleepspore Jelly × 3 (Lumen Moss), Velvet Ray × 1.5 | **The Hum** (`mods`): surge interval × 1.3, erratic × 0.6, hook window × 0.85. B: deeper sleep (× 1.5 / × 0.5 / × 0.75). | Sleepspore farming |
| **The Puffball Vent** — "Every twenty breaths the reef sneezes." | raft · (0, −21.8) | reef patch (0, −25) r 5 @ 0.45–0.55 | Sporebelly Puffer × 3, Capshell × 1.5 | **Vent Burst** (`rhythm` 20 s, burst): 2 s hiss, a geyser throws out any bobber, then 6 s of settling water: rarity +0.25, wait × 0.7. B: a restless reef (14 s, 1.5 s hiss). | timing on the raft |
| **The Drowned Greenhouse** — "Rows of glass, rows of water, and one row that still remembers the sun." | foot · south walkway (−44, 36.5), y 1.0 | 4 flooded beds (2 × 9 m) @ 0.40–0.50 | Capshell × 2, Plumgill × 2, Sporebelly × 1.5 | **The Lit Row** (`targets`): the lock picks a bed; one bed glows (rotates every 15 s) and a sun-patch drifts along it; release within ±0.08 of the meter's tick: wait × 0.5, quality +0.12. B: the sun flickers (every 9 s). | the food / oil tap; Shimmering farming |
| **The Gill Harp** — "Walk the strings in the order she hums them." | foot · Harp Green south (43, 39.2) | pool (43, 32) r 5.2 @ 0.70–0.80 | Velvet Ray × 2.5, Threadling Eel × 2 (Spore Cake) | **Serenade** (`sequence`): three gill-curtains (east, west and north of the pool, touchR 1.2) pulse in a new order each day; walk through them in order within 15 s → 45 s of song: wait × 0.5, nibble tells +1. B: a quicker tune (10 s window, 60 s song). | **Harpstring Eel** (while it sings) |
| **The Veilwater** — "A pool that kept its own night." | foot · Veil Ledge east (−36.3, −45.2), y 4.2, casting west | veiled pool (−40, −45) r 2.4 @ 0.75–0.85 behind fallen steps | Mildew Angler × 2, Sleepspore × 1.5 | **Burn the Veil** (`deed`, permanent): relight the Spent Sporelights on the other three islands (46, −22), (−38, 47), (56, 27) (pills); with all three the veil burns away: rarity +0.25, quality +0.15, gloom-only species bite in calm. B: one sporelight is already lit. | **Hushcap Koi**; a reason to visit every island |

#### Glasswater Vault (8 places)

| place | access · stand | water | favours | rule (twist) · B twist | rewards |
|---|---|---|---|---|---|
| **The Fallen Chandelier** *(legend pool)* — "It fell in one breath. It has been holding that breath ever since." | foot · the Coronet's south edge (0, −31) | trench inside the coronet (0, −37) r 3.5 @ 0.90–0.95 | Mirror Pike × 1.5, Shardspine × 1.5; **The Glass Sovereign** | **Lit Arms** (`deed`, resets at dawn): six arms on the Coronet (touchR 0.9) relight as you walk past: +0.04 rarity each; all six: nibble tells +1 and the Sovereign's enrage +15 s. | the legend |
| **The Mirror Nave** — "Nothing swims in the water. Everything swims in the ceiling." | foot · chapel south (−58.5, 6.5), y 4, behind the fallen step | nave pool (−58.5, 0) r 3.8 @ 0.65–0.75 | Mirror Pike × 3 | **Reflection**: two silhouettes swim along the open crystal ribs and show on the water **mirrored across a north–south brass line** (x flips: the screen's sideways axis). Land within 0.9 m of a true position → a bite in 2–4 s (rarity +0.2); elsewhere wait × 1.6; true positions flash 0.5 s. Hit area ≈ 11% of the pool. B: three fish, 0.75 m. | **The Unreflected** |
| **The Bell-Chapel Window** — "Strike the hour and the water remembers." | foot · the chapel's west window (56.6, 6), y 7 (High Cast +3 m) | trench patch (44, −6) r 4, north-west of the sill | Chime Jelly × 3 (Glass Larvae), Mirror Pike × 2 | **The Struck Hour** (`deed` window): pull the bell rope (40 s cooldown): 12 s of shiver: wait × 0.4. B: 8 s, 25 s cooldown. | fast rares from an eel-proof perch (steep line) |
| **The Well of Ledgers** — "Every depth was written down." | foot · shaft north rim (−41, 37.2), y 7 | shaft (−41, 41) r 2.2 @ 0.50–1.00, its south face fallen in | Blind Scrivener × 3 (Ember Roe), Mirror Pike × 1.5 | **Plumb Line**: the bobber drops to the shaft centre; the charge picks depth 0.5 → 1.0; a Clean Cast reaches the bottom ledger (rarity +0.1). B: 0.6 → 1.0, bottom at 0.9. | **The Footnote** (bottom ledger only) |
| **The Stilled Cascade** — "The falls froze mid-word." | foot · terrace west of the basin (−33.6, −49.6), y 4 | basin (−29, −51) r 4.2 @ 0.80–0.90, open to the gallery | Glassgill × 2, Prism Minnow × 1.5 | **Stillness** (`mods`): sweet-band drift × 0.25, band noise × 0.3, darter jumps × 0.5, quality +0.1, wait × 1.4. B: slightly less still, slightly quicker. | **Rainglass Darter** (calm) |
| **The Broken Hymnal** — "The bridge sang as it fell, and never quite finished." | foot · outer stub end (35.2, 20.3) | trench beyond the stub (30.5, 13.5) r 6 @ 0.85–0.95 | Prism Minnow × 2, Mirror Pike × 1.5, Shardspine × 2 (night) | **The Unfinished Chord** (`cue` chime): shards chime every 3.5–5 s; bites land exactly 1.0 s after a chime: hook window +0.15, nibble tells +1. B: faster chimes, 0.6 s lead. | perfect-hook streaks |
| **The Burning Glass** — "A lens the size of a chapel, still trying to light the water." | both · no fixed stand | a 3.5 m pool of focused light sweeping the north trench along r 29 from 250° to 340° and back at 0.65 m/s (≈ 70 s each way), calm only | — | **Focused Light** (`moving`): landing inside: rarity +0.2, wait × 0.6, quality +0.08. B: faster and smaller (1.0 m/s, 2.8 m). | a roaming bonus visible from anywhere |
| **The Votive Font** — "Votive fry, small as wishes." | foot · the hub south (0, 16.3), behind the font's low step | ring channel r 12–14 @ 0.20–0.30 | Prism Minnow × 2, Glassblown Puffer × 2 | **Quick** (`mods`): wait × 0.5, rarity −0.10. Eel-free. B: quicker and poorer. | the emergency oil / food tap |

#### The Pallid Deep (7 places + the Breathing Deep)

| place | access · stand | water | favours | rule (twist) · B twist | rewards |
|---|---|---|---|---|---|
| **The Bottomless** *(legend pool, the finale)* — "Two who kneel. One who breathes below." | foot · two stances: **the Brink** (0, −38.5), y 1, casting north 9–17 m over open water (**flat line**: sweet band +0.03; eels from the Bottomless reach you); **the Joined Hands** (0, −57.9), y 6, casting south 3–9 m (**steep line**: sweet −0.03, surge warning −0.1 s; eel-proof; crawlers only by the two forearms) | (0, −52) r 11.5 @ 0.95–1.00 | Lampwarden × 1.5 (gloom, Ember Roe), Shroud Ray × 1.5; **The Pale Leviathan** | the legend rule is unchanged; the two gold eye-glints still open at night before you own Drowned Marrow. **Its first surge breathes in every candle within 30 m.** **Victory:** the Wick's flame relights the giants' lantern, then every candle and memorial candle in the Deep relights gold, from the Wick outward. | the run |
| **The Long Pier of Names** — "Every candle a promise someone couldn't keep." | foot · pier end (35.5, 50) | (39.8, 45.2) r 6 @ 0.75–0.85, north-east of the pier end | Shroud Ray × 1.5, Gilt-Eyed × 1.5 | **For the Named** (`drifters`): candle-rafts drift north → south past x 41 every 20–30 s; land within 1.5 m of one to relight it: +6 oil and the next bite +0.2 rarity; 3 a day. B: more, faster, smaller (4 a day, +4 oil). | oil on the long walk out |
| **The Drowned Almshouse** — "Five rooms, five lives, and every one of them kept a fish." | foot · upper floor (−58, −20), y 2.5 | 5 floor holes r 1.4, each with a broken step on its south side: Cradle 0.3, Cookpot 0.4, Bed 0.6, Chest 0.8, Shrine 0.7 | Cradle → Ossuary Fry × 4, Cookpot → Bonecrook × 4, Bed → Wraithfin × 3, Chest → Gilt-Eyed × 3, Shrine → Funeral Veil × 3 (gloom) | **Five Rooms** (`targets`): aim near a hole and the reticle locks; the cast drops in. B: two pairs of rooms swap their fish. | species on demand |
| **The Chain Garden** — "Something turns over in its sleep." | foot · plinth (44, −36.5), y 2 | ring around the plinth r 6–12 @ 0.85–0.95 | Gilt-Eyed × 1.5, Lampwarden × 1.5 (night) | **The Thing Below Turns** (`rhythm` 30 s): 1.5 s warning, then for 8 s casts within 4 m of a chain get weight bias +0.6, rarity +0.15; 15% per surge to foul the line. B: 22 s, 25% foul. | heavy-fish bounties |
| **The Sunken Belfry** — "The bell rings when something touches it." | foot · parapet (56, −18.4), y 1.0 (a dead end) | bell-mouth (56, −22) r 2.2 @ 0.85–0.95 | Lampwarden × 2 (night), Gilt-Eyed × 1.5 | **Rung from Below** (`cue` toll): no plunge, no "!"; the bell tolls and a bone-white ring pulses: rarity +0.2, hook window +0.1. B: the toll comes 0.4 s early. | **The Clapper** |
| **The Bier Barge** — "Give the dead a fish, and they open the hold." | foot · deck (−10, −17), y 1.5 | lidded hold (−10, −21.2) r 1.6 @ 0.75–0.85 | Funeral Veil × 2 | **Grave Goods** (`deed` offer, until dusk): lay your lowest-value fish on the bier; the hold opens until dusk: rarity +0.25, quality +0.15, gloom species bite in calm. B: the dead want your **best** fish (rarity +0.35, quality +0.2). | **The Wax-Bearer** |
| **The Empty Ferry Slip** — "At dusk the ferry comes. It brings no one." | foot · slip head (−42, −42.5) (a dead end) | the slip channel @ 0.85–0.95 | Shroud Ray × 1.5 (calm) | **The Last Ferry** (`phaseWindow` dusk, **once a descent**): the first cast in during dusk is a guaranteed rare (the Unpaid Fare when awake) with a 2 s wait. The catch: you start the night at a dead end. B: the ferry comes at dawn. | **The Unpaid Fare** |
| **The Breathing Deep** (the Deep's feeding spots, `spotStyle`) | anywhere | bubble domes r 3.5 placed by **path**: ≤ 8 s of walking to a point within castMax − 2 m of the dome; every 40 s (70 s at night) | — | 2 s warning, **12 s** live: rarity +0.3, weight bias +0.5; a dome that expires uncast respawns at half the interval. Tide Chart: 2 domes that breathe until dusk; domes count as feeding spots for `spot_catch`. | |

#### Place-kept species (WALK_SPECIES; Journal 32 → 40)

| species | lake · place · condition | time | depth | kg | value / food / oil | behaviour · tier |
|---|---|---|---|---|---|---|
| **Harpstring Eel** | Sporewood · Gill Harp · while it sings | any | 0.4–0.85 | 0.6–2.4 | 74 / 22 / 44 | darter · 3 |
| **Hushcap Koi** | Sporewood · Veilwater · veil burned | calm | 0.6–1 | 1–4 | 78 / 26 / 46 | darter · 3 |
| **The Unreflected** | Glasswater · Mirror Nave · reflection hit | any | 0.5–1 | 1–4 | 145 / 30 / 56 | darter · 4 |
| **The Footnote** | Glasswater · Well of Ledgers · bottom ledger | any | 0.9–1 | 2–6 | 140 / 40 / 54 | sinker · 4 |
| **Rainglass Darter** | Glasswater · Stilled Cascade | calm | 0.75–0.95 | 0.3–1.2 | 135 / 20 / 60 | darter · 4 |
| **The Clapper** | Pallid · Sunken Belfry | any | 0.8–1 | 3–9 | 225 / 46 / 70 | thrasher · 4 |
| **The Wax-Bearer** | Pallid · Bier Barge · hold open | any | 0.7–0.9 | 2–6 | 220 / 30 / 80 | leaper · 4 |
| **The Unpaid Fare** | Pallid · Ferry Slip · the Last Ferry | calm | 0.8–1 | 4–12 | 240 / 50 / 78 | sinker · 4 |

**Awake per descent** (seeded, at zone entry): Sporewood 1 of 2, Glasswater 2 of 3, the Pallid Deep 1 of 3. An asleep species never bites; the Journal and Murk say so ("It sleeps this descent"), and `place_species` bounties only name awake ones. They count as rares everywhere else, pay ≈ 15% over each lake's rares and need no bait; Wick-Worms attract all eight. A lake's Journal perk needs its place-kept fish too.

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

**Sister-candles (`BALANCE.lamps`).** Sporewood 5, Glasswater 8, Pallid 9 (validated: every reachable walkway ≤ 68 m of path from a candle — or, in Sporewood, from a mooring).

| rule | value |
|---|---|
| share flame | stand within 2.4 m and hold 1.0 s; costs **12 × zone oil drain (14.4 / 16.8 / 19.8 oil)**; any phase; damage interrupts it |
| lasts | the rest of the descent (`run.flags.lamps`) |
| light | r 6 m (+1 per level of the Trimmer's Shears), cold and steady in the lake's accent colour; enemies inside move × 0.7 (the lower of this and your light's × 0.75 applies); the Silent Choir shows inside; **darkness ticks at half rate inside** (never stops); lights land (lamp term + one instanced decal) |
| also | sharing marks the 2 nearest undiscovered places; lit candles join `water.setLights` (the two nearest; still ≤ 6) |
| flame-leap | **once each dawn, free**, from any lit candle (or the moored raft) to any other lit candle; the radial shows them in their true directions; never in calm, dusk or the Gloomtide |
| darkened by | a hand slam within 4 m, 3 latched moths for 6 s, Eclipse (temporary), and **a gloom legendary's first surge (every candle within 30 m of its pool: "It breathes the candles in")**; relight 6 × zone drain |
| Known Places | a mastered place starts each later descent **discovered, with its candle's first share free** — you still walk there and hold |
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
| Pallid | Cairn Plaza (r 8) and the Landing (r 8) | room to circle; deep water all round (eels) |
| | the Rib Walk loop (≈ 175 m through the Plaza) | four branches; in the walk-under-water variants the Bier Road closes the loop instead |
| | the Brink and the Hands (≈ 75 m loop) | the finale ground: low Brink with eels, high Hands without |

**The finale on foot.** The Pale Leviathan's fight is unchanged (§5.6: no new elites while hooked, Grasping Dark summons two Ringed Grasps through the stone, Eclipse, the Ferryman cannot rise). You are anchored as on the raft, and a planted Wick is never moved off its ledge. **Its first surge breathes in every candle within 30 m**, so the fight is never fought inside a candle's slow or half-rate darkness, whichever stance you chose. The two stances are a real trade: **the Brink** gives a flat line (sweet band +0.03: skilled land ≈ 50% at line strength 1.9, against 43% on the raft) but eels leap from the Bottomless and crawlers come by three roads; **the Joined Hands** are eel-proof and reached only by the two forearms, but the line runs steep (sweet −0.03, warnings −0.1 s: ≈ 30%) and a slam there has nowhere to slide (`balance-foot.mjs --reel`). Because 72% of the Pallid swarm flies, funnelling crawlers trims only ≈ 20% of the bag: the finale stays gated by gear (Silverthread) and build. **Victory:** every candle and memorial candle in the Deep relights gold, from the Wick outward (folded into the existing candle beat).

**Dusk readout:** from Murk's 85% bell the HUD shows "Nearest sister-candle 34 m · ≈ 7 s" and "Open ground 9 s" with a faint ghost path. Starting dusk farther than 68 m from any lit candle or the moored raft shows (bad) "No candle within reach. Find open ground, or plant a Stake Lantern."

### 24.9 Risk/reward & progression hooks

**The core trade on foot:** the best water (place-kept fish, legend pools, deep edges) sits at dead ends and edges; the safest ground is not where the best fish are. Every walking choice costs calm seconds, and every candle costs oil.

| hook | rule | why it is fun |
|---|---|---|
| **Discovery** | the Wick within 8 m of a place's stand or water (or a cast into it) → `place:discover`, toast, a **Places** page in the Journal (rule line, vignette, place-kept silhouette, mastery stars); first time ever: +2 Memories at run end | curiosity pays; the map fills in across runs |
| **Astir** | each calm one non-legend place per walking lake is Astir (seeded; never twice running): wait × 0.55, rarity +0.25, quality +0.15; Murk names it on arrival | daily routing variety |
| **Variants & twists** | per descent: the lake's map variant (a fallen bridge, a road under water), each non-legend place's A or B twist, and which place-kept fish are awake (4 of 8) | fixed maps stay unsolved: the routes and the hunt change every descent |
| **Mastery** | 4 catches in one place in one descent, at least one Fine → `place:mastered`, +10 Memories, and a **Known Place**: discovered from day 1 with a free first share of its candle in every later descent | map mastery that saves oil, not walking |
| **Place-kept species** | 8 rares tied to a place and a condition, weight × 8 when eligible and awake | a Journal hunt with clear, learnable puzzles |
| **Sister-candles & the dawn leap** | share flame with oil (§24.8); one free flame-leap each dawn to any lit candle | light the way on day 1, choose where each later day starts |
| **Shortcuts** | 4 (the Hyphae Strand, the Sundered Span, the Tuned Bridge, the Sunken Road): a free deed, usually on the far side, opens a route for the descent; the Surveyor's Chalk relic opens the one nearest your arrival | metroidvania "open it from the other side" |
| **Deeds** | sporelights, harp curtains, the chandelier's arms, the bell rope, the bier offering | prepare a place for the night or the legend |
| **Wayside** | Pallid memorial candles (+0.5 oil, lit for the descent, mark your routes, feed the victory cascade), Glasswater drifting pages (1–2 Shells or lore), Sporewood puffballs (+2 satiety); the day's eel raid threatens walkway edges | the roads have something to do after discovery is spent |
| **Murk on foot** | his docks sit beside walkways; trading still costs the walk to his dock (never a leap destination) | the "spot vs. Murk" tension of §4.5 survives |

**Memories added (one-time):** challenges +185; place discovery 21 × 2 = 42; mastery 21 × 10 = 210; ≈ +437 against ≈ +960 of new relic sinks, so meta progression does not speed up.

**Records:** places mastered, biggest fish per place, most candles lit in one descent. **Death-screen lines:** "The Gill Harp: 1 catch from mastery." · "When the Gloomtide rose you were 48 m from the nearest candle." **Top-damage tips:** eels on foot → "Eels reached you at the water's edge 4 times. At night, fish enclosed pools or stand back from the edge."; slams on a walkway → "Hands caught you on a narrow walkway. Step along it, not sideways."

### 24.10 New content (data tables, merged with WALK_ENABLED)

**STATS:** `stride` (Stride, base 0, −2…3, m/s on foot only); `moveSpeed`'s label becomes "Speed".

| kind | id · name | numbers | unlock / where |
|---|---|---|---|
| upgrade | `boots_cork` **Cork-Soled Boots** (`feet`) | stride +0.35 per level; 45 / 120 / 280 Shells | from Sporewood |
| supply | `stake_lantern` **Stake Lantern** | 40 base; `give {stake: 1}`; planted with a pill; slow + Choir only | from Sporewood |
| bait | `wick_worm` **Wick-Worms** | 30, × 4; rarity +0.06; attracts the 8 place-kept species | *Strange Waters* |
| relic | `roadworn_soles` **Roadworn Soles** | stride +0.2 per level; 45 / 125 / 280 | *First Footfall* |
| relic | `trimmers_shears` **The Trimmer's Shears** | candle light +1 m per level (`lampRadius:1`); 90 / 245 | *A Place That Knows You* |
| relic | `surveyors_chalk` **The Surveyor's Chalk** | in each walking lake the shortcut nearest your arrival starts open (`shortcutStart:1`); 185 | *The Long Way Round* |
| weapon | `undertow_crook` **Undertow Crook** (common, 5 levels, tags foot, area, close) | a 2.5 m, 120° sweep every 1.8 s (L5: 3.2 m, 200°, 1.3 s), damage 6 → 15; **on foot it knocks crawlers off the walkway**: they re-haul for 0.8 s taking × 1.5 aura, and a fall of more than 2 m stuns them 1 s; on the raft it sweeps the deck edge. **Kindle** (with Vantage) **Riptide Crook**: a full-circle sweep every 1.2 s, damage 20, knock 4.5 m, 1.5 s stun on any fall, hauling crawlers take × 2 aura | *Held the Crossing* |
| boon | `vantage` **Vantage** (common, 3 levels, tags foot, light) | on high ground: zap range +2 / 4 / 6 m and **crawlers hauling up to you take × 1.5 / 2 / 2.5 aura** (L3 +0.5 m light) | *Hidden Waters* |
| boon | `kindred_flames` **Kindred Flames** (rare, 3 levels, tags light, foot) | lit candles burn enemies inside at 0.4 / 0.6 / 0.8 × your aura; share time 0.7 / 0.45 / 0.25 s; **first shares** cost × 0.75 / 0.5 / 0 (relights full price); L3: each candle fires one free flare per Gloomtide when something enters it | *Four Shared Flames* |
| Wick | `wayfarer` **The Wayfarer** — "Who Walked Every Road" (tier IV capstone) | stride +0.8, raft speed −1; starts with the Undertow Crook and 2 Wick-Worms; quirk **First Flame**: the first sister-candle you share with in each lake costs no oil; a re-tint of the base model | *Every Still Place* |

All of these are challenge-locked, so **the run-1 boon pool is unchanged** (18 of 32), and foot-tagged boons are **never** offered in raft-only lakes. New archetype tag **Kindred**: Kindred Flames, Tolling Bell, Lantern Pulse, Brighter Wick.

**Challenges, tier IV "Paths Underfoot"** (30 → 40; *The Complete Chronicle* asks for every species):

| # | challenge | goal | type · params | scope | reward |
|---|---|---|---|---|---|
| 31 | **First Footfall** | Step ashore from your raft. | `footAshore` {n:1} | total | `relic:roadworn_soles` + 5 |
| 32 | **Hidden Waters** | Discover 6 Places. | `placeFound` {n:6} | total | `boon:vantage` + 10 |
| 33 | **Four Shared Flames** | Share your flame with 4 sister-candles in one descent. | `lampLit` {n:4} | run | `boon:kindred_flames` + 15 |
| 34 | **Strange Waters** | Land 3 different place-kept fish. | `placeSpecies` {n:3} | total | `bait:wick_worm` + 15 |
| 35 | **A Place That Knows You** | Master a Place. | `placeMastered` {n:1} | total | `relic:trimmers_shears` + 15 |
| 36 | **The Long Way Round** | Open 3 shortcuts in one descent. | `shortcutOpen` {n:3} | run | `relic:surveyors_chalk` + 10 |
| 37 | **Held the Crossing** | Disperse 60 gloomlings on bridges in a single Gloomtide. | `slayOnTag` {tag:bridge, n:60} | run | `boon:undertow_crook` + 20 |
| 38 | **Far From Any Candle** | Endure a Gloomtide on foot in the Glasswater Vault or deeper without standing in a sister-candle's light. | `nightNoLamp` {zoneMin:2} | run | 20 |
| 39 | **Every Candle in the Vault** | Share your flame with every sister-candle in the Glasswater Vault in one descent. | `lampLitZone` {zone:glasswater} | run | 25 |
| 40 | **Every Still Place** | Master every Place in the three lower lakes. | `placeMastered` {n:21} | total | `character:wayfarer` + 50 |

Challenge sources: `footAshore` ← first `player:mode {reason:'ashore'}`; `placeFound` / `placeMastered` ← `place:discover` (first ever) / `place:mastered`; `placeSpecies` ← `journal:new` for a species with `place`; `lampLit` ← `lamp:lit {first:true}` (relights and free Known-Place shares do not count; they do count for `lampLitZone`); `shortcutOpen` ← `shortcut:open` (the Chalk's free one does not count); `slayOnTag` ← `enemy:slain` with `tag === 'bridge'`, reset each Gloomtide; `nightNoLamp` ← dawn with no frame inside a lit candle since the Gloomtide began, on foot, zone ≥ zoneMin.

**Bounties** (`WALK_BOUNTIES`, types in `WALK_BOUNTY_TYPES`; rewards use the §15 formula): `place_catch` "Bring me {n} fish from {place}." (26, w 3), `place_species` "They whisper of a {species} at {place}." (55, w 1, awake species only), `astir_catch` (34, w 2), `light_lamp` "Share your flame with the sister-candle at {lamp} before dusk." (20, w 2), `lamp_vigil` "Keep tonight's vigil inside the light of {lamp}." (50, w 1, foot lakes).

**Tips** (`WALK_TIPS`; every trigger validated against the event list and its discriminator): `moor_walk` (`interact:change:ashore`), `foot_basics` (`player:mode:ashore`), `foot_spawn` (`player:mode:spawn`, emitted only for foot spawns), `tow_bell`, `lamp_light`, `lamp_hop` (dawn leap), `place_found`, `high_cast`, `shortcut`, `edge_eels`, `astir`, `legend_snuff` (`lamp:snuffed:legend`). **Text:** `WALK_TEXT` (pills Share flame / Flame-leap / Plant…, banners, toasts), `TEXT.challengeTiers[4]`, `TEXT.memoryLabels.places`, `MERCHANT_LINES.astir`.

### 24.11 Tuning changes, with reasons

| key | before | after | applies | why |
|---|---|---|---|---|
| calm length | 120 | **120 (unchanged)** | everywhere | Appendix B: with the dawn leap and the places' bonuses, catches and Shells per day stay within ±7% of v1; the run length is the user's constraint. `ZONES[].phases.calm` stays as a knob. |
| Arrival Hush | — | +30 s in Glasswater and the Pallid Deep, +10 s in Sporewood, on the first calm in the lake; no calm raid that day | walking lakes | the first day in a lake is the exploratory one; Sporewood's walks are short and its arrival is the run-1 wall, so it gets only 10 s |
| drains | — | unchanged; sharing flame costs oil | — | walking costs time; light costs oil |
| foot speed / accel | — | 0.84 × raft speed; accel 6, decel 8 | on foot | short-window reach equal to the raft's; dodges need anticipation (Appendix B kinematics) |
| contact radius | 1.8 | 1.6 on foot | on foot | the Wick is a smaller target; its dodges are no easier |
| crawler spawn ring | 22–34 m | lake water 16–28 m with path ≤ 40 m; raft nights in walking lakes: the raft's water component | walking lakes | arrival time parity; no grinding on shores |
| crawler land speed | × 1 | × 0.9 on land, 0.8 s haul | on foot | a 5 m/s Wick can barely kite late mites |
| creelsnatch | depth ≥ 0.4 | also needs the Wick within 6 m of open water and ≤ 3 m above it; flop 1.2 s on stone | on foot | enclosed pools and inland ground are eel-free; edges are the risk |
| killers | — | **unchanged**: stain 3.2, telegraphs, inkwell hold 13–18 m | on foot | they end runs; only their geometry aligns with walkways |
| pickup radius | 4 | +0.5 m; water cinders drift to the Wick's own area or fly to it | on foot | level-up cadence stays at 24 / 32 s (Appendix B) |
| cast meter start | below 2 m/s | below 1 m/s | on foot | no anchor brake on foot |

**Explicitly unchanged:** the Heat model, `difficultyFor`, the XP curve, light and aura, reel / bite / quality models, tolls, valueMult, Warden hp, legend rules, every Mossmere number, raft handling and every v1 table while `WALK_ENABLED` is off.

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
