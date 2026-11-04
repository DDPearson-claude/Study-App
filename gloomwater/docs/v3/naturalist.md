# Pivot panel · Lens 3: The Naturalist & the Collection

*GLOOMWATER pivot toward "fishing and a beautiful, interesting environment first; combat is a nice-to-have". This lens makes the fish the stars and the collection the long-term hook. The numbers come from a roster script and a pacing sim (method in §8). Nothing in the repo was edited.*

## 0. Thesis, and where I disagree with the guiding hypotheses

**Thesis.** Every cast should be able to produce one of three feelings: *"I've never seen that"* (a species), *"that's the biggest one I've had"* (a size), or *"so that's how you get it"* (a condition solved). Today the game produces only the first, 32 times, and then stops. I propose **60 species**, a **log-normal size system with named size classes and honest, visible scale**, a **journal that works as a field guide and a treasure map**, and **Old Murk as the collector who wants specific fish**. Together they give over 400 permanent collectibles, and a death never touches them.

I agree with the hypotheses, with four corrections:

1. **Size must be readable *before* the hook, not only at the landing.** "Read the water" should include reading the fish. An **approach shadow** at true length gives the moment "that one is big", and with it a decision: hook it, or **let it pass** and wait for a bigger one. This is the cheapest high-impact change in this proposal.
2. **Sizes must be honest.** Today a hooked fish under 1.6 m is drawn up to 1.45× larger during the fight, and the model scale moves only ±22% across a species' whole weight range. That flattens exactly what we want to show off. Length should follow weight (L ∝ w^⅓, uniform scale), so screen area grows as w^⅔: a Trophy covers about 1.7–2× the area of a typical fish of its species. The camera, not the mesh, should make small fish readable.
3. **The sting should be the trophy you didn't bring home, not the collection.** The journal records species, personal bests and size stamps the moment a fish is measured. The **mount** (the wall, the raft pole) needs the fish to survive in your creel until Old Murk's next visit. If you die with a Trophy in the creel, it sinks with you.
4. **Don't flood the first session.** Sixty species is a lot. The first 30 minutes should name about 8 of them. Later sessions should run on size stamps, morphs, rumours and Murk's commissions, not on the raw species count.

## 1. Roster structure

**60 species = the 32 existing + the 8 place-kept fish from §24 + 20 new.** That is 14–15 per lake plus 2 Wanderers. Each lake follows the same grammar, so players can learn what kind of fish to expect where:

| slot per lake | count | rule | Mossmere example |
|---|---|---|---|
| everyday commons | 3 | any time, no bait; at least one in every depth band | Dusk Minnow, Mossback Perch, Gutter Crayfish |
| night common | 1 | Gloomtide only, shallow, rises toward your light: **night is a fishing opportunity** | Lampsipper |
| uncommons | 3–4 | one of them gated by a condition (dawn, mood, bait or night) | Matins Dace (the dawn rise), Sluice Bream (Drip-rain) |
| rares | 3–6 | ≥ 1 night-only, ≥ 1 bait puzzle, 1–3 **place-kept** | Reedjaw Pike, Gloam Eel, Old Portcullis |
| elusive (new tier) | 1–2 | place + condition (a puzzle you read in the journal); weight 2, ×10 when eligible | Bridgechain Sturgeon, Cupbearer |
| legendary | 1 | legend rule unchanged; **ages** across descents (§2.5) | The Belled Matriarch |
| Wanderers | 2 total | any lake, rare global conditions | Pilgrim Salmon, Hearthfish |

| | C | U | R | E | L | total | place-kept | night-only | condition-gated (mood/dawn/deed/cue) |
|---|---|---|---|---|---|---|---|---|---|
| The Mossmere | 4 | 4 | 3 | 2 | 1 | 14 | 3 | 2 | 4 |
| Sporewood Pools | 4 | 3 | 5 | 1 | 1 | 14 | 3 | 2 | 4 |
| Glasswater Vault | 4 | 3 | 6 | 1 | 1 | 15 | 4 | 2 + Sovereign | 4 |
| The Pallid Deep | 4 | 3 | 6 | 1 | 1 | 15 | 4 | 3 + Leviathan | 4 |
| Wanderers | | | | 2 | | 2 | | 1 | 2 |
| **total** | 16 | 13 | 20 | 7 | 4 | **60** | 14 | 10 (+2 legends) | 18 |

**The Mossmere needs a few raft "waters".** The §24 draft gives it only the Bell Pool. I hang three small raft-reachable places on landmarks that already exist in `ZONES[0].arena`: the **Gatehouse Door** (the flooded doorway of the Drowned Gatehouse at 22, −12, a 1.4 m target disc), **Under the Span** (the break in the Toppled Bridge piers at x −26…−19), and the **Cupped Hands** (a new small prop near Stair Isle: half-sunk stone hands holding a 1 m bowl of rainwater). They use the §24 `targets` rule kit, need no walking, and give run 1 something to puzzle over without touching the difficulty curve.

**Lake moods (condition layer, cheap).** Each calm draws one of three moods for the day. Murk announces it, and the world swaps its particle preset and applies one fishing uniform. The archetypes are shared and the names are per lake:

| archetype | effect | Mossmere | Sporewood | Glasswater | Pallid Deep |
|---|---|---|---|---|---|
| **Still** | size pressure +0.3 (§2.3), wait × 1.2 | Still Water | Hush | Clear | Breathless |
| **Fall** | wait × 0.8, commons × 1.3 | Drip-rain (ceiling drips) | Spore-fall | Shard-chime | Ash-fall |
| **Mist** | rarity +0.08, morphs × 2, gloom species may bite in calm at weight × 0.3 | Low Mist | Bloom-haze | Prism-fog | Pall |

## 2. The size system

### 2.1 Distribution
Each species replaces `weight: [min, max]` with `size: { median, sigma }`:
```
Z  = clamp(N(0,1), −2.2, 3.5)
Z' = min(3.5, Z + S)                    S = size pressure (§2.3), 0 … +1.5
w  = median · e^(σ·Z')                  cap ("said to reach") = median · e^(3.5σ)
L  = Lk(shape) · w^(1/3)                visual length; uniform model scale = L / L(median) × model.scale
```
σ gives each species a personality. **0.22** is tight (crayfish, jellies: cap 2.2× median), **0.30** is standard (cap 2.9×), **0.38–0.45** is a famous monster (Weeping Carp, Reedjaw Pike, the sturgeons: cap 4–4.8×). Legendaries use σ 0.10 plus **ageing** (§2.5).

### 2.2 Size classes (per-species percentiles, so the same words mean the same rarity on every fish)

| class | Z threshold | base share | badge | worked example: Weeping Carp (median 2.8 kg, σ 0.40) |
|---|---|---|---|---|
| **Slip** | < −1.0 | 16% | small grey ink ring; releasing a Slip feeds "let them grow" | < 1.9 kg |
| *(unmarked)* | −1 … 1 | 68% | none | 1.9–4.2 kg |
| **Stout** | ≥ 1.0 | 12% | bronze wax seal | ≥ 4.2 kg |
| **Grand** | ≥ 1.75 | 3.4% | bone seal; unlocks the "said to reach" line in the journal | ≥ 5.6 kg |
| **Trophy** | ≥ 2.5 | 0.52% | gold seal; mountable for Memories; trophy portrait | ≥ 7.6 kg (**Old Ledger record** at Z 2.7: 8.3 kg) |
| **Old One** | ≥ 3.1 | 0.10% | gold seal with a black ribbon; the fish is **given a name** ("Old Rustbarbel", from per-species syllable tables) and logged | ≥ 9.7 kg, cap 11.4 kg |

### 2.3 Size pressure S: the challenge comes from fishing
Trophies at S = 0 are about 1 in 190 catches of a species, too rare to plan for. **S** is how a skilled reader of the water bends the odds. It reuses the existing `weightBias` fields 1:1.

| source | S | notes |
|---|---|---|
| Gloomtide (any species) | +0.25 | "big fish feed in the dark": night fishing pays even with combat off |
| bobber in the bottom third of the species' depth band | +0.15 | the reticle already shows depth |
| bait `weightBias` (Ember Roe +0.35; new **Sinker Leech** +0.5, bite speed −0.3) | +0.35 / +0.5 | |
| place twists already in §24 (Chain Garden +0.6, Breathing Deep +0.5) | +0.5 … 0.6 | |
| Still mood | +0.3 | |
| rare feeding spot | +0.2 | |
| **Let it pass**: the bite window lapses with no tap → bait kept, next cast in the same water | +0.15 per pass, cap +0.45 | trades time for size; resets on the next hook |
| **Still out there**: recast within 90 s where a Grand+ fish escaped | +0.4 | the near miss becomes "one more cast" |
| **Let them grow**: each Slip of that species released this descent | +0.05, cap +0.3 | extends the existing Release/Mercy |
| relic **Knotted Cord** (new) | L1: class label on approach shadows; L2–3: +0.05 each | |

**cap S ≤ 1.5**

| S | Stout+ | Grand+ | Trophy+ | Old One |
|---|---|---|---|---|
| 0 | 15.9% | 4.0% | 0.62% | 0.10% |
| 0.5 (one good choice) | 30.9% | 10.6% | 2.3% | 0.47% |
| 1.0 (place + bait, or night + Still + depth) | 50.0% | 22.7% | 6.7% | 1.8% |
| 1.5 (everything right) | 69.2% | 40.1% | 15.9% | 5.5% |

### 2.4 Size makes the fight harder, and gear decides access
With `r = w / median`, the existing reel model gets `power × r^0.18`, `stamina × r^0.5` and `surgeTime × r^0.15`, plus erratic +0.05 for Trophy+ fish. **Line rating** (shown on every line in the shop) is `5 kg × lineStrength^5`: 5 kg base, 10 / 19 / 32 / 52 kg with Braided Gut I–IV, and 108 / 204 kg with Silverthread. A fish heavier than the rating also gets `power × min(1.6, √(w / rating))`, and the line *sings* (a thin whine and a frayed-line shimmer). Legendaries are exempt; they keep their hand-tuned boss numbers.
*Example:* a Trophy Reedjaw Pike (12.2 kg) on base line has power × 1.20 × 1.56 ≈ **1.9×** and stamina × 1.65. That is a wall. On Braided Gut II (19 kg) it is a hard but fair fight. Trophies need **place + conditions + gear + skill**, which is the challenge from request 1, moved into the fishing.

**Two new fight styles** (fishing-reel.js) so that big fish feel different, not only longer:
- **runner** (sturgeons, Pilgrim Salmon): every 9–14 s a 2.5–4 s run (0.8 s hiss and spool-spin tell). The sweet band rises to about 0.65. Holding spikes tension at 1.6× surge rate; releasing loses P at 0.06/s. The skill is **feathering**: short pulses of holding that ride the band.
- **snagger** (Old Portcullis): its surges head for cover, and a snag meter fills unless T ≥ 0.6. You must **hold through** these surges, the opposite of every other fish (a brown ◆ "turn it" tell). A full meter means snagged: release to slack within 2 s or the line parts.

### 2.5 Records
- **Your best** (per species, all-time), **this descent's best** and **Heaviest in the lake** (any species).
- **Old Ledger record**: a figure in Murk's ledger "since before the Fall", at Z 2.7 (inside Trophy). Breaking it rings Murk's bell across the lake even if he isn't moored, and he writes your Wick's name over the old one.
- **Said to reach**: the cap. It is shown as a dotted silhouette once you land a Grand of that species, so players know the ceiling exists.
- **The one that got away**: the biggest escape per species, shown with an estimate ("It looked Grand. Six kilos, maybe more.").
- **Legend ages**: each legendary is one individual and it remembers you. Every later landing is 6% heavier (cap +36%), and her page keeps a growth line ("Descent 3: 18.6 kg · Descent 9: 23.9 kg"). It is melancholy and cheap, and it gives old bosses a reason to be fought again.

## 3. Seeing size in 3D

| moment | what changes | budget |
|---|---|---|
| **Approach** (new) | 1.2–1.8 s before the first nibble, a fish-shaped shadow at **true length** fades in 2–3 m out and circles the bobber (reuses `fishing-fx.setShadow(len, rim)`). Grand+ shadows push a faint V-wake. Rare feeding spots sometimes show one big dorsal breaking the surface. | 0 new draw calls |
| **Fight** | Remove the 1.45× mid-fight boost. The camera's `fish` framing distance becomes `clamp(2.2 + 2·L, 3, 12)` m, so a Votive Fry is framed tight and a Candlewake Sturgeon pulls the camera back. Splash radius ∝ L, droplet count ∝ L^1.5 (capped). | existing particles |
| **Breach** (new) | Every Grand+ fish breaches once near P 0.5: 0.25 s at time-scale 0.35, a rim-light flash, and a rising "thump" pitched by size. | 1 timescale tween |
| **The Measure** (landing, 2.2 s, tap to skip after 0.6 s) | Four poses chosen by length. **Palm** (< 0.3 m): the Wick cups it, close-up. **Arms** (0.3–1.05 m): held up to the camera (exists). **Steelyard** (1.05–2.2 m): hung from a bone steelyard on the lantern pole while the counterweight slides (extends the existing "hang from rod tip"). **Alongside** (> 2.2 m, all legendaries): the fish rolls beside the raft and the Wick walks its length with a knotted cord while the camera cranes up. Length ticks up, then weight, then the class seal stamps in ink. | actors poses + 1 steelyard mesh |
| **Portrait** (Trophy+, 2.5 s, skippable) | Low-angle orbit, background dimmed 40%, a strong rim light. The pose seed is saved and the journal plate redraws it. | grade uniform only |
| **Everywhere** | Journal sketches show a small Wick silhouette at true relative scale beside the fish: a Cupbearer next to a towering Wick, the Leviathan dwarfing it. | canvas |

**Age marks** make size readable even on a phone. Each species has one detail that grows with its class: the Mossback's moss tuft (Grand+ wear one pale bloom), the Weeping Carp's barbels (ribbons on a Trophy), the Shardspine crest, the Capshell's mushroom hat, the buttons on the Gutter Crayfish, the crown fragment on a Bonecrook. All are drawn from parameters in `models-fish.js` and `ui-fishart.js`, with no new assets.

## 4. The Journal: field guide and treasure map

Each species page holds:
1. **Plate**: the procedural sketch, with a morph toggle and the Wick for scale.
2. **Name, epithet, lore line.**
3. **Field notes**: six facts (depth band, time, mood, place, bait, fight style). Each stays greyed out until you land the species under that condition, or a rumour reveals it, so the page fills in with the player's own observations.
4. **Size chart**: a horizontal log scale from Slip to the cap with class bands in ink wash, dots for your last 12 catches, a gold tick for your best, a rust tick for the Old Ledger record and a dotted silhouette for "said to reach".
5. **Seals row**: Stout · Grand · Trophy · Old One · Morph (five wax seals, 5 × 56 = 280 to collect).
6. **Rumours** (unknown species), in three tiers. **Tier 1** is free and vague ("A fish that keeps no reflection."). **Tier 2** names the place ("…in the chapel pool, west of the hub."). It comes from discovering that place, a related catch, or buying it from Murk for 10–40 Shells. **Tier 3** gives the condition ("…cast where its reflection swims."). It comes from a commission or a Tier-2 hint plus one visit. Rumours are what send players walking to the §24 places.
7. **The one that got away**, Old Ones by name, and the legend's growth line.

**Rewards** (Memories, banked at run end as now): new species +3 · Grand seal +2 · Trophy +5 · Old One +12 · morph +4 · whole lake → the existing `JOURNAL_PERKS` · a **Grand Folio** (a Grand of every non-legendary species in a lake) → +30 and a rod charm · all 60 → *The Complete Chronicle*. About 1,500 Memories come from collection, so meta income no longer depends on Gloomlings dispersed.

## 5. The Mounting Wall
A wall of 60 carved frames in the Shrine of Drowned Lanterns. Each frame shows your best **mounted** fish of that species as a ui-fishart plate drawn at a size ∝ log(length), with a brass plaque: "Weeping Carp · 8.4 kg · 92 cm · Trophy · Descent 14, day 3 · Taper". Grand+ fish can be **mounted** from the catch card ("Keep for the Wall"). The fish holds a creel slot until Murk's next visit; mounting is free, but you give up its sale (Grand fish sell for ×1.25, Trophies ×1.6 and Old Ones ×2.5 on top of size value). First mount per class per species: Grand +2, Trophy +6, Old One +15 Memories. Your three heaviest mounts hang from the raft's lantern pole, using the existing flat trophy silhouettes scaled and tinted by class, so the cost is 0 extra draw calls. The 2D wall costs nothing in the 3D budget.

## 6. Old Murk wants fish

**The Ledger (per descent).** Bounties shift from about 40% combat to about 85% naturalist. The combat templates stay, and appear only when combat is on.

| new template | text | base Shells |
|---|---|---|
| `catch_class` | "Bring me a Stout {species}." / "…a Grand {species}." | 30 / 60 |
| `any_grand` | "Anything Grand. I'm not fussy. I'm a little fussy." | 45 |
| `variety` | "Three kinds I haven't bought today." | 35 |
| `mood_catch` | "Something that only rises in {mood}." | 40 |
| `release_slip` | "Let a little one go. Tell me what it was." (+0.1 S for the rest of the day) | 15 |
| `ledger_beat` | "My ledger says {kg} for a {species}. My ledger is old." | 80 |

**Commissions (persistent across runs).** Murk has an "old customer list": 36 authored commissions in 4 tiers, with 3 open at a time. They survive death, so they are long-term goals, and they take over most of the unlock duty that combat challenges hold today.

| commission | reward |
|---|---|
| "A Stout Weeping Carp. For the soup, and the memory." | Tier-2 rumour: Bridgechain Sturgeon · 10 Memories |
| "Something that only rises at dawn." | relic **Knotted Cord** |
| "The thumb-fish that lives in the stone hands." | 15 Memories · raft charm (a bowl-lantern) |
| "A Grand anything from the Pools." | bait **Sinker Leech** |
| "A Pilgrim Salmon from two lakes in one descent." | 25 Memories · Waystone discount |
| "Any fish in Soot. Black as my old hat." | morph chance × 1.5 relic (*Smoked Glass Eye*) |
| "A Trophy from deep water, any lake." | Wick unlock (replaces one combat unlock) |
| "An Old One. Any. I'd like to see one before I go." | 40 Memories · Murk's own rod as a cosmetic |

## 7. "One more cast" rarity design

| hook | rule | why it works |
|---|---|---|
| approach shadow | true size visible before the bite | anticipation, and a decision every cast |
| let it pass / still out there | S +0.15 per pass; +0.4 for 90 s after a Grand+ escape | near misses turn into the next cast |
| new-species pity | an unseen eligible species gets weight × (1 + 0.15·k), cap × 4, k = casts it could have bitten | keeps the discovery rate up without guarantees |
| record statistics | catch *n* of a species beats your best with p ≈ 1/n; with 60 species there is always a fresh one | frequent small wins early, rarer and sweeter later |
| daily freshness | today's mood + the §24 Astir place + Murk's Ledger = a new "best water" each day | a reason to fish differently on day 2 |
| visible ceilings | the dotted "said to reach" silhouette and the Old Ledger figure | a concrete target you can see on the page |
| morph flicker | 1 in 120 base, × 2 in Mist; a morph shows as a differently coloured approach shadow | the jackpot, rare enough to stay special |

## 8. Discovery pacing (simulated)

*Method:* a Monte Carlo of 1,000 players × 20 sessions of 30 fishing minutes, run on the roster below. Assumptions: 1.3 landed fish per minute after 15–35% escapes (bigger and rarer fish escape more); 28% of casts at night; a moods/places/bait availability model; a "set up for size" share that grows from 12% to 45% as a lake becomes familiar; the lake mix follows typical descents (session 1 the Mossmere only; Sporewood from session 2, Glasswater from session 4, the Pallid Deep from session 6). "Notable" = new species, a best beaten by ≥ 3%, a new size seal or a morph. "Headline" = new species, Grand+ seal, Old Ledger record or morph.

| session | new species | bests beaten | Grand / Trophy / Old One seals | morphs | notable every | headline every | sessions with no headline |
|---|---|---|---|---|---|---|---|
| 1 | 8.3 | 6.4 | 1.8 / 0.37 / 0.10 | 0.34 | **2.0 min** | **3.1 min** | 0% |
| 2 | 6.2 | 5.2 | 1.6 / 0.45 / 0.09 | 0.36 | 2.6 | 3.8 | 0% |
| 4 (Glasswater opens) | 6.8 | 4.4 | 1.6 / 0.43 / 0.09 | 0.31 | 2.6 | 3.6 | 0% |
| 6 (the Deep opens) | 5.7 | 4.2 | 1.5 / 0.44 / 0.09 | 0.30 | 3.0 | 4.2 | 0% |
| 10 | 1.9 | 3.8 | 1.3 / 0.43 / 0.11 | 0.34 | 5.0 | 8.5 | 2% |
| 15 | 0.7 | 2.5 | 0.9 / 0.41 / 0.09 | 0.31 | 8.4 | 14.3 | 12% |
| 20 | 0.4 | 2.1 | 0.7 / 0.48 / 0.15 | 0.28 | 10.7 | 17.9 | 19% |

**Reading it.** Early play meets the target: something notable every 2–3 minutes and a headline every 3–4. Late *random* play thins to one headline every 15–18 minutes, and about 1 session in 5 has none. That is the job of **targeted play**: commissions, Tier-3 rumours, Old Ledger records and Trophy hunts with S ≈ 1.0 (a Trophy every ~15 catches of the target species). Each one is a 10–20 minute goal, so a deliberate session still gets one or two headlines. Trophies stay at about 0.45 per session and Old Ones at about 0.1, which makes them true events. The tuning knobs are the morph rate, the class Z thresholds and the experienced set-up share.

## 9. Morphs (all off-green)
One authored morph per non-legendary species (56 in all). It is a palette swap on the cached geometry, keyed by species + morph, so it costs nothing at runtime. Value × 3, +4 Memories, its own plate in the journal.

| morph | look | body / accent |
|---|---|---|
| **Bone** | leucistic, pale ink outline | #e9e2cf / #f6f2e6 |
| **Soot** | melanistic, with an ember-red rim | #14121a / #c4553a |
| **Ember** | rust and amber | #7a3a24 / #e0874a |
| **Dusk** | violet with a pale belly | #3a2a5a / #a58ad8 |
| **Gilt** | tarnished gold | #8a6a2a / #e8c66a |
| **Frost** | moonlit silver-blue | #8fa4c8 / #e6eeff |

**Palette note.** The current Mossmere fish (Mossback 0x4f6b4a, Reedjaw 0x3e5a4c, the Gloam Eel's mint glow 0x6ff5c8) are green-dominant. In this roster they move to slate, pewter, rust and ivory, and the Gloam Eel glows pale moon-violet. Green survives only as a moss tuft or a lichen fleck, a rare accent. The four lakes' fish stay distinct: Mossmere slate and rust; Sporewood plum, amber and rose; Glasswater indigo, ice and violet; the Pallid Deep bone, ink and gold.

## 10. Full species roster (60)

✦ = new (20) · ◆ = place-kept from the §24 draft (8) · unmarked = existing (32). Typical = median weight; record = the cap (legendaries: fully aged). Lengths come from L = k·w^⅓ per body type. The morph is shown in italics.

| # | species | lake · place | rarity | typical → record (kg · cm) | fight | condition | signature visual trait · *morph* |
|---|---|---|---|---|---|---|---|
| 1 | **Dusk Minnow** | Mossmere | common | 0.11 kg → 0.31 kg · 21 → 30 (σ 0.3) | darter | any time, shallows | pewter schools flecked rust like thrown pennies · *Gilt* |
| 2 | **Mossback Perch** | Mossmere | common | 0.65 kg → 2 kg · 38 → 55 (σ 0.32) | steady | any time, all depths | slate perch; a moss tuft on its back that grows with size (Grand+ wear one pale bloom) · *Soot* |
| 3 | **Gutter Crayfish** | Mossmere | common | 0.22 kg → 0.48 kg · 18 → 23 (σ 0.22) | sinker | any time, shallows | drowned buttons on the carapace, one more per size class · *Ember* |
| 4 | **Lampsipper** ✦ | Mossmere | common | 0.18 kg → 0.48 kg · 25 → 34 (σ 0.28) | darter | Gloomtide only, shallows, rises to your light | upturned mouth, two pale moth-wing eye-spots · *Dusk* |
| 5 | **Matins Dace** ✦ | Mossmere | uncommon | 0.35 kg → 0.93 kg · 31 → 43 (σ 0.28) | darter | the dawn rise (dawn + first 25 s of calm) | slate-silver, one rust pennant fin; rises in rings of dimples · *Frost* |
| 6 | **Weeping Carp** | Mossmere | uncommon | 2.8 kg → 11 kg · 62 → 99 (σ 0.4) | sinker | any time, mid–deep | tear-streaks under the eyes; barbels lengthen with age into ribbons · *Bone* |
| 7 | **Candlefin Koi** | Mossmere | uncommon | 1.5 kg → 4.3 kg · 50 → 71 (σ 0.3) | darter | calm only | ivory koi, fin edges lit with heatless flame · *Soot* |
| 8 | **Sluice Bream** ✦ | Mossmere · Moss Sluice water | uncommon | 1.1 kg → 3.1 kg · 45 → 64 (σ 0.3) | sinker | Drip-rain mood (any water; ×3 at the Sluice) | slab-flat slate body, rust-rimmed scales; turns broadside like a shield · *Gilt* |
| 9 | **Reedjaw Pike** | Mossmere | rare | 4.5 kg → 18 kg · 102 → 163 (σ 0.4) | thrasher | any time, deep | reed-barred flanks; old ones carry pale scars · *Frost* |
| 10 | **Gloam Eel** | Mossmere | rare | 2 kg → 5.7 kg · 78 → 111 (σ 0.3) | leaper | Gloomtide, deep, Lumen Moss | ink eel with pale-violet photophores (was teal) · *Bone* |
| 11 | **Old Portcullis** ✦ | Mossmere · Drowned Gatehouse | rare | 3.5 kg → 13 kg · 67 → 104 (σ 0.38) | snagger | cast through the flooded doorway | catfish whose barbels hang like a broken portcullis; iron-rust mottle · *Soot* |
| 12 | **Bridgechain Sturgeon** ✦ | Mossmere · Toppled Bridge | elusive | 6 kg → 24 kg · 91 → 145 (σ 0.4) | runner | Still Water mood, under the broken span | rust scutes in a line like chain links, shovel snout · *Bone* |
| 13 | **Cupbearer** ✦ | Mossmere · Cupped Hands | elusive | 60 g → 0.14 kg · 17 → 23 (σ 0.25) | darter | Drip-rain mood fills the stone bowl; a 1 m precision cast | thumb-sized, violet-gold veil fins; measured in millimetres · *Gilt* |
| 14 | **The Belled Matriarch** | Mossmere · Bell Pool | legendary | 19 kg → 32 kg · 117 → 139 | steady (boss) | legend rule (calm, Heartmoss) | a temple bell grown into her skull; tarnished-bronze scales · *—* |
| 15 | **Pollen Shiner** ✦ | Sporewood | common | 90 g → 0.24 kg · 20 → 27 (σ 0.28) | darter | any time, shallows | amber-dusted minnow that trails pollen when hooked · *Dusk* |
| 16 | **Sporebelly Puffer** | Sporewood | common | 0.45 kg → 1.1 kg · 23 → 31 (σ 0.25) | thrasher | any time, shallows | sighs spores when frightened; Grand+ puff to a perfect sphere · *Bone* |
| 17 | **Plumgill Perch** | Sporewood | common | 0.9 kg → 2.6 kg · 42 → 60 (σ 0.3) | steady | any time, all depths | bruise-plum gills · *Gilt* |
| 18 | **Capshell Crayfish** | Sporewood | common | 0.42 kg → 0.91 kg · 22 → 29 (σ 0.22) | sinker | any time, shallows | wears a mushroom hat that grows with it · *Soot* |
| 19 | **Velvet Ray** | Sporewood | uncommon | 3.6 kg → 11 kg · 58 → 85 (σ 0.32) | leaper | any time, mid–deep | plum velvet wings with pale eye-rings · *Frost* |
| 20 | **Threadling Eel** | Sporewood | uncommon | 1.1 kg → 2.9 kg · 64 → 89 (σ 0.28) | darter | Spore Cake | blind, root-like, stitched bands · *Ember* |
| 21 | **Nightbloom Carp** ✦ | Sporewood | uncommon | 3.2 kg → 13 kg · 65 → 103 (σ 0.4) | sinker | Gloomtide only | plum carp whose scales open like amber spore-lamps at night · *Gilt* |
| 22 | **Stalkshadow Pike** ✦ | Sporewood · Stalk Groves | rare | 4 kg → 15 kg · 98 → 153 (σ 0.38) | thrasher | Spore-fall mood, near stalks | barred like mushroom stems; hangs head-up among them · *Bone* |
| 23 | **Mildew Angler** | Sporewood | rare | 5.5 kg → 17 kg · 78 → 113 (σ 0.32) | sinker | Gloomtide, deep | its lure is one soft lit mushroom · *Dusk* |
| 24 | **Sleepspore Jelly** | Sporewood | rare | 0.75 kg → 1.6 kg · 24 → 31 (σ 0.22) | darter | calm, Lumen Moss | pink-white bell with a sleeping fry inside · *Soot* |
| 25 | **Harpstring Eel** ◆ | Sporewood · Gill Harp | rare | 1.2 kg → 3.2 kg · 66 → 91 (σ 0.28) | darter | while the Harp sings | rose-striped; fins hum like plucked strings on the line · *Frost* |
| 26 | **Hushcap Koi** ◆ | Sporewood · Spore Shrine | rare | 1.9 kg → 5.4 kg · 54 → 77 (σ 0.3) | darter | calm, all three shrine lanterns lit | dusk-dark koi lit only in the dark the shrine keeps · *Bone* |
| 27 | **The Remembered Sun** ✦ | Sporewood · Drowned Greenhouse | elusive | 1.4 kg → 4 kg · 49 → 70 (σ 0.3) | leaper | a Clean Cast on the Lit Row centre line | the one warm fish in the Pools: a pale-gold sun-disc on its flank · *Dusk* |
| 28 | **The Drifting Grove** | Sporewood · Grove Well | legendary | 30 kg → 50 kg · 137 → 162 | leaper (boss) | legend rule (calm, Glowcap Bulb) | a meadow on her back that blooms when she dives · *—* |
| 29 | **Prism Minnow** | Glasswater | common | 0.12 kg → 0.32 kg · 22 → 30 (σ 0.28) | darter | any time, shallows | schools flash ice-blue all at once · *Gilt* |
| 30 | **Votive Fry** ✦ | Glasswater · Font Ring | common | 50 g → 0.12 kg · 16 → 22 (σ 0.25) | darter | any time, shallows (×3 in the Font Ring) | wax-pale with one amber dot like a votive flame · *Soot* |
| 31 | **Glassgill Perch** | Glasswater | common | 1 kg → 2.9 kg · 44 → 62 (σ 0.3) | steady | any time, all depths | a heart visible through its side, beating slower when watched · *Ember* |
| 32 | **Glassblown Puffer** | Glasswater | common | 0.6 kg → 1.4 kg · 25 → 34 (σ 0.25) | thrasher | any time, shallows | rings like a wineglass when it puffs · *Bone* |
| 33 | **Chime Jelly** | Glasswater | uncommon | 0.95 kg → 2.1 kg · 26 → 33 (σ 0.22) | darter | calm, Glass Larvae | chimes when it brushes crystal · *Gilt* |
| 34 | **Pane Ray** ✦ | Glasswater · Burning Glass | uncommon | 3 kg → 9.2 kg · 55 → 80 (σ 0.32) | leaper | any time, mid–deep (×3 under the Burning Glass) | wings clear as window glass; the ink skeleton shows through · *Soot* |
| 35 | **Mirror Pike** | Glasswater | uncommon | 5.2 kg → 20 kg · 107 → 167 (σ 0.38) | darter | any time, deep | mirror flank that shows a tired little candle · *Ember* |
| 36 | **Shardspine Eel** | Glasswater | rare | 3.3 kg → 9.4 kg · 92 → 131 (σ 0.3) | thrasher | Gloomtide, deep | crystal frost along the spine; the crest grows with size · *Dusk* |
| 37 | **Vesper Gar** ✦ | Glasswater · Broken Hymnal | rare | 2.6 kg → 8.9 kg · 85 → 128 (σ 0.35) | darter | Gloomtide (×3 at the Broken Hymnal) | needle jaw; violet glass fins ring on every surge · *Frost* |
| 38 | **The Blind Scrivener** | Glasswater | rare | 6.6 kg → 20 kg · 83 → 120 (σ 0.32) | sinker | Ember Roe, deepest water | eyeless, one violet lure · *Bone* |
| 39 | **The Unreflected** ◆ | Glasswater · Mirror Pool | rare | 2 kg → 5.7 kg · 55 → 79 (σ 0.3) | darter | a reflection hit | ice-pale, blind; casts no reflection · *Soot* |
| 40 | **The Footnote** ◆ | Glasswater · Well of Ledgers | rare | 3.3 kg → 9.4 kg · 66 → 93 (σ 0.3) | sinker | Clean Cast to the bottom ledger | tiny script-like marks along the flank · *Gilt* |
| 41 | **Rainglass Darter** ◆ | Glasswater · Stilled Cascade | rare | 0.6 kg → 1.4 kg · 37 → 50 (σ 0.25) | darter | calm | raindrop spots that catch the light · *Dusk* |
| 42 | **The Sexton** ✦ | Glasswater · Bell-Chapel Window | elusive | 5 kg → 17 kg · 75 → 113 (σ 0.35) | thrasher | during the Struck Hour (after the bell rope) | deep indigo; a pale bell-shaped patch on each flank; a muffled toll each surge · *Ember* |
| 43 | **The Glass Sovereign** | Glasswater · Fallen Chandelier | legendary | 27 kg → 45 kg · 132 → 156 | leaper (boss) | legend rule (Gloomtide, Prism Moth) | each scale a window with no one behind it · *—* |
| 44 | **Ossuary Fry** | Pallid Deep | common | 0.12 kg → 0.32 kg · 22 → 30 (σ 0.28) | darter | any time, shallows | bone-pale and blind · *Gilt* |
| 45 | **Ashfall Smelt** ✦ | Pallid Deep | common | 0.2 kg → 0.53 kg · 26 → 36 (σ 0.28) | darter | any time, mid (×2 in Ash-fall mood) | grey and translucent, flecked with ash; smells of cold candles · *Ember* |
| 46 | **Pallid Wraithfin** | Pallid Deep | common | 0.95 kg → 2.7 kg · 43 → 61 (σ 0.3) | steady | any time, all depths | ghost-ribbon fins · *Soot* |
| 47 | **Bonecrook Crayfish** | Pallid Deep | common | 0.6 kg → 1.3 kg · 25 → 33 (σ 0.22) | sinker | any time, shallows | a shell of fallen things; Trophy+ wear a crown fragment · *Gilt* |
| 48 | **Hearthstone Sole** ✦ | Pallid Deep · Almshouse Cookpot | uncommon | 1.6 kg → 4.9 kg · 44 → 65 (σ 0.32) | sinker | any time, shallow–mid (×3 in the Cookpot hole) | flat as a cold hearthstone, both eyes on top, soot rings · *Ember* |
| 49 | **Gilt-Eyed Eel** | Pallid Deep | uncommon | 3.6 kg → 11 kg · 95 → 138 (σ 0.32) | thrasher | any time, deep | two gold coins for eyes · *Bone* |
| 50 | **Shroud Ray** | Pallid Deep | uncommon | 6.6 kg → 20 kg · 71 → 104 (σ 0.32) | leaper | any time, deep | burial-cloth wings · *Soot* |
| 51 | **Funeral Veil** | Pallid Deep | rare | 1.5 kg → 3.2 kg · 30 → 38 (σ 0.22) | darter | Gloomtide, mid | widow-veil threads · *Dusk* |
| 52 | **Lampwarden Angler** | Pallid Deep | rare | 9.5 kg → 29 kg · 93 → 135 (σ 0.32) | sinker | Gloomtide, Ember Roe | the last lamp hangs from its jaw · *Bone* |
| 53 | **Candlewake Sturgeon** ✦ | Pallid Deep · Chain Garden | rare | 14 kg → 68 kg · 121 → 204 (σ 0.45) | runner | Gloomtide, deep (×3 in the Chain Garden) | a row of bone scutes like unlit candles · *Gilt* |
| 54 | **The Clapper** ◆ | Pallid Deep · Sunken Belfry | rare | 5.1 kg → 17 kg · 76 → 114 (σ 0.35) | thrasher | toll cue (hook by ear) | bell-bronze carp; the bell rings when it turns · *Soot* |
| 55 | **The Wax-Bearer** ◆ | Pallid Deep · Bier Barge | rare | 3.3 kg → 9.4 kg · 66 → 93 (σ 0.3) | leaper | hold open (an offering) | a drop of candle-wax on its brow · *Dusk* |
| 56 | **The Unpaid Fare** ◆ | Pallid Deep · Empty Ferry Slip | rare | 6.6 kg → 20 kg · 83 → 120 (σ 0.32) | sinker | first cast at dusk | coin-eyed, dark ghost-ribbon body · *Gilt* |
| 57 | **The Namesake** ✦ | Pallid Deep · Long Pier of Names | elusive | 2.4 kg → 6.9 kg · 59 → 84 (σ 0.3) | steady | after relighting 3 candle-rafts in a day | bone-white with gold calligraphic marks; each catch is logged under a name from the pier · *Soot* |
| 58 | **The Pale Leviathan** | Pallid Deep · The Well | legendary | 190 kg → 316 kg · 253 → 300 | sinker (boss) | legend rule (Gloomtide, Drowned Marrow) | older than the kingdom; an ember in its belly · *—* |
| 59 | **Pilgrim Salmon** ✦ | Wanderer · each lake's gate water | elusive | 2.5 kg → 7.1 kg · 68 → 96 (σ 0.3) | runner | dawn/first 30 s of calm at the gate, once per lake per descent (Murk: "the pilgrims are running") | rust hooked jaw, frayed fins; grows each lake down (2.5 / 4 / 6 / 9 kg median) · *Bone* |
| 60 | **Hearthfish** ✦ | Wanderer · any lake | elusive | 0.5 kg → 1.4 kg · 35 → 50 (σ 0.3) | leaper | Gloomtide, cast inside your own light with oil ≥ 75% | a coal-glow in its belly that brightens near your lantern · *Gilt* |

**Shapes.** Two new body shapes keep the new fish distinct: `sturgeon` (scutes and a shovel snout, derived from the leviathan profile; for Bridgechain and Candlewake) and `flat` (both eyes on top, lies flat; for Hearthstone Sole). Pilgrim Salmon uses `pike` with a new `hookjaw` flag; Old Portcullis uses `carp` with long barbels; Vesper Gar uses `pike` with a needle snout. One new skin pattern, `marks` (procedural glyphs), serves The Footnote and The Namesake.

**Fit with the other panel lenses.** The roster assumes §24's places and adds three small raft waters in the Mossmere. Night-only fish (10, plus 2 legendaries) and the S +0.25 at night give a combat-off night a reason to exist. Lake moods are the only new world-state system, and they are deliberately one uniform plus one particle preset. If the explorer lens proposes a richer weather or tide system, the three mood archetypes map onto it 1:1.

## 11. Changes to existing systems

| item | keep / modify / cut / new | module | effort |
|---|---|---|---|
| Tension reel model, hook window, nibbles, legend rule and boss phases | keep | fishing-reel.js, fishing.js | — |
| Quality tiers (Fine / Shimmering) as a fight-skill value multiplier | keep | progression.js | — |
| SPECIES 32 → 60 (20 new, 8 from §24); `rarity: 'elusive'` (reuses `RARITY_COLORS.epic`); `size {median, sigma}` replaces `weight [min,max]` | modify / new | data.js | M |
| Log-normal weight roll with size pressure S (reuses `weightBias`); class thresholds; cap | modify | fishing.js (`rollWeight`), data.js | S |
| Value from size: `(w/median)^0.6` × class bonus (Grand 1.25, Trophy 1.6, Old One 2.5), replacing `sizeK [0.75, 1.25]` | modify | progression.js (`makeFish`), data.js | S |
| Fight scaling by size + line rating (`5 kg × LS^5`) shown in the shop | new | fishing.js, fishing-reel.js, ui-screens.js | M |
| New behaviours `runner`, `snagger` (+ HUD tells) | new | fishing-reel.js, ui-hud.js | M |
| Honest scale: model length ∝ w^⅓; **cut** the 1.45× mid-fight boost; camera fish framing by length | modify / cut | models-fish.js, fishing.js, render.js | S |
| Approach shadow at true length; V-wake for Grand+ | new | fishing.js, fishing-fx.js | S |
| Breach + slow-mo for Grand+ | new | fishing.js, fishing-fx.js, core.js (timescale) | S |
| The Measure: palm / arms / steelyard / alongside poses, ticking numbers, ink seal | modify | actors.js, actors-wick.js, actors-raft.js, ui.js | M |
| Trophy portrait shot | new | render.js (camera), render-grade.js | S |
| Age marks (size-driven details) for ~20 species | new | models-fish.js, ui-fishart.js | M |
| Shapes `sturgeon`, `flat`; flags `hookjaw`, needle snout; pattern `marks` | new | models-fish.js, ui-fishart.js | M |
| Morphs (6 palettes, 56 species) | new | data.js, models-fish.js, ui-fishart.js | S |
| Mossmere fish palette off-green; Gloam Eel glow to moon-violet | modify | data.js (SPECIES.model) | S |
| Journal page: plate with Wick scale, field notes, size chart, seals row, got-away, legend growth line | modify | ui-screens.js, ui-fishart.js | M |
| Rumours (3 tiers) + Murk selling Tier 2 | new | data.js (TEXT), progression.js, progression-market.js | S |
| Records: best, descent best, heaviest per lake, Old Ledger record, said-to-reach, Old One names, legend ages | modify | progression.js, data.js | S |
| Mounting Wall in the Shrine; "Keep for the Wall" on the catch card; `meta.mounts` | new | ui-screens.js, progression.js | M |
| Raft pole trophies sized and tinted by class | modify | actors-raft.js | S |
| Journal Memories (seals, morphs, Grand Folio); `JOURNAL_PERKS` need the whole 14–15 | modify | data.js (BALANCE.journal / memories) | S |
| Bounty templates → ~85% naturalist; combat templates only when combat is on | modify | data.js (BOUNTIES), progression.js | S |
| Murk's Commissions (36, persistent, 3 open) | new | data.js, progression.js, ui-screens.js | M |
| Lake moods (3 archetypes × 4 lakes) | new | data.js (ZONES), world-fx.js, fishing.js, audio | M |
| Mossmere raft waters: Gatehouse Door, Under the Span, Cupped Hands (+ one small prop) | new | data.js (arena places), world-art.js | S |
| New-species pity; let it pass; still out there; let them grow | new | fishing.js, progression.js | S |
| Bait **Sinker Leech**; relic **Knotted Cord**; relic *Smoked Glass Eye* | new | data.js | S |
| Challenges: *Heavyweight* (8 kg) → "Land a Trophy"; add *First Grand*, *Old Ledger*, *Five Seals*, *Folio* (with the progression lens) | modify | data.js (CHALLENGES), progression-challenges.js | S |
| Hard bait-locks on Threadling Eel / Chime Jelly → `attract × 4` (keep the Scrivener, Lampwarden and Gloam Eel locks as puzzles) | modify | data.js | S |
| `tools/validate-data.mjs`: every lake × mood has a no-bait calm species; every place-kept fish has a rumour; σ within 0.2–0.5 | modify | tools/ | S |
