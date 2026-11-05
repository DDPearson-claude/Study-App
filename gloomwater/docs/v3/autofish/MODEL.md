> **Superseded draft (2026-11-05).** This catch-model draft has been reconciled into the binding spec: DESIGN §25.0.2a and §25.6 (the formula, the gear, the logs, the targets), CONTRACT §13.7a / §13.8 (`catchChance`), and `src/data.js` `CATCH_V3` (read by `tools/sim/catch-v3.mjs`). Where they differ, the spec wins: the Mossmere's Elder step is 12 and commons have an Elder rarity step of 2 (so every Elder at matched T0 stays ≤ 10% with any item); strike ids are clean / struck / early / late; play lengths and the leap table come from EXPERIENCE (tuned); drag presets are cut; Gloomtide's 0.85 hit rule is replaced by "a hand slam parts the line"; the economy normaliser is 0.89 / 0.83 / 0.75 / 0.64; the timeline buys 3 / 3 / 3 / 4 legend baits. Kept as the design record.

# GLOOMWATER v3: the catch-chance model (automatic fishing)

*Systems design for the automatic reel. Branch `gw-autofish`, based on `gw-p1v-base`. The numbers are a draft table, `CATCH_V3`, in `tools/sim/catch-v3.mjs`. Every % in this document comes from that sim (`node tools/sim/catch-v3.mjs`, plus `--all` and `--md` for the full tables). The table moves to `src/data.js` as `export const CATCH_V3` behind `V3_ENABLED` when the model is built. A new export does not touch the flag-off fingerprint, which only hashes the v1 export names. v1 stays bit-identical.*

## 0. What the user asked for, and where this model answers it

| the user's rule | answer |
|---|---|
| Fishing is automatic and based on a percentage chance of reeling in. | §1: one chance `p` per hooked fish, from species, size class, gear, bait or lure, strike and buffs. §6: the reel plays itself out. |
| It must never be 100%. | Every class has a cap below 1 (95% for Small and Keeper, down to 50% for Ancients and legends). The curve only approaches its cap. The sim's highest value anywhere is 95.0%, just under the 95% cap. |
| Gear raises the chance. Some items are global, some are fish-specific (lures and bait). | §3: rod, line and reel are **global** Hold. Baits and lures are **specific**: each lists the species or families it helps and by how much (§4). |
| Whichever fish takes the bait, that species' chance is used. | `p` is computed for the fish that actually bit: its species, its size class, and only the items that help *that* fish. |
| The % shows only in the fishing log and gear log, never while fishing, so you can't tell what is on the line. | §7: the Journal shows % per species × class. The Gear Bench shows each item's Hold. The HUD shows no % and no species. |
| 1. Strike, then automatic. | §5: perfect tap +4, on time +2, mistimed −3. No tap lets the bite pass (bait refunded, favour carried). The reel then runs by itself. |
| 2. Bigger is harder. | §2: class penalties of Small −4, Keeper 0, Prize +7, Trophy +15, Elder +24, Ancient +28, plus each lake's Elder step. The log shows % per class. |
| 3. Hint size, hide species. | §6.3: the bite tell, rod bend, line hiss, splash and shadow all scale with size. The species is never shown until the fish is landed. |
| 4. Name the fish only after it is gone. | §6.4: a short "the one that got away" note gives the species, the rough size (±8%) and the cause, after the loss. |
| 5. Some species leap. | §6.2: leaps are set per species (how often, how many, at what point in the reel). A leap is a backlit silhouette: shape and size, no colour, pattern or glow. At least 5 species leap in every lake. A leap carries the thrown-hook risk. |
| 6. A very short tutorial in a place that fits the lore. | §10: the game opens at the Landing, where the last Wicks landed. Strike practice at the test buoy, then a Quayling off the jetty, then Murk points you to the Journal's odds. About 60 s, before the First Outing. |

Standing decisions this model keeps:
- Expeditions from the Landing.
- Lantern is the default from the 2nd expedition.
- In Still and Lantern, combat never costs a hooked fish (§6.5).
- The Long Descent uses per-run gear and its own purse (§3.6).
- Early-lake Elders stay hard until late-game tackle (§8).
- Never 100%: hard caps below 1.

---

## 1. The formula

```
p = max( floor, cap[class] · σ( 0.1 · (Hold − Fight) ) )        σ(x) = 1 / (1 + e^−x)

Hold  = 10 (the Wick's own craft)
      + tackle   rod + line + reel, each weighted by the fish's style (§3.2)
      + item     the equipped bait OR lure, only if it helps this fish (§4)
      + strike   perfect +4 · on time +2 · mistimed −3 (§5)
      + buffs    Well-fed, Angler Boons, relics, Wick quirk: together at most +6 (§3.4)
      + Marked   +6 when you re-hook a Marked Fish (once)
      + wounds   legends only: +6 per earlier escape, up to +18, kept until landed

Fight = lake + rarity + style + headline + kept + fouled + class
      (+ the lake's Elder step + the Elder rarity step, for Elders and Ancients)   (§2)
```

| constant | value | why |
|---|---|---|
| scale | **0.1 logit per Hold point** | +10 Hold roughly doubles low odds, adds about +24 points at even odds and little near the cap. That gives natural diminishing returns. |
| caps (per class) | Small / Keeper **0.95** · Prize **0.93** · Trophy **0.88** · Elder **0.78** · Ancient **0.50** · legend **0.50** | Never 100%. Bigger fish have lower ceilings. An Ancient or a legend is never better than a coin flip. |
| floor | **0.02** | Every hooked fish keeps a sliver of a chance. A starter-tackle Elder is a 2% story, never 0%. |

**Why this form.** It adds the way players think ("+6 vs predators"), it never reaches 1, and the cap per class means "a giant is never a sure thing" is a property of the curve, not a clamp someone has to remember. One logit is 10 Hold points, so every number in the game is a small integer.

**What a Hold point is worth** (Keeper cap 0.95):

| odds before | +2 | +5 | +10 | +15 | −3 | −5 |
|---|---|---|---|---|---|---|
| 20% | 23 | 29 | 40 | 52 | 16 | 13 |
| 50% | 55 | 61 | 71 | 79 | 43 | 38 |
| 80% | 82 | 85 | 89 | 91 | 76 | 73 |

**The roll.** `p` is fixed at the strike, from the fish that bit. The reel then plays one Bernoulli(p) outcome, spread over beats (§6.1). The size class is a constant within the class: the log's per-class number is exactly what the fish gets.

**Worked example.** An Elder Reedjaw Pike in the Mossmere. Glassreed rod (T3), Silverthread line (T4), Whisper Drag reel (T3), the Harbour-Bell Spinner, a perfect strike, Well-fed.
- Hold = 10 + (8 × 0.85 + 13 × 1.3 + 8 × 0.85 = 30.5) + 10 + 4 + 2 = **56.5**.
- Fight = 0 lake + 8 rare + 2 thrasher + 2 headline + 24 Elder + 10 Mossmere step + 6 rare Elder = **52**.
- p = 0.78 · σ(0.45) = **48%**.

---

## 2. Fight: the fish

| term | values |
|---|---|
| lake | the Landing (cove) −12 · the Mossmere 0 · Sporewood 7 · Glasswater 16 · the Pallid Deep 24 |
| rarity | common 0 · uncommon 4 · rare 8 |
| style | steady 0 · darter 0 · sinker 1 · leaper 1 · thrasher 2 · runner 2 · sulker 2 |
| headline | +2 for the lake's reference species (Reedjaw Pike, Mildew Angler, Mirror Pike, Gilt-Eyed Eel) |
| kept | −2 for place-kept fish (solving the place earns a fairer fight) |
| fouled | +3 for fish that live among chains (Old Portcullis at the Gatehouse Door, Candlewake Sturgeon in the Chain Garden) |
| **class** | **Small −4 · Keeper 0 · Prize +7 · Trophy +15 · Elder +24 · Ancient +28** |
| Elder step (Elder and Ancient only) | the Mossmere +10 · Sporewood +7 · Glasswater +4 · the Pallid Deep +2 |
| Elder rarity step (Elder and Ancient only) | common 0 · uncommon +3 · rare +6 |

- **The Elder step** works like §25.6.5's Elder age, now as a chance term. Early water keeps its oldest fish hard (Q3). Deep-lake fish are already hard because of the lake term. The step falls with depth but stays positive, so Trophy → Elder is a big jump in every lake: +19 in the Mossmere and +11 in the Pallid Deep for commons, plus 6 more for rares.
- **Wanderers** use the lake they are hooked in.
- **Caps on class** come from the species and the place: the Quayling caps at Keeper, the Lampwarden at Trophy, fry water at Prize. Giants live only in giant water (§25.7.1).
- **Legends:** see the table below.

| legend | Fight | style | bait (the ticket) |
|---|---|---|---|
| The Belled Matriarch | 16 | steady | Heartmoss Ball (40) |
| The Drifting Grove | 28 | leaper | Glowcap Bulb (90) |
| The Glass Sovereign | 40 | leaper | Prism Moth (170) |
| The Lantern-Swallower | 56 | sinker | Last Candle (320) |

Legend rules:
- Cap 0.50.
- Each escape leaves the legend **wounded**: +6 Hold on your next attempt, stacking to +18, kept in meta until you land it.
- Each landing makes it older and heavier, matching the +7% weight rule: +2 Fight per landing, up to +10.
- Legends take no bait or lure Hold. The legend bait is the ticket, not a bonus.

---

## 3. Hold: the Wick and the kit

### 3.1 Tackle tiers become Hold (replaces shock, pips, absorb, dragAt, line strength, reel speed and sweet band)

| tier | Rod | Line | Reel | matched set | price per slot (Rod / Line / Reel) | proof catch (unchanged) |
|---|---|---|---|---|---|---|
| T0 | Willow Switch **0** | Twine **0** | Wooden Winch **0** | **0** | start | — |
| T1 | Ashwood **2** | Braided Gut **2** | Brass Spool **2** | **6** | 120 | — |
| T2 | Whalebone **5** | Waxed Silk **5** | Clockwork **5** | **15** | 450 | any Mossmere Prize |
| T3 | Glassreed **8** | Glass-Gut **9** | Whisper Drag **8** | **25** | 1,400 | a Sporewood Trophy or a Glasswater Prize |
| T4 | Lantern-Spine **12** | Silverthread **13** | Tidewheel **12** | **37** | 3,200 | a Glasswater Trophy |

What each slot keeps from its old stats:
- **Rod:** castMax and the hook-window multiplier (×1.00 to ×1.16), which widens the strike window (§5).
- **Line:** the clear-water rule. Below Glass-Gut in Glasswater, waits are ×1.12 and favour −0.1. That affects bites, not chance.
- **Reel:** drag presets from T2 (§3.5).

What is cut:
- Slack grace, shock, hook-hold pips (as a mechanic), absorb, the drag point, line strength, reel speed and the sweet band.
- `tackleStats()` keeps castMax, hookWindow and creelSize and gains `hold: {rod, line, reel}`.

The **Creel** (slots, Live Well, nights) and all prices and proofs are unchanged.

### 3.2 Style emphasis: which slot a fish tests

| style | rod | line | reel | reads as |
|---|---|---|---|---|
| leaper | ×1.3 | ×0.85 | ×0.85 | a good rod keeps the hook in through the leaps |
| runner | ×0.85 | ×0.85 | ×1.3 | a good reel stops it stripping you |
| thrasher · sinker · sulker | ×0.85 | ×1.3 | ×0.85 | a strong line survives the head-shakes and the dead weight |
| steady · darter | ×1 | ×1 | ×1 | |

The weights average 1, so a matched set is almost style-blind. In a mixed loadout, upgrading the slot your target tests is worth about +2 to +3 Hold. For example, T4 Line with a T2 rod and reel gives a thrasher 25.4 Hold, against 23 for an even spread. This replaces "which tier per slot" in the old reel sim. It is also the cause shown when a fish is lost (§6.4).

### 3.3 Strike: see §5

### 3.4 Buffs (all together capped at **+6**)

| source | Hold |
|---|---|
| **Well-fed** (satiety ≥ 60%) | +2 (replaces reelSpeed +0.08 and sweetZone +0.01) |
| Steady Reel (Angler Boon) | +1 per level (5 levels) |
| Gilded Hook (Angler Boon) | +2 (its hook window stays) |
| Patient Line (Angler Boon) | +1 per level against leapers and runners (3 levels) |
| Line of Seven Knots (relic) | +1 per level (3) |
| Grandmother's Hook (relic) | +1 per level (3); its hook window stays |
| Measuring Cord L2 (relic) | +2 against Prize and bigger (was +1 pip) |
| Ashwick's quirk, *Burned Once* | +3 on the first fish hooked each night (was "first surge telegraphed 0.3 s longer") |

**Strike-window buffs** add no Hold. They widen the strike window, which makes a perfect strike easier: Hungry Waters, Feather Touch, the Rod tier, Gilded Hook's and Grandmother's Hook's window, The Listening Bobber's nibble tell.

Rarity buffs (Lucky Knot, Two-Headed Coin, Shimmering Scale) stay rarity buffs. **No Boon or relic adds favour or opens a place** (§25.3.5).

### 3.5 Drag presets (Reel T2+, optional, set at the bench or by tapping the reel icon before a cast)

| preset | Hold |
|---|---|
| Light | +4 vs runners, −1 vs everything else |
| Set | 0 |
| Firm | +2 vs steady, darter, sinker, thrasher, sulker; −3 vs runners and leapers |

This is a small pre-cast read, like choosing a lure. Cut it if playtests find it fiddly. The model is complete without it.

### 3.6 The Long Descent, P1–P2 builds and per-run gear

- **Per-run UPGRADES:** the Hold per slot comes from the **effective tier** `upgradeTiers(levels)` (unchanged: floor(4 × levels ÷ the slot's levels)), using the §3.1 table.
- **Per-run Glimmer Spoon** (`lure_glimmer`): +2 / +4 / +6 vs predators at levels 1 / 2 / 3.
- **Trembling Feather:** strike window only.
- Its own purse (20 Shells), Gloomtide every night (§6.5) and everything else in §25.3.7 are unchanged.

---

## 4. Bait and lures: the specific gear (one equipped: a bait **or** a lure)

Rules:
- An item adds its Hold **only to the fish it helps**. If something else bites, the item does nothing for that fight. That makes it a real targeting choice.
- Each item's attract and favour effects on *which* fish bites and *how big* it is stay as in §25.6.3.
- Baits are spent at the cast and refunded when a bite is let pass.
- A loss whose cause is **snapped** loses the lure. A replacement costs 25%.

| item | kind | price | sold | helps (Hold) |
|---|---|---|---|---|
| Mire Worms | bait | 8 × baitMult | start | +5: Gutter Crayfish, Mossback Perch, Weeping Carp, Capshell Crayfish, Plumgill Perch, Bonecrook Crayfish |
| Lumen Moss | bait | 18 | start | +5: Candlefin Koi, Prism Minnow, Funeral Veil, Pallid Wraithfin, Gloam Eel, Sleepspore Jelly |
| Spore Cake | bait | 26 | Sporewood | +5: Sporebelly Puffer, Velvet Ray, Plumgill Perch, Threadling Eel |
| Ember Roe | bait | 36 | Sporewood | +6: Reedjaw Pike, Mildew Angler, Mirror Pike, Shardspine Eel, Gilt-Eyed Eel, Blind Scrivener, Lampwarden (still favour +0.35, so it brings bigger fish too) |
| Glass Larvae | bait | 48 | Glasswater | +5: Glassblown Puffer, Glassgill Perch, Prism Minnow, Shroud Ray, Chime Jelly |
| Shimmerfly | bait | 40 | unlock | +2 on **every** fish (the one global bait) |
| Wick-Worms | bait | 30 | §24 | +4: the §24 place-kept fish |
| Cut Strip | bait | free (3 per fish) | creel screen | +4 vs predators |
| Feather Fly | lure | 40 | start | +6 vs insect feeders (rise-ring casts still wait × 0.5) |
| Glimmer Spoon | lure | 90 | start | +6 vs predators |
| Bone Jig | lure | 120 | start | +6 vs bottom feeders |
| Moth Popper | lure | 260 | Sporewood lit | +6 vs night-only species, at night |
| Lantern Lure | lure | 1,200 | Glasswater lit | +8 vs glow species |
| **Harbour-Bell Spinner** (NEW) | lure | 220 | start | **+10: Reedjaw Pike, Weeping Carp, Bridgechain Sturgeon** |
| **Spore-Lamp Fly** (NEW) | lure | 480 | Sporewood lit | **+10: Mildew Angler, Nightbloom Carp, Velvet Ray** |
| **Mirror Shard** (NEW) | lure | 950 | Glasswater lit | **+10: Mirror Pike, Blind Scrivener, Shardspine Eel** |
| **Ferryman's Coin** (NEW) | lure | 1,600 | Pallid lit | **+10: Gilt-Eyed Eel, Candlewake Sturgeon, Shroud Ray** |

**The giants' lures** (one per lake) are new. Each is +10 on that lake's headline species and its giant-tail species, and does **nothing** for anything else. The choice per cast is a family lure (+6 on everything of its kind, including the commons you hook most) against a giants' lure (+10 on three fish).

Lore sketches:
- **Harbour-Bell Spinner:** a clapper from a drowned harbour bell. The moat's old giants still come when it rings.
- **Spore-Lamp Fly:** a fly tied around one soft lit spore.
- **Mirror Shard:** a sliver of the Vault's glass that shows a fish itself.
- **Ferryman's Coin:** the fare nobody paid.

Measured on targets at the lake's own tackle (Prize and Trophy, T(i) and T(i+1)), family lures average **+12.5 points** and giants' lures **+19.8**. Per item, min to max:

| item | points |
|---|---|
| Feather Fly | 5–14 |
| Glimmer Spoon | 5–14 |
| Bone Jig | 6–14 |
| Moth Popper | 9–14 |
| Lantern Lure | 11–18 |
| Harbour-Bell Spinner | 17–22 |
| Spore-Lamp Fly | 16–23 |
| Mirror Shard | 17–23 |
| Ferryman's Coin | 12–23 |

---

## 5. The bite and the strike

1. **Float watch.** Signs, the float's favour notches and the class bite tells (double pop · plunge · drag-under · flat slide · dome) are unchanged. They show **size**, never species.
2. **The strike window** is the species' hook window × the Rod's multiplier × window buffs, clamped to [0.35, 1.4] s as today.

| tap | when | Hold |
|---|---|---|
| **Perfect** | the first 40% of the window (at least 0.25 s) | **+4** |
| **On time** | the rest of the window | **+2** (the log's reference strike) |
| **Mistimed** | up to 0.3 s early (during the class tell's lead) or up to 0.3 s late | **−3** |
| too early | a tap on a nibble or feint more than 0.3 s before the bite | spooked (today's `early` miss): the bait is spent, no favour carried |
| **no tap** | the window lapses | **the bite passes**: bait refunded, +0.15 favour carried to the next cast in the same water (cap +0.3), as today |

- The pips on the hook icon (Prize and bigger) now only show the strike: 3 for perfect, 2 for on time, 1 for mistimed. They are never lost during the reel.
- Letting a dome pass on starter tackle is a real choice: the bait comes back and the water stays warm. But a hooked Trophy or bigger that escapes becomes a **Marked Fish** (§25.6.7), worth +6 Hold when you re-hook it. Many players will strike anyway.
- An average player strikes perfect 35%, on time 50% and mistimed 15% of the time, worth about +2 Hold on average. The economy sim uses this split.

---

## 6. The automatic reel

### 6.1 One roll, played as beats

The outcome is one Bernoulli(p). To make a loss land on a readable moment, the reel is a short sequence of **beats**. Each beat survives with `q_i = p^(w_i / Σw)`, so the product is exactly `p`.

| class | reel length (s, × lake: cove 0.8, the Mossmere 1.0, Sporewood 1.15, Glasswater 1.3, the Pallid Deep 1.45) | ordinary beats |
|---|---|---|
| Small | 3 | 1 |
| Keeper | 4 | 2 |
| Prize | 6 | 3 |
| Trophy | 8 | 4 |
| Elder | 11 | 5, plus the old trick at 55% |
| Ancient | 13 | 6, plus the old trick at 55% |
| legend | 18 | 6 authored set pieces (the Matriarch's toll, the Grove's blooming dive, the Sovereign's three leaps, the Swallower's ember surges; its Grasping Dark snags are two of them, in every mode) |

- Beat weights: an ordinary beat 1, a **leap 2**, the **old trick 2**, a chain beat at fouled places 1.5.
- A loss on an ordinary beat reads as the style's cause:

| style | thrown | snapped | spooled |
|---|---|---|---|
| leaper | 60% | 25% | 15% |
| runner | 15% | 25% | 60% |
| thrasher · sinker · sulker | 25% | 60% | 15% |
| steady | 40% | 40% | 20% |
| darter | 50% | 30% | 20% |

- A loss on a leap is a **thrown hook**. A loss on a chain beat is **fouled**.
- Nothing is pressed during the reel. A tap fast-forwards a Small or Keeper reel. Cutting the line stays "hold movement 0.6 s" and counts as a let-go.

### 6.2 Leaps (per species)

Each row gives the chance the fish leaps at all, how many leaps, and the progress points where they happen.

| lake | leapers |
|---|---|
| the Mossmere | Gloam Eel 100% · 2 at 0.35 / 0.75<br>Reedjaw Pike 40% · 1 at 0.6<br>Candlefin Koi 25% · 1 at 0.5<br>Lampsipper 30% · 1 at 0.45<br>Dusk Minnow 15% · 1 at 0.5 |
| Sporewood | The Remembered Sun 100% · 2 at 0.3 / 0.7<br>Velvet Ray 50% · 1 at 0.8, the end of its run<br>Harpstring Eel 25% · 1 at 0.55 |
| Glasswater | Mirror Pike 50% · 1 at 0.8<br>Vesper Gar 35% · 1 at 0.6<br>Rainglass Darter 30% · 1 at 0.5<br>The Unreflected 25% · 1 at 0.55<br>Prism Minnow 15% · 1 at 0.5 |
| the Pallid Deep | Shroud Ray 100% · 2 at 0.35 / 0.75<br>Wax-Bearer 100% · 2 at 0.3 / 0.7<br>Funeral Veil 25% · 1 at 0.5<br>Gilt-Eyed Eel 30% · 1 at 0.65<br>Ossuary Fry 15% · 1 at 0.5 |
| Wanderers | Hearthfish (every lake, night) 100% · 2 at 0.3 / 0.7<br>Pilgrim Salmon 80% · 2 at 0.4 / 0.8 |
| legends | The Drifting Grove 2 at 0.4 / 0.8<br>The Glass Sovereign 3 at 0.25 / 0.55 / 0.85 |

Elders of leapers play their old trick as a second leap at 0.55. Every lake has at least 5 leaping species, night ones included (Gloam Eel, Lampsipper, Hearthfish, Vesper Gar, Funeral Veil). A leap tells you "a leaper, about this long" but **never pins one species**.

**How a leap looks** (presentation spec for fishing-fx and actors): 0.25 s at timescale 0.35. The fish is a **backlit silhouette** against the lantern glow or the starlit dome: outline and true length only, no body colour, pattern, glow or eye-shine, rendered as a flat ink fill with a thin rim. A thump is pitched by length.

### 6.3 What the player sees while a fish is on (size yes, species no)

Size cues:
- the class bite tell
- rod bend and line angle ∝ class
- line-hiss pitch ∝ length
- splash, wake and under-water shadow at true length (§25.7.5)
- the leap silhouette

What is not shown:
- no HUD %
- no tension bar (there is no input)
- no species name, colour or glow on the shadow

The float's favour notches stay: they are size odds, not catch odds.

### 6.4 After the fish

**Landed.** The measuring ceremony and card as §25.6.8. The card lists the favours that applied and shows no %.

**Lost.** A short **"the one that got away"** note appears after the loss.
- **Small and Keeper:** a one-line toast, for example *"A Reedjaw Pike, about 48 cm, snapped the line."*
- **Prize and bigger:** the existing near-miss card: silhouette, species, class, length ±8%, cause and one tip. The old "% landed" progress line is dropped. Instead the card has a **Journal** button that opens that species' odds (§7). That keeps every % inside the logs.
- **Trophy and bigger:** the fish becomes a Marked Fish as before. Its re-hook is +6 Hold, once.
- A lost species the Journal has not yet seen gets a **"seen, not landed"** page with its odds. No Memories are paid until it is landed.

### 6.5 Night modes and combat

| mode | effect on a hooked fish |
|---|---|
| Still · Lantern | **Combat never costs a hooked fish.** The hard rule holds (no knockback, shove or creelsnatch while hooked). |
| Gloomtide (and The Long Descent) | a telegraphed hit taken while a fish is on inserts one extra beat with survival **0.85** at that moment |

The log notes the Gloomtide rule in words.

---

## 7. The logs (the only place a % appears)

**The fishing log (Journal, species page)** has a *Your odds* block for the fitted tackle and the equipped item.

```
Reedjaw Pike — your odds      Glassreed · Glass-Gut · Whisper Drag · Glimmer Spoon · Well-fed not counted
Small 92%   Keeper 91%   Prize 85%   Trophy 74%   Elder 23%   Ancient 11%
With the Harbour-Bell Spinner: Trophy 78% · Elder 30% · Ancient 15%        (best owned item for this fish)
A perfect strike adds a little; a mistimed one costs a little. Gloomtide: a hit while it's on can cost it.
```

- **Reference values:** an on-time strike, no per-expedition buffs, no Marked or wound bonus.
- A Marked Fish's line shows its own % ("Old Ninefin, Trophy, ~108 cm: 85%").
- A legend's page shows the attempt % with its wounds ("Wounded twice: +12").
- Classes a species cannot reach print "—" (the Lampwarden's Elder, the Quayling's Prize and above).
- A species you have neither landed nor lost shows "?" for every class. **Discovery stays discovery.**

**The gear log (Gear Bench / Tackle screen, and the lure and bait rows at Murk)**, per item:
- *Glassreed Rod: +8 Hold on every fish · counts ×1.3 against leapers.*
- *Glimmer Spoon: +6 Hold against predators (9 species you've met).*
- *Harbour-Bell Spinner: +10 Reedjaw Pike, Weeping Carp, Bridgechain Sturgeon.*
- A pinned-species compare: *"Elder Reedjaw: 15% → 30% with this."* (T3 set, no item → Harbour-Bell Spinner)
- Proof-catch status and prices as today.

**Nowhere else.**
- **No %** on the HUD, the float, the bite tell, the reel, the catch card, the near-miss card, toasts or the Set Out card.
- The Set Out card's **tackle rating** becomes words only. It names the largest class your fitted set plus equipped item lands at 50% or better against the lake's reference species, for example *"Holds Prizes here. Trophies are a coin flip."* The numbers live in the gear log.

---

## 8. Numbers (from `tools/sim/catch-v3.mjs`; on-time strike; "a/b" = without / with the best bait or lure)

**Targets** (sim output):

```
PASS  early commons, starter tackle, 60–80%: Mossmere commons Small/Keeper on T0 71–79%
      Keeper commons on each lake's arrival tackle: mossmere T0 71–73 · sporewood T1 68–71 · glasswater T2 68–71 · paleabyss T3 74–75
PASS  early headline Elders ≈ 3–10% until late tackle (T0–T2, no item): Reedjaw Pike 2/3/6 · Mildew Angler 2/2/4
      … with their best item on T0/T1/T2: Reedjaw Pike 4/6/14 · Mildew Angler 3/5/11 (max 14)
PASS  early headline Elders at the top (T4) with the right lure 45–70%: Reedjaw Pike 53 · Mildew Angler 47
      deep lakes (by design lower: the endgame's hardest regular fish): Mirror Pike 46 · Gilt-Eyed Eel 36
      … with a perfect strike and every buff (+6): Reedjaw Pike 64 · Mildew Angler 60 · Mirror Pike 60 · Gilt-Eyed Eel 51
PASS  Ancients and legends never above ~50%: best Ancient anywhere (T4, best item, perfect, every buff, Marked) 48% (Dusk Minnow); legends at their best 50 / 50 / 49 / 44%
PASS  nothing ever reaches its cap (and every cap < 1): highest chance anywhere 95.0% (cap 95%)
PASS  a lure is a real choice: +10–25 points on its targets (Prize/Trophy, the lake's own tackle): family lures avg +12.5, giants' lures avg +19.8 points
```

**The headline species** (the full 49-species table is in the appendix):

| species | class | T0 | T1 | T2 | T3 | T4 | best item |
|---|---|---|---|---|---|---|---|
| Dusk Minnow (Mossmere common) | Small | 79/86 | 86/90 | 91/93 | 93/94 | 95/95 | Feather Fly +6 |
| | Keeper | 73/82 | 82/87 | 89/92 | 93/94 | 94/95 | |
| | Prize | 58/70 | 70/79 | 82/87 | 89/91 | 92/92 | |
| | Trophy | 37/51 | 51/63 | 68/76 | 79/83 | 85/86 | |
| | Elder | 8/13 | 13/21 | 26/37 | 45/55 | 64/69 | |
| | Ancient | 3/6 | 6/10 | 12/19 | 24/31 | 38/42 | |
| **Reedjaw Pike** (Mossmere headline) | Keeper | 48/69 | 61/79 | 78/88 | 88/92 | 93/94 | Harbour-Bell Spinner +10 |
| | Prize | 31/53 | 44/66 | 64/80 | 80/88 | 89/91 | |
| | Trophy | 16/33 | 25/46 | 44/64 | 65/78 | 79/85 | |
| | **Elder** | **2/4** | **3/6** | **6/14** | **15/30** | **34/53** | |
| | Ancient | 2/2 | 2/3 | 3/7 | 7/15 | 17/29 | |
| Mildew Angler (Sporewood headline) | Trophy | 10/22 | 16/33 | 31/53 | 53/71 | 74/82 | Spore-Lamp Fly +10 |
| | Elder | 2/3 | 2/5 | 4/11 | 11/25 | 28/47 | |
| Mirror Pike (Glasswater headline) | Trophy | 6/14 | 10/22 | 20/40 | 39/60 | 64/77 | Mirror Shard +10 |
| | Elder | 2/3 | 2/5 | 4/11 | 11/24 | 27/46 | |
| Gilt-Eyed Eel (Pallid headline) | Trophy | 3/7 | 5/11 | 10/24 | 24/45 | 49/68 | Ferryman's Coin +10 |
| | Elder | 2/2 | 2/3 | 3/6 | 7/16 | 18/36 | |
| | Ancient | 2/2 | 2/2 | 2/3 | 3/7 | 9/18 | |

**Lake averages** (open water, no item; arrival tier T(i), the lake's curve tier T(i+1), and T4):

| lake · rarity | tackle | Small | Keeper | Prize | Trophy | Elder | Ancient |
|---|---|---|---|---|---|---|---|
| Mossmere · common | T0 / T1 / T4 | 79 / 85 / 95 | 73 / 81 / 94 | 57 / 69 / 92 | 37 / 50 / 85 | 8 / 13 / 64 | 3 / 6 / 37 |
| Mossmere · rare | T0 / T1 / T4 | 60 / 72 / 94 | 51 / 64 / 93 | 34 / 48 / 89 | 18 / 28 / 80 | 2 / 3 / 36 | 2 / 2 / 18 |
| Sporewood · common | T1 / T2 / T4 | 76 / 86 / 94 | 69 / 83 / 93 | 53 / 71 / 90 | 33 / 53 / 82 | 9 / 18 / 57 | 4 / 8 / 33 |
| Sporewood · rare | T1 / T2 / T4 | 60 / 77 / 93 | 51 / 70 / 91 | 34 / 55 / 86 | 18 / 34 / 75 | 2 / 5 / 31 | 2 / 2 / 15 |
| Glasswater · common | T2 / T3 / T4 | 77 / 87 / 93 | 70 / 84 / 91 | 54 / 74 / 86 | 34 / 56 / 75 | 11 / 25 / 47 | 5 / 12 / 26 |
| Glasswater · rare | T2 / T3 / T4 | 61 / 79 / 89 | 51 / 73 / 87 | 34 / 58 / 78 | 18 / 37 / 62 | 3 / 8 / 21 | 2 / 3 / 10 |
| Pallid · common | T3 / T4 | 80 / 90 | 74 / 88 | 60 / 80 | 39 / 64 | 16 / 37 | 8 / 19 |
| Pallid · rare | T3 / T4 | 66 / 84 | 57 / 79 | 40 / 66 | 22 / 47 | 5 / 14 | 2 / 7 |

How it reads:
- Every lake's commons land about **68–75% on arrival tackle**, rising to about 81–88% on the lake's curve tier and about 88–95% at T4. That is never boring and never guaranteed.
- **Elders:** headline Elders in the early lakes sit at 2–6% on T0–T2 and about 14% with the right lure on T2. The real step is T3 with the giants' lure (25–30%), then T4 (47–53%; 60–64% with a perfect strike and every buff).
- **Commons' Elders** stay catchable on the lake's own tackle: 13% on Mossmere T1, 26% on T2, 37% with the Feather Fly. That keeps Q3's second clause ("smaller species' Elders stay catchable on the lake's own tackle") and is where most first Elders come from.

**Legends** (legend bait; on-time strike; cap 50%):

| legend | T0 | T1 | T2 | T3 | T4 | T4 after 1 / 2 / 3 escapes | expected attempts on its lake's curve tier |
|---|---|---|---|---|---|---|---|
| The Belled Matriarch | 20 | 27 | 38 | 45 | 48 | 49 / 49 / 50 | T1: 2.8 (114 Shells of Heartmoss) |
| The Drifting Grove | 8 | 13 | 24 | 35 | 44 | 47 / 48 / 49 | T2: 3.1 (275 Shells) |
| The Glass Sovereign | 3 | 5 | 11 | 21 | 35 | 41 / 44 / 47 | T3: 3.2 (551 Shells) |
| The Lantern-Swallower | 2 | 2 | 3 | 7 | 17 | 24 / 31 / 38 | T4: 3.6 (1,148 Shells of Last Candle) |

The wounds make every legend a short campaign of 2–4 attempts. The gate never dead-ends and is never a sure thing.

**Favour: bigger fish, lower odds, more value.** μ still shifts the size distribution and nothing else. More favour means bigger fish, which means a lower chance per hook.

| case | μ 0 | μ 0.5 | μ 1.0 | μ 1.5 | μ 1.8 |
|---|---|---|---|---|---|
| Reedjaw, T1, giant water: E[p] | 61% | 56% | 49% | 41% | 36% |
| … Shells per hook | 14.7 | 15.8 | 16.3 | 16.1 | 15.6 |
| … Elders landed per 100 hooks | 0.01 | 0.04 | 0.11 | 0.26 | 0.40 |
| Reedjaw, T4, giant water: E[p] | 92% | 90% | 87% | 81% | 77% |
| … Shells per hook | 23.6 | 28.0 | 33.2 | 38.4 | 41.0 |
| … Elders landed per 100 hooks | 0.12 | 0.46 | 1.37 | 3.23 | 4.88 |

How it reads to the player: **a 5-notch float means fewer fish, bigger fish.** Favour pays once your tackle can hold what it brings.
- On early tackle, Shells per hook peak around μ 1 and fall after.
- On T4 they rise all the way up.
- Elders per hook rise with favour on any tackle.

So the float stays the thing you master, and the Journal's odds tell you whether tonight is a night to chase the dome or to fill the creel.

**Landings per outing** (expectation over each lake's open-water pool and the §25.7.3 favour mix, a third of casts in giant water, average strike, 8% let pass, 144 s of fishing per day as in §25.2.4):

| lake | tackle | s per cast | hooks / day | E[p] | landed / day | today's table | per 4-day outing | Prize+ / outing | Trophy+ / outing |
|---|---|---|---|---|---|---|---|---|---|
| the Mossmere | T0 | 15.8 | 8.4 | 66% | 5.5 | 5.0 | 22.0 | 4.7 | 0.9 |
| | T1 | 16.3 | 8.2 | 75% | 6.1 | 5.0 | 24.5 | 5.7 | 1.2 |
| Sporewood | T1 | 16.2 | 8.2 | 62% | 5.1 | 4.6 | 20.4 | 4.2 | 0.8 |
| | T2 | 16.9 | 7.8 | 77% | 6.0 | 4.6 | 24.1 | 5.7 | 1.2 |
| Glasswater | T2 | 16.8 | 7.9 | 63% | 4.9 | 4.2 | 19.8 | 4.1 | 0.8 |
| | T3 | 17.5 | 7.6 | 78% | 5.9 | 4.2 | 23.7 | 5.7 | 1.3 |
| the Pallid Deep | T3 | 17.5 | 7.6 | 67% | 5.1 | 3.8 | 20.3 | 4.4 | 0.9 |
| | T4 | 18.3 | 7.2 | 83% | 6.0 | 3.8 | 24.0 | 6.0 | 1.4 |

The automatic reel is shorter than today's fight (3–13 s against 5–60 s), so the same fishing time holds about 8 hooks a day instead of about 6. Lower land rates then bring landings to roughly today's count on arrival tackle, and **+20–40% on the curve tier**. Better tackle now means a fuller creel, which today's model never had. §9 says how the economy holds.

The Landing (tutorial): the Quayling lands **90% (Small) and 87% (Keeper)** on T0 with an on-time strike (88% perfect, 83% mistimed).

---

## 9. What this does to the rest of the design

| system | effect | owner and fix |
|---|---|---|
| **Income** | landings run above `ECONOMY_V3.income[lake].landed` on the lake's average tier | Multiply the size **value factor** (0.66) and the **yield factor** (0.784) by a landing normaliser per lake: the Mossmere **0.86** · Sporewood **0.83** · Glasswater **0.78** · the Pallid Deep **0.69** (the sim's `value×` column, averaged over arrival and curve tiers). Shells, food and oil per in-lake day then stay at today's table, so Far Water's oil pressure and the tackle timeline hold. The balance sim (T3) re-derives these. The alternative knob is the bite wait (the sim's `wait→today` column, ×1.2–1.9). It is not recommended: more ceremonies beat longer waits. |
| **XP** | +20–40% fish per day means more Boon levels per expedition | Fish XP × the same normaliser, or accept it. T3 decides. |
| **Lure catalogue** | +3,250 Shells (the four giants' lures). Lures go from 1,710 to 4,960. Main sinks go from 28,240 to 31,490. | Suggested placements: Harbour-Bell Spinner ≈ h1.3, Spore-Lamp Fly ≈ h3.0, Mirror Shard ≈ h6, Ferryman's Coin ≈ h11. Income meets the main sinks at ≈ h18.4 instead of h16.7. T3 re-places the timeline. |
| **Legend baits** | expected attempts are 2.8–3.6 per legend, against 1–2 today | About +640 Shells over a campaign, mostly the Last Candle (≈ 1,150 against 640 budgeted). |
| **Proof catches** | Prize+ per Mossmere outing is 4.7 on T0. Trophy+ is about 1.2 per outing on the curve tiers. | Every proof lands within about 1 expedition of being on sale. No change. |
| **Elder pacing** | open-water Elders landed per outing are 0.01–0.04 on curve tackle, before residents and Marked Fish. First Elder landed moves from h2–6 to **≈ h4–8**, mostly a common's Elder at T2 (26%) or a Marked Fish's second chance. | The T5 pacing sim re-checks. The relief valves are Marked Fish (+6), residents and the Feather Fly / Bone Jig on commons' Elders. The Elder-heavy third of the Memories pool already came late. |
| **Tackle rating, gear gate, §25.6.9 land-rate targets** | replaced | The rating is computed from `catchChance` (words on the Set Out card). §8's tables are the new gear gate. The reel sim stays only for The Long Descent if it keeps the manual reel (see §11). |
| **Hook-hold pips, drag, Spooled, old trick, runner and sulker verbs** | become presentation: beats and causes in §6 | The runner hiss, sulker thud and old-trick double surge are animations on the beat they belong to, with no input. |
| **The float's favour, signs, pressure, Night Rise, Far Water, Clean Cast, place windows, clear water** | unchanged and **add no chance** | One lever per system: signs and favour decide *what bites and how big*, the kit decides *whether you land it*. Night Rise makes the big-fish hour the hard-fish hour. |

---

## 10. The opening: a very short tutorial at the Landing (the relayed user request)

The game opens where the lore says the last Wicks came ashore: **the Landing**, the old ferry landing under the kingdom's outer wall, behind the broken sea-gate arch. A Wick is one of the Lamplit Kingdom's last candle-flames. It fishes so it stays lit, and its first act in the game is to fish. The player is never dropped into a lake without context. The catch model is taught in about 60 s, using only things the Landing already has (§25.4.2).

| t | beat (one line of text each, skippable after the first run) | what the model teaches |
|---|---|---|
| 0:00 | Title orbit of the cove: one lit hearth, the bare harbour wall, Murk's barge. "Begin." The Wick wakes by the hearth. *Tip: walk to the jetty.* | where you are and why: the last Wicks landed here |
| 0:10 | **Strike practice at the test buoy.** Cast at it. It dips like a bite twice, and each tap gets a stamp: *Perfect* · *On time* · *Too soon*. No fish, no rewards. | the only input after the cast; perfect is worth a little |
| 0:25 | Cast into the cove. A **Quayling** bites (Small or Keeper; 87–90% on T0). The reel runs itself, then the measuring moment: "Quayling, Keeper, 14 cm". If it gets away, the got-away note plays and a fresh Quayling bites within 4 s, so the tutorial never dead-ends and no single fish is guaranteed. | automatic reel; size shown, species named on landing; losses happen |
| 0:45 | Murk, from his barge: *"Every fish you've met has its odds in that Journal of yours. Better tackle, better odds. Never certain."* The Journal opens on the Quayling page and shows its *Your odds* row. | the % lives in the log and nowhere else |
| 0:55 | Map Table, then the **First Outing** card (the Mossmere, every night still), then Set Out. | the expedition loop |

**Dependency.** This needs the Landing's jetty, test buoy, Quayling and Murk's barge, which the phase plan holds for P3. This model asks that a Landing v0 slice (quay, hearth, jetty, test buoy, the cove-only Quayling, Murk at the barge) ship **together with the automatic fishing**, so the first build of the new fishing already opens in its lore-true place. The full Landing (walls, pond, shrine) can still land in P3.

---

## 11. Build notes (data, API, events)

**Data** (`src/data.js`, behind `V3_ENABLED`):
- `CATCH_V3` (the draft in the sim).
- `LURES` gains the four giants' lures, each with `species: [...]`.
- `TACKLE[slot][tier].hold` from §3.1.
- `tackleStats()` returns `hold`.
- New `validate-data` rules:
  - every cap < 1
  - floor ≥ 0.01
  - matched-set Hold rises strictly
  - every lure lists a family, `night` or species
  - the sim's six targets pass (as a `--catch` pass calling `tools/sim/catch-v3.mjs`)

**One pure helper**, `catchChance(sp, sizeClass, loadout, ctx) → p`, lives in `data.js` next to `tackleStats`, so fishing (the roll), ui (the logs) and progression (the tackle rating) share it.
- `loadout = {tackle: {rod, line, reel}, item, drag}`
- `ctx = {lake, strike, buffs, marked, wounds, landings, night}`

**Events** (additive; no event payload may be printed as a % outside the logs):

| event | change |
|---|---|
| `fishing:hook` | + `{strike: 'perfect'\|'onTime'\|'mistimed'}` (the species stays off any UI) |
| `fishing:leap` | new: `{sizeClass, length, shape}`, with no speciesId (the silhouette) |
| `fishing:beat` | new: `{kind: 'beat'\|'leap'\|'oldTrick'\|'chain'\|'hit', at}` |
| `fishing:escaped` | reasons + `'thrown'` and `'fouled'` |
| `fish:got-away` | new: `{speciesId, sizeClass, lengthEst, cause, place, markedFish}`, for every class; Prize+ also keeps `fish:escaped-big` for the near-miss card |
| `journal:seen` | new: `{speciesId}` |

**Save:**
- `meta.legendWounds {id: n}`
- `journal.seen`
- `meta.markedFish` (unchanged)

**v1 flag-off:** untouched. The Long Descent keeps today's manual reel only if the user wants a "manual" prestige mode. Otherwise it uses this model with per-run tiers (§3.6). The default here is this model everywhere in v3.

## 12. Risks and open questions

1. **Early losses sting.** 20–30% of early commons get away. Mitigations:
   - the got-away note names the fish, so a loss is information, not noise
   - turnover is fast (≈ 16 s per cast)
   - the Feather Fly and Bone Jig are cheap
   - T1 (120 per slot) lifts commons to about 81%

   If playtests flinch, raise the Wick's craft from 10 to 12 (Keeper commons on T0 ≈ 76%, Small ≈ 81%).
2. **Elders later.** First Elder ≈ h4–8 (§9). If it drags, lower the Mossmere Elder step from 10 to 8. Commons' Elders on T1 go from 13% to 16% while headline Elders stay ≤ 10% on T0–T2.
3. **Deep headline Elders** (Mirror Pike 46%, Gilt-Eyed Eel 36% at T4 with the right lure) are below the early lakes' 45–70% band on purpose, as the endgame. Raise the Pallid lake term from 24 to 21 if the Pallid feels walled.
4. **Drag presets** (§3.5) are optional. Cut them if the bench gets fiddly.
5. **Economy normaliser against the wait:** T3 decides. This document recommends the normaliser.

---

## Appendix: every species, class and tier

Generated by `node tools/sim/catch-v3.mjs --all --md`: % landed, matched tackle T0…T4, an on-time strike, written as "without / with the best bait or lure". "—" means the class is out of reach. Wanderers are listed under their first lake. The Quayling is in §8.

**The Mossmere** (% landed, matched tackle T0…T4, an on-time strike: without / with the best bait or lure)
| species | class | T0 | T1 | T2 | T3 | T4 | best item |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dusk Minnow | Small | 79/86 | 86/90 | 91/93 | 93/94 | 95/95 | Feather Fly +6 |
| Dusk Minnow | Keeper | 73/82 | 82/87 | 89/92 | 93/94 | 94/95 | Feather Fly +6 |
| Dusk Minnow | Prize | 58/70 | 70/79 | 82/87 | 89/91 | 92/92 | Feather Fly +6 |
| Dusk Minnow | Trophy | 37/51 | 51/63 | 68/76 | 79/83 | 85/86 | Feather Fly +6 |
| Dusk Minnow | Elder | 8/13 | 13/21 | 26/37 | 45/55 | 64/69 | Feather Fly +6 |
| Dusk Minnow | Ancient | 3/6 | 6/10 | 12/19 | 24/31 | 38/42 | Feather Fly +6 |
| Mossback Perch | Small | 79/86 | 86/90 | 91/93 | 93/94 | 95/95 | Bone Jig +6 |
| Mossback Perch | Keeper | 73/82 | 82/87 | 89/92 | 93/94 | 94/95 | Bone Jig +6 |
| Mossback Perch | Prize | 58/70 | 70/79 | 82/87 | 89/91 | 92/92 | Bone Jig +6 |
| Mossback Perch | Trophy | 37/51 | 51/63 | 68/76 | 79/83 | 85/86 | Bone Jig +6 |
| Mossback Perch | Elder | 8/13 | 13/21 | 26/37 | 45/55 | 64/69 | Bone Jig +6 |
| Mossback Perch | Ancient | 3/6 | 6/10 | 12/19 | 24/31 | 38/42 | Bone Jig +6 |
| Gutter Crayfish | Small | 78/85 | 85/89 | 90/92 | 93/94 | 94/95 | Bone Jig +6 |
| Gutter Crayfish | Keeper | 71/80 | 80/86 | 88/91 | 93/94 | 94/95 | Bone Jig +6 |
| Gutter Crayfish | Prize | 56/68 | 68/77 | 81/86 | 88/90 | 92/92 | Bone Jig +6 |
| Gutter Crayfish | Trophy | 35/48 | 48/61 | 66/74 | 79/83 | 85/86 | Bone Jig +6 |
| Gutter Crayfish | Elder | 7/12 | 12/19 | 24/35 | 43/54 | 63/69 | Bone Jig +6 |
| Gutter Crayfish | Ancient | 3/5 | 5/9 | 12/18 | 23/30 | 37/42 | Bone Jig +6 |
| Lampsipper | Small | 79/86 | 86/90 | 91/93 | 93/94 | 95/95 | Feather Fly +6 |
| Lampsipper | Keeper | 73/82 | 82/87 | 89/92 | 93/94 | 94/95 | Feather Fly +6 |
| Lampsipper | Prize | 58/70 | 70/79 | 82/87 | 89/91 | 92/92 | Feather Fly +6 |
| Lampsipper | Trophy | 37/51 | 51/63 | 68/76 | 79/83 | 85/86 | Feather Fly +6 |
| Lampsipper | Elder | 8/13 | 13/21 | 26/37 | 45/55 | 64/69 | Feather Fly +6 |
| Lampsipper | Ancient | 3/6 | 6/10 | 12/19 | 24/31 | 38/42 | Feather Fly +6 |
| Weeping Carp | Small | 71/85 | 80/89 | 88/92 | 93/94 | 94/95 | Harbour-Bell Spinner +10 |
| Weeping Carp | Keeper | 63/80 | 75/86 | 86/91 | 91/94 | 94/95 | Harbour-Bell Spinner +10 |
| Weeping Carp | Prize | 47/68 | 60/77 | 76/86 | 86/90 | 91/92 | Harbour-Bell Spinner +10 |
| Weeping Carp | Trophy | 27/48 | 40/61 | 59/74 | 75/83 | 84/86 | Harbour-Bell Spinner +10 |
| Weeping Carp | Elder | 4/9 | 6/15 | 14/29 | 30/49 | 53/66 | Harbour-Bell Spinner +10 |
| Weeping Carp | Ancient | 2/4 | 3/7 | 7/14 | 15/27 | 29/40 | Harbour-Bell Spinner +10 |
| Candlefin Koi | Small | 73/82 | 82/87 | 89/92 | 93/94 | 94/95 | Feather Fly +6 |
| Candlefin Koi | Keeper | 66/76 | 76/84 | 86/90 | 92/93 | 94/94 | Feather Fly +6 |
| Candlefin Koi | Prize | 49/62 | 62/73 | 77/84 | 87/89 | 91/92 | Feather Fly +6 |
| Candlefin Koi | Trophy | 29/42 | 42/55 | 61/71 | 76/81 | 84/86 | Feather Fly +6 |
| Candlefin Koi | Elder | 4/7 | 7/12 | 15/24 | 31/43 | 54/63 | Feather Fly +6 |
| Candlefin Koi | Ancient | 2/3 | 3/5 | 7/12 | 16/23 | 30/37 | Feather Fly +6 |
| Reedjaw Pike | Small | 57/76 | 69/84 | 83/90 | 90/93 | 93/94 | Harbour-Bell Spinner +10 |
| Reedjaw Pike | Keeper | 48/69 | 61/79 | 78/88 | 88/92 | 93/94 | Harbour-Bell Spinner +10 |
| Reedjaw Pike | Prize | 31/53 | 44/66 | 64/80 | 80/88 | 89/91 | Harbour-Bell Spinner +10 |
| Reedjaw Pike | Trophy | 16/33 | 25/46 | 44/64 | 65/78 | 79/85 | Harbour-Bell Spinner +10 |
| Reedjaw Pike | Elder | 2/4 | 3/6 | 6/14 | 15/30 | 34/53 | Harbour-Bell Spinner +10 |
| Reedjaw Pike | Ancient | 2/2 | 2/3 | 3/7 | 7/15 | 17/29 | Harbour-Bell Spinner +10 |
| Gloam Eel | Small | 63/78 | 75/85 | 86/90 | 91/93 | 94/94 | Lantern Lure +8 |
| Gloam Eel | Keeper | 55/71 | 68/80 | 82/88 | 89/92 | 93/94 | Lantern Lure +8 |
| Gloam Eel | Prize | 37/56 | 51/68 | 70/81 | 83/88 | 90/91 | Lantern Lure +8 |
| Gloam Eel | Trophy | 20/35 | 31/48 | 51/66 | 69/78 | 81/85 | Lantern Lure +8 |
| Gloam Eel | Elder | 2/4 | 3/7 | 8/15 | 18/31 | 39/54 | Lantern Lure +8 |
| Gloam Eel | Ancient | 2/2 | 2/3 | 3/7 | 8/15 | 20/30 | Lantern Lure +8 |
| Old Portcullis | Small | 61/73 | 73/82 | 85/89 | 91/93 | 94/94 | Bone Jig +6 |
| Old Portcullis | Keeper | 52/66 | 66/76 | 80/86 | 89/92 | 93/94 | Bone Jig +6 |
| Old Portcullis | Prize | 35/49 | 49/62 | 68/77 | 82/87 | 89/91 | Bone Jig +6 |
| Old Portcullis | Trophy | 19/29 | 29/42 | 48/61 | 68/76 | 81/84 | Bone Jig +6 |
| Old Portcullis | Elder | 2/3 | 3/5 | 7/12 | 17/26 | 38/49 | Bone Jig +6 |
| Old Portcullis | Ancient | 2/2 | 2/2 | 3/5 | 8/13 | 19/27 | Bone Jig +6 |
| Cupbearer | Small | 69/79 | 79/86 | 88/91 | 92/93 | 94/95 | Feather Fly +6 |
| Cupbearer | Keeper | 61/73 | 73/82 | 85/89 | 91/93 | 94/94 | Feather Fly +6 |
| Cupbearer | Prize | 44/58 | 58/70 | 75/82 | 85/89 | 91/92 | Feather Fly +6 |
| Cupbearer | Trophy | 25/37 | 37/51 | 57/68 | 73/79 | 83/85 | Feather Fly +6 |
| Cupbearer | Elder | 3/4 | 4/8 | 10/17 | 23/33 | 45/55 | Feather Fly +6 |
| Cupbearer | Ancient | 2/2 | 2/3 | 5/8 | 11/17 | 24/31 | Feather Fly +6 |
| Bridgechain Sturgeon | Small | 68/83 | 78/88 | 87/92 | 92/94 | 94/95 | Harbour-Bell Spinner +10 |
| Bridgechain Sturgeon | Keeper | 59/78 | 71/85 | 84/90 | 91/93 | 94/94 | Harbour-Bell Spinner +10 |
| Bridgechain Sturgeon | Prize | 42/64 | 56/75 | 73/85 | 85/90 | 90/92 | Harbour-Bell Spinner +10 |
| Bridgechain Sturgeon | Trophy | 24/44 | 35/57 | 55/72 | 72/82 | 83/86 | Harbour-Bell Spinner +10 |
| Bridgechain Sturgeon | Elder | 2/6 | 4/10 | 9/21 | 21/40 | 43/60 | Harbour-Bell Spinner +10 |
| Bridgechain Sturgeon | Ancient | 2/3 | 2/5 | 4/10 | 10/20 | 23/35 | Harbour-Bell Spinner +10 |
| Hearthfish | Small | 63/78 | 75/85 | 86/90 | 91/93 | 94/94 | Lantern Lure +8 |
| Hearthfish | Keeper | 55/71 | 68/80 | 82/88 | 89/92 | 93/94 | Lantern Lure +8 |
| Hearthfish | Prize | 37/56 | 51/68 | 70/81 | 83/88 | 90/91 | Lantern Lure +8 |
| Hearthfish | Trophy | 20/35 | 31/48 | 51/66 | 69/78 | 81/85 | Lantern Lure +8 |
| Hearthfish | Elder | 2/4 | 3/7 | 8/15 | 18/31 | 39/54 | Lantern Lure +8 |
| Hearthfish | Ancient | 2/2 | 2/3 | 3/7 | 8/15 | 20/30 | Lantern Lure +8 |

**Sporewood Pools** (% landed, matched tackle T0…T4, an on-time strike: without / with the best bait or lure)
| species | class | T0 | T1 | T2 | T3 | T4 | best item |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sporebelly Puffer | Small | 63/75 | 75/83 | 86/90 | 91/93 | 94/94 | Feather Fly +6 |
| Sporebelly Puffer | Keeper | 55/68 | 68/78 | 82/87 | 90/92 | 93/94 | Feather Fly +6 |
| Sporebelly Puffer | Prize | 37/51 | 51/64 | 70/79 | 83/87 | 90/91 | Feather Fly +6 |
| Sporebelly Puffer | Trophy | 20/31 | 31/44 | 51/63 | 70/77 | 82/84 | Feather Fly +6 |
| Sporebelly Puffer | Elder | 4/8 | 8/13 | 17/26 | 34/45 | 56/64 | Feather Fly +6 |
| Sporebelly Puffer | Ancient | 2/3 | 3/6 | 8/12 | 17/24 | 31/38 | Feather Fly +6 |
| Plumgill Perch | Small | 68/78 | 78/85 | 87/90 | 92/93 | 94/94 | Glimmer Spoon +6 |
| Plumgill Perch | Keeper | 59/71 | 71/80 | 84/88 | 90/92 | 94/94 | Glimmer Spoon +6 |
| Plumgill Perch | Prize | 42/56 | 56/68 | 73/81 | 85/88 | 90/91 | Glimmer Spoon +6 |
| Plumgill Perch | Trophy | 24/35 | 35/48 | 55/66 | 72/78 | 82/85 | Glimmer Spoon +6 |
| Plumgill Perch | Elder | 5/9 | 9/15 | 19/29 | 37/49 | 59/66 | Glimmer Spoon +6 |
| Plumgill Perch | Ancient | 2/4 | 4/7 | 9/14 | 19/26 | 33/39 | Glimmer Spoon +6 |
| Capshell Crayfish | Small | 66/76 | 76/84 | 86/90 | 92/93 | 94/94 | Bone Jig +6 |
| Capshell Crayfish | Keeper | 57/69 | 69/79 | 83/88 | 90/92 | 93/94 | Bone Jig +6 |
| Capshell Crayfish | Prize | 40/53 | 53/66 | 71/80 | 84/88 | 90/91 | Bone Jig +6 |
| Capshell Crayfish | Trophy | 22/33 | 33/46 | 53/64 | 71/78 | 82/85 | Bone Jig +6 |
| Capshell Crayfish | Elder | 5/9 | 9/14 | 18/28 | 36/47 | 57/65 | Bone Jig +6 |
| Capshell Crayfish | Ancient | 2/4 | 4/7 | 8/13 | 18/25 | 33/39 | Bone Jig +6 |
| Velvet Ray | Small | 55/75 | 68/83 | 82/90 | 89/93 | 93/94 | Spore-Lamp Fly +10 |
| Velvet Ray | Keeper | 45/68 | 59/78 | 76/87 | 87/92 | 92/94 | Spore-Lamp Fly +10 |
| Velvet Ray | Prize | 29/51 | 42/64 | 62/79 | 78/87 | 88/91 | Spore-Lamp Fly +10 |
| Velvet Ray | Trophy | 15/31 | 24/44 | 42/63 | 62/76 | 78/84 | Spore-Lamp Fly +10 |
| Velvet Ray | Elder | 2/6 | 4/10 | 9/21 | 21/39 | 43/60 | Spore-Lamp Fly +10 |
| Velvet Ray | Ancient | 2/3 | 2/5 | 4/10 | 10/20 | 22/34 | Spore-Lamp Fly +10 |
| Threadling Eel | Small | 59/71 | 71/80 | 84/88 | 90/92 | 94/94 | Glimmer Spoon +6 |
| Threadling Eel | Keeper | 50/63 | 63/75 | 79/86 | 88/91 | 93/94 | Glimmer Spoon +6 |
| Threadling Eel | Prize | 33/47 | 47/60 | 66/76 | 81/86 | 89/91 | Glimmer Spoon +6 |
| Threadling Eel | Trophy | 17/27 | 27/40 | 46/59 | 66/74 | 80/83 | Glimmer Spoon +6 |
| Threadling Eel | Elder | 3/5 | 5/9 | 11/18 | 24/35 | 47/57 | Glimmer Spoon +6 |
| Threadling Eel | Ancient | 2/2 | 2/4 | 5/8 | 12/18 | 25/32 | Glimmer Spoon +6 |
| Nightbloom Carp | Small | 57/76 | 69/84 | 83/90 | 90/93 | 93/94 | Spore-Lamp Fly +10 |
| Nightbloom Carp | Keeper | 48/69 | 61/79 | 78/88 | 88/92 | 93/94 | Spore-Lamp Fly +10 |
| Nightbloom Carp | Prize | 31/53 | 44/66 | 64/80 | 80/88 | 89/91 | Spore-Lamp Fly +10 |
| Nightbloom Carp | Trophy | 16/33 | 25/46 | 44/64 | 65/78 | 79/85 | Spore-Lamp Fly +10 |
| Nightbloom Carp | Elder | 3/6 | 4/11 | 10/23 | 23/42 | 45/62 | Spore-Lamp Fly +10 |
| Nightbloom Carp | Ancient | 2/3 | 2/5 | 5/11 | 11/22 | 24/36 | Spore-Lamp Fly +10 |
| Mildew Angler | Small | 43/66 | 57/76 | 75/86 | 87/92 | 92/94 | Spore-Lamp Fly +10 |
| Mildew Angler | Keeper | 34/57 | 48/69 | 68/83 | 83/90 | 91/93 | Spore-Lamp Fly +10 |
| Mildew Angler | Prize | 20/40 | 31/53 | 51/71 | 72/84 | 85/90 | Spore-Lamp Fly +10 |
| Mildew Angler | Trophy | 10/22 | 16/33 | 31/53 | 53/71 | 74/82 | Spore-Lamp Fly +10 |
| Mildew Angler | Elder | 2/3 | 2/5 | 4/11 | 11/25 | 28/47 | Spore-Lamp Fly +10 |
| Mildew Angler | Ancient | 2/2 | 2/2 | 2/5 | 5/12 | 14/25 | Spore-Lamp Fly +10 |
| Sleepspore Jelly | Small | 50/68 | 63/78 | 79/87 | 88/92 | 93/94 | Lantern Lure +8 |
| Sleepspore Jelly | Keeper | 40/59 | 55/71 | 73/84 | 86/90 | 92/94 | Lantern Lure +8 |
| Sleepspore Jelly | Prize | 25/42 | 37/56 | 58/73 | 76/85 | 87/90 | Lantern Lure +8 |
| Sleepspore Jelly | Trophy | 12/24 | 20/35 | 37/55 | 59/72 | 77/82 | Lantern Lure +8 |
| Sleepspore Jelly | Elder | 2/3 | 3/5 | 6/12 | 14/26 | 33/49 | Lantern Lure +8 |
| Sleepspore Jelly | Ancient | 2/2 | 2/2 | 3/5 | 7/12 | 17/26 | Lantern Lure +8 |
| Harpstring Eel | Small | 55/68 | 68/78 | 82/87 | 90/92 | 93/94 | Glimmer Spoon +6 |
| Harpstring Eel | Keeper | 45/59 | 59/71 | 76/84 | 87/90 | 92/94 | Glimmer Spoon +6 |
| Harpstring Eel | Prize | 29/42 | 42/56 | 62/73 | 79/85 | 88/90 | Glimmer Spoon +6 |
| Harpstring Eel | Trophy | 15/24 | 24/35 | 42/55 | 63/72 | 78/82 | Glimmer Spoon +6 |
| Harpstring Eel | Elder | 2/3 | 3/5 | 7/12 | 17/26 | 37/49 | Glimmer Spoon +6 |
| Harpstring Eel | Ancient | 2/2 | 2/2 | 3/5 | 8/12 | 19/26 | Glimmer Spoon +6 |
| Hushcap Koi | Small | 55/71 | 68/80 | 82/88 | 90/92 | 93/94 | Lantern Lure +8 |
| Hushcap Koi | Keeper | 45/63 | 59/75 | 76/86 | 87/91 | 92/94 | Lantern Lure +8 |
| Hushcap Koi | Prize | 29/47 | 42/60 | 62/76 | 79/86 | 88/91 | Lantern Lure +8 |
| Hushcap Koi | Trophy | 15/27 | 24/40 | 42/59 | 63/74 | 78/83 | Lantern Lure +8 |
| Hushcap Koi | Elder | 2/4 | 3/6 | 7/14 | 17/29 | 37/52 | Lantern Lure +8 |
| Hushcap Koi | Ancient | 2/2 | 2/3 | 3/7 | 8/14 | 19/29 | Lantern Lure +8 |
| The Remembered Sun | Small | 52/66 | 66/76 | 80/86 | 89/92 | 93/94 | Feather Fly +6 |
| The Remembered Sun | Keeper | 43/57 | 57/69 | 75/83 | 86/90 | 92/93 | Feather Fly +6 |
| The Remembered Sun | Prize | 27/40 | 40/53 | 60/71 | 77/84 | 88/90 | Feather Fly +6 |
| The Remembered Sun | Trophy | 14/22 | 22/33 | 40/53 | 60/70 | 77/82 | Feather Fly +6 |
| The Remembered Sun | Elder | 2/3 | 3/5 | 6/11 | 15/24 | 35/46 | Feather Fly +6 |
| The Remembered Sun | Ancient | 2/2 | 2/2 | 3/5 | 7/11 | 18/25 | Feather Fly +6 |
| Pilgrim Salmon | Small | 45/59 | 59/71 | 76/84 | 87/90 | 92/94 | Glimmer Spoon +6 |
| Pilgrim Salmon | Keeper | 36/50 | 50/63 | 69/79 | 84/88 | 91/93 | Glimmer Spoon +6 |
| Pilgrim Salmon | Prize | 22/33 | 33/47 | 53/66 | 73/81 | 86/89 | Glimmer Spoon +6 |
| Pilgrim Salmon | Trophy | 10/17 | 17/27 | 33/46 | 54/66 | 74/80 | Glimmer Spoon +6 |
| Pilgrim Salmon | Elder | 2/2 | 2/4 | 5/9 | 12/19 | 29/41 | Glimmer Spoon +6 |
| Pilgrim Salmon | Ancient | 2/2 | 2/2 | 2/4 | 5/9 | 14/21 | Glimmer Spoon +6 |

**Glasswater Vault** (% landed, matched tackle T0…T4, an on-time strike: without / with the best bait or lure)
| species | class | T0 | T1 | T2 | T3 | T4 | best item |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Prism Minnow | Small | 48/61 | 61/73 | 78/85 | 88/91 | 93/94 | Feather Fly +6 |
| Prism Minnow | Keeper | 38/52 | 52/66 | 71/80 | 85/89 | 92/93 | Feather Fly +6 |
| Prism Minnow | Prize | 23/35 | 35/49 | 56/68 | 75/82 | 87/89 | Feather Fly +6 |
| Prism Minnow | Trophy | 11/19 | 19/29 | 35/48 | 57/68 | 76/81 | Feather Fly +6 |
| Prism Minnow | Elder | 3/5 | 5/9 | 12/19 | 26/37 | 49/59 | Feather Fly +6 |
| Prism Minnow | Ancient | 2/2 | 2/4 | 5/9 | 12/19 | 26/33 | Feather Fly +6 |
| Glassgill Perch | Small | 48/61 | 61/73 | 78/85 | 88/91 | 93/94 | Glimmer Spoon +6 |
| Glassgill Perch | Keeper | 38/52 | 52/66 | 71/80 | 85/89 | 92/93 | Glimmer Spoon +6 |
| Glassgill Perch | Prize | 23/35 | 35/49 | 56/68 | 75/82 | 87/89 | Glimmer Spoon +6 |
| Glassgill Perch | Trophy | 11/19 | 19/29 | 35/48 | 57/68 | 76/81 | Glimmer Spoon +6 |
| Glassgill Perch | Elder | 3/5 | 5/9 | 12/19 | 26/37 | 49/59 | Glimmer Spoon +6 |
| Glassgill Perch | Ancient | 2/2 | 2/4 | 5/9 | 12/19 | 26/33 | Glimmer Spoon +6 |
| Glassblown Puffer | Small | 43/57 | 57/69 | 75/83 | 87/90 | 92/93 | Bone Jig +6 |
| Glassblown Puffer | Keeper | 34/48 | 48/61 | 68/78 | 83/88 | 91/93 | Bone Jig +6 |
| Glassblown Puffer | Prize | 20/31 | 31/44 | 51/64 | 72/80 | 85/89 | Bone Jig +6 |
| Glassblown Puffer | Trophy | 10/16 | 16/25 | 31/44 | 53/65 | 74/79 | Bone Jig +6 |
| Glassblown Puffer | Elder | 3/4 | 4/8 | 10/17 | 23/34 | 45/56 | Bone Jig +6 |
| Glassblown Puffer | Ancient | 2/2 | 2/3 | 5/8 | 11/17 | 24/31 | Bone Jig +6 |
| Chime Jelly | Small | 38/57 | 52/69 | 71/83 | 85/90 | 92/93 | Lantern Lure +8 |
| Chime Jelly | Keeper | 29/48 | 43/61 | 63/78 | 80/88 | 90/93 | Lantern Lure +8 |
| Chime Jelly | Prize | 17/31 | 27/44 | 47/64 | 68/80 | 84/89 | Lantern Lure +8 |
| Chime Jelly | Trophy | 8/16 | 14/25 | 27/44 | 48/64 | 71/79 | Lantern Lure +8 |
| Chime Jelly | Elder | 2/3 | 3/6 | 6/13 | 15/28 | 35/50 | Lantern Lure +8 |
| Chime Jelly | Ancient | 2/2 | 2/3 | 3/6 | 7/13 | 18/27 | Lantern Lure +8 |
| Mirror Pike | Small | 29/52 | 43/66 | 63/80 | 80/89 | 90/93 | Mirror Shard +10 |
| Mirror Pike | Keeper | 22/43 | 34/57 | 55/75 | 74/86 | 88/92 | Mirror Shard +10 |
| Mirror Pike | Prize | 12/27 | 20/40 | 37/60 | 60/77 | 80/88 | Mirror Shard +10 |
| Mirror Pike | Trophy | 6/14 | 10/22 | 20/40 | 39/60 | 64/77 | Mirror Shard +10 |
| Mirror Pike | Elder | 2/3 | 2/5 | 4/11 | 11/24 | 27/46 | Mirror Shard +10 |
| Mirror Pike | Ancient | 2/2 | 2/2 | 2/5 | 5/11 | 13/25 | Mirror Shard +10 |
| Shardspine Eel | Small | 26/48 | 38/61 | 59/78 | 78/88 | 89/93 | Mirror Shard +10 |
| Shardspine Eel | Keeper | 19/38 | 29/52 | 50/71 | 72/85 | 87/92 | Mirror Shard +10 |
| Shardspine Eel | Prize | 10/23 | 17/35 | 33/56 | 56/75 | 78/87 | Mirror Shard +10 |
| Shardspine Eel | Trophy | 5/11 | 8/19 | 17/35 | 36/57 | 61/76 | Mirror Shard +10 |
| Shardspine Eel | Elder | 2/2 | 2/3 | 3/7 | 7/17 | 20/38 | Mirror Shard +10 |
| Shardspine Eel | Ancient | 2/2 | 2/2 | 2/3 | 3/8 | 9/19 | Mirror Shard +10 |
| Vesper Gar | Small | 29/43 | 43/57 | 63/75 | 80/86 | 90/92 | Glimmer Spoon +6 |
| Vesper Gar | Keeper | 22/34 | 34/48 | 55/68 | 75/83 | 88/91 | Glimmer Spoon +6 |
| Vesper Gar | Prize | 12/20 | 20/31 | 37/51 | 60/71 | 80/85 | Glimmer Spoon +6 |
| Vesper Gar | Trophy | 6/10 | 10/16 | 20/31 | 40/53 | 64/73 | Glimmer Spoon +6 |
| Vesper Gar | Elder | 2/2 | 2/3 | 3/6 | 9/14 | 23/33 | Glimmer Spoon +6 |
| Vesper Gar | Ancient | 2/2 | 2/2 | 2/3 | 4/7 | 11/17 | Glimmer Spoon +6 |
| The Blind Scrivener | Small | 26/48 | 38/61 | 59/78 | 78/88 | 89/93 | Mirror Shard +10 |
| The Blind Scrivener | Keeper | 19/38 | 29/52 | 50/71 | 72/85 | 87/92 | Mirror Shard +10 |
| The Blind Scrivener | Prize | 10/23 | 17/35 | 33/56 | 56/75 | 78/87 | Mirror Shard +10 |
| The Blind Scrivener | Trophy | 5/11 | 8/19 | 17/35 | 36/57 | 61/76 | Mirror Shard +10 |
| The Blind Scrivener | Elder | 2/2 | 2/3 | 3/7 | 7/17 | 20/38 | Mirror Shard +10 |
| The Blind Scrivener | Ancient | 2/2 | 2/2 | 2/3 | 3/8 | 9/19 | Mirror Shard +10 |
| The Unreflected | Small | 34/48 | 48/61 | 68/78 | 83/88 | 91/93 | Feather Fly +6 |
| The Unreflected | Keeper | 26/38 | 38/52 | 59/71 | 78/85 | 89/92 | Feather Fly +6 |
| The Unreflected | Prize | 14/23 | 23/35 | 42/56 | 64/75 | 82/87 | Feather Fly +6 |
| The Unreflected | Trophy | 7/11 | 11/19 | 24/35 | 44/57 | 68/76 | Feather Fly +6 |
| The Unreflected | Elder | 2/2 | 2/3 | 4/7 | 10/17 | 26/37 | Feather Fly +6 |
| The Unreflected | Ancient | 2/2 | 2/2 | 2/3 | 5/8 | 12/19 | Feather Fly +6 |
| The Footnote | Small | 29/43 | 43/57 | 63/75 | 81/87 | 90/92 | Bone Jig +6 |
| The Footnote | Keeper | 22/34 | 34/48 | 55/68 | 75/83 | 88/91 | Bone Jig +6 |
| The Footnote | Prize | 12/20 | 20/31 | 37/51 | 61/72 | 80/85 | Bone Jig +6 |
| The Footnote | Trophy | 6/10 | 10/16 | 20/31 | 40/53 | 65/74 | Bone Jig +6 |
| The Footnote | Elder | 2/2 | 2/3 | 3/6 | 9/15 | 23/34 | Bone Jig +6 |
| The Footnote | Ancient | 2/2 | 2/2 | 2/3 | 4/7 | 11/17 | Bone Jig +6 |
| Rainglass Darter | Small | 34/48 | 48/61 | 68/78 | 83/88 | 91/93 | Feather Fly +6 |
| Rainglass Darter | Keeper | 26/38 | 38/52 | 59/71 | 78/85 | 89/92 | Feather Fly +6 |
| Rainglass Darter | Prize | 14/23 | 23/35 | 42/56 | 64/75 | 82/87 | Feather Fly +6 |
| Rainglass Darter | Trophy | 7/11 | 11/19 | 24/35 | 44/57 | 68/76 | Feather Fly +6 |
| Rainglass Darter | Elder | 2/2 | 2/3 | 4/7 | 10/17 | 26/37 | Feather Fly +6 |
| Rainglass Darter | Ancient | 2/2 | 2/2 | 2/3 | 5/8 | 12/19 | Feather Fly +6 |
| The Sexton | Small | 29/43 | 43/57 | 63/75 | 81/87 | 90/92 | Bone Jig +6 |
| The Sexton | Keeper | 22/34 | 34/48 | 55/68 | 75/83 | 88/91 | Bone Jig +6 |
| The Sexton | Prize | 12/20 | 20/31 | 37/51 | 61/72 | 80/85 | Bone Jig +6 |
| The Sexton | Trophy | 6/10 | 10/16 | 20/31 | 40/53 | 65/74 | Bone Jig +6 |
| The Sexton | Elder | 2/2 | 2/3 | 3/6 | 9/15 | 23/34 | Bone Jig +6 |
| The Sexton | Ancient | 2/2 | 2/2 | 2/3 | 4/7 | 11/17 | Bone Jig +6 |

**The Pallid Deep** (% landed, matched tackle T0…T4, an on-time strike: without / with the best bait or lure)
| species | class | T0 | T1 | T2 | T3 | T4 | best item |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ossuary Fry | Small | 29/43 | 43/57 | 63/75 | 80/86 | 90/92 | Feather Fly +6 |
| Ossuary Fry | Keeper | 22/34 | 34/48 | 55/68 | 75/83 | 88/91 | Feather Fly +6 |
| Ossuary Fry | Prize | 12/20 | 20/31 | 37/51 | 60/71 | 80/85 | Feather Fly +6 |
| Ossuary Fry | Trophy | 6/10 | 10/16 | 20/31 | 40/53 | 64/73 | Feather Fly +6 |
| Ossuary Fry | Elder | 2/3 | 3/5 | 7/12 | 17/26 | 37/49 | Feather Fly +6 |
| Ossuary Fry | Ancient | 2/2 | 2/2 | 3/5 | 8/12 | 19/26 | Feather Fly +6 |
| Pallid Wraithfin | Small | 29/43 | 43/57 | 63/75 | 80/86 | 90/92 | Glimmer Spoon +6 |
| Pallid Wraithfin | Keeper | 22/34 | 34/48 | 55/68 | 75/83 | 88/91 | Glimmer Spoon +6 |
| Pallid Wraithfin | Prize | 12/20 | 20/31 | 37/51 | 60/71 | 80/85 | Glimmer Spoon +6 |
| Pallid Wraithfin | Trophy | 6/10 | 10/16 | 20/31 | 40/53 | 64/73 | Glimmer Spoon +6 |
| Pallid Wraithfin | Elder | 2/3 | 3/5 | 7/12 | 17/26 | 37/49 | Glimmer Spoon +6 |
| Pallid Wraithfin | Ancient | 2/2 | 2/2 | 3/5 | 8/12 | 19/26 | Glimmer Spoon +6 |
| Bonecrook Crayfish | Small | 27/40 | 40/55 | 61/73 | 79/86 | 90/92 | Bone Jig +6 |
| Bonecrook Crayfish | Keeper | 20/32 | 32/45 | 52/66 | 74/82 | 87/91 | Bone Jig +6 |
| Bonecrook Crayfish | Prize | 11/18 | 18/29 | 35/49 | 59/70 | 79/85 | Bone Jig +6 |
| Bonecrook Crayfish | Trophy | 5/9 | 9/15 | 19/29 | 38/51 | 63/72 | Bone Jig +6 |
| Bonecrook Crayfish | Elder | 2/3 | 3/5 | 6/11 | 16/25 | 36/47 | Bone Jig +6 |
| Bonecrook Crayfish | Ancient | 2/2 | 2/2 | 3/5 | 7/12 | 18/25 | Bone Jig +6 |
| Gilt-Eyed Eel | Small | 16/34 | 26/48 | 45/68 | 68/83 | 85/91 | Ferryman's Coin +10 |
| Gilt-Eyed Eel | Keeper | 11/26 | 19/38 | 36/59 | 60/78 | 81/89 | Ferryman's Coin +10 |
| Gilt-Eyed Eel | Prize | 6/14 | 10/23 | 22/42 | 43/65 | 69/82 | Ferryman's Coin +10 |
| Gilt-Eyed Eel | Trophy | 3/7 | 5/11 | 10/24 | 24/45 | 49/68 | Ferryman's Coin +10 |
| Gilt-Eyed Eel | Elder | 2/2 | 2/3 | 3/6 | 7/16 | 18/36 | Ferryman's Coin +10 |
| Gilt-Eyed Eel | Ancient | 2/2 | 2/2 | 2/3 | 3/7 | 9/18 | Ferryman's Coin +10 |
| Shroud Ray | Small | 20/40 | 32/55 | 52/73 | 73/85 | 87/92 | Ferryman's Coin +10 |
| Shroud Ray | Keeper | 15/32 | 24/45 | 43/66 | 65/81 | 84/90 | Ferryman's Coin +10 |
| Shroud Ray | Prize | 8/18 | 13/29 | 27/49 | 48/70 | 73/84 | Ferryman's Coin +10 |
| Shroud Ray | Trophy | 3/9 | 6/15 | 14/29 | 29/50 | 54/72 | Ferryman's Coin +10 |
| Shroud Ray | Elder | 2/2 | 2/4 | 3/9 | 8/19 | 22/41 | Ferryman's Coin +10 |
| Shroud Ray | Ancient | 2/2 | 2/2 | 2/4 | 4/9 | 11/21 | Ferryman's Coin +10 |
| Funeral Veil | Small | 16/29 | 26/43 | 45/63 | 68/80 | 85/90 | Lantern Lure +8 |
| Funeral Veil | Keeper | 11/22 | 19/34 | 36/55 | 59/75 | 80/88 | Lantern Lure +8 |
| Funeral Veil | Prize | 6/12 | 10/20 | 22/37 | 42/60 | 68/80 | Lantern Lure +8 |
| Funeral Veil | Trophy | 3/6 | 5/10 | 10/20 | 24/40 | 48/64 | Lantern Lure +8 |
| Funeral Veil | Elder | 2/2 | 2/2 | 2/4 | 5/10 | 14/26 | Lantern Lure +8 |
| Funeral Veil | Ancient | 2/2 | 2/2 | 2/2 | 2/5 | 7/12 | Lantern Lure +8 |
| Lampwarden Angler | Small | 13/26 | 22/38 | 40/59 | 64/78 | 83/89 | Lantern Lure +8 |
| Lampwarden Angler | Keeper | 9/19 | 16/29 | 32/50 | 55/72 | 78/87 | Lantern Lure +8 |
| Lampwarden Angler | Prize | 5/10 | 8/17 | 18/33 | 38/56 | 65/78 | Lantern Lure +8 |
| Lampwarden Angler | Trophy | 2/5 | 4/8 | 9/17 | 21/36 | 45/61 | Lantern Lure +8 |
| The Clapper | Small | 16/26 | 26/38 | 45/59 | 68/78 | 85/89 | Bone Jig +6 |
| The Clapper | Keeper | 11/19 | 19/29 | 36/50 | 60/72 | 81/87 | Bone Jig +6 |
| The Clapper | Prize | 6/10 | 10/17 | 22/33 | 43/56 | 69/78 | Bone Jig +6 |
| The Clapper | Trophy | 3/5 | 5/8 | 10/17 | 24/36 | 49/61 | Bone Jig +6 |
| The Clapper | Elder | 2/2 | 2/2 | 2/3 | 5/9 | 15/23 | Bone Jig +6 |
| The Clapper | Ancient | 2/2 | 2/2 | 2/2 | 2/4 | 7/11 | Bone Jig +6 |
| The Wax-Bearer | Small | 17/32 | 27/45 | 48/66 | 69/81 | 85/90 | Lantern Lure +8 |
| The Wax-Bearer | Keeper | 12/24 | 20/36 | 38/57 | 61/76 | 81/88 | Lantern Lure +8 |
| The Wax-Bearer | Prize | 6/13 | 11/22 | 23/40 | 44/62 | 70/81 | Lantern Lure +8 |
| The Wax-Bearer | Trophy | 3/6 | 5/10 | 11/22 | 25/41 | 50/66 | Lantern Lure +8 |
| The Wax-Bearer | Elder | 2/2 | 2/2 | 2/4 | 5/11 | 15/27 | Lantern Lure +8 |
| The Wax-Bearer | Ancient | 2/2 | 2/2 | 2/2 | 2/5 | 7/13 | Lantern Lure +8 |
| The Unpaid Fare | Small | 16/26 | 26/38 | 45/59 | 68/78 | 85/89 | Bone Jig +6 |
| The Unpaid Fare | Keeper | 11/19 | 19/29 | 36/50 | 60/72 | 81/87 | Bone Jig +6 |
| The Unpaid Fare | Prize | 6/10 | 10/17 | 22/33 | 43/56 | 69/78 | Bone Jig +6 |
| The Unpaid Fare | Trophy | 3/5 | 5/8 | 10/17 | 24/36 | 49/61 | Bone Jig +6 |
| The Unpaid Fare | Elder | 2/2 | 2/2 | 2/3 | 5/9 | 15/23 | Bone Jig +6 |
| The Unpaid Fare | Ancient | 2/2 | 2/2 | 2/2 | 2/4 | 7/11 | Bone Jig +6 |
| Candlewake Sturgeon | Small | 12/27 | 20/40 | 38/61 | 61/79 | 81/89 | Ferryman's Coin +10 |
| Candlewake Sturgeon | Keeper | 9/20 | 15/32 | 29/52 | 52/73 | 76/87 | Ferryman's Coin +10 |
| Candlewake Sturgeon | Prize | 4/11 | 8/18 | 17/35 | 35/58 | 62/78 | Ferryman's Coin +10 |
| Candlewake Sturgeon | Trophy | 2/5 | 3/9 | 8/19 | 19/37 | 41/62 | Ferryman's Coin +10 |
| Candlewake Sturgeon | Elder | 2/2 | 2/2 | 2/4 | 4/9 | 11/24 | Ferryman's Coin +10 |
| Candlewake Sturgeon | Ancient | 2/2 | 2/2 | 2/2 | 2/4 | 5/11 | Ferryman's Coin +10 |
| The Namesake | Small | 19/29 | 29/43 | 50/63 | 71/80 | 86/90 | Glimmer Spoon +6 |
| The Namesake | Keeper | 13/22 | 22/34 | 40/55 | 63/75 | 83/88 | Glimmer Spoon +6 |
| The Namesake | Prize | 7/12 | 12/20 | 25/37 | 47/60 | 71/80 | Glimmer Spoon +6 |
| The Namesake | Trophy | 3/6 | 6/10 | 12/20 | 27/40 | 53/64 | Glimmer Spoon +6 |
| The Namesake | Elder | 2/2 | 2/2 | 2/4 | 6/10 | 17/26 | Glimmer Spoon +6 |
| The Namesake | Ancient | 2/2 | 2/2 | 2/2 | 3/5 | 8/12 | Glimmer Spoon +6 |

