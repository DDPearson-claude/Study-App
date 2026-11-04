# GLOOMWATER pivot: structure, pacing, progression and where combat fits

*Panel lens: macro structure, session pacing, economy, meta-progression, difficulty curve, retention, and combat's new role. Every number below is a target for `src/data.js`. Where this lens touches the fishing model (size classes, how size affects the fight), the numbers are the **interface** progression needs. The fishing lens may change the distribution as long as the value and difficulty steps per class hold.*

---

## 0. Verdict

**Swap the one-way roguelite descent for out-and-back Expeditions run from a persistent home, the Landing.** Keep the descent as the fiction and as an optional prestige mode.

The player's long arc becomes: **find the place → read the conditions → hook it → land it → measure it → bring it home**. Four things persist: gear, the Journal, records and map knowledge. Expeditions stay short and risky. You can lose the catch you are carrying, but never the collection. The night stays in the game in all three modes. In every mode it is the best time to hook a giant. Fighting the swarm is a separate opt-in choice, made once per expedition: **Still**, **Lantern** (default) or **Gloomtide** (today's game, unchanged).

### Where I disagree with the guiding hypotheses

1. **"Keep roguelite descents" — no.** In the current design gear resets every run, and that fights the headline loop "earn gear and access → reach bigger fish": trophy hunting would reset every 15 minutes. Gear must persist. The challenge still holds because size scales the fight: the biggest fish of an *early* lake need *late* gear, so every lake stays relevant and power creep never makes old water trivial.
2. **"Skippable combat" — yes, but with no fishing penalty.** Skipping combat must not cost fishing rewards. No species, place or size class is locked behind fighting. Combat modes pay in *risk-shaped* currency instead: better size odds while the swarm is up, Memories for nights endured, Boons and Wardens. Still mode pays in time: about 10% more fishing minutes.
3. **Night: go further than "night is also a fishing opportunity".** Make night the *climax of every day*. The **Night Rise** (big fish come shallow and bite heavier) happens in every mode. The night then becomes about getting the giant home, not about getting through it.
4. **"Failure stings without wiping": define the sting precisely.** You lose the creel, any unmounted trophies and half of the expedition's Homecoming tally. Records are written the instant a fish is measured, so they can never be lost.
5. **Satiety should not survive as a drain.** Two upkeep meters are chores that take attention from the water. Oil stays, recast as **range** (how long you can stay out in the dark). Satiety becomes a **Well-fed buff** with no starvation.

---

## 1. Macro structure

### 1.1 The campaign spine (persistent)

| milestone | how | unlocks | target hour |
|---|---|---|---|
| The Mossmere | start | Bell Pool, 8 species | 0 |
| **Belled Matriarch** first landing | legend rule (unchanged) | Moss Sluice opens for good; pay the 180 toll once → **Sporewood Waystone** lit | 0.6–1.2 |
| **Drifting Grove** | legend rule | Glasswater (toll 420 once) | 2.5–4 |
| **Glass Sovereign** (night) | legend rule | Pallid Deep (toll 900 once), Silverthread on sale | 5–7 |
| **Pale Leviathan** | legend rule, gear gate LS ≥ 1.9 | story ending ("The light comes up"), legend rematches, Elder sightings | 10–14 |
| post-game | Journal 40, Trophy Wall 40, size ladders, place mastery, **The Long Descent** | prestige relic and cosmetics | 14–30 |

Waystone relics are cut. Landing a legendary lights the next lake's Waystone for good, so access is earned by fishing.

### 1.2 The expedition (one session)

| step | what happens | reuses |
|---|---|---|
| **The Landing** (menu hub, no new 3D scene) | Murk's stall (persistent tackle, bait, supplies), Shrine (Relics), Journal, **Trophy Wall**, Murk's Ledger, challenges | title screen, shop tabs, Shrine, Journal screens |
| **Set Out** | pick a lake (any with a lit Waystone), a Wick and a **night mode**. The mode is locked for the expedition. | New Descent screen |
| **Days** | calm → dusk → night → dawn (§2). Murk moors daily in-lake: sell, resupply, take requests. | survival, progression, Murk |
| **Going deeper** (optional) | an opened gate is a free passage. Each lake crossed adds +15% to the Homecoming tally (and +3 Heat in combat modes). | gates, `travel()` |
| **Ride home with Murk** | at his dock during calm: unsold fish are sold, marked trophies are mounted, the Homecoming tally is paid | `summarizeRun` |
| **Snuffed** (failure) | Embers reach 0 (combat modes), or 25 s of guttering darkness (any mode) | death flow |

**Length:** open-ended, built for **3–5 in-game days (20–32 min)**. A one-day outing (≈ 7 min) is a first-class phone session: ride home at the next calm.

### 1.3 What persists, what is at stake

| thing | persists | if snuffed |
|---|---|---|
| Journal names, size-ladder rungs, records, personal-best weights | yes: written at the **measuring moment** | never lost |
| Places discovered and mastered (Known Places start lit) | yes | never lost |
| Shells (banked when Murk pays), tackle, Relics, Wicks, challenges, lake access | yes | never lost |
| **Creel** (unsold fish) | expedition | **lost** (it sinks) |
| **Marked trophies** (fish kept for the Wall; theft-proof) | expedition | **lost** |
| **Homecoming tally** (days out, haul kg, nights endured, lakes crossed) | paid on return | **× 0.5** |
| bait, oil flasks, Stake Lanterns, level, Boons, Heartwax, lit Waylamps, shortcuts | expedition | ended (same as returning home) |

The sting lands on *the fish you were proudest of*, so no collection is ever wiped. Since Murk buys daily, the usual loss is about one day's catch. The big losses only happen when you chose to carry a trophy through the nights.

**Sell or mount.** Any personal best of Specimen class or above can be **marked** for the Wall. It holds a slot until you ride home, then mounts for Memories, appears on the Trophy Wall and puts a raft cosmetic on the raft. Selling it pays Shells now. This generalises the current "Trophy or Toll".

---

## 2. Day/night cycle and night modes

### 2.1 Phases

| phase | length | role |
|---|---|---|
| calm | **240 s** (+60 s Arrival Hush on the first day in a lake) | exploring, places, deeds, most species, Murk |
| dusk "Last Light" | 20 s | dusk-window places (Ferry Slip), +0.15 weight bias, the forecast toast |
| night | **100 s** (Gloomtide mode: 90–120 s as now) | night-only species, **Night Rise**: weight bias +0.25 on every night cast |
| dawn | 10 s | survivors dissolve, Murk's bell, banking |

A day is ≈ 370 s, about 6 min. Today's day is 232–262 s, so combat now comes round about half as often per hour, even in Gloomtide mode.

### 2.2 The three night modes

| | **Still** | **Lantern** (default) | **Gloomtide** (classic) |
|---|---|---|---|
| swarm nights | none (every night is a Stillnight) | nights 2, 4, 6 … (night 1 is always still). Murk forecasts it at dawn: "The Gloom stirs tonight." | every night |
| swarm duration | 0 | 55 s inside the 100 s night (k 0.20–0.75), then a quiet aftermath | 90–120 s (unchanged) |
| intensity vs. `difficultyFor` | — | spawnRate × 0.55, hpMult × 0.8, maxAlive × 0.6, elite interval × 2 (first elite at Heat ≥ 3), 1 formation | × 1.0 (current §7) |
| Wardens | none | every 2nd swarm night (nights 4, 8) at hp × 0.75; it withdraws when the window closes | nights 3, 6, 9 (unchanged) |
| what it threatens | — | **your catch and your light**: creelsnatch eels (weight × 2) take an unmarked fish, moths drink oil, a slam snaps a non-legendary line. Fodder contact costs **oil, not Embers**; only telegraphed hits (slam, glob, charge, Warden) cost Embers. | Embers first (current death model), then oil and the creel |
| night fishing | the full 100 s | 45 s still, plus fishing inside the swarm (spawn × 0.8 while hooked, as now) | inside the swarm only |
| **reward for braving it** | — | **Gloom-fed**: while the swarm is up, a cast's weight is rolled twice and the higher roll kept (Trophy odds ≈ 5% → 10%, Elder ≈ 0.5% → 1%). Plus Cinders, +4 Memories per swarm night. | Gloom-fed every night, full Cinders and Boons, Wardens (Heartwax, relic reveals), current night Memories |
| Embers lost per swarm night (on-curve) | 0 | 0–1 | current table (§7.7) |
| snuffed per expedition (target) | ≤ 5% | 10–15% | 40–55% in the first 5 h, 25–35% later |
| Homecoming tally multiplier | × 1.0 | × 1.1 | × 1.25 |

Swapping modes mid-expedition is not allowed. Otherwise players would switch to Still while carrying a trophy.

### 2.3 Run-level build in every mode

Fish already give XP (`fishXpFor`). In **Still**, levels come only from fish, discoveries (+10 XP for a new place, +5 for a new size rung) and an **Angler pool**. That pool is the nine existing fishing, movement and oil boons (Steady Reel, Hungry Waters, Lucky Knot, Gutsfire, Lantern on the Line, Gilded Hook, Swift Oars, Slow Burn, Brighter Wick) plus about six new ones, for example Long Cast, Measured Hand (+weight bias), Night Eyes, Patient Line, Feather Drag and Wanderer's Stride. Lantern mode mixes the Angler pool with the weapons. Gloomtide keeps today's pool and its Angler boons. Every expedition still builds a character, and the level-up beat survives without combat.

### 2.4 Legendary fights without a swarm

In Still mode the Sovereign's fight runs without the swarm. The Leviathan's *Grasping Dark* becomes two telegraphed **snags**: a +0.2 tension spike each, warned 1 s ahead by a hand silhouette under the water. In combat modes both fights are unchanged.

---

## 3. Survival drains, recast

| drain | before | after | why |
|---|---|---|---|
| **oil** | 0.17/s × phase (calm 1.0 · dusk 1.3 · gloom 1.8) × zone; at 0, darkness damage | **range model:** × zone × context: **on the raft or inside a lit Waylamp 0.35 · on foot 1.0 · Stillnight 1.0 · swarm 1.8**. At 0: Last Flicker (+12, once a day), then 25 s **guttering** (no casting: you cannot see the bobber), then **snuffed**. | Oil now measures how far and how long you dare to go. The Mossmere raft burns ≈ 35 oil a day (one rendered fish). A full lantern lasts ≈ 7 min on foot in Glasswater away from lamps. Waylamps (§24) become range extenders. |
| **satiety** | 0.10/s; starvation costs Embers, reel × 0.75 | drain × 0.5, **no penalty at 0**. ≥ 60% = **Well-fed**: reelSpeed +0.08, sweetZone +0.01, +1 dawn mend in combat modes. | Eating stays a creel choice (eat, burn, sell, mount), but is never a chore. |
| Embers | always on | combat modes only, hidden in Still | no meter that does nothing |

---

## 4. Economy

### 4.1 Fish value = species × size class × quality

| class | share of the species' rolls (base) | weight vs. species median | value × | food/oil × | first time per species | fights like |
|---|---|---|---|---|---|---|
| Small | lowest 25% | 0.5–0.8 | 0.6 | 0.8 | — | power × 0.9, stamina × 0.8 |
| Keeper | 25–75% | 0.8–1.3 | 1.0 | 1.0 | — | the species |
| Specimen | 75–95% | 1.3–1.9 | 1.8 | 1.3 | +1 Memory | about ½ rarity tier up |
| Trophy | 95–99.5% | 1.9–2.8 | 4 | 1.6 | +4 Memories, Wall-eligible | 1 tier up (needs +1 gear tier) |
| Elder | top 0.5%, only with **2+ size signs** | 2.8–4 | 10 | 2 | +12 Memories, "Elder" Wall frame | 2 tiers up (needs +2 tiers) |

**Size signs** stack. The Elder roll is enabled only when two or more are present, which makes "right place + right conditions + right gear + skill" a recipe the player can read: Night Rise · dusk · today's Astir place · Gloom-fed · heavy bait (`weightBias`) · a size-rhythm place (Chain Garden, Breathing Deep) · Murk's Rumour (§7). Under the best recipe the Elder rate climbs from 0.5% to about 3%.

The average value multiplier is ≈ 1.24 (today `sizeK` averages 0.94). Retune species `value` × 0.8 if Shell income runs hot.

### 4.2 Shell income by stage (targets)

| lake (hours) | fish landed / h | average Shells / fish (incl. size) | gross / h | bait, oil, supplies | net / h |
|---|---|---|---|---|---|
| Mossmere (0–1.5) | 36 | 11 | 400 | 60 | ≈ 340 |
| Sporewood (1.5–4) | 32 | 30 | 960 | 160 | ≈ 800 |
| Glasswater (4–8) | 30 | 65 | 1,950 | 350 | ≈ 1,600 |
| Pallid Deep (8–14) | 26 | 120 | 3,100 | 600 | ≈ 2,500 |

Cumulative ≈ 24,000 Shells by hour 14; one-time tolls take 1,500.

### 4.3 What Shells buy

| sink | price band | notes |
|---|---|---|
| **Persistent tackle** (today's UPGRADES, moved from run to meta) | catalogue ≈ **28,000** (today 12,665 per run) | rod, line (with a **rated kg**: above it the snap threshold falls 1.0 → 0.88), reel, drag, lures, lantern chimney (range), creel, boots/oars. Tiers unlock by lake reached. Leviathan-ready (≈ 70% of the catalogue) ≈ hour 12; the whole catalogue ≈ hour 18. |
| bait and supplies | 5–15% of income | consumable, per expedition |
| tolls | 180 / 420 / 900, **once** | the first passage only |
| Murk's taxidermy | 15% of the fish's sale value, to mount | makes sell-or-mount a real choice |
| Murk's Charts | 60–400 | reveals one lake's place twists, or tomorrow's Astir |

---

## 5. Meta-progression (four persistent tracks)

| track | currency / trigger | what it gives | full by |
|---|---|---|---|
| **Tackle** | Shells | raw fishing power: the size-class gates | h 18 |
| **Journal** | first catches, size rungs (5 per species × 40 = 200 rungs), place pages | Memories; **lake perks** now need *a Specimen of every species* in the lake (incl. place-kept), not just names | h 20–25 (Elders: 30+) |
| **Places** | discovery (+2 Memories), mastery (+10; Known Place: its Waylamp starts lit) | map knowledge; 4–6 places gated by gear (e.g. Bell-Chapel Window needs castMax ≥ 19; the Well of Ledgers' bottom ledger needs line II) | h 12 found, h 25 mastered |
| **Relics** | Memories, ≈ 150–220 / h | utility and knowledge more than stats: Oilskin (range), Mended Creel, Seven Knots, Grandmother's Hook, Listening Bobber, Shimmering Scale, Floor-Map Rubbing, Lamplighter's Hook, Roadworn Soles, plus new **Measuring Cord** (shows the size class on the hook), **Murk's Spyglass** (tomorrow's Astir), **Rumour Shell** (+1 Rumour a day) | fishing/exploration shelf ≈ 3,800 Memories (h 18–20); combat relics move to a "Gloom shelf" ≈ 2,600 |

**Memories sources, retuned toward discovery:** new species 3 · new place 2 · size rung 1 / 4 / 12 · mastery 10 · challenges (instant) · Homecoming tally ≈ 30–90 per expedition (days × 4 + haul kg / 10 + nights endured + 15 per lake crossed) × mode multiplier.

**Challenges:** 30 → 40 with §24's tier IV. The 12 combat challenges move to a **Gloom** tab. Every unlock that matters to fishing gets an **either-path** requirement, so all 5 Wicks, all baits and all fishing relics are reachable in Still mode. For example, Ashwick needs "Silence a Warden **or** land 3 night-only species of Specimen class", and Tallow needs "Endure 5 Gloomtides **or** spend 5 nights fishing in one expedition". Combat boons stay combat-locked; they do nothing in Still mode anyway. New fishing goals: first Trophy, first Elder, 10 Trophies, all Specimens in a lake, a 20-kg non-legendary, ride home with 3 marked trophies.

**Wicks** keep their stats. Each quirk gets a fishing/exploration half:

| Wick | new half (all modes) |
|---|---|
| The Wick | *Curious*: places reveal from 16 m (not 8); the first new species of each day gives +1 reroll |
| Taper | as now (Angler's Ember: fish give double XP) |
| Stub | stride +0.4, and a size sign whenever it casts within 5 s of stopping |
| Tallow | oil burn × 0.8 on foot (range) |
| Ashwick | Gloom-fed rolls three times instead of two |

---

## 6. Difficulty curve

| | **Hour 1** | **Hour 5** | **Hour 15** |
|---|---|---|---|
| where | Mossmere (raft) | Sporewood places, Glasswater entry (mixed and foot) | Pallid Deep, plus Elder hunts back in earlier lakes |
| gear (line strength) | 1.0–1.15 | 1.3–1.45 | 1.9–2.2 |
| the challenge | the reel itself: surges, leaps, perfect hooks, reading depth. The Matriarch is the first wall (≈ 50% first attempt at Gut Line I). | **conditions and places**: bait locks, time windows, sequence and rhythm twists. Trophies need +1 tier. The Drifting Grove's decoy band. Saving 420 for the toll. | **Elder recipes** (2+ size signs), Elder fights at +2 tiers, the Leviathan gear gate, legend rematches that grow each landing |
| typical failure | snap from holding through a surge; late hook | no bite (wrong conditions); a Trophy snaps; slack on leapers | an Elder escapes (≈ 60% of first Elder hooks); the Brittle Line phase; snuffed far from a lamp |
| land rate of hooked fish (on-curve) | commons 90%, rares 60% | Keepers 85%, Trophies 45% | Trophies 65%, Elders 30–40% |
| Lantern swarm night | 0–1 Ember | ≈ 1 | 1–2 |
| Gloomtide mode | as today: dies on night 3–5 | as today in Sporewood | as today in the Pallid Deep |

**"The one that got away":** a Trophy or Elder that escapes stays in that place for the rest of the expedition, with a 25% chance to re-bite any cast within 3 m and its progress carried over (`woundedCarry` extended from legendaries). Losing it stings, and it gives you a reason to come back.

---

## 7. Retention hooks

| hook | rule |
|---|---|
| **Astir** (in-run) | §24 as drafted: one place per walking lake each in-game day; the Mossmere gains one "astir" spot style |
| **Grand Astir** (real date) | one place per lake per calendar day (seeded by `Date`): Astir bonus + counts as a size sign; shown at the Landing |
| **Murk's Rumour** | daily: "An Elder Velvet Ray turns in the Lullaby Pool." Elder chance × 3 for that species and place today (counts as a sign) |
| **Murk's Ledger** | 3 persistent requests (species × size class, place, night, Shimmering); 1 refreshes per expedition, and a lapsed slot refreshes after a real day; pays Shells + Memories, sometimes a bait unlock. Combat templates appear only in combat modes. |
| **Records** | personal best per species, per place, per size class; Trophy Wall (40 frames; Elder frames gilded); "New record" on the measuring card |
| **Legend rematches** | after the first landing, each legendary can be hooked again every expedition; each landing raises its weight range +8% (cap × 1.6) and its enrage +5 s: a boss whose record keeps climbing |
| **The Long Descent** | Gloomtide mode, start in the Mossmere, land all four legendaries in one expedition: today's roguelite victory, kept as the prestige challenge (+200 Memories, unique Wick cloak) |

---

## 8. Pacing

### 8.1 Session time budget: a 4-day expedition (≈ 25 min play + ≈ 2 min at the Landing)

| minutes | exploring (sail, walk, places, deeds, lamps) | fishing (cast → land → measure, incl. night fishing) | fighting | menus (Murk, catch cards, Journal, Boons, Landing) | fighting share |
|---|---|---|---|---|---|
| **Still** | 8.5 | 14.5 | 0 | 4.0 | 0% |
| **Lantern** | 8.5 | 12.8 | 2.0 (2 swarm windows, 1 Warden) | 3.7 | ≈ 7% |
| **Gloomtide** | 7.0 | 9.5 | 7.0 (4 full nights) | 3.5 | ≈ 26% |

*Per day (Lantern):* 4 min calm = ≈ 2.2 min exploring + ≈ 1.8 min fishing (4–5 catches, 1–2 places). The 100 s night = ≈ 75 s fishing on still nights, or 45 s fishing + 55 s swarm.

### 8.2 First session, minute by minute (Lantern, The Wick, Mossmere)

| time | beat |
|---|---|
| 0:00 | Set Out (defaults pre-picked; the mode card reads "Lantern: the Gloom stirs some nights"). |
| 0:20 | First cast → first fish → **the measuring moment** (board, class stamp "Keeper", first Journal page). |
| 1–4 | 3–4 species; a Specimen is likely by minute 4 (25% per catch). Murk moors: first request. |
| 4:00 | Last Light: "The big ones come up at dusk." |
| 4:20 | **Night 1 is always still**: Night Rise; Gloam Eel silhouette in the Journal ("answers Lumen Moss"). |
| 6:10 | Dawn. Murk: sell, buy Gut Line I (40, *persistent*). "The Gloom stirs tonight." |
| 10:30 | **First swarm** (55 s): zap and flare tips; a creelsnatch takes a fish; a Gloom-fed cast lands a Large Reedjaw. |
| 13–19 | Day 3: Bell Pool found; Heartmoss (40) → Matriarch attempt (≈ 50%). |
| ≈ 22 | Ride home: Homecoming ≈ 40 Memories, first relic, first mount on the Wall. |

### 8.3 Target numbers

| metric | target |
|---|---|
| expedition length | 3–5 days, 20–32 min (median 25); a one-day outing ≈ 7 min |
| new species per hour | h0–1: 6 · h1–5: 3 · h5–10: 2.2 · h10–18: 1.6 → 40 by ≈ h20 |
| "something new" cadence | every 2–3 min in hour 1; every 4–6 min (species, place, rung, record) through h10 |
| records per session | ≥ 3 personal bests and ≥ 1 new size rung per 25-min session until h15; ≥ 1 Trophy per 2 sessions from h3 |
| Elders | first ≈ h6–9; 10 by ≈ h20 |
| places | 21 found by h12; first mastery by h3 |
| legendaries (first landing) | 0.6–1.2 / 2.5–4 / 5–7 / 10–14 h |
| fight share of play | Still 0% · Lantern 5–10% · Gloomtide 25–30% |
| snuffed rate | Still ≤ 5% · Lantern 10–15% · Gloomtide 25–55% |
| Memories / h | 150–220 (all modes within ± 15%) |
| Shells / h | per §4.2 (Still +10%, Gloomtide −15% from fishing time; Gloom-fed sizes partly offset it) |

---

## 9. Minimum-rework path

**Phase 1: the feel shift (≈ 1–1.5 weeks, mostly data and seams).** Night-mode multipliers in `difficultyFor` plus a `swarmWindow(k)` (Still = zero spawns; the phase stays `gloomtide` internally, so gloom-time species, music and fishing keep working; the UI calls a quiet one a "Stillnight"). Phase lengths. Oil context multipliers. Satiety → Well-fed. Size classes: value and difficulty scaling, a wider model scale range, and the measuring card. Night Rise and Gloom-fed. A Set Out screen with the mode choice. **Lantern becomes the default.**

**Phase 2: persistence (≈ 2 weeks).** Shells and tackle move to meta (`createRun` copies `meta.tackle` into `run.upgrades`, so getStats is untouched). Homecoming and Snuffed summaries. Marked trophies and the Trophy Wall (2D, drawn with `ui-fishart`). Waystones lit by legendaries. Either-path challenges. The persistent Ledger. Retuned relics and Memories.

**Phase 3: content and hooks (in parallel with §24).** Places integration (in progress), Grand Astir and Rumours, legend rematches, the Angler boon pool, gear-gated places, The Long Descent, and a fishing-economy sim with per-mode profiles.

---

## 10. Changes to existing systems

*Effort: S ≤ 2 days · M 3–6 days · L 1–2 weeks (one implementer).*

| change | what | module(s) | effort |
|---|---|---|---|
| **keep** | tension reel model, cast/bite/hook, nibble tells, Clean Cast, perfect-hook streak | fishing-reel, fishing | — |
| **modify** | size class feeds the fight (power × 0.9–1.3, stamina × 0.8–1.8 by class); line **rated kg** (snap at 0.88 above it) | fishing-reel, fishing, data | M |
| **modify** | weight roll → long tail + 5 size classes; size signs; Night Rise; Gloom-fed best-of-2 | fishing, data | S |
| **modify** | fish model length range 0.78–1.22 → 0.6–1.9 (Elder ≈ 2.2) with a weathered Elder ink pass (no mutation); bigger under-water shadow and splash by class | models-fish, fishing-fx | M |
| **new** | the measuring moment: camera close-in, measuring board, class stamp, personal-best banner, Mark-for-Wall | fishing-fx, render (camera mode), ui, audio | M |
| **modify** | day phases 240 / 20 / 100 / 10; Arrival Hush +60 s | data, survival | S |
| **new** | night modes Still / Lantern / Gloomtide: director multipliers, `swarmWindow(k)`, Warden cadence, Lantern forecast | data, combat, survival, ui | M |
| **keep (demoted)** | enemies, weapons, Kindles, formations, Wardens, flare, zap; only Gloomtide and Lantern modes run them | combat-* | — |
| **modify** | Lantern fodder contact drains oil, not Embers; creelsnatch weight × 2; marked trophies theft-proof | combat, progression | S |
| **modify** | Sovereign and Leviathan phases without a swarm (Still): snags replace Grasping Dark | fishing, data | S |
| **new** | Angler boon pool (9 existing + ≈ 6 new); XP from discoveries | data, combat-levels | M |
| **modify** | oil → range model (raft/lamp 0.35, foot 1.0, night 1.0, swarm 1.8); guttering → snuffed in every mode | survival, data | S |
| **modify** | satiety → Well-fed buff, no starvation penalty | survival, data | S |
| **modify** | Embers, flare and Burn buttons hidden in Still | ui-hud | S |
| **modify** | Shells and tackle persistent (`meta.tackle`, `meta.shells`); catalogue ≈ 28k with lake-gated tiers | progression, progression-market, data | M |
| **new** | expedition flow: Set Out, Ride home with Murk, Homecoming tally, Snuffed (creel lost, tally × 0.5) | main, progression, ui-screens | L |
| **new** | Trophy Wall + sell-or-mount (taxidermy fee) | progression, ui-screens, ui-fishart | M |
| **modify** | Journal: 40 species, 5-rung size ladder, places page, lake perks need Specimens | progression, ui-screens | M |
| **modify** | records: per species, place and class; near-miss lines rewritten around fish ("1 kg off a Trophy") | progression, ui | S |
| **modify** | gates: permanent unlock, one-time toll; Waystones lit by legendaries | progression, data | S |
| **cut** | Waystone relics (3); Murk's Old Debt (start purse is meaningless once Shells persist) → replaced by Spyglass and Rumour Shell | data | S |
| **keep (Gloomtide only)** | Kindling Draft for deep Gloomtide starts; linger Heat | combat, progression | — |
| **modify** | relics: fishing/exploration shelf + Gloom shelf; §24 relics; new Measuring Cord, Spyglass, Rumour Shell | data, progression | S |
| **modify** | challenges: Gloom tab, either-path unlocks, fishing tier (+8 goals) | data, progression-challenges | M |
| **modify** | Wick quirks get a fishing/exploration half | data, player, fishing | S |
| **modify** | bounties → persistent **Murk's Ledger** (3 slots, real-date refresh, mode-filtered) | progression, data, ui | M |
| **keep** | §24 places, Waylamps, foot mode, Astir (in progress) | world, player, fishing | — |
| **new** | Grand Astir and Murk's Rumour (real-date seed) | progression, ui | S |
| **new** | legend rematches (+8% weight per landing, cap × 1.6); "the one that got away" | fishing, progression | S |
| **new** | The Long Descent (prestige challenge = today's run victory) | progression, data | S |
| **modify** | Memories formula: discovery-weighted + Homecoming tally × mode | data (`memoriesFor`) | S |
| **modify** | creel base 4 → 6 (daily selling keeps it light; trophies hold slots) | data | S |
| **keep** | Burn-a-fish, Murk's in-lake visits, Shrine, audio engine (+ measuring sting, Stillnight music bed: S) | progression, audio | S |
| **modify** | balance sim: fishing-economy model, per-mode profiles, size-class land rates | tools/balance-sim | M |
