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
- **Challenges** (a 30-goal checklist) → new **Wicks**, new **boons** in the pool, new **relics**, a new **bait**, plus Memories.
- **Journal**: 32 species to name, zone-completion perks, mastery.
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
| E | Interact: Trade / Descend |
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
32 species, 8 per lake (3 common, 2 uncommon, 2 rare, 1 legendary). `value / food / oil` are at mean weight and normal quality, already scaled by lake. Difficulty columns are the contract semantics (§8 of the contract). Difficulty is derived from an authoring tier × behaviour (× legendary), with the duty cap applied; the two finale fish are hand-tuned. Each lake's commons are roughly as hard as the previous lake's rares.

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
- **Contact**: an enemy within 1.8 m of the raft centre (or an AoE ability) calls `survival.damage(n, source)`. `n = max(1, floor(enemy.damage × diff.damageMult))`, Wardens capped at 3. Enemies with damage 0 (moths, inkwell bodies) never cost Embers.
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

### 12.1 The checklist (30)
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
| 30 | **The Complete Chronicle** `complete_chronicle` | Name every species in the Journal. | `journal` {n:32} | total | 200 Memories |

*Totals: 30 challenges, 831 Memories; unlocks: 4 Wicks, 11 boons, 9 relics, 1 bait.*

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
- **Descend:** sail into the open gate (within 1.2 × its radius) → interact "Descend" → `ui.openDescend()` shows the toll, the next lake's card, and a warning that the Gloom grows (+3 Heat). Allowed during **calm and dawn** only (the gate sleeps through dusk and the gloomtide). Confirm → `progression.travel(nextZone)`: pay the toll (first visit: `zone:unlock`), `zone:change {zone, prev}` (world rebuild, player respawn at the new spawn, area-title banner), `run.flags.zoneEnteredDay = day`, `run.gateOpen = false`. One-way. Boons, level, creel, upgrades and Shells carry over.
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
| `fog` | #222a3a | #2b1b30 | #14173e | #1c1b18 |
| `fogDensity` | 0.016 | 0.019 | 0.012 | 0.022 |
| `water` | #1b2230 | #2a1a2e | #141b46 | #14130f |
| `waterDeep` | #07090f | #0d0710 | #04051c | #030302 |
| `foam` | #d0d9ea | #f3d3e0 | #c8e2ff | #e9e2cf |
| `glow` | #a9b9f0 | #ffb46a | #5cc8ff | #e8c66a |
| `accent` | #d6dccd | #ff7fb0 | #b48cff | #eae4d3 |
| `ambient` | #3a4560 | #5b3f63 | #30387e | #3a3833 |
| `ink` | #05070a | #0b060d | #03040e | #020202 |
| `far` | #7a8aac | #80588a | #5460bc | #a8a18c |
| `light` | #d6e0f4 | #ffd9c4 | #d6e2ff | #f0dca0 |
| grade | exp 1, bloom 0.85/0.6/0.72, tint #46527c×0.18, vig 0.4, sat 0.84, grain 0.05 | exp 1.02, bloom 1.05/0.75/0.68, tint #6b3a6e×0.2, vig 0.4, sat 0.9, grain 0.05 | exp 1.05, bloom 1.15/0.55/0.65, tint #2e3494×0.2, vig 0.35, sat 1.0, grain 0.04 | exp 0.95, bloom 0.9/0.8/0.7, tint #5a4e2a×0.12, vig 0.5, sat 0.6, grain 0.07 |

### 19.3 The Mossmere (moonlit slate, silver glow, grey lichen with a whisper of sage)
- **Palette intent ("Moonlit slate").** Cold, low-saturation blue-grey water and haze, pewter stone, silver-grey lichen; every glow is pale moonlight silver with a faint periwinkle cast. Green survives only as a trace (a breath of sage in the lichen and on the Mossback Perch, and Old Murk's dim sage lamp), so the Wick's amber lantern is the one warm, saturated colour in the frame. The Mossmere stays the least saturated lake; Glasswater owns saturated indigo and ice-cyan.
- **Hero (north, beyond the Moss Sluice):** *The Sunken Gate*: a colossal half-drowned round arch on box piers with a broken portcullis hanging askew; beside it a bell tower leaning 12° with a cracked bell glowing faint moon-silver (accent light #1).
- **In the lake:** the *Drowned Gatehouse* island (half-sunk tower), the *Toppled Bridge* piers with chains dangling from the break, pylons and statue stumps, the two *Sisters* rocks; the *Bell Pool*'s sunken temple bell visible as a dim shape under the water.
- **Shore & rings:** moss-bearded cliffs, drowned arcades with hanging roots (TubeGeometry on Catmull-Rom curves) and moss "beards" (alpha planes), a far colonnade, a slow waterfall curtain (scrolling noise alpha) from a ceiling crack.
- **Floating:** notched lily pads (instanced 30–50, a few with pale silver glow-buds), driftwood, a half-sunk pair of stone hands cupping an empty bowl.
- **Particles:** ≈ 150 drowsy moon-silver motes on slow sine paths, ≈ 60 falling lichen flecks. **Shafts:** 2–3 pale moonlight shafts, 15–25°, flickering.
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
- **Old Murk:** a hunched, enormous stone-grey toad (#4f514a with silver lichen patches #c2c6bc), heavy-lidded faintly glowing pale-yellow eyes (#e8e08a), a drooping lip, a moth-eaten shawl; a towering teetering pack (jars of murky bait, empty birdcages, coiled rope, dead lanterns, rods, a crooked umbrella, a fish-bone wind chime); a dim sage-green lamp (#a6d4a0, the game's one deliberate green light) on a hooked pole; a pewter, moon-bleached lily-pad barge with a hand bell on a post. Slow blinks, throat-sac swells before speaking, an occasional tongue-flick at a passing moth.
- **Gloomlings:** near-black ink bodies (#07080d) with a faint violet rim and distinctive eyes (per-lake eye colours in data). *Gloomling*: a fist-sized curl of living ink, pinprick eyes, a smoke tail. *Inkmite*: soot-black ticks with one lime glint, moving like spilled grain. *Duskmantle*: powder-violet moth whose wings carry two pale-blue painted eyes. *Creelsnatch*: a ribbon of shadow with lime hook-teeth. *Sporeling*: puffball gloomlings trailing amber spores. *Weeping Inkwell*: a tall bowed figure with a swollen ink-sac under its chin, black tears running into the water. *Bell-Jar Tick*: a hound-sized tick under a cracked glass bell-jar, a pinned moth still inside. *Silent Choir*: tall veiled figures in rows; outside the light only gold pinpricks. *Drowned Hand*: a colossal dripping hand rising from an ink stain, tarnished brass rings on two fingers.
- **Wardens** (model `warden`): *The Wickeater*: a colossal hooded gloom with a hollow moon-lit maw and candle stubs in its hem like teeth. *The Veiled Gardener*: towering, draped in plum veils of mould, an amber glow where a face should be. *The Shard Abbot*: robed in shelved crystal like a walking library. *The Lightless Ferryman*: a hooded giant poling a boat that isn't there, a dull gold coin for each eye.
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
