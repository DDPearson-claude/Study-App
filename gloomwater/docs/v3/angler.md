# The Angler's Craft: making the catch the challenge

*Panel lens 1 of 4, the angler's craft. Inputs: DESIGN §5, `src/fishing-reel.js`, `src/fishing.js`, `src/models-fish.js`, `src/data.js` (SPECIES, BAITS, UPGRADES, BALANCE.reel/cast/bite/economy), the §24 walking draft, `tools/sim/reel.mjs`. Every land rate quoted below comes from `tools/out/pivot/angler-sim.mjs`, a copy of the project's reel bot (`tools/sim/reel.mjs`) extended with the proposed size scaling, drag, rod shock, light hook and net check. Raw output: `angler-sim-lakes.txt` and `angler-sim-headline.txt` in the same folder. To rerun it: `node tools/out/pivot/angler-sim.mjs --pexp 1.6 --epz 0.08 [--headline]`.*

## 0. Thesis

1. **Most catches stay calm. Big fish are where it gets hard.** Small and Keeper fish keep landing about 97% of the time, so exploring and fishing feels relaxing. A fish's size class is the difficulty dial: every Prize, Trophy and Elder is a step up in skill, gear and setup. The player always knows which step they are on, because size shows before the hook, during the fight and at the measuring board.
2. **A big fish needs four things: the place, the conditions, the presentation and the gear.** The place and conditions decide whether a giant is there at all. Your presentation decides whether it bites. Gear decides whether you can hold it once it does. Skill then decides whether you land it.
3. **The reel stays as it is and gets more inputs.** The tension, sweet-band and surge model in `fishing-reel.js` is good and readable on touch. I add size scaling, drag, four fight styles, snags, a hook-hold pip track and a net moment, as new surge kinds and modifiers. Nothing about the model's core changes.

Where I push back on the panel's starting assumptions:
- **Cut the feeding-spot mote columns.** They turn "reading the water" into "sail to the glowing pillar" (see the current screenshots). Replace them with readable signs (§3).
- **Tackle must be permanent.** Per-run gear means every run starts again with a twig rod, so hunting trophies in the Pallid Deep depends on that run's Shell income. A trophy collection needs a stable kit. Consumables stay per run.
- **Don't make every catch hard.** Request 1's challenge should sit on big fish. If commons fail 20% of the time, exploring becomes a chore.

---

## 1. Diagnosis: today the reel is not a challenge

`node tools/balance-sim.mjs --reel` with on-curve gear:

| | commons | uncommons | rares | legendaries |
|---|---|---|---|---|
| average player land rate | 100% | 94–100% | 48–100% (median 96%) | 2–71% |
| skilled player land rate | 100% | 97–100% | 91–100% | 40–87% |
| fight length | 5–10 s | 7–15 s | 11–38 s | 31–125 s |

- **Size changes nothing in the fight.** `rollWeight` gives a bounded `t = U^1.6`. It moves value by ×0.75–1.25 and model length by ×0.78–1.22, and the reel never sees it.
- **No size tail.** A Reedjaw Pike tops out at exactly 9 kg, so there is nothing to chase.
- **Gear is a set of flat stat stacks with no gate,** and skill barely separates players below legendaries. The run's challenge lives almost entirely in the night swarm. The pivot has to move it.

---

## 2. Size: the headline system

### 2.1 Size score, classes, lengths
On the bite, roll a **size score** `z ~ Normal(μ, 1)`, truncated to [−2.0, 3.6]. Length is `L = L50 × e^(σ·z)` and weight is `W = W50 × e^(3σ·z)`. `L50` and `σ` are per species: σ 0.14 for fry, 0.16–0.18 for panfish, 0.20 for predators, 0.15 for the hand-tuned finale fish. Classes are cut on **z**, so a class means the same thing for every species:

| class | z | share at μ = 0 | ink stamp | lands with |
|---|---|---|---|---|
| Small | < −0.25 | 38.7% | — | hands |
| Keeper | −0.25 … 1.04 | 46.0% | — | hands |
| **Prize** | 1.04 … 1.88 | 12.2% | bronze seal | Reed Net |
| **Trophy** | 1.88 … 2.65 | 2.7% | silver seal | Long Net |
| **Elder** | ≥ 2.65 | 0.4% | gold seal + the fish gets a name | Cradle Net |

| species | median length (L50) | Prize from | Trophy from | Elder from | ceiling (z 3.6) | weight of an Elder vs the median |
|---|---|---|---|---|---|---|
| Dusk Minnow | 9 cm | 10 | 12 | 13 | 15 | ×3.0 |
| Mossback Perch | 28 cm | 33 | 38 | 43 | 50 | ×3.6 |
| Reedjaw Pike | 78 cm | 96 | 114 | 133 | 160 | ×4.9 (≈ 18 kg) |
| Mirror Pike | 90 cm | 111 | 131 | 153 | 185 | ×4.9 |

The Wick stands about 45 cm tall, so an Elder pike is three Wicks long. Legendaries stay unique individuals with a narrow σ of 0.06, so their records are about weight to the gram. Prize fish and up get their value from `(W/W50)^0.6`, capped at ×4. Food and oil use `^0.5`, capped at ×2.5. The economy lens owns the final numbers.

### 2.2 Size pressure μ: where the giants are
| source | μ |
|---|---|
| lure size S / M / L / XL | −0.4 / 0 / +0.4 / +0.8 (L re-rolls Small once; XL throws away any roll below Prize, and the wait × 1.8) |
| cut-strip bait / live-fry bait (predators only) | +0.3 / +0.5 |
| §24 place: base / Astir / that place's `giantMu` | +0.15 / +0.35 / +0.2 to +0.6 |
| dusk and dawn / Gloomtide (gloom-only species) | +0.2 / +0.25 (+0.4) |
| species condition matched (its hint line, e.g. "rises in drip-rain") | +0.3 |
| bait settled in the lower third of the species' depth band | +0.25 |
| Clean Cast | +0.1 |
| **pressure:** each catch from the same place today | −0.12 (floor −0.6), resets at dawn, so moving on pays |
| cap | +1.8 |

| μ | Small | Keeper | Prize | Trophy | Elder | what this looks like |
|---|---|---|---|---|---|---|
| 0 | 38.7 | 46.0 | 12.2 | 2.7 | 0.4 | blind casting in open water |
| 0.5 | 22.2 | 48.2 | 21.2 | 6.9 | 1.5 | a decent place at dusk |
| 1.0 | 10.5 | 41.3 | 29.6 | 14.1 | 4.5 | right place, right lure |
| 1.5 | 4.1 | 28.8 | 33.1 | 23.1 | 10.9 | full setup: Astir place, condition matched, live bait |
| 1.8 | 2.1 | 21.1 | 32.0 | 28.1 | 16.8 | everything at once |

At about 150 casts per hour of active fishing, a casual player meets an Elder of some species about once an hour, and most of those are commons. An **Elder of a rare** is roughly one per 15 hours at μ 0, but one per ~25 casts with full setup. **Setup is what you master.**

**Place caps.** Each place gets `maxClass`. Open water off a place caps at Trophy. Elders appear only in places flagged `holdsGiants` (about 2–3 per lake, e.g. the Chain Garden, the Well of Ledgers bottom ledger, the Lullaby Pool) and as sight-cast shadows (§3). The Font Ring caps at Prize: it is fry water. **Finding where the giants live is the exploration goal.**

### 2.3 Size you can see
- **Model.** `createFish` length becomes `M.scale × e^(σ(z − 0.4))`, i.e. ×0.8 to ×2.0 around today's Keeper size. Prize fish and up drop the mid-fight boost that small fish get (`fishing.js spawnHooked`). It costs no extra draw calls: one mesh, scaled.
- **Bite tells by class (§5)** and a **leap reveal**: the first leap or breach of a Prize+ fish runs 0.25 s of slow motion, with the silhouette rim-lit against the lantern. That is the moment you find out what you have hooked.
- **Fight readouts.** Wake, splash (`size: 0.6 + L·0.6`, already in the code) and the under-water shadow decal all scale with real length. The `fishFight` camera pulls back +12% per class above Keeper, so long runs stay on screen. Rod bend scales with T × class.
- **Landing.** The fish lies beside the Wick; the scale contrast is the joke and the awe (§10).

---

## 3. Reading the water

Signs replace feeding spots. They are pooled, instanced decals, ripples and particles (`water.ripple`, `fishing-fx` shadows and bursts), with **no new lights** and at most 6 alive at once. Each one tells you a species family and a size, and has its own cast rule.

| sign | looks / sounds like | tells you | cast rule | effect |
|---|---|---|---|---|
| **Rise ring** | rings every 4–9 s; ring radius ∝ length; a "plip" (small) or deep "gulp" (big) | surface feeder; class from ring size | land within 2.5 m, ≤ 3 s after a rise, with a surface lure | wait × 0.5; that fish's z is used |
| **Cruising shadow** | dark fish shape 0.3 m under, gliding a lazy path, seen only inside your light radius | **one specific fish**, its length shown exactly (rolled with μ +1.0, rares × 2) | lead it: land 1–3 m ahead and within 1.2 m of its line. On it or behind it spooks it (it returns elsewhere after 60 s) | 70% take with a matching lure, 35% without |
| **Bubble trail** | strings of bubbles creeping along the bottom; faint fizz | bottom feeder or sulker | sinking rig at the head of the trail | wait × 0.6, μ +0.3 |
| **Moth fall** | glowing moths spiral down onto a 6 m patch | risers now; predators 20 s later | fly or popper | rarity +0.1; after 20 s predators × 2 and μ +0.4 |
| **Nervous water** | skittering micro-ripples, fry skipping out | a predator under a bait ball | spoon or cut strip at the edge | predators × 3, μ +0.5 |
| **Strike splash** | one heavy slap, heard from off-screen with direction | a big runner or leaper just fed | within 4 m in the next 10 s | μ +0.6, predators × 3 |
| **Seam** | a foam line of drifting motes where currents meet (fixed by the layout; Sporewood channels) | runners and divers hold here | land up-current and let it drift in | rarity +0.1, runners/divers × 2 |
| **Glow trail** *(night only)* | a bioluminescent smear moving under the surface, visible lake-wide | a glowing gloom-only fish; brightness ∝ size | lead it like a shadow | gloom species μ +0.4 |

- **Raise Lantern** (hold the Wick, 1 oil, 8 s cooldown): for 4 s, shadows within 2× your light radius are revealed. Lantern upgrades now help you *see* fish, which ties oil = light into fishing.
- **Night is prime time for seeing giants.** Glow trails, moth falls drawn to your lantern and the gloom-only species give night fishing its own reason to exist, with or without the swarm.
- **Originality.** Visible shadows are a genre convention. We avoid the structure where every fish is a shadow you cast at. Most fishing is blind casting while reading signs; shadows are 1–3 per calm and appear only in your light.

---

## 4. Casting and presentation

**Cast.** The pointer now picks the spot (clamped to `castMax`). The existing ping-pong meter (period 1.6 s) now sets **scatter**: radius `r = (1 − charge) × 0.18 × dist × (1 − 0.6 × rodAccuracy)`, and a Clean Cast (charge ≥ 0.92) gives r = 0 plus μ +0.1. At 15 m with the starter rod, a sloppy release scatters up to 1.8 m; with the top rod, 1.0 m. That matters for shadows (a 1–3 m lead window), the Lit Row (0.6 m) and the Mirror Pool (1.5 m). Distance is no longer tied to timing, so the skill is precision.

**Depth.** Effective depth = min(water depth, rig depth). Float rigs and lures run at a fixed depth band. Sinking rigs **count down**: press and hold after the splash and the bait sinks at 0.22/s, shown on a gauge beside the bobber; lift to settle it. Bites start only once it settles, and pressing during the sink never spooks. Deep water costs time.

**Lures** are permanent tackle (a BAITS entry with `lure: true`, unlimited uses). A snap or a snag break loses the lure, and a new one costs 25% of its price. **Baits** are per-run consumables. Species gain `diet` tags (insect / fish / bottom / plankton / glow): a match gives weight × 2.5, a mismatch × 0.4, and commons are never zero.

| presentation | depth | size | diet | price / source |
|---|---|---|---|---|
| Float Rig (carries bait) | set 0.2 / 0.5 / 0.8 | — | the bait's | starter |
| Plumb Rig (carries bait, sinks) | count-down | — | the bait's | 60 |
| Feather Fly | surface | S | insect | 40 |
| Glimmer Spoon *(upgrade → lure)* | mid | M | fish | 90 |
| Bone Jig | bottom | M | bottom (snag-free +15%) | 120 |
| Cork Wobbler | mid | L | fish | 300 |
| Moth Popper | surface | M | insect (night × 1.5) | 260 |
| Lantern Lure | mid–deep | XL | fish, glow | 1,200 |
| existing baits (Mire Worms … Shimmerfly) | rig | — | existing attract lists → diet | Murk, plus foraging on foot (worms under moss stones, larvae from crystal) |
| **Cut Strip** | rig | — | fish; that lake's predators μ +0.3 | turn any catch into 3 strips (a fourth creel choice next to Eat / Render / Sell) |
| **Live Fry** | rig | — | predators × 3, μ +0.5 | keep a Small fish in a 2-slot bait well |
| **Lamp Moths** | rig | — | insect × 3 | at night, tap moths circling your lantern (3 per night) |

So the food chain is: catch small, to catch big.

---

## 5. The hook moment

- **The bite tells you the size.** Small: a quick double pop. Keeper: the classic plunge. Prize: a slow 0.4 s drag-under before the "!". Trophy: the bobber **lies flat**, then slides away. Elder: a dome of water bulges up first. Players know when to focus, and can change drag before the strike.
- **Window.** Prize fish and up hold the bait 10% longer, but the perfect-hook threshold is unchanged (0.4 × window).
- **Deep-set or lip-hooked.** A perfect hook on a Prize+ fish is deep-set: full slack grace, 3 hook-hold pips. A normal hook is lip-hooked: slack grace × 0.7, 2 pips. Striking during a lay-down or bulge spooks the fish, and it becomes a shadow nearby.
- **Hook-hold pips** (shown on the hook icon): you lose one when tension drops below the slack line during a leap or head-shake. At 0 the hook is thrown. The existing sustained-slack escape stays. The pips make "almost had it" visible and fair.

---

## 6. The fight

### 6.1 How size scales the fight
`g = e^(0.2·z)`, applied to the species' `difficulty` before `createReel` (the reel itself does not change):

| class (z used in sim) | g | power × g^1.6 (sinkers g^1.15) | stamina × g | surge time × √g | sweet band × g^−0.5 | erratic + | surges more often × g^−0.6 |
|---|---|---|---|---|---|---|---|
| Small (−0.8) | 0.85 | 0.77 | 0.85 | 0.92 | 1.08 | 0 | 1.10 |
| Keeper (0.4) | 1.08 | 1.14 | 1.08 | 1.04 | 0.96 | 0.03 | 0.95 |
| Prize (1.4) | 1.32 | 1.57 | 1.32 | 1.15 | 0.87 | 0.11 | 0.85 |
| Trophy (2.2) | 1.55 | 2.02 | 1.55 | 1.25 | 0.80 | 0.18 | 0.77 |
| Elder (3.0) | 1.82 | 2.61 | 1.82 | 1.35 | 0.74 | 0.24 | 0.70 |

Global re-tune: base stamina × 1.4, because fights were 5–10 s, too short to have an arc. Skilled fight lengths in the sim: Keeper 6–16 s, Prize 9–40 s, Trophy 12–70 s, Elder 17–150 s.

Reel-model edits:
- **Easing uses load.** `target = −fallBase / (0.8 + 0.2·pw/LS)`, replacing `pw`, so a better line genuinely lets you ease a big fish.
- **Rod shock.** `surgeHoldMult × (1 − shock)`.
- **Fatigue clock** (non-legendaries): after 60 s, `pw × max(0.6, 1 − 0.01·(t − 60))`. This caps Elder fights near 90 s on a phone.
- **Sinkers grow at g^1.15.** At g^1.6 their constant drag made Trophies 0% on any gear.

### 6.2 Drag
Above `dragAt`, the drag absorbs `dragQ` of any tension rise and the fish takes line: `P −= 0.08 × absorbed`. If P hits 0 while slipping, the fish is **spooled**. Drag has three notches: Light (`dragAt` 0.70), Set (0.80), Firm (0.90). You pick one in the tackle tray before the cast, or tap the drag dial / use the mouse wheel mid-fight. The starter reel is fixed at Set. The right call follows from your read of the fish: Firm on divers, before they reach snags; Light on runners and leapers.

### 6.3 Fight styles (behaviour → surge kinds in the reel)
| style | signature | counter-skill | how size amplifies it | species (re-mapped) | code |
|---|---|---|---|---|---|
| steady | baseline | track the band | longer | perches | keep |
| darter | short, frequent surges; band jumps | re-centre quickly | band jumps × √g | minnows, koi, jellies | keep |
| **runner** | surge kind `run`: 0.8 s line hiss, then a run of surgeTime × 2√g. Released: P −0.05·pw/LS per s. Held: T × 1.8 (into drag slip) | let it run, then reel: after a run there are 2 s of ×1.5 progress ("it turns") | runs longer; spool risk on a weak reel | pikes, Shroud Ray | new |
| **diver** | surge kind `dive`: heads for the nearest structure within 7 m at 1.5 m/s × pw/LS | **rod sweep:** push the joystick away; the counter-force is 1.2 m/s × T, so you must keep tension up to steer | faster, more often | eels, Mildew/Lampwarden anglers | new |
| **sulker** | sulk phase every 10–14 s, lasting 4–6 s × √g: holding gains nothing and T creeps +0.3·pw/LS | **pump:** release ≥ 0.3 s, then hold; each lift gives +0.04·RS/√g P | sulks last longer | crayfish, carp, Blind Scrivener | new (from `sinker`) |
| thrasher | violent surges, plus a **head-shake** (T ±0.12·g at 3 Hz) | keep tension above the slack line or lose a pip | shake amplitude × g | puffers, Shardspine/Gilt-Eyed | extend |
| leaper | leaps: hold or go slack | hold through; the leap reveal | leap × √g | rays, Gloam Eel | keep |
| schooler *(trait)* | land one in < 8 s → the next 4 casts within 3 m wait × 0.3, μ +0.15 each ("the big ones come up last") | speed | — | fry, minnows, perches | new |

**Snags.** When a fish stays inside world structure for 0.8 s, the line locks. Release for 1.2 s and it swims free with a chance by structure: weed 85%, roots 65%, crystal 50% (a failure cuts the lure), bones 55%, chains 40%, +5% per rod tier and +15% with the Bone Jig. Structure is a world tag (`world.getTagAt`, already planned in §24) on reeds, roots, crystal, bones and chains. **Cut line** moves from "hold movement 0.6 s" to a button (key X), because the joystick now sweeps the rod.

---

## 7. Gear progression (permanent tackle)

There are five slots. Each tier is bought from Old Murk and kept forever. Tiers 3 and 4 also need a **proof catch**: gear is earned by fishing, not by grinding.

| tier | Rod (castMax · accuracy · shock · hook window) | Line (strength) | Reel (speed · drag absorption · sweet band) | Hook (slack grace · pips) | Net (largest class) | Shells per slot | proof |
|---|---|---|---|---|---|---|---|
| T0 | Willow Switch 14 · .55 · 0 · ×1 | Twine 1.00 | Wooden Winch 1.00 · .30 (fixed Set) · .16 | Bent Pin 1.4 s · 3 | hands: Keeper | start | — |
| T1 | Ashwood 17 · .70 · .08 · ×1.04 | Braided Gut 1.15 | Brass Spool 1.12 · .45 · .17 | Barbed Bone 1.6 · 3 | Reed Net: Prize (60) | 80–150 | — |
| T2 | Whalebone 20 · .80 · .15 · ×1.08 | Waxed Silk 1.32 | Clockwork 1.25 · .58 · .18 | Iron Barb 1.8 · 3 | Long Net: Trophy (400) | 300–550 | a Mossmere Prize |
| T3 | Glassreed 23 · .90 · .22 · ×1.12 | **Glass-Gut** 1.52 (invisible in clear water) | Whisper Drag 1.40 · .68 · .19 | Wickhook 2.0 · 4 | — | 900–1,500 | a Sporewood Trophy or a Glasswater Prize |
| T4 | Lantern-Spine 26 · .97 · .30 · ×1.16 | Silverthread 1.75 (+0.2 s slack) | Tidewheel 1.55 · .76 · .20 | Ember Barb 2.2 · 4 | Cradle Net: Elder (1,800) | 2,200–3,800 | a Glasswater Trophy |

The full set is about 23,000 Shells, roughly 10–15 hours at the lakes' fishing income. If the panel keeps per-run gear, divide the prices by about 4 and keep the tiers. The old lantern, creel and raft upgrades move to the survival and combat layer. Glimmer Spoon and Trembling Feather become lures.

**Clear water (Glasswater).** Every line tier above T2 except Glass-Gut adds wait × 1.12 and μ −0.1, so the clear lake asks for its own line. **Line ratings** shown in the shop come from the sim: the largest class a skilled player lands ≥ 50% of the time. Example: "Braided Gut: Mossmere Elder · Sporewood Trophy · Glasswater Prize".

**The gear gate is real (sim, skilled player, Prize / Trophy / Elder):**

| species | T0 | T1 | T2 | T3 | T4 |
|---|---|---|---|---|---|
| Reedjaw Pike (Mossmere rare) | 86/62/2 | 92/89/48 | 95/98/81 | 99/96/93 | 98/99/99 |
| Mildew Angler (Sporewood rare) | 81/35/0 | 87/79/28 | 97/86/76 | 100/99/90 | 100/100/100 |
| Mirror Pike (Glasswater uncommon) | 61/21/0 | 84/59/9 | 98/93/59 | 99/99/98 | 99/99/100 |
| Shardspine Eel (Glasswater rare) | 47/1/0 | 83/34/0 | 91/81/14 | 93/94/68 | 97/99/93 |
| Gilt-Eyed Eel (Pallid uncommon) | 54/0/0 | 83/29/0 | 89/84/18 | 94/92/72 | 93/99/89 |
| The Pale Leviathan (novice / skilled / expert) | 0/0/0 | 0/0/0 | 0/0/0 | 0/13/40 | 24/71/96 |

One tier under a lake's curve, its Trophies are a coin flip and its Elders are walls. Coming back to the Mossmere with Silverthread for its Elder pike is the satisfying return trip.

---

## 8. Land-rate targets and the four-lake climb

The targets assume mastered gear for the lake (T(i+1)) and the right net. Sim figures are the lake's rares (novice / skilled / expert).

| class | target N / S / E | sim: Mossmere T1 | Sporewood T2 | Glasswater T3 |
|---|---|---|---|---|
| Small / Keeper commons | 97 / 99 / 100 | 100 / 100 / 100 | 100 / 100 / 100 | 99 / 100 / 100 |
| Keeper rares | 85 / 95 / 99 | 96 / 97 / 99 | 100 / 100 / 100 | 99 / 99 / 98 |
| Prize | 70 / 90 / 97 | 72 / 93 / 97 | 93 / 98 / 98 | 93 / 93 / 97 |
| Trophy | 45 / 75 / 90 | 54 / 90 / 94 | 87 / 93 / 96 | 73 / 88 / 91 |
| Elder | 15 / 50 / 80 | 22 / 67 / 85 | 54 / 87 / 94 | 16 / 63 / 83 |
| Elder on arrival gear (T(i)) | 3 / 20 / 45 | 9 / 42 / 49 | 20 / 50 / 67 | 0 / 7 / 22 |

What the sim shows: size plus drag plus gear produce the intended *shape*, with a clean gear gate and a wide skill spread on Trophy and Elder fish. What it cannot show yet: **Keeper rares and big commons are still too easy for novices** (an Elder common lands 90–99%). Runners, sulkers, divers, snags and pips are the unsimulated layer meant to close that gap. Extending `tools/sim/reel.mjs` with them is the first task (see the table at the end).

| | The Mossmere | Sporewood Pools | Glasswater Vault | The Pallid Deep |
|---|---|---|---|---|
| gear (arrival → mastered) | T0 → T1 | T1 → T2 | T2 → T3 | T3 → T4 |
| styles introduced | steady, darter, sulker, runner (pike), schooler | + leaper, thrasher head-shake | + diver into crystal | heavy sulkers, divers into chains |
| signs | rises, bubbles, strike splash, shadows in open water | + moth fall, seams in the channels, glow trails | + reflections; shadows visible farther (clear water) | signs only inside your light; glow trails; the Breathing Deep |
| snag free chance | weed 85% | roots 65% | crystal 50% (cuts the lure) | bones 55%, chains 40% |
| bite tells | full | feints on rares | feints on all rares; line-shy fish | "toll" cues, fewer nibbles |
| where Elders live | dusk shadows only (raft lake, no places) | 2 giant places | 3 giant places + the Well of Ledgers bottom | 3 giant places + Breathing Deep domes |
| typical σ | 0.18 | 0.20 | 0.20 | 0.22 |

---

## 9. Fair failure

| failure | cause you can read | what you see |
|---|---|---|
| **Snapped** | T ≥ snap for 0.12 s | line whips, rod springs, the lure is lost |
| **Thrown hook** | pips reach 0, or slack longer than the grace | the hook flies back with a glint |
| **Spooled** | P reaches 0 while the drag slips | the reel screams empty |
| **Snagged off** | a failed free roll | the line goes dead, then parts |
| **Lost at the net** | missed the net ring twice (two classes over net capacity cannot be landed at all) | the fish rolls at the rim and is gone |

- **The near-miss card always shows what you lost:** the silhouette, estimated class and length (±8%), the % landed, the cause and one tip. Example: "Reedjaw Pike, Trophy, ~121 cm. Snapped at 84%. Your line is rated Prize here. Ease off on the hiss."
- **Marked Fish.** An escaped Prize+ fish keeps its z and stays at that place, with a hook-glint on its shadow. Its next fight starts at `0.5 × P_escape` (capped at 0.3), reusing the legendary `wounded` rule. Up to 6 persist across runs in meta. The death screen says: "Still out there: the 131 cm Reedjaw Pike that broke your Braided Gut."
- **Failure costs the fish and maybe a lure, never the collection.** Journal, records, tackle and Marked Fish all persist.

---

## 10. Landing and measuring

At P = 1, a **Prize+ fish needs the net.** A ring shrinks onto the rolling fish over 0.5 s with hands, 0.6 s Reed, 0.7 s Long and 0.8 s Cradle; tap when it meets the fish. A miss means a **net bolt**: P drops to 0.8 and an immediate warned surge follows. Sim net success (on-class net): 88% novice / 97% skilled / 99.5% expert per try. One class under capacity: 50 / 70 / 85%. Small and Keeper fish land by hand.

| t | the ceremony (Small/Keeper: 1.2 s, tap to skip · Elder: 5 s) |
|---|---|
| 0.0–0.6 s | scoop: a water sheet and a splash at true scale; the camera eases in, framing fish and Wick together |
| 0.6–1.4 s | lift: the Wick holds it up, or for a fish longer than the Wick, stands beside it on the raft or pier |
| 1.4–2.8 s | **measure:** a knotted measuring cord unrolls along the fish. The centimetres tick up with rising pitch, a chime rings as the count crosses Keeper → Prize → Trophy → Elder, and the class seal stamps down in ink |
| 2.8–3.6 s | records: "New best: 112 cm (was 97)" · class first · lake record · the Journal ruler inks a tick |
| 3.6 s+ | card: Keep / Eat / Render / Cut Strip / Release. A Prize+ release banks the record plus +1 / +3 / +8 Memories (Prize / Trophy / Elder) |

**Records.** Personal bests per species (cm and kg); class firsts (a Journal grid of 40 species × 5 classes); an **Elder Log**, where each Elder gets a generated name, place, run and day (e.g. "Old Ninefin, 141 cm, the Bell Shallows, run 12, day 3"); and a per-species ruler in `ui-fishart` showing class bands, your catches as ticks and your best.

---

## Changes to existing systems

| # | system | keep / modify / cut / new | module(s) | effort |
|---|---|---|---|---|
| 1 | Tension / sweet band / surge core, telegraphs, Clean Cast, Shimmering quality, legendary phases | keep | fishing-reel.js, fishing.js | — |
| 2 | Size score z, classes, μ pressure, per-species `L50`/`σ`/`diet`/`maxClass`, place `giantMu`/`maxClass` | new (replaces `rollWeight`) | data.js, fishing.js | M |
| 3 | Size → difficulty scaling (§6.1) + stamina × 1.4 re-tune | new | fishing.js (before `createReel`), data.js | S |
| 4 | Easing by load `pw/LS`; rod shock; fatigue clock | modify | fishing-reel.js | S |
| 5 | Drag slip, spooled escape, 3 drag notches + dial | new | fishing-reel.js, ui-hud.js, main.js | M |
| 6 | Fight styles runner / diver / sulker, thrasher head-shake, schooler trait; species re-mapped | new / modify | fishing-reel.js (surge kinds), fishing.js, data.js BEHAVIOR_MODS | L |
| 7 | Snags (structure tags), rod sweep on the joystick, Cut-line button | new / modify | world-layout.js, fishing.js, main.js, ui-hud.js | M |
| 8 | Bite tells by class, deep-set / lip-hooked, hook-hold pips | modify | fishing.js, fishing-fx.js, ui-hud.js | M |
| 9 | Cast: pointer target + scatter ring; count-down sink rigs | modify | fishing.js, fishing-fx.js | M |
| 10 | Feeding-spot mote columns (Tide Chart → "Sign Chart") | cut / replace | fishing.js, fishing-fx.js | S |
| 11 | Signs (rises, bubbles, moth fall, nervous water, strike splash, seams, glow trails) + Raise Lantern | new | fishing.js, fishing-fx.js, water.js, audio-sfx.js | L |
| 12 | Sight-cast shadows (pre-rolled fish) | new | fishing.js, fishing-fx.js | M |
| 13 | Visible size: model scale, no boost for Prize+, leap reveal, camera pull-back | modify | models-fish.js, fishing.js, render.js | S |
| 14 | Net ring, net bolt, measuring ceremony, PB/class/lake records | new | fishing.js, actors.js (`showCatch`), ui-screens.js, audio | M |
| 15 | Tackle: 5 slots × 5 tiers, permanent, proof catches (replaces fishing UPGRADES) | modify | data.js, progression-market.js, progression.js | M |
| 16 | Lures as permanent BAITS (`lure`, lost on snap), diet matching, lure size | modify | data.js BAITS, fishing.js `rollSpecies` | M |
| 17 | Cut Strip, Live-Fry bait well, Lamp Moths, foraged baits | new | progression.js, fishing.js, player.js | M |
| 18 | Marked Fish (persistent escaped trophies; reuses `wounded`) | new | progression.js meta, fishing.js | M |
| 19 | Value/food/oil from the weight ratio (replaces sizeK) | modify | progression.js `makeFish`, data.js | S |
| 20 | Journal: class grid, size ruler, Elder Log; near-miss card | modify / new | ui-screens.js, ui-fishart.js, progression.js | M |
| 21 | Combat-coupled fishing rules (hand slam snaps a non-legend line, slack budget for zaps) | modify (only when combat is on) | fishing.js | S |
| 22 | Fisher boons (Steady Reel, Lucky Knot, Hungry Waters) | keep (they now help reach classes) | data.js | — |
| 23 | Reel sim: add size, drag, shock, net, styles, snags; QA targets in §8 | new | tools/sim/reel.mjs, balance-sim.mjs (prototype: tools/out/pivot/angler-sim.mjs) | M |
