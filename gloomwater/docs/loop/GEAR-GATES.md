# Gear gates: the start kit, the bare hook, and what each piece of gear lands (the Mossmere; design v1)

*17 November 2026. Measured on 4049c61 (preview 21). No game code is changed here. The sim figures come from a scratch copy of
`tools/sim/clams.mjs` with this document's tables patched in (§6). The builder ports that patch.*

## 0. The user's words, and what each becomes

> "So far we start with no bait and no lure. Yet it still feels like fish bite frequently. Let's start off with one lure and some
> bait, the lure is low quality but it allows us to catch some predators. Buying better lures allows us to catch bigger predators
> and buying different types of bait allows us to potentially catch bigger fish aswell. Certain fish we shouldn't be able to access
> without certain lures or bait but the standard fish that allow us to grind money for gear should be achievable but maybe Capped at
> a certain size so we feel like we really need to buy new gear and lures"

| words | becomes |
|---|---|
| "start off with one lure and some bait" | a fresh save owns the **Bent Spoon** (new, free, never sold) and **one tin of Mire Worms (10)**, fitted (§2.1) |
| "it still feels like fish bite frequently" (on a bare hook) | the bare hook bites **2.5× slower**, brings **commons only**, and lands **up to Keeper** (§2.2) |
| "the lure is low quality but … some predators" | the Bent Spoon takes perch, bass, chub, the Milkeye Perch and the trout, **up to Keeper**. It never takes a pike (§2.1) |
| "better lures … bigger predators" | the bought lures raise the cap on the fish they suit and open the pikes and the giants (§3, §5) |
| "different types of bait … bigger fish" | each tin is the right bait for some fish, and the right bait lands them bigger (§4). Lumen Moss is still the Gloam Eel's only bait |
| "certain fish we shouldn't be able to access" | the two giants need a bought lure (Cut Strip no longer brings them). The pike still needs a lure or a strip, as built (§3) |
| "standard fish … achievable but capped" | the commons bite on the start kit and land up to Prize on Twine. **Line T1** lifts the cap to Trophy (§4) |
| "feel like we really need to buy new gear" | a fish over the cap bites, hooks and **gets away**, and a few words name what would hold it (§4.3) |

What stays as it was: bait **or** a lure, never both. The lure is cast and comes back by itself at 1.2 m/s. The strike gauge stays.
Prices stay ×2. The Hold ladder stays. Odds show only in the Journal and the gear log, never on the shelf or the HUD. There is no
way to fail: a fish can get away, as WC-3's lost fish already do, but nothing in the player's stock is lost beyond the bait used.

---

## 1. Today, measured (4049c61)

### 1.1 The start kit

`progression-loop.freshLoop`: **no lure, no bait** (`lures: []`, `fitted: {lure: null, bait: null}`, `bait: {}`), T0 tackle
(Willow Switch, Twine, Wooden Winch), Hold 3, 0 clams. The first fishing is on the bare hook. The only free bait is Cut Strip,
which you get by pressing and holding Let go on a Small or a Keeper.

### 1.2 Why a bare hook "still feels like fish bite frequently"

1. **Every cast bites.** `rollBite` always rolls a fish. `placePool` never empties ("nothing ever stops biting"), and the hook
   table only changes **which** fish bites, never **whether** one does.
2. **The wait has no hook term.** `W = (3 + Exp(5.5)) / biteSpeed`, clamped to 2–25 s. The only thing that changes it is a bait's
   `biteSpeed` (+0.3 for Mire Worms). So the bare hook waits 8.4 s on average and Mire Worms 6.5 s. With the 1.8 s cast, that is
   **10.2 s against 8.3 s**: 5.9 bites a minute against 7.2. The bare hook is only 18% slower.
3. **The bare hook takes almost everything.** Ten of the Mossmere's fish grade it 1: the seven commons, the Weeping Carp, the
   Candlefin Koi and the Bridgechain Sturgeon. Only the five hunters refuse it.
4. **It lands full size.** No gear term caps the size. A fresh save at dusk on a bare hook lands Small 32% · Keeper 48% · Prize 16% ·
   Trophy 4% (SHEET §3.5), all the way up to Trophy.

### 1.3 Bite rates (open water, the blind caster's mix of areas; the game's own functions)

| on the hook | day | dusk | night | the first bite (cast included) |
|---|---|---|---|---|
| bare hook | 5.9 / min | 5.9 | 6.6 (waits ÷ 1.15) | 10.2 s |
| Mire Worms | 7.2 | 7.2 | 8.1 | 8.3 s |
| Lumen Moss, Cut Strip | 5.9 | 5.9 | 6.6 | 10.2 s |
| Feather Fly | 7.0 (areas 5.9–8.1) | 7.0 | 7.2 | 8.6 s |
| Glimmer Spoon | 6.2 (5.2–7.7) | 6.2 | 7.1 | 9.7 s |
| Bone Jig | 8.4 (7.3–9.3) | 8.5 | 9.3 | 7.2 s |
| Harbour-Bell Spinner | 6.5 (6.4–6.7) | 6.3 | 5.8 | 9.3 s |

A bait's rate is the same in every area: every cast bites, and the area only changes who. A lure's rate is
`Σ p · takeChance(0.05, grade)` from `castOdds` for each second of the retrieve, over a 14 m cast (9 rolls). The ranges in brackets
are the slowest and quickest areas.

### 1.4 Who each set-up takes today (`WATERCRAFT.mossmere.hook`; grade 3 the right bait, 2 likes it, 1 takes it)

| hook | right bait (3) | likes it (2) | takes it (1) |
|---|---|---|---|
| bare | — | — | the seven commons, Weeping Carp, Candlefin Koi, Bridgechain Sturgeon |
| Mire Worms | Dusk Minnow, Mossback Perch, Rustfin Sucker, Bridgechain (design: + Gutter Crayfish) | Gutter Crayfish, Likely Chub, Overbold Bass, Weeping Carp | Lampsipper, Koi, Milkeye Perch, Kissmark Trout |
| Lumen Moss | Weeping Carp, Candlefin Koi, Gloam Eel | Dusk Minnow, Likely Chub, Lampsipper | Gutter Crayfish, Rustfin Sucker |
| Cut Strip | Crayfish, Milkeye, Reedjaw Pike, Bridgechain, **both giants** | Mossback, Chub, Bass, Trout | — |
| Feather Fly | Chub, Lampsipper | Minnow, Bass, Trout | Mossback, Koi |
| Glimmer Spoon | Trout, Reedjaw Pike | Mossback, Bass, Milkeye, Thousandcast | Chub, Hullkiss |
| Bone Jig | Mossback, Bass, Milkeye | Trout, Reedjaw, Thousandcast | Chub |
| Spinner | Reedjaw, Thousandcast | Mossback, Chub, Bass, Trout, Hullkiss | Milkeye |

Any other fish is a stray: at most 1% of a cast (the user's rule, exact, in all 80,196 pools).

### 1.5 What caps the size today

- `fishing-reel.capZ` on a trip: Trophy is the top (z 2.64) everywhere, except Under the Span (old water) and a giant at its own
  place, which may roll Elder. Nothing about the gear enters it.
- Gear only changes the **land chance** (`catchParts`: tackle Hold, +5/+6 Hold on the item's grade-2 and grade-3 fish,
  `gradeTargets`). Bare tackle: Dusk Minnow 85 / 81 / 57 / 37% from Small to Trophy, Reedjaw Pike 69 / 61 / 30 / 16%.
- A bait's favour +0.3 moves the whole size roll up. Fresh at dusk on worms: Small 17 · Keeper 48 · Prize 26 · Trophy 10.

### 1.6 The shelf's lures and baits (×2; tins at base)

| item | price | what it opens (from the table) |
|---|---|---|
| Mire Worms (tin of 10) | 10 | the worm fish (column above); speeds bites ×1.3 |
| Lumen Moss (tin of 10) | 10 | the Gloam Eel (its only bait); carp and koi as the right bait |
| Feather Fly | 100 | chub and Lampsipper as the right lure |
| Glimmer Spoon | 180 | Reedjaw Pike and Kissmark Trout as the right lure |
| Bone Jig | 220 | perch, bass and Milkeye as the right lure |
| Harbour-Bell Spinner | 360 | both pikes, giants' share ×1.5 |
| Line T1 / T2 | 100 / 600 | Hold only (no cap) |

Cut Strip is free, and it is already the right bait for every hunter, both giants included. So today nothing is gated by buying.

### 1.7 Today's pacing (`clams.mjs --shipped=mossmere`, full run, ×2)

The blind caster's first buy is Hold 4 after **trip 7** (0.42 h; target trip 3–5, FAIL). Then Glimmer Spoon 1.68 h, Bone Jig 1.74,
Feather Fly 1.87, Spinner 2.00. **The empty shelf: 4.29 h** (reader 3.91, stalker-reader 3.82; target 4.5–7.5, both readers FAIL).
The longest wait is 38 min, and the first giant comes home at 2.4 h. Per Wick (`--wicks --quick`): 3.77–4.02 h, every one under the
band; 21 checks fail.

---

## 2. The start kit and the bare hook

### 2.1 The start kit

| key (data.js, the loop's block) | value |
|---|---|
| `LOOP.start` | `{ lures: ['bent_spoon'], bait: { mireworm: 10 }, fit: 'mireworm' }` |
| `freshLoop` reads it | `lures: ['bent_spoon']`, `bait: { mossmere: { mireworm: 10 } }`, `fitted: { lure: null, bait: 'mireworm' }` |
| `migrateLoop` | an old save that lacks the Bent Spoon gets it (it is free). No bait is granted to an old save |

**The Bent Spoon** (`bent_spoon`): "a kitchen spoon Murk bent and holed", low quality, free, never on the shelf. It shows in the
tackle tin's Lure row, the sheet and the gear log.

| key | value |
|---|---|
| `LOOP.lures.bent_spoon` | `{ water: 'mossmere', price: 0, start: true }`. The shelf (`loop-gear` / `shelfItems`) skips `start` lures |
| `LURES` (loop-only push in the apply block, beside SHEET §8.1's patch; the v3 fingerprint never sees it) | `{ id: 'bent_spoon', name: 'Bent Spoon', depth: 'mid', attract: 1, favour: -0.25, price: 0, onSale: null }` (no `family`, so `baseTerms` reads the −0.25 for every fish) |
| `CATCH_V3.items.bent_spoon` (loop-only) | `{ kind: 'lure', hold: 3, species: gradeTargets('bent_spoon') }` (the perch and the bass) |
| `TEXT_LOOP.gearItems.bent_spoon` | `'Bent Spoon'` |
| art | the Glimmer Spoon's mesh, dull pewter (no flash), its icon `lure` |
| hook column (`watercraft.js`: `HOOK_ITEMS` and `LURE_IDS` get `'bent_spoon'`; each `HOOK_ROWS` row gets a 9th cell) | Mossback Perch 2, Overbold Bass 2, Likely Chub 1, Milkeye Perch 1, Kissmark Trout 1, every other fish 0, the Matriarch `null` |

Measured: the Bent Spoon brings, by day, bass 34% · perch 33% · chub 23% · trout 7%, and at night the Milkeye Perch. It strikes
4.9–5.1 times a minute (first strike 11.7–12.3 s), slower than every bought lure (5.8–9.3). It never brings a pike: the Reedjaw
Pike grades it 0.

**The first trip** sails with the worms fitted. Its first bite comes in 8.3 s on average, as today's worms do, and **evening 1
never loses a fish to the cap**: an over-cap fish lands at the cap instead (`LOOP.gearCap.firstEvening: 'cap'`, §4.2). The tutorial's
beats (`loop-tutorial.js`) do not change. Ten worms last about 2.5 trips at Hold 3 (the sim fishes 4.1 bites a trip).

### 2.2 The bare hook: rare, slow, small, never a dead end

| key | value | effect |
|---|---|---|
| `LOOP.bare.waitMult` | 2.5 | in `rollBite`, on a trip with nothing on the hook, `W *= 2.5` **before** the 2–25 s clamp (never on a legend cast or in the tutorial). Mean wait 17.4 s, so the first bite comes in 19.2 s: **3.1 a minute**, against worms' 7.2 |
| `LOOP.bare.favour` | −0.5 | a `baseTerms` term `{family: 'tackle', id: 'bare'}` on a trip with nothing on the hook: small fish come to a bare hook. The float's notches show it |
| hook table | `weeping_carp.bare`, `candlefin_koi.bare`, `bridgechain_sturgeon.bare`: 1 → **0** | commons only (the seven): carp, koi and the sturgeon need a bait |
| `LOOP.gearCap.item.bare` | `'keeper'` | lands up to Keeper (§4) |

It still bites in every pool (the smallest takers' weight is 13.8, as built), so the water never goes silent and a player with no
bait and no clams can always fish. Cut Strip is still free from the trip's own Smalls and Keepers. Measured (3,000 trips, Hold 3,
Twine): 19 clams a trip in 3.1 min, against 38 in 2.1 min today.

---

## 3. Gates: what each Mossmere fish needs

Four cells change besides the bare hook's three. **`thousandcast_pike.cut_strip` 3 → 0** and **`hullkiss_lamprey.cut_strip` 3 → 0**,
so the giants need a bought lure. **`hullkiss_lamprey.bell_spinner` 2 → 3**, so the Spinner is the right lure for every giant and the
lamprey can still reach its top class. **`gutter_crayfish.mireworm` 2 → 3**, so the worm is the crayfish's right bait. Its only grade
3 was Cut Strip, which is now capped at Prize, and without this edit its Trophy and Elder seals would be lost. Nothing else moves. The 1% stray rule, "every pool bites" and "every fish
can be caught" all still pass in the sim (§6).

| fish | needs | start kit (Bent Spoon, Mire Worms) |
|---|---|---|
| Dusk Minnow, Mossback Perch, Gutter Crayfish, Likely Chub, Overbold Bass, Rustfin Sucker, Lampsipper (**the standard fish**) | nothing (bare hook, worms, the spoon) | **open** |
| Weeping Carp, Candlefin Koi | a bait (worms, or Lumen Moss as the right bait) | open on worms |
| Milkeye Perch, Kissmark Trout | a bait or a lure (never a bare hook, as built) | open on worms or the Bent Spoon |
| Bridgechain Sturgeon (Under the Span) | worms or Cut Strip (no longer a bare hook) | open on worms, once the map is bought |
| Reedjaw Pike | **a strip or a real lure**: Cut Strip, Glimmer Spoon, Bone Jig, Spinner (never worms, the bare hook or the Bent Spoon) | strip only |
| Gloam Eel (the Buoy Lights) | **Lumen Moss** (as built) | no |
| ★ Thousandcast Pike | **a bought lure**: Glimmer Spoon, Bone Jig (2), Spinner (3) | no |
| ★ Hullkiss Lamprey | **a bought lure**: Glimmer Spoon (1), Spinner (3) | no |
| ★ The Belled Matriarch | the Heartmoss Ball (as built) | no |

The Mossmere's list (12 open-water fish) stays reachable on the start kit plus Cut Strip. Measured: p95 44 min, p99 52 (target
≤ 60 and ≤ 75).

---

## 4. Size caps

### 4.1 The rule (one pure function, `watercraft.gearCap`)

```
gearCap(D, fishId, { lure, bait, line }) → { cls, z, by } | null        (null: no row, a legend, or off the Mossmere: no cap)
  grade  = gradeOf(fishId, {lure, bait})                       (one thing on the hook, as built)
  terms  = [ grade:  LOOP.gearCap.grade[grade]                  ['keeper' for a stray (0), 'keeper', 'prize', 'elder']
             item:   LOOP.gearCap.item[lure || bait || 'bare']  (bare 'keeper', bent_spoon 'keeper', cut_strip 'prize'; others none)
             line:   LOOP.gearCap.line[min(line tier, 2)] ]     ['prize' Twine, 'trophy' Line T1, 'elder' T2+]
  cls    = the lowest of the terms;  z = BALANCE_V3.size.classMaxZ[cls] (elder: the size top)
  by     = the term that set it (ties: item, then line, then grade)
capZ (as built) still applies on top: Elders only at Under the Span and for a giant at its own place.
```

```js
LOOP.gearCap = {
  grade: [null, 'keeper', 'prize', 'elder'],          // takes it · likes it · the right bait (capZ still keeps Elders to old water)
  item: { bare: 'keeper', bent_spoon: 'keeper', cut_strip: 'prize' },   // the free hooks' ceiling
  line: ['prize', 'trophy', 'elder'],                  // Twine · Line T1 · Line T2 and up
  firstEvening: 'cap',                                 // evening 1: an over-cap fish lands at the cap (no loss)
  ashwick: 'cap',                                      // Ashwick's comeback of a cap loss returns at the cap
};
```

What it means on the water:

| set-up | the standard fish land up to | measured, Hold 3 open water (per trip) |
|---|---|---|
| bare hook, Twine | Keeper | 19 clams, 3.1 min; 0.6 of 4.1 hooked fish get away over the cap (14%) |
| **start kit: Mire Worms, Twine** | Prize (grade 3 and 2), Keeper (grade 1) | 28 clams, 2.0 min; 0.44 of 4.1 (11%) |
| **start kit: Bent Spoon, Twine** | Keeper | 29 clams, 2.4 min; 0.83 of 4.3 (19%) |
| Cut Strip, Twine | Prize | 48 clams, 3.6 min; 0.77 of 6.8 (11%) |
| Mire Worms, **Line T1** | Trophy (grade 3), Prize (grade 2) | 35 clams, 2.0 min; 0.18 of 3.9 (5%) |
| Glimmer Spoon, T1/T1/T1, Hold 4 | Trophy for the pike and trout | 89 clams, 2.4 min; 0.45 of 5.1 (9%) |

Every fish still reaches its old top class on some M1 hook at Line T2, so the 47 class seals M1 can earn are unchanged (test GG2).

### 4.2 Over the cap: it hooks, then gets away (chosen over rolling at the cap)

Rolling at the cap would be invisible: the player would never meet the bigger fish, so would never feel the need. A fish that
hooks and gets away is the moment the user asked for. It costs what any lost fish costs today, the bait and that bite, and nothing
else.

- `fishing.rollSize` (a trip, the Mossmere, not a legend or a find): `g = gearCap(...)`. The z is rolled as built (`capZ`). If
  `z > g.z`, set `S.overCap = { by: g.by, cls: g.cls }`. On evening 1 (`run.evening === 1`) or in the tutorial, pass
  `cap = min(cap, g.z)` to `rollZ` instead, so the fish lands at the cap.
- At the strike (`fishing.js` around line 1657): after `S.p = …`, add `if (S.overCap) S.p = 0;` and force the cause (`'snap'`
  when `by === 'line'`, else `'thrown'`). The four draws stay in their order, so seeded parity holds. The loss then plays WC-3's
  lost fish exactly (slack line, splash, sound, the shape bolts).
- `fish:escaped` carries `overCap`. `progression-loop`'s `onEscaped` stores Ashwick's comeback at `z = g.z − 0.001`, so it comes
  back once, tired, and lands at the cap.
- A sign's pre-rolled z and a silhouette's z obey the same check, since they pass through `rollSize`.

### 4.3 The got-away line: the one word on the water

On a cap loss only, the slot under the float that shows "Hook set" on a Clean strike shows one line for 2.5 s. It never names the
fish, its class or its size. It names the gear that would hold it:

| `by` | the line (`TEXT_LOOP.gate.away`) |
|---|---|
| `line` | `Too heavy for your line.` |
| `item`, bare | `Too big for a bare hook.` |
| `item`, bent_spoon | `Too big for the Bent Spoon.` |
| `item`, cut_strip | `Too big for Cut Strip.` |
| `grade`, a lure | `It wants a better lure.` |
| `grade`, a bait | `It wants a better bait.` |

Murk says one once-line at home after the first trip with a cap loss: `TEXT_LOOP.murk.firstAway = 'Lost a big one? Better gear holds them.'`.
This is the one exception to WATERCRAFT §7.1's "no note" (§8, question 1).

---

## 5. The ladder (prices ×2, as the shelf has them; tins now 20)

| buy | price | what it raises or opens (the standard fish first) |
|---|---|---|
| (start) Bent Spoon | free | perch, bass, chub, Milkeye, trout up to Keeper |
| (start) Mire Worms × 10 | free | the worm fish up to Prize on Twine |
| **Line T1** | 100 | **every grade-3 fish Prize → Trophy** (the worm fish, and each lure's right fish). The first buy, trip 3 |
| Mire Worms, a tin | **20** (`LOOP.baitRule.grade` 1.5 → 3: tins follow the ×2) | keeps the worm caps; without it the bare hook drops to Keeper |
| Lumen Moss, a tin | 20 | carp and koi up to Trophy; minnow, chub, Lampsipper up to Prize; the Gloam Eel |
| Feather Fly | 100 | chub and Lampsipper up to Trophy; minnow, bass, trout up to Prize |
| Glimmer Spoon | 180 | **the Reedjaw Pike and the trout up to Trophy**; opens the Thousandcast (Prize) and the lamprey (Keeper) |
| Bone Jig | 220 | perch, bass, Milkeye up to Trophy; pike, trout, Thousandcast up to Prize |
| Harbour-Bell Spinner | 360 | **both pikes and the lamprey to the top** (Elder at their places, with Line T2) |
| Line T2 | 600 | Elders where the water allows (Under the Span, the giants at home) |

**Shelf lines** (`TEXT_LOOP.shelf`, each 8 words or fewer, no odds). The ones that change:

| key | today | now |
|---|---|---|
| `line` (every Line tier) | Holds the long runs. | **Lands bigger fish.** |
| `glimmer_spoon` | Flash, for the hunters. | **Flash, for pike and the big hunters.** |
| `bone_jig` | Hopped on the bottom, for bottom feeders. | **Hopped deep, for big perch and bass.** |

Kept: Mire Worms "Nearly every fish takes a worm."; Lumen Moss "For the Gloam Eel and the Candlefin Koi."; Feather Fly "For Dusk
Minnows, Chub, Lampsippers and Koi."; Spinner "For the Mossmere's giants.". The Bent Spoon is never on a shelf page.

### 5.1 Where the player can see a gate or a cap (logs only)

| place | what | words |
|---|---|---|
| the Journal's species page (`catalogueFor` → `ui-loop.catalogueView`), a met fish | the best cap over owned hooks (owned lures, tins with any in the bag, Cut Strip, the bare hook) at the owned line; if no owned hook takes it, the cheapest M1 item that does | `Lands up to {Class}.` / `Needs {item}.` (`TEXT_LOOP.gate.upTo`, `.needs`; {item} from `gearItems` with "the": "Needs the Glimmer Spoon.") |
| the sheet's Who bites / Your odds (`loop-sheet.js`) | a class over the picked hook's cap reads **"—"** (its land chance is 0), as a class the fish cannot roll already does | none new |
| the sheet's pinned fish row | the cap at the picks | `Lands up to {Class}.` |
| the gear log's item line (WC-3's `+{n} Hold …`) | a second line on the three capped items and on the Line slot | `Lands up to {Class}.` |
| the water | the got-away line (§4.3) | §4.3 |

Never on the shelf, the HUD's tins, the float or the Chart.

---

## 6. Pacing (M1 §6.4), measured

The scratch sim is `clams.mjs` with a patch applied (kept outside the repo, in the session's scratch folder `gear-gates/patch.mjs`, with `clams-gear.mjs`). The patch adds the hook edits, the Bent Spoon, `gearCap`, the
bare wait (×2.07 on the sim's 7.5 s, the game's 17.4 / 8.4) and its favour, the Bent Spoon's retrieve (wait ×1.3: 12 s to a strike
against 9.3), a cap loss as a plain lost fish (the bite is spent), tins at 20, the start kit, worms from minute 0, and a buying-order
change: **Line T1 first, Hold 4 after the Lily Maze, Hold 5 after the Glimmer Spoon**. The run is full (not `--quick`), ×2.

| | today | **this design** | target |
|---|---|---|---|
| first buy | Hold 4, trip 7, 25 min | **Line T1, trip 3, 8 min** | trip 3–5 |
| bought by 10 min / 1 h | 0 / 7 | 1 / 7 | 0–1 / 4–9 |
| Bent Spoon | — | minute 0 (start) | |
| Glimmer Spoon | 101 min | **78 min** | |
| Bone Jig | 104 min | 103 min | |
| Feather Fly | 112 min | 115 min | |
| Harbour-Bell Spinner | 120 min | 127 min | |
| **the empty shelf (end of Lake 1)**: blind · reader · stalker-reader | 4.29 · 3.91 · 3.82 h | **5.28 · 4.65 · 4.67 h** (317 · 279 · 280 min) | 4.5–7.5 h |
| longest wait for one buy | 38 min (Hold 5) | 37 min (Hold 6) | ≤ 40 |
| first giant home | 2.4 h | 2.3 h | 0.5–3.5 |
| trips | ≤ 4.3 min | ≤ 4.8 min | ≤ 6 |
| the list, p95 / p99 | 37 / 43 min | 44 / 52 min | ≤ 60 / 75 |
| place maps a minute | +21 / +32 / +11% | +28 / +20 / +7.2% | ≥ 5% |
| per Wick (`--wicks --quick`; run before the crayfish cell of §3, which left the no-passive run unchanged) | 3.77–4.02 h (mean 3.89), 21 checks fail | **4.44–4.88 h (mean 4.66)**, 12 fail | each 4.5–7.5, ±10% of the mean |

Still failing with this design (fixes noted):
- **"A tin is worth fitting" +232% a minute** (band +3–25%). By design a tin is now how fish grow, so the band goes: the check
  becomes "a tin earns ≥ 1.3× its price" (3.8×, passes).
- **Hold steps pay their way**: Hold 4 −7%/min (Hold 5 already fails today). The cap makes a bigger hold slower to fill with
  big fish. The user set the Hold prices, so this one is theirs.
- `--wicks`: Taper's shelf at 4.44 h (1.3% under), the Wick's first buy after trip 2, and the Buoy Lights +2.7–3.4% for Taper, Stub
  and Ashwick (Taper already failed this at +3.2% today). Ashwick's first-trip comeback floor passes (1.25), thanks to `ashwick: 'cap'`.

---

## 7. The build, item by item

| # | file | change |
|---|---|---|
| 1 | `src/watercraft.js` | `HOOK_ITEMS` and `LURE_IDS` + `'bent_spoon'` (a 9th `HOOK_ROWS` cell for each fish, §2.1); the seven cell edits (§2.2, §3); new pure `gearCap(D, fishId, {lure, bait, line})` (§4.1), exported |
| 2 | `src/data.js` (loop blocks only) | `LOOP.start`, `LOOP.bare`, `LOOP.gearCap`, `LOOP.lures.bent_spoon`; `LOOP.baitRule.grade` 3; the loop-only `LURES` and `CATCH_V3.items` entries for `bent_spoon`; `TEXT_LOOP.gearItems.bent_spoon`; `TEXT_LOOP.gate = { upTo: 'Lands up to {class}.', needs: 'Needs {item}.', away: { line, bare, bent_spoon, cut_strip, lure, bait } }` (§4.3); `TEXT_LOOP.murk.firstAway`; the three shelf lines (§5) |
| 3 | `src/fishing.js` | `rollBite`: the bare wait multiplier; `baseTerms`: the bare favour term; `rollSize`: `S.overCap`, or the evening-1 cap; the strike: `S.p = 0` and its cause; `sendGotAway`: `overCap` on the event |
| 4 | `src/ui-hud-v3.js` | the got-away line in the "Hook set" slot on `fish:escaped` with `overCap` (2.5 s), clamped inside the safe area |
| 5 | `src/progression-loop.js` | `freshLoop` from `LOOP.start`; `migrateLoop` adds the Bent Spoon; the shelf skips `start` lures; `onEscaped` gives Ashwick's comeback at the cap; `sayOnce('firstAway')` |
| 6 | `src/loop-sheet.js`, `src/ui-sheet.js`, `ui-loop.catalogueView` / `catalogueFor`, WC-3's gear log | §5.1's lines and the "—" cells |
| 7 | `src/ui-tackle.js`, the lure model | the Bent Spoon in the Lure row; its dull mesh |
| 8 | `tools/sim/clams.mjs` | port the patch (§6); the tin check's new band; a report of cap losses per trip by kit |
| 9 | `tools/validate-data.mjs` | the `gearCap` totality check (GG2); the existing stray, "every pool bites" and "every fish caught" checks |

### 7.1 Tests to add (`tools/tests/gear-gates.test.mjs`)

| id | what |
|---|---|
| GG1 | `gearCap` table: worms + Twine → Mossback `prize` by `line`; worms + T1 → Mossback `trophy`; Bent Spoon + T2 → Bass `keeper` by `item`; Glimmer + T1 → Reedjaw `trophy`, Thousandcast `prize` by `grade`; bare → Minnow `keeper`; the Matriarch → `null` |
| GG2 | totality: every Mossmere fish but the legend reaches its built top on some M1 hook at Line T2 (with `capZ`: 47 seals, 15 Elders) |
| GG3 | the hook table: the seven edited cells and the Bent Spoon column; every stray ≤ 1.00% in every pool (`castOdds`, the sim's exact check); S > 0 everywhere |
| GG4 | `freshLoop`: the Bent Spoon owned, 10 Mire Worms in the Mossmere's bag, worms fitted; `migrateLoop` adds the spoon to an old save and no bait; the shelf never lists `bent_spoon` |
| GG5 | `fishing` with a seeded fish forced over the cap: `S.p === 0`, outcome lose, cause `snap` for `line`, still four draws; evening 1 → it lands at `classMaxZ[cls]`; a legend or a find is untouched; Ashwick's stored comeback z ≤ the cap |
| GG6 | the bare hook: wait ×2.5 before the clamp on a trip (not a legend cast, not the tutorial); the `bare` favour term on a trip only; the flag-off game is unchanged (`validate-data --v3` fingerprint) |
| GG7 | words: every `TEXT_LOOP.gate` line ≤ 6 words and names no species; the three shelf lines ≤ 8 words; `textAllowed` lists them; the got-away line fits on one line at 358 × 664 and 1280 × 720 with no overlap of the float or the tackle tin |
| GG8 | the sheet: a class over the cap reads "—"; the catalogue line for a met fish matches `gearCap` over owned hooks |
| GG9 | T104 still holds (the game's pool is the sim's, every hook including `bent_spoon`) |

---

## 8. Risks, and questions for the user

| # | risk | knob |
|---|---|---|
| 1 | **Cap losses could annoy.** On the Bent Spoon about 1 hooked fish in 5 gets away (bare 1 in 7, worms on Twine 1 in 9). After Line T1 it is 1 in 11–20 | `LOOP.gearCap.item`, `LOOP.bare.favour`, the Bent Spoon's favour |
| 2 | **The got-away line reverses WC-3's "nothing on a loss"** for cap losses only. It names gear, never the fish | Question 1: keep the line, or keep only the splash and Murk's once-line |
| 3 | The sim's player leaves the bare hook and the Bent Spoon at once, so their caps barely move the pacing; the line cap and the grade caps do. A real player who lingers on the spoon earns less early | the first browser tally of two trips (WATERCRAFT §8.4) |
| 4 | The sim treats a lure as a bait with a longer wait. The Bent Spoon's ×1.3 is from the strike rates, not measured in play | re-measure in the browser |
| 5 | Tins double (10 → 20) through `baitRule.grade`. This departs from WC-1's "consumables at base", but matches the user's ×2 | `LOOP.baitRule.grade` |
| 6 | Hold 4 loses 7% a minute when bought. The Buoy Lights pays +2.7–3.4% for three Wicks, because the lamprey is now gated. Taper is 1.3% under the band | Hold prices are the user's; the Buoy Lights' 260 base; Question 2 |
| 7 | The buying order moves (Line T1 first). The sim's ORDER is a sensible player, not a rule, but `M1.md` §6.2's tables quote the old order | update M1 §6.2 at the port |
| 8 | The crayfish-on-worms edit (×2.5, was ×1.6) shifts the worm pools. validate-data's leap and bite ambiguity rules (`AUTOFISH` biteRule, maxShare) must be re-run; the sim's watercraft checks pass | GG3, `validate-data --loop` |
| 8b | The fingerprint: `LURES` and `CATCH_V3.items` change only in the loop's apply block (SHEET §8.1's way). `catchParts`' text is untouched: the cap is `S.p = 0` in `fishing.js` | `validate-data --v3` |
| 9 | Text: "Too big for the Bent Spoon." is about 27 characters in "Hook set"'s 8-character slot. It can run off the screen when the float sits near an edge | GG7, clamp to the safe area |

**Questions** (each with the default this document builds):
1. The got-away line on a cap loss: **yes** (default) / no, only the splash and Murk's once-line.
2. Gate the Hullkiss Lamprey behind a bought lure (**yes**, default; the Buoy Lights pays less) / keep it on Cut Strip up to Prize.
3. Tins at 20 (**yes**, default) / back to 10 (the shelf would end about 3% sooner).

---

## 9. Built (gw-gear, 17 November 2026)

Built item by item as §7 lists it, on 4049c61 with this document merged. Where the build differs from the text above:

- **Tins stay 20, not 40.** The game's shelf already prices a tin at Murk's factor (20 at ×2: `shelfItems` doubles every card), so
  `LOOP.baitRule.grade` stays 1.5; raising it to 3 would have made a tin 40. The sim now prices a tin at the factor on M1 (`tinK`),
  which is what §6's "tins at 20" measured. Question 3 is then already answered as built.
- **The line's cause is `snapped`**, the play's own key (`AUTOFISH.loss`); `thrown` otherwise, as §4.2 says.
- **No lure mesh exists** (a cast shows the float only), so the Bent Spoon has no model to dull; its glyph and engraving are the
  spoon's.
- **The Heartmoss Ball away from her pool is a bare hook** for the cap, the favour and the wait (fishing's rule for every fish but
  her); at her pool her cast is a legend's and none of the three applies.
- **A cap loss spends its bite**, as any lost fish does in the game (the scratch patch had refunded it). The sim does not model
  evening 1's soft cap (it measures kits, not one evening).
- The got-away line is ui-hud-v3's `showGearAway` (2.5 s, italic 21 px, 19 px on a phone, clamped 16 px inside the screen's sides);
  Murk's `firstAway` follows the first sale (or comes alone after an empty hold); the Journal's line is `progression-loop.gateLine`.

Measured (`clams.mjs --shipped=mossmere`, full, ×2; `--wicks --quick`), beside §6's scratch figures:

| | §6 (scratch) | built |
|---|---|---|
| first buy | Line T1, trip 3, 8 min | Line T1, trip 3, 8 min |
| bought by 10 min / 1 h | 1 / 7 | 1 / 7 |
| Glimmer Spoon · Bone Jig · Feather Fly · Spinner | 78 · 103 · 115 · 127 min | 75 · 100 · 112 · 124 min |
| the empty shelf: blind · reader · stalker-reader | 5.28 · 4.65 · 4.67 h | **5.26 · 4.56 · 4.60 h** |
| longest wait · first giant · trips | 37 min · 2.3 h · ≤ 4.8 min | 37 min (Hold 6) · 2.3 h · ≤ 4.5 min |
| the list p95 / p99 | 44 / 52 min | 45 / 53 min |
| place maps a minute | +28 / +20 / +7.2% | +26.5 / +19.1 / +5.9% |
| per Wick | 4.44–4.88 h (mean 4.66) | 4.40–4.88 h (mean 4.62), each within ±10% |
| cap losses per hooked fish (Hold 3): bare · worms · Bent Spoon · strip · worms on T1 | 14 · 11 · 19 · 11 · 5% | 14 · 10 · 19 · 12 · 5% |

Still failing, as §6 foresaw: the Hold steps (Hold 4 −6.9% a minute when bought; the user's prices); per Wick, Taper 4.40 h and
Ashwick 4.45 h just under 4.5, the first buy after trip 2 for the Wick, Taper, Tallow and Ashwick, and the Buoy Lights +2.2–2.8% for
Taper, Stub and Ashwick. The tin check's band is now "earns ≥ 1.3× its price" (3.8×). Tests: `tools/tests/gear-gates.test.mjs`
(GG1–GG9), with the hook-table, sheet, lost-fish and evening suites updated where the start kit or the cells changed what they read;
`validate-data --loop` checks the caps' totality, the start kit and "the bare hook takes the commons alone".

Browser (`loop-1a.scenario.mjs` main pass, a dev build, desktop 960×540 and `--mobile` 820×900): the first trip sails with the
worms on the hook (the tin reads 10, then 9, 7); on evening 2 a Trophy perch on worms and Twine hooks and gets away with "Too heavy
for your line." in the strike word's slot, one line, inside the screen and clear of the tackle tin, nothing lost from the hold; the
Journal's Dusk Minnow page reads "Lands up to Prize." under its class. The runs' other failures are older than this build: the goal
line expects PLAN §0's "Hold 4" where the shelf's cheapest card is now Ashwood at 100 (Hold 4 is 400), and at 820 px `--mobile` the
New Descent cards are the desktop row (T59's phone grid is for narrower screens).
