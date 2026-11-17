# Lost tackle: old fishing gear from the water, its notebooks, and the brook behind the Veil (the Mossmere; design v1)

*17 November 2026. Built on `FINDS.md` revision 3 (finds as built in step 5c: `src/loop-finds.js`, `LOOP.finds`) and
`GEAR-GATES.md` v1 (branch gw-gear-design; the build is gw-gear). No game code is changed here. The timing figures come from a
Monte Carlo of the snag draw over GEAR-GATES' measured M1 timeline, and the pacing figures from a scratch copy of
`tools/sim/clams.mjs` with GEAR-GATES' patch and this document's terms applied (§7). Both scripts are kept outside the repo, in the
session's scratch folder (`tackle/mc2.mjs`, `tackle/tk-patch.mjs`). The builder ports them (lane L6).*

## 0. The user's words, and what each becomes

> "We should also be able to fish up old lost fishing equipment. Rods, lures, reels, notebooks etc. These should be rare and have
> stats that you physically can't have in the game unless you find those items. The notebooks could increase catch odds of certain
> species, even ones that aren't actually on the lake or river your on. The notebooks could also reveal secret streams just off your
> current water that again you couldn't otherwise access" (17 November 2026)

| words | becomes |
|---|---|
| "fish up old lost fishing equipment" | **lost tackle**, a fourth kind of find beside treasures, barge parts and looks. It comes up as a snag, with the haul, the show and the card that every find already has (§2) |
| "Rods, lures, reels, notebooks" | the Mossmere's set of six: a rod, a reel, a line, a lure and two notebooks (§3, §4). There is no hook slot in the game, so there is no found hook |
| "rare" | each piece is **1% of the Mossmere's snags**, the same share as the jackpot, so no find is rarer and none is commoner. One soft guarantee brings the first notebook at about hour 1 (§2.2) |
| "stats that you physically can't have … unless you find those items" | each piece has **one** stat that nothing on Murk's shelf gives, in this water or any later one: a 26 m cast, the quickest reel, quicker bites, a lure that most fish take. Each pays for it with a trade-off, so the shelf's ladder still matters (§3) |
| "notebooks could increase catch odds of certain species" | a notebook you own raises its species' share of the bites wherever they already live (§4.1) |
| "even ones that aren't actually on the lake" | each notebook brings one fish from another water into the Mossmere, at a low rate and in one area: the Rosefleck Trout from Glasswater Vault, and the Nightbloom Carp from Sporewood Pools (§4.2) |
| "reveal secret streams just off your current water" | the last pages of the Veil Angler's Notebook show **Veilback Brook**, a short stream behind the Sluice Veil on the east cliff. It is drawn on the Chart and can be sailed to only once the notebook is home (§5) |

What stays as it was. A find never gets away and never costs a clam. Kept stays kept. Odds show only in the logs: the Journal, the
gear log and the water's catalogue (FINDS' revision 3). A find never counts toward the catch key, a record of the Mossmere's list,
an order or a Wick's firsts. Nothing human ever comes up: the owners live only in one line of text each.

---

## 1. In one breath

Now and then the heavy, slow line of a snag brings up something that was somebody's own: a long lamplighter's pole cut down
into a rod, a reel ground from a belfry clock, a spool of thread spun on the ferry, a guard's brass button drilled for a hook,
or a swollen notebook tied with string. The card says, in one plain line, what it does. At home it hangs on the barge's rack, or
lies open on the chart table, and the tackle tin can fit it in place of what you bought. One notebook's last pages are a map.
The next time the Chart opens, a short brook has been inked in behind the falling water on the east cliff.

---

## 2. Lost tackle, the fourth kind of find

### 2.1 The rules

| rule | value |
|---|---|
| **what it is** | `kind: 'tackle'` in `LOOP.finds.items`, with a `slot`: `rod`, `line`, `reel`, `lure` or `notebook` |
| **how it comes up** | a snag, as every find does (1 bite in 20; never on evening 1, the tutorial or a legend's cast). No new verb and no new minigame |
| **the haul and the show** | FINDS §6.1–§6.2 as built: the slow wind, never lost, the find pose (`pinch` for the button, `both` for the reel, the line and the notebooks, `alongside` for the 3 m pole, which is brought along the raft's side) |
| **the card** | FINDS §6.3's card. In the kind stamp's place is a small **hook** (the fourth stamp beside the coin, the hull and the ribbon). Under the name is **one plain line saying what it does** (§6). **Keep** shows the glyph of where it goes (the rack, or the chart table for a notebook) and no price. **Let go** drops it back, and it may come up again |
| **the hold** | it takes one slot until the tally, as a part does. Its slot is its price |
| **the tally** | carried aboard after the parts and the looks, with a soft wooden knock and its name in dim ink. It is never sold |
| **found once** | once owned (`meta.loop.finds.got[id] ≥ 1`) it leaves the draw for good, as a part does |
| **where it is kept** | the rod, line, reel and lure hang on the **barge's gear rack** (the Gear Bench rack that switches models by tier, SPEC's rack target), each as a merged variant of the rack mesh, so the home's draw calls do not grow. The notebooks lie on the **chart table** (5b's chart table top). Both appear in the gear log under their slot, and in the catalogue's finds row (§6.2) |
| **how it is fitted** | **the rod, line and reel**: the slot keeps the tier you bought. A fitted piece stands in for it, and taking the piece off puts the tier back, so nothing bought is ever lost. **The lure** is owned like a bought lure and goes on the hook from the tin's Lure row. **A notebook** works while you own it (it is carried in the Wick's coat) and needs no slot and no choice |
| **the tin's Kit row** | the tackle tin's drawer (`ui-tackle.js`) gets a third row, **Kit**, shown only once a found rod, line or reel is owned. It has one chip per owned piece, its engraving and its name, pressed while fitted. A tap fits it, and a tap on a pressed chip takes it off. The rules are those of the Bait and Lure rows (`changeHook`'s): at home, or on the lake when no fish is on ("After this fish.") |

### 2.2 The rates (`findShares` gains one term)

Each unowned lost-tackle piece is **1% of the water's snags** (`LOOP.finds.tackle.each`), taken from the plain and fine
treasures in proportion, as the parts' share is. The precious, rare and jackpot grades stay where they are (12, 4 and 1%).

**The soft guarantee** names one piece, **the Veil Angler's Notebook** (`guarantee.item`). While it is unowned, every snag at
the Mossmere that does not bring it up raises its share by **5 points**, to at most **40%**
(`meta.loop.finds.tackleMiss.mossmere` counts those snags). The other five stay at 1% throughout. This is chosen over "the first
piece, whichever it is", because the notebook carries the brook (§5): under a plain guarantee only 33% of players would see the
brook in Lake 1, and under this one 99.98% do (§7.1). The rod, reel, line, lure and the second notebook stay truly rare: each
comes to about 1 player in 4 during M1.

The parts' and looks' share is clamped so that the two never take more than the plain and fine treasures can give:
`kindShare = min(kind.cap, saved, LOOP.finds.tackle.partCap − tackleShare)`, with `partCap` 0.80. `tackleShare` is at most
0.40 + 5 × 0.01 = 0.45, so `kindShare` never falls below 0.35, its base, and each part keeps at least 35% ÷ 6 = 5.8%.

**The 1% rule holds.** The jackpot is exactly 1% in every state. Each lost-tackle piece is 1% or more, so no find is rarer
than the jackpot. At the extreme, the plain and fine treasures keep 3% between them (FINDS' own floor at the cap), and the shares
sum to 1. The catalogue prints "1%" under each lost-tackle silhouette, and under the notebook its climbing share as it stands.

```
findShares(meta, D, water)            (loop-finds.js; the draw and the catalogue share it, as built)
  tackle  = unowned 'tackle' items of the water, never one already in this trip's hold
  each    = LOOP.finds.tackle.each                                    0.01
  t[id]   = id === guarantee.item ? min(guarantee.cap, each + guarantee.step × tackleMiss[water]) : each
  T       = Σ t
  K       = min(kind.cap, saved kind share, partCap − T)  (0 with no unowned part or look; split equally among them)
  plain   = 0.54 − (K + T) × 54/83        fine = 0.29 − (K + T) × 29/83        precious 0.12 · rare 0.04 · jackpot 0.01
noteSnag: a snag that is not guarantee.item while it is unowned → tackleMiss[water] += 1; bringing it up deletes the count
```

---

## 3. The Mossmere's set

### 3.1 The gear, and the shop it beats

The shop's best at the Mossmere, from GEAR-GATES' numbers and `TACKLE`: the **rod** Whalebone (T2) casts 19 m with +5 Hold, and
the best rod in the game, the Lantern-Spine (T4), casts 22 m. The **reel** Clockwork (T2) has +5 Hold, and a play's length is
`1 − 0.05 × the mean fitted tier`, so 0.90 at T2 and 0.70 at T6, the best anywhere. No **line** changes how soon a fish bites:
Twine lands up to Prize, Line T1 up to Trophy (+2 Hold) and Line T2 up to Elder (+5). A bought **lure** is "liked" (grade 2) by
at most seven Mossmere fish (the Spinner's column), and the Bent Spoon is liked by two.

| id | name | slot | the stat beyond the shop | the trade-off (why the ladder still matters) | the owner, one line (≤ 36 characters) | prop · pose |
|---|---|---|---|---|---|---|
| `lamp_pole` | **Lamplighter's Pole** | rod | **casts 26 m** (`castMax` 26). The shop's best is 19 m here and 22 m anywhere. A sign or a rise counts as in range out to 41 m (`castMax + 15`) | **+0 Hold**, the Willow Switch's (the Whalebone gives +5), and the T0 strike window. It reaches, but it holds less | "It lit the drowned buoys, once." | a long dark pole, its brass lamp-hook bent into a tip ring · alongside |
| `belfry_winch` | **Belfry Winch** | reel | **every play runs at 0.6 of its length** (`playMult` 0.6, used in place of the tier's factor when it is the smaller). The best bought reel anywhere gives 0.70 | **+2 Hold**, the Brass Spool's (the Clockwork gives +5). It is quick, but a big fish is likelier to throw the hook | "Cut from the belfry's clockwork." | a brass wheel of clock teeth on an iron crank · both |
| `ferry_thread` | **Ferrywife's Thread** | line | **bites come sooner: every wait × 0.8** (`waitMult`, in `rollBite` before the 2–25 s clamp). No line on the shelf touches the wait | **+2 Hold and lands up to Trophy**, Line T1's, never Elder (Line T2 gives +5 and Elder). It suits the standard fish and the orders, not the record fish | "Spun on the ferry between rows." | a wooden spool of pale fine thread, a ferry token tied on · both |
| `guard_button` | **Gate-Guard's Button** | lure | **most fish like it**: grade 2 for every Mossmere fish but the giants, the legend and the Gloam Eel (13 fish, and the three far guests of §4). No lure is liked by more than seven | **it is no fish's right lure**, so its grade caps it at Prize (`LOOP.gearCap.grade[2]`). It adds **+0 Hold** and strikes as slowly as the Bent Spoon (`attract` 1). It never brings a giant. It is the lure to take for the list, the orders and a new guest; the bought lures still land the Trophies | "Off a gate guard's coat, drilled." | a heavy brass button, a crest worn away, a hook through its shank · pinch |

None of the four ends the shelf. Line T1 is the first buy, at trip 3, about 50 minutes before the first find can come (§7.1).
Line T2, the Clockwork and the Whalebone each still win on Hold and on Elders. Every bought lure still lifts its own fish to
Trophy, and the Glimmer Spoon and the Spinner still open the giants.

### 3.2 The data

```js
LOOP.lostTackle = {
  lamp_pole:    { slot: 'rod',  castMax: 26, hookWindow: 1.0, hold: 0 },
  belfry_winch: { slot: 'reel', playMult: 0.6, hold: 2 },
  ferry_thread: { slot: 'line', waitMult: 0.8, hold: 2, cap: 'trophy' },       // gearCap's line term reads `cap`
  guard_button: { slot: 'lure' },                                              // its hook column and CATCH_V3 record below
  veil_notebook: { slot: 'notebook', boost: { kissmark_trout: 1.6 },
    guest: { id: 'rosefleck_trout', from: 'glasswater', areas: ['inflow'], lights: ['day', 'dusk'], share: 0.04 },
    reveals: 'veilback_brook' },
  lily_notebook: { slot: 'notebook', boost: { weeping_carp: 1.5, candlefin_koi: 1.5 },
    guest: { id: 'nightbloom_carp', from: 'sporewood', areas: ['pads'], lights: ['night'], share: 0.03 } },
};
// loop-only, in the apply block beside GEAR-GATES' bent_spoon entries (the v3 fingerprint never sees them):
LURES.push({ id: 'guard_button', name: 'Gate-Guard’s Button', depth: 'mid', attract: 1, favour: 0, price: 0, onSale: null });
CATCH_V3.items.guard_button = { kind: 'lure', hold: 0, species: [] };
LOOP.lures.guard_button = { water: 'mossmere', price: 0, found: true };        // the shelf skips `found` lures, as it skips `start`
```

**Its hook column** (`watercraft.js`: `HOOK_ITEMS` and `LURE_IDS` gain `'guard_button'`, a 10th cell after GEAR-GATES'
`bent_spoon`): 2 for the Dusk Minnow, Mossback Perch, Gutter Crayfish, Likely Chub, Overbold Bass, Rustfin Sucker, Lampsipper,
Weeping Carp, Candlefin Koi, Milkeye Perch, Kissmark Trout, Reedjaw Pike and Bridgechain Sturgeon; 0 for the Thousandcast Pike,
the Hullkiss Lamprey and the Gloam Eel; `null` for the Matriarch.

---

## 4. Notebooks

A notebook is a drowned angler's notes on a few fish. It works while you own it (the Wick carries it), everywhere those fish
are, with no slot to fill and no choice to get wrong. It does two things.

### 4.1 Its species come more often, where they already live

`boost` multiplies each named fish's weight in `hookWeights` (watercraft.js, §4 step 6) **before** `finishPool`. So the giants'
share, the 1% stray cap and "every pool bites" still apply on top, unchanged. A weight of 0 stays 0: a notebook never puts a fish
where it does not live, and never takes a fish that will not take the hook. The game's pool, the sheet's Odds, the gear log's Who
bites and the sim all read `castOdds`, so each of them shows the boost exactly (T104 holds).

### 4.2 It brings one fish from another water

`guest` adds one fish from a later water to the Mossmere's pool, **in one area and one light only**, as a fixed share of the cast
there. This is the giants' share's mechanism (`finishPool`): `p = share × [0, 0.5, 1, 1.5][grade]`, and the rest of the cast is
scaled by `1 − p`. Grade 0 means it never bites on that hook: it is absent, not a stray. The guest is never a stray, and the 1%
rule is untouched. A guest **sells at the Mossmere's tier** (`fishClams(sp, z, {tier: LOOP.waters.mossmere.tier})`): Murk pays
what this water pays, so a far fish is a wonder, not a jackpot.

| notebook | its notes | brings (from) | where and when it may bite | its hook (bare · worms · moss · strip · fly · spoon · jig · spinner · Bent Spoon · button) |
|---|---|---|---|---|
| **The Veil Angler's Notebook** (`veil_notebook`) | Kissmark Trout ×1.6 | **Rosefleck Trout** (Glasswater Vault, uncommon, trout plan): "Blunt-nosed and rose-flecked, like something pressed in a book." | the **inflow** under the Sluice Veil (cold aqueduct water), day and dusk; 4% of a cast there, 6% on the Feather Fly; also Veilback Brook's own fish (§5) | 0 · 1 · 0 · 2 · 3 · 2 · 1 · 1 · 1 · 2 |
| **The Lily Gardener's Notebook** (`lily_notebook`) | Weeping Carp ×1.5, Candlefin Koi ×1.5 | **Nightbloom Carp** (Sporewood Pools, rare, carp plan): "By day it is just a carp, and a little embarrassed about it." | the **lily beds** (the `pads` area's four beds) at night; 3% of a cast there, 4.5% on Lumen Moss | 0 · 2 · 3 · 0 · 0 · 0 · 1 · 0 · 0 · 2 |

The owners' lines (≤ 36 characters): the Veil Angler's, "Fished the Veil every day, it says."; the Lily Gardener's, "Every carp in the moat, by name.".
The props: a swollen leather notebook tied with string, its pages wavy (the Veil Angler's has a folded map sticking out); a
smaller cloth-bound one with a pressed lily (the Lily Gardener's). Both use the `both` pose.

**The guests in the Journal.** A guest has its own species record, made by the roster converter from `docs/loop/roster.json` with
its home water as `zone` and `guestOf: 'mossmere'`. Its Journal entry is keyed by its id, as every entry is, so when its home water
ships the entry is already there. In the Mossmere's catalogue, the guests follow the water's own fish, each with a small
notebook glyph in the corner of its cell and no words. A guest shows only once its notebook is owned, or once met. A guest never
counts toward the Mossmere's list, its catch seal or M1's 47 class seals. Its class seals are kept on the species and count when
its home water ships. **Models**: the Rosefleck and the Rainglass Darter use the built trout plan's parameters (if the Darter's
tall sail fin is not among them, it is the plan's one new parameter); the Nightbloom uses the built carp plan, with a faint
lavender glow along its flank at night.

---

## 5. Veilback Brook, the stream behind the Veil

### 5.1 What it is

Behind the Sluice Veil, the falling water on the east cliff at (58, 4), the old aqueduct once fed the moat through a stone cut.
The cut is still there: a brook about 6 m wide that runs 18 m back into the cliff, between reed banks, under the aqueduct's
broken arches, to a low culvert where the water spills out of the hill. It is still, cold and close. The cliff walls rise on both
sides, the reeds lean in, a single lily bed lies where the brook widens, and the mist hangs low at the culvert. The candle is the
warmest thing in it. Nothing new is lit: the light is the lake's moon and sky, and the palette is Clear Night's (lavender, pale
stone, rust; green only as the reeds' trace).

**Its fish** (a place's own pool, `LOOP.places.veilback_brook`):

| fish | from | in the brook |
|---|---|---|
| **Rosefleck Trout** | Glasswater Vault (guest), uncommon | its own fish (`own`), day and dusk. Its main home in M1 |
| **Rainglass Darter** | Glasswater Vault (guest), rare | its own fish, day and dusk; found only here in M1. "Carries the last rain on its sail and will not let it dry." Hook: Feather Fly 3, worms 1, button 2, every other 0 |
| Dusk Minnow · Kissmark Trout | the Mossmere | drawn in (`draws: { dusk_minnow: 1.5, kissmark_trout: 1 }`), so the night brook still bites |

It gives **1 good bite an evening** (`good: 1` on the place, read by `goodBitesFor`: a short brook, and the measured choice, §7.2).
Its favour is a day place's (+0.15 + 0.4). It holds no giant and has no rule. Its size cap is GEAR-GATES' cap as on every water.

### 5.2 How it is revealed and reached

1. **Before the notebook**: the cut is built, but the raft cannot pass the Veil (a collision disc at the mouth), a standing bank of
   mist fills the mouth behind the falling water, and a cast into the cut lands short, at the bank, as a cast onto land does.
   Nothing on the Chart shows it. The built rumour already hints at it ("Sail into the Sluice Veil. It is only water.").
2. **The notebook comes home**: at the tally it is carried aboard. As home opens, the camera holds 1.2 s on the chart table where
   it lies open at its map (reduced motion cuts to it). Murk says one once-line: `TEXT_LOOP.murk.brook = 'Water behind the Veil. Always said so.'`
3. **The Chart**: the next time it opens, the Mossmere's sheet inks the brook in over 1.2 s (`chart-gild.js`'s ink step;
   reduced motion shows it drawn). The shore line opens at the Veil and a thin double line runs off the sheet's east edge, with
   the reeds hatched and the name in the Fell italic, **Veilback Brook**, drawn as a place site with its leader like the other
   four. It is free: no map card and no price. Tapping it picks it, and Sail goes there.
4. **The sail**: the glide runs through the Veil (a splash, the falling water loud for a second, a little spray on the lens), and
   the mist bank lifts, as a place's does on its first evening. From then on the mouth is open for good.

### 5.3 The smallest world build

The engine already has a shore notch (`arena.shoreNotch`, CONTRACT §13.8, built for the Landing's cove: "the cliff ring and its
collision open over that width"), and the Moon Cistern's old record (`data.js` `secret: true`) designed exactly this cut at angle 0.
So the brook is **a notch and a place**, not a new scene:

| piece | build | calls |
|---|---|---|
| the cut | `ZONES[0].arena.shoreNotch = [{ a: 3.9, w: 6, depth: 0.6, len: 18 }]`, always built, so the world is one deterministic geometry and nothing rebuilds at the reveal | 0 (terrain) |
| the Veil | the curtain card widened from 2.6 m to 6.4 m, so it covers the mouth. It is the same scrolling shader | 0 |
| hidden until revealed | a keel-style collision circle at the mouth and a standing mist bank (world-places' `BANK`) over the notch's footprint. `world.setPlaces` lifts both when `veilback_brook` is revealed. `fishing.js`'s land test treats an unrevealed secret place's footprint as bank | 0 (merged into the banks' mesh) |
| the water | the inflow's flow seam (watercraft-face's baked B mask) extended up the cut, so the water slides toward the lake | 0 |
| the banks | one more reed arc pair along both sides (WC-3's reed InstancedMesh, about 60 stems) and one lily bed of 8 pads (the pads' InstancedMesh) | 0 (instances) |
| the head | a low culvert arch built with the aqueduct's own `arch()` extrude, with a second small veil card (1.6 m) spilling from it, merged with the aqueduct | +1 at most |
| sound | the inflow's trickle (`audio-mossmere` WATER_VOICES) placed at the culvert as well | — |
| the place | `LOOP.places.veilback_brook = { water: 'mossmere', kind: 'day', secret: true, revealedBy: 'veil_notebook', price: 0, good: 1, own: ['rosefleck_trout', 'rainglass_darter'], draws: { dusk_minnow: 1.5, kissmark_trout: 1 } }`; `MOSSMERE_V3.places` gets its geometry `{ id: 'veilback_brook', name: 'Veilback Brook', water: { kind: 'path', pts: [[60, 4.1], [75, 5.1]], w: 5, depth: [0.5, 0.7] }, landmark: { x: 74, y: 2, z: 5 }, lore: 'Behind the falling water, the old cut still runs.', look: 'a reed-banked brook under broken arches' }` | — |

**Risks to check in the browser**: the play camera between 16 m walls (the cove's notch is proof it works, but it is wider), and
the Veil hiding the cut at every screen shape before the reveal (358 × 664 and 1280 × 720, day and night).

**W-lite, if lane W must wait** (S): no notch. The brook is a 5 m disc place at the Veil's foot (54, 4) with the same records,
revealed and drawn the same way, with the Veil and its spray as its landmark. Its fish and its Chart line ship, and the cut
follows later with no change to the save (the place id stays the same).

---

## 6. How the player learns what a piece does

### 6.1 The words

Every line is ≤ 8 words and ≤ 36 characters (FINDS' rule), with no numbers outside the logs.

| key (`TEXT_LOOP.finds.items[id]`) | name | `does` (the card's one plain line) | `line` (the owner's, in the catalogue and the log) |
|---|---|---|---|
| `lamp_pole` | Lamplighter's Pole | Casts farther than any rod sold. | It lit the drowned buoys, once. |
| `belfry_winch` | Belfry Winch | Brings every fish in quicker. | Cut from the belfry's clockwork. |
| `ferry_thread` | Ferrywife's Thread | Fish bite sooner on it. | Spun on the ferry between rows. |
| `guard_button` | Gate-Guard's Button | Most fish take it. Never giants. | Off a gate guard's coat, drilled. |
| `veil_notebook` | The Veil Angler's Notebook | Trout notes, and a hidden water. | Fished the Veil every day, it says. |
| `lily_notebook` | The Lily Gardener's Notebook | Carp notes, and one far carp. | Every carp in the moat, by name. |

Other words: `TEXT_LOOP.tackle.kit = 'Kit'` (the tin's third row); `TEXT_LOOP.murk.firstTackle = 'Somebody fished here before you.'`
(once, at the first piece's tally); `TEXT_LOOP.murk.brook` (§5.2); the place name **Veilback Brook**.

### 6.2 Where the full effect is (logs only)

| place | what it shows |
|---|---|
| **the card** | the name, the `does` line, the hook stamp, Keep (with the rack or chart-table glyph) and Let go. Nothing else |
| **the catalogue's finds row** (FINDS §6.5) | a fourth short row, **tackle**, with the six pieces: hatched silhouettes with "· · ·" and "1%" under each until found (the guaranteed notebook shows its share as it stands), then in ink with a tick. Tapping an owned piece shows its drawing, the owner's line and its effect lines below |
| **the gear log** (WC-3's item lines) | under its slot, the owned piece and its effect lines, in the log's built style: `Casts 26 m.` · `Plays 0.6× as long.` · `Bites come 20% sooner.` · `Liked by 13 fish here.` with GEAR-GATES' `Lands up to {Class}.` and `+{n} Hold …` lines beside them. For a notebook: `{Fish} come more often.` for each boosted fish, `{Fish} bite at {where}, {lights}.` for its guest (`where` from the area's name, "the Sluice Veil" or "the lily beds"), and `Shows the way to Veilback Brook.`. Its **Who bites** table already reads `castOdds`, so the boosted and guest shares print there as numbers, as every share does |
| **the sheet** (Who bites / Your odds) | the guests' rows, with the notebook glyph, at their areas and lights; the boosted fish's shares as they now stand |
| never | the HUD, the float, the tin's chips (names and engravings only), the shelf, the Chart |

`TEXT_LOOP.lost.log = { cast: 'Casts {m} m.', play: 'Plays {x}× as long.', wait: 'Bites come {p}% sooner.', likes: 'Liked by {n} fish here.', boost: '{fish} come more often.', guest: '{fish} bite at {where}, {lights}.', reveals: 'Shows the way to {place}.' }`.

---

## 7. Pacing (M1 §6.4)

### 7.1 When the pieces come (Monte Carlo of the draw, 20,000 players)

The model is §2.2's draw over GEAR-GATES' measured blind-caster timeline (84 trips to the empty shelf at 5.28 h; Hold 3 → 6 at
the hours it is bought; 4.1 bites a trip at Hold 3, in proportion above; 1 snag in 20 bites; none on evening 1).

| | figure |
|---|---|
| snags at the Mossmere by the empty shelf | 26.9 on average (p10 20, p90 34) |
| **the first piece** (in practice the Veil Angler's Notebook) | p10 0.31 h · **p50 1.02 h** · p90 2.06 h · p99 3.27 h. By 1 h 49%, by 2 h 89%, by 3 h 98%, by the empty shelf 100% |
| the Veil Angler's Notebook, so the brook | p50 1.18 h; **99.98% by the empty shelf** (a plain guarantee on any first piece: 33%) |
| pieces owned at the empty shelf | 2.18 on average: one 26.5% · two 39.6% · three 25.1% · four 7.6% · five 1.2% · all six 0.1% |
| each other piece by the empty shelf | about 24% (1% of about 27 snags) |

The first lost tackle comes after the first buy (Line T1 at trip 3, 8 minutes) for every player, and inside Lake 1 for every
player. The rod, reel, line, lure and second notebook stay rare: the user's "rare".

### 7.2 What it does to the shelf (scratch clams.mjs, `--shipped=mossmere --quick`, ×2)

The scratch adds Veilback Brook as a free day place from the notebook's hour, and the Thread's wait × 0.8 and the Winch's
play × 0.6 as terms on the trip, each fitted from an hour. The Thread and the Winch run **without their trade-offs** (their Hold
loss and the Thread's Trophy cap are left out), so those rows are upper bounds. `--quick` puts today's empty shelf at 4.64 h,
where the full run gives 5.28 h; the comparisons below are within `--quick`.

| case | the empty shelf: blind caster · reader · stalker-reader (h) | against today |
|---|---|---|
| today (GEAR-GATES only) | 4.64 · 4.20 · 4.18 | — |
| the brook from 1.18 h with **2 good bites** (a day place's) | 4.38 · 4.13 · 4.12 | −5.6% · −1.7% · −1.4% |
| **the brook from 1.18 h with 1 good bite (this design)** | **4.56 · 4.26 · 4.26** | **−1.7% · +1.4% · +1.9%** |
| the design + the Thread and the Winch both fitted from 3 h, no trade-offs (a lucky player, upper bound) | 4.42 · 4.12 · 4.14 | −4.7% · −1.9% · −1.0% |
| the Thread alone from 0.5 h, no trade-off | 4.27 | −8.0% |
| the Winch alone from 0.5 h, no trade-off | 4.38 | −5.6% |
| the brook (2 bites) at 0.31 h + both from 0.5 h (the luckiest tail: fewer than 1 player in 1,000) | 3.86 · 3.69 · 3.70 | −16.8% |

**Read**: the design moves the empty shelf by under 2% for the typical player and by under 5% for a lucky one, inside FINDS'
±10% gate. That leaves room for the finds' own −4 to −7% (FINDS §4.4, *est.*). `clams.mjs` has no finds model yet: FINDS §11's
sim requirement is unbuilt, so the two have not been run together (lane L6). The brook's one good bite is the knob that keeps it
small. With two, it acts like a free place map (−5.6%). The notebooks' boosts and the guests are not in the scratch. They move a
few uncommon fish's shares, and the guests sell at the Mossmere's tier, so their effect is well under the brook's. L6 measures it.
**A find never replaces the ladder**: every bought item still raises something no piece does (§3.1), and the 32 items and their
prices are unchanged.

---

## 8. Save

```
meta.loop.finds.got[id]                  (as built: a lost-tackle piece with got ≥ 1 is owned, never drawn again)
meta.loop.finds.tackleMiss = { mossmere: n }     (fillFinds makes it whole; deleted once the guaranteed piece is owned)
meta.loop.found = { rod: null, line: null, reel: null }  (the fitted piece per slot, or null for the bought tier; migrateLoop fills it)
meta.loop.lures                          (+ 'guard_button' when it comes home; fitted through fitted.lure as any lure)
meta.loop.places.revealed = ['veilback_brook']   (bookFinds adds it when veil_notebook comes home)
```

`progression-loop`: `bookFinds` pushes a lost lure into `lures` and a revealed place into `places.revealed`. New methods are
`fitFound(slot, id)` and `unfitFound(slot)`, both through `canChangeHook`'s rules. `getStats` / `tackleStats` read
`LOOP.lostTackle[found[slot]]` in place of the tier's record for `castMax`, `hookWindow` and `hold`. `catchParts` reads the same
Hold. The loadout passes `playMult` and `waitMult` to `fishing-play` and `rollBite`.

---

## 9. The build, in lanes

| lane | size | what | depends on |
|---|---|---|---|
| **L1 · the draw** | S | `LOOP.finds.items` + the six (`kind: 'tackle'`, `slot`, `pose`, `size`); `LOOP.finds.tackle = { each: 0.01, guarantee: { item: 'veil_notebook', step: 0.05, cap: 0.4 }, partCap: 0.8 }`; `findShares` and `noteSnag` (§2.2); `fillFinds` (`tackleMiss`); `TEXT_LOOP.finds.items` (name, `does`, `line`); `validate-data --loop` (kind known; slots known; each ≥ the jackpot; shares sum to 1 in a fresh set, with the guarantee at its cap, one piece left, and the set owned; lines ≤ 8 words and 36 characters) | none: it can start now |
| **L2 · shown and kept** | M | the card's hook stamp and the `does` line; Keep's rack and chart-table glyphs; the tally's carry-aboard rows; `models-finds.js` + 6 props (≤ 400 triangles each; the pole ≤ 600); the rack variants and the notebooks on the chart table, merged (home stays ≤ 6 main-pass calls); the catalogue's tackle row; sounds (FINDS §8's knock and glint) | L1 |
| **L3 · fitting and the four stats** | M | `meta.loop.found`, `fitFound` / `unfitFound`, the tin's Kit row; `tackleStats` / Hold read the piece; `castMax` (and the sign range); `playMult` in `fishing-play` (`min(tierFactor, playMult)`); `waitMult` in `rollBite` (before the clamp, beside GEAR-GATES' bare-hook term); the button's hook column, `LURES` / `CATCH_V3` / `LOOP.lures` entries; `gearCap`'s line term reads `ferry_thread.cap` | **gw-gear merged first** (`gearCap`, the hook table's 9th column, the `start` lure skip it copies) + L1 |
| **L4 · notebooks and guests** | M | `boost` in `hookWeights`; `guest` in `finishPool`; three `HOOK_ROWS` rows (Rosefleck, Darter, Nightbloom; 10 cells each); guest species records (converter, `guestOf`); guest pricing at the water's tier; the catalogue's notebook glyph; models on the trout and carp plans | **gw-gear merged first** (the hook rows' cell count) + L1 |
| **L5 · the logs' words** | S | the gear log's effect lines and Who bites guest rows; the sheet's guest rows; the catalogue tap; `TEXT_LOOP.lost.log`, `tackle.kit`, `murk.firstTackle`, `murk.brook`; `textAllowed` | L3, L4 |
| **L6 · the sim and its gates** | S | port the scratch into `clams.mjs` (the brook from the notebook's hour, `good` 1; the Thread and the Winch with their trade-offs as fitted-when-better; the boosts and the guests in `poolFor` via `castOdds`), and the draw's Monte Carlo as a report (`--finds`: first piece p50/p90, the notebook by the shelf, pieces owned); gates: the M1 empty shelf within ±10% of finds-off with finds on, the 1% rule over 100,000 snags in each state, T104 with the boosts and the guests | **gw-gear's sim port (its lane 8)** + L1, L4 |
| **W · Veilback Brook in the world** (separate; may go later) | **M–L** | §5.3: the notch on the Mossmere's arena, the wider Veil, the mouth's collision and bank, the cast block, the seam, the reeds and the lily bed, the culvert, the sound, the place's two records, `setPlaces` reveal, the glide through the Veil; `clarity-perf --loop` | L1 (the reveal flag); not gw-gear |
| **C · the brook on the Chart** (with W) | S | `chartPlaces` skips a `secret` place until it is revealed; the Mossmere's sheet draws the notch only once revealed (`waterGeometry(arena, { revealed })`); the ink-in step; the place site, leader and name; `sail({ water, place })` refuses an unrevealed place. No re-bake: the water's sheet is drawn live from the arena | W, or W-lite |
| **W-lite** (instead of W, if needed) | S | §5.3's fallback: the brook as a disc place at the Veil's foot, revealed and drawn the same way | L1 |

Order: L1 now → L2 → (gw-gear merges) → L3, L4 → L5, L6. W + C can run beside them from L1 on, or wait, with W-lite shipping in
their place. The smallest delivery of the whole ask is **L1 + L2 + L3 + L4 + L5 + W-lite + C**.

### 9.1 Tests (`tools/tests/lost-tackle.test.mjs`)

| id | what |
|---|---|
| LT1 | `findShares`: a fresh set gives each piece 1% and the notebook 1%; after n misses the notebook gets `min(0.40, 0.01 + 0.05n)`; the jackpot is 1% in every state; no find is under 1%; the parts' share is clamped by `partCap − T`; the shares sum to 1 (a fresh set, the guarantee at its cap with the parts' share at its own cap, one piece left, the set owned) |
| LT2 | `noteSnag` counts misses only while the notebook is unowned and deletes the count when it comes; a piece owned leaves the draw; none on evening 1, the tutorial or a legend's cast; over 100,000 seeded snags each unowned piece is 1.00% ± 0.07 |
| LT3 | the tally carries a piece aboard with no clams (a reload pays nothing twice); the lure joins `lures` and never the shelf; the notebook adds `places.revealed` |
| LT4 | stats: the Pole fitted gives `castMax` 26 and rod Hold 0, and unfitting gives back the bought tier's; the Winch makes a play's length × 0.6 (seeded `planPlay`); the Thread makes the wait × 0.8 before the clamp and caps at Trophy by `line`; the button's column grades, Prize cap and no giant; `canChangeHook` rules for the Kit row |
| LT5 | notebooks: a boost changes only fish already in a pool; a guest appears only in its area and light, at `share × grade factor`, and is absent at grade 0; every stray ≤ 1.00% in every pool with both notebooks (`castOdds` sweep); T104 parity; a guest's price at the Mossmere's tier; never in the list, the catch seal or M1's 47 seals |
| LT6 | the brook: not in `chartModel` and not sailable until revealed; revealed by the notebook's tally; `goodBitesFor` gives 1 there; a cast into the cut lands short before the reveal; the raft cannot pass the Veil before it and can after |
| LT7 | words: every `does` and `line` ≤ 8 words and 36 characters with no digits; the card, the tin's Kit row (three chips at 358 × 664 and 390 × 844, every target ≥ 44 px) and the catalogue's tackle row fit at 358 × 664, 960 × 540 and 1280 × 720 with no overlap or cut text; no find name is a real brand, person or another game's item |
| LT8 | the flag-off game and the v3 fingerprint unchanged (`validate-data --v3`) |

**Scenario** (`tools/scenarios/loop-tackle.scenario.mjs`, using a debug hook `debug.finds.force(id)` for the next snag): for each
of the six, the haul, the show and the card; the tally; the rack and the chart table at home; the tin with the Kit row; the
catalogue's tackle row and a tap; the gear log; the Chart's ink-in of the brook and a sail through the Veil into it, day and
night. Run it at 1280 × 720, 960 × 540, 390 × 844 and 358 × 664, with two look-and-fix rounds.

---

## 10. Risks, and questions for the user

| # | risk | knob |
|---|---|---|
| 1 | the guarantee makes the first piece nearly always the same notebook, so the "surprise" of the first lost tackle is the same for everyone | `guarantee.item` (null makes it any piece: then 33% see the brook in Lake 1); question 1 |
| 2 | the Thread and the Winch speed the evening, and the user asked earlier that bites feel earned (GEAR-GATES) | `waitMult`, `playMult`; their Hold trade-offs; question 2 |
| 3 | the Pole's reach is felt, not counted: the sim does not model cast distance, so its worth rests on the play | `castMax`; the first browser tally |
| 4 | the brook's camera between high walls | W's risk check; W-lite |
| 5 | guests could read as "every fish keeps its water" broken (ROSTER §3) | one area, one light, a low share, the notebook glyph; they sell at the Mossmere's tier |
| 6 | three more rows in the hook table and a 10th column add to validate-data's ambiguity rules (`AUTOFISH` biteRule, maxShare) | LT5, `validate-data --loop` |

**Questions** (each with the default this document builds):
1. The guarantee brings **the Veil Angler's Notebook first** (default), or any piece first (most players then miss the brook in Lake 1).
2. The Thread and the Winch: **keep them** (default), or give them only looks and sound (then the rod and the lure carry the "stats you can't have").
3. Veilback Brook: **the cut behind the Veil (lane W)** (default), or **W-lite** for now (a place at the Veil's foot; the cut later).

---

## 11. Build notes (lanes L1 and L2, branch gw-tackle)

| what | where |
|---|---|
| the six pieces | `LOOP.finds.items` (`kind: 'tackle'`, `slot`, `pose`, `size`; the pole 3.0 m); `LOOP.finds.tackle` (§2.2's knobs); `LOOP.lostTackle` (§3.2's stats, unread until L3 and L4) |
| the draw | `loop-finds.findShares` (the pieces' term, `partCap`); `noteSnag` (the misses, capped at the count that reaches 40%; a piece leaves the parts' share be); `fillFinds` (`tackleMiss`, `places.revealed`); `bookFinds` (the guaranteed piece's count goes; `reveals` → `meta.loop.places.revealed`) |
| the reveal flag | `meta.loop.places = { revealed: [] }` (fresh loops carry it; `fillFinds` makes it whole); read it with `loop-finds.placeRevealed(metaLoop, id)` / `revealedPlaces(metaLoop)` |
| words | `TEXT_LOOP.finds.items[id] = {name, does, line}`; `findDoes(D, id)`; `TEXT_LOOP.murk.firstTackle` (said once by `saleLineId`; a part's line no longer fires for a piece) |
| on screen | the card (`findCardView().does`, the `hook` stamp, Keep's `rack` / `table` glyph); the tally (group 6, `gw-trow--tackle`); the catalogue's fourth row (`rows.tackle`, three to a row, two on a phone); sounds `tackle_glint`, `tackle_knock` |
| at home | `actors-finds.tackleHomeParts` merged into the barge's timber (rack: the pole, the winch, the thread, the button; chart table: the Veil Angler's open at its map, the Lily Gardener's shut); `findHomeSig` appends `:` and six flags once one is owned |
| tests | `tools/tests/lost-tackle.test.mjs` (LT1, LT2, LT3's tally and reveal, LT7's node half, the views, the props, the barge); `tools/tests/loop-lost-tackle.scenario.mjs` (the browser half) |

Not built in L1–L2: fitting, the notebooks' boosts and guests, the logs' effect lines and the sim (L3–L6, below); the brook, its Chart
line and the camera's hold on the chart table at the reveal (W, C).

### 11.1 Lanes L3–L6 (branch gw-tackle)

| what | where |
|---|---|
| fitting (L3) | `meta.loop.found = {rod, line, reel}` (freshLoop; `migrateLoop` clears a piece the save no longer owns); `loop.fitFound(slot, id)` / `unfitFound(slot)` (changeHook's rules: at home, or on the lake with no fish on; a waiting line comes in quietly; `loop:found`). The slot keeps its bought tier. A fitted piece stays drawn on the rack (L2's merge is unchanged: no new mesh) |
| the four stats (L3) | `loop-finds.foundKit(metaLoop, D)` → the trip's `castMax` and `hookWindow` (progression `tripStats`), each slot's Hold (`loopTackleHold`, `getLoadout().hold`, so `catchParts`), `playMult` (fishing-play `planPlay`: `min(tier factor, playMult)`), `waitMult` (fishing `rollBite`, before the 2–25 s clamp, never a legend's cast), `lineCap` (`watercraft.gearCap`'s new `lineCap` kit term: the fishing cap, the sheet's "—" cells, the Journal's gate line) |
| the button (L3) | the hook table's 10th column (`HOOK_ITEMS`, `LURE_IDS`); `LURES` and `CATCH_V3.items.guard_button` (+0 Hold) in the loop's apply block; `LOOP.lures.guard_button = {found: true}` (the shelf and the gate line skip it); `bookFinds` (and `debug.finds.give`, and `migrateLoop` for a save that owns it) put it in `meta.loop.lures` |
| the Kit row (L3) | `ui-tackle.tackleModel(...).kit` and the drawer's third row (`TEXT_LOOP.tackle.kit`), each owned found rod, line or reel drawn with its find art (`drawFindArt`), pressed while fitted; the button in the Lure row drawn the same way |
| notebooks (L4) | `watercraft.noteTerms(D, notes, {area, place, phase})` → `boost` (`hookWeights`, before `finishPool`; 0 stays 0) and `guests` (`finishPool`: `share × [0, 0.5, 1, 1.5][grade]`, the rest scaled by 1 − p; grade 0 absent, never a stray); `castOdds`, `openMix`, `bitesTable` take `notes`; the game (`fishing.castOddsNow`), the sheet (`whoBites`) and the gear log's Who bites pass the owned notebooks (`loop-finds.ownedNotes`) |
| guests (L4) | `W.hook.guests` (their own rows, so `gradeTargets` and every "the water's fish" reader keep to the water's own); `LOOP.guests.mossmere`; the converter's records (`tools/roster-export.mjs` `GUESTS`, `src/roster-shipped.js`) on their home water with `guestOf: 'mossmere'`, never in `SPECIES_LOOP` or the list; `priceOf` sells a guest at the water it visits; the trout plan's `spots: 'rose'` and `sail` (the darter), the carp plan's lavender glow (`ROSTER_ART`); the catalogue's guests (`catalogueFor().guests`, a notebook glyph in the cell's corner, shown once its notebook is owned or once met) |
| words (L5) | `TEXT_LOOP.lost.log` (+ `where`, `lights`, `places`), `TEXT_LOOP.tackle.kit`, `TEXT_LOOP.murk.brook` (the word only: W/C say it); `loop-finds.lostLogLines` (pure; `ui-af.lostLogLines` with the class words): the sheet's plates (a fitted piece stands in for its tier, each owned notebook a plate of its own, the button's line on the hook plate), the gear log's rows (found rows under their slot, notebooks under the tackle), the catalogue's tap (the log lines in `does`' place); the sheet's guest rows carry the notebook glyph |
| the sim (L6) | `clams.mjs`: `poolFor(…, notes)` (the game's `noteTerms` on the sim's records, the guests re-homed on the Mossmere), Veilback Brook (`BROOK`: a free day place, `good: 1`, its two guests its own fish), the Thread (wait × 0.8, its Hold and Trophy cap) and the Winch (play × min(tier, 0.6)) fitted when better (Line and Reel T0–T1); `pacing({finds})`; `lostTackleReport` at step 5 (the draw's Monte Carlo on the run's own trips, the 1% rule over 100,000 snags in four states, the ±10% gate); T104 with both notebooks |
| tests | `lost-tackle.test.mjs` (LT3's lure, LT4 fitting and the four stats, LT5 boosts, guests and the stray sweep, L5's words, the Kit row; 565 checks); `validate-data --loop` (each piece's stats in range, the found lure, the guests); `loop-lost-tackle.scenario.mjs`'s second half (the Kit row, fitting, the sheet, a guest's card and page) |

### 11.2 The pacing, measured (L6; `clams.mjs --shipped=mossmere --quick`)

| | figure |
|---|---|
| the first piece | p10 0.35 h · **p50 1.02 h** · p90 2.11 h · p99 3.26 h; by 1 h 48%, by 2 h 87%, by the empty shelf 100% |
| the Veil Angler's Notebook | p50 1.24 h; **100% by the empty shelf** (6,000 players) |
| pieces owned at the empty shelf | 2.14 (one 27% · two 41% · three 23% · four 7% · five 1%); each other piece 22–24% |
| the empty shelf, finds off | 5.20 h (82 trips) |
| **finds on** (the notebook at 1.24 h: the brook, the boost, the guest) | **4.68 h, −10.0%** (gate ±10%: passes, at its edge) |
| a lucky player (notebook at 0.49 h, the other notebook, the Thread and the Winch from 3 h) | 4.71 h, −9.3% |
| the terms | the brook and the Rosefleck at the Veil, no boost: −8.0% · the Kissmark boost ×1.1 −8.1%, **×1.2 −10.0% (built)**, ×1.3 −10.8% (fails) |

**Re-measured after the review (the sim's brook made the game's).** The first figures (−9.3% with ×1.6) were taken on a sim brook that
was an ordinary day place with the guests on top: every open-water fish bit there. The game's brook is `only` (its own fish and its
draws, data.placePool), and the sim's `BROOK` now is too (T104 holds on the merged tree). With no commons to thin it, the brook's one
good bite is mostly the Rosefleck, the Darter and the Kissmark, so the brook alone is −8.0%, four times §7.2's scratch. The boost is
built at **×1.2** (§4.2's ×1.6 fails the gate); FINDS' treasure sales (−4 to −7%, unmodelled: `clams.mjs` sells no treasure) would
push any of these past ±10%. **Question for the user**: a quieter brook (no Kissmark among its draws), a smaller boost, or a wider
gate. The Hold-step check (Hold 4 −5.9% a minute) fails as it did before this lane (GEAR-GATES' open item).

## 12. Build notes (lanes W and C, branch gw-brook)

| what | where |
|---|---|
| the place | `LOOP.places.veilback_brook` (`secret`, `price` 0, `good` 1, `only`: its own fish and its draws, `glide`/`glideSec`: the Sail's glide in); its record joins `MOSSMERE_V3.places` under the loop only (the v3 fingerprint unchanged); `goodBitesFor({place})`; `placePool` honours `only` and finds a guest of its own by id |
| the reveal | the notebook's tally adds the brook to `places.revealed` and to `maps.places` (owned, free; `fillFinds` does the same for an older save); `mapCards` never offers a secret place; the Chart, the catalogue and `sail` show or go to it only once owned |
| the cut | `ZONES[0].arena.shoreNotch` under the loop (`a` 3.9, `w` 6, `len` 18, a pool to 8.4 m, a 2.4 m head); `world-layout`: `notchFrame`, `notchHalfW`, `notchSdf`, `notchShoreR`, `shoreDist`, depth behind the shore (every depth inside it as built); shut until its place is owned (`world.setPlaces`): no water, the raft held at the Veil, a cast lands short |
| the world | the ring's mouth dropped and a U of the same rock (banks, wet ledge, walls, tops, the head) in the cliffs' mesh; its own boulders, two reed banks (83 stems), one lily bed of 8 pads, the culvert's arch and an old broken arch near the head (the places' stone); the Veil 6.4 m across the mouth with the culvert's 1.6 m spill in the same mesh, denser while shut, thinner with the raft inside; the aqueduct 3 m along and 1.2 m back so its broken arch spans the mouth, its piers down to the water; the brook's mist bank three times as tall; the seam down the cut; the culvert's trickle and a splash as the glide passes the Veil. No new mesh, draw call or light (168–172 calls in the brook on the dev build) |
| the view | the play camera turns down the brook while the raft is in it (`world.viewYaw`, the home swing's eased orbit), and on the Sail's glide in: its fixed north view would stand behind the south bank |
| the water | the bake covers the cut (`world.getBakeHalf`, `getShoreDist`; 160 texels in a loop build, about 1 m each as before) |
| lane C | `TEXT_LOOP.murk.brook`, said before any other first; `render.holdChart(1.2)` then the Jetty; `waterGeometry().notch`; `chart-gild.brookStep`/`brookCard` (the shore opens, the double line runs off the sheet, the reeds hatched, the Veil's strokes; 1.2 s once, kept in `meta.loop.places.inked`); the brook's own mark on the Chart |
| tests | `tools/tests/veilback-brook.test.mjs` (51, the glide in clear of every obstacle among them); the Sail's refusal and glide in `loop-evening`; the validator's secret-place checks; `tools/tests/loop-brook.scenario.mjs` (the browser half) |

Open: no lasting wisp at the culvert beyond its spill. (With lanes L3–L6 merged in, the brook bites its own two guests; the sim's
`BROOK` is `only` too, so T104 holds on the brook, §11.2.)
