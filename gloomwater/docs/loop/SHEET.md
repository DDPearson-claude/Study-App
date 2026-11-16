# The Wick's sheet: your gear, your buffs and your odds on one page (binding design, v1)

*Written 16 November 2026, after the user's hour with the published preview. Binding with `SPEC.md` v8.8 (§0 row 38,
decisions 105–110, §0.14, §8.12) and `M1.md` revision 9 (§2.18, §4 step S). It builds on `WATERCRAFT.md` revision 2 (§2.6,
§3.7, §3.9, §4), `WICKS.md` §2, `FINDS.md` §3 and §6, SPEC §8.8 (the catalogue) and Murk's catalogue (`gw-mvp-catalogue`).
The interiors of the barge are `docs/loop/BARGE-INSIDE.md` (branch `gw-design-inside`, written beside this one); §2.3 is the
seam between the two. Scope: the Mossmere (M1); every later water fills the same page with its own rows. Design only: no
`src/` or `tools/` file is changed by this document.*

*Figures marked *measured* come from scratch probes run against `gw-m1-mvp` @b527fae (WC-1 merged) through
`tools/tests/loop-fixture.mjs` and the merged `src/watercraft.js`, with the land roll's Hold rule as §8.1 makes it. None of
them is typed into the game: the page prints what the game's own functions give. Never name any television series or
presenter in anything written from this document.*

---

## 0. The user's words, and what each becomes

> "When we buy upgrades for our rod we need a page where we can view our gear quality, what we have as upgrades, how they
> impact our catch chances and a master character sheet or stats page we can view to see our buffs." (16 November 2026,
> after an hour's play-test of the published preview)

Binding from the same day: "Different areas of the lake should have different % chances of catching different species"; "if
I've got a worm on as bait I am never going to catch a pike, so the % chance for catching a pike if a worm is on should be 1
or less"; fish odds stay hidden except in the player's own logs, and the catalogue shows rates under the finds only, never a
% under a fish (SPEC §0 rows 23, 36, 37).

| the user said | it becomes | where |
|---|---|---|
| a page | **the Wick's sheet**: one page, the Journal's first tab (its flyleaf), named by your Wick's own name; also opened from the pause menu, from the rod rack on the barge and from every **Odds ›** | §2 |
| our gear quality | each piece of tackle, raft and home drawn as an engraved plate (Murk's catalogue's hand) with its name and a **quality mark in the float's own notches**: one ink notch for each tier or level you own, a hollow notch for each one Murk sells that you do not | §3.2, §3.3 |
| what we have as upgrades | every upgrade you own, the raft's and the home's, the barge parts you found and the looks you wear, each with what it does in numbers; the next tier of each piece Murk sells, with its price | §3.2, §3.3 |
| how they impact our catch chances | the **land chance by size class** for every fish you have met, with your gear and the bait and lure on the hook; **who bites** where you fish, at that hour, on that hook (the 1% rule shows as "<1%"); and on each tier you could buy next, what it would do to one fish you choose | §3.2, §3.5 |
| a master character sheet or stats page … to see our buffs | the Wick, its passive and the passive's **exact** effect; **Buffs**: every modifier that is on, each with its source and its number | §3.1, §3.4 |

**The standing taste (binding).** "Art, atmosphere and fishing those are our key drivers." Drowned Filigree: the sheet is a
page of old paper inside the Journal's night ink, its plates engraved, its rules and corners Murk's book's, candle amber only on
a price. The sheet is a **log**: it shows chances, plainly, and it is the one page where they live; nothing it shows ever
reaches the water, a card or the catalogue's fish. No way to fail. Few words: every word is §6's. Sizes in pounds and ounces
(the sheet shows none: a size class is its name). Phone 390 × 844 and 390 × 664, a 358 px column, text ≥ 16 px, targets ≥ 44 px.

---

## 1. The design on one page

1. **One page, named by your Wick.** The Journal's first tab is the sheet, its flyleaf: the tab reads your Wick's name
   ("Taper") with its passive's small picture. The pause menu (at home and on a trip) carries the same name and picture; the
   rod rack on the barge opens it; every **Odds ›** in the game opens it at its Odds. It replaces the gear log under the loop
   (§8.5); off the loop the built gear log is untouched.
2. **What you are**: the Wick's portrait, its name, its passive's name, picture and line, and **one more line with the
   passive's exact numbers** ("First bite never common. Giants ×1.3, to 12%.").
3. **What you own**: Tackle (Rod, Line, Reel; the lure and the bait on the hook), Raft (the hold, Oars, Keel, Lantern), Home
   (Murk's Order Board, the Bait Bed, the Long Wall, Barge lights) and the barge parts you found, each an engraved plate with
   its name, its notches, what it does in numbers, and the next tier Murk sells with its price. The looks you wear sit with
   whatever wears them. Things you do not own yet are drawn faint, with no line and no number, so the page shows the shelf's
   shape without selling from it.
4. **What is on**: **Buffs**, every modifier with its source: the passive, bigger fish from a tin, a lure, the Keel and the
   Lantern after dark, good bites, the hold, orders, free bait, speed, the found parts, and on a trip the let-go favour and
   quiet water's penalty where you are.
5. **What it does to your chances**: **Odds**, for a water or place you pick (where you are, on a trip), an hour and a hook:
   the favour of a plain cast there as a sum of its sources and in the float's notches, **how big the fish run** (the share
   of bites in each size class), **who bites** (every fish you have met by name with its share of bites, the rest counted)
   and **your odds** (the land chance of each by class). Every number comes from the function the game draws from
   (`watercraft.castOdds`, `data.catchParts`, the size roll's own truncated normal), so the page cannot drift from the water.
6. **It never shows** an area's share (WATERCRAFT §2.6), a fish you have not met, a marked giant, a legend's wounds or a
   waiting comeback, a size of a hooked fish, or anything while a line is out.
7. **Live and new**: the page re-reads the save on every change (a bait fitted, a buy, a find fitted at dawn); a tap on the
   page's hook fits it, at home, as the Chart's slots do; a newly bought or found thing carries **a small pink ink drop**
   until you have seen it on the page, and so do the ways in.
8. **One pure model**, `loop-sheet.js`'s `sheetModel(meta, D, opts)`, with its node tests; **one MEDIUM build lane after
   tonight's merge** (§9).

---

## 2. Where it lives

### 2.1 The Journal's flyleaf (the tab)

The loop's Journal (`ui-screens.js` `renderCatalogue`) has, today, one tab per owned water, **Prints** and the giants' ★. The
sheet becomes **the first tab**: its label is the Wick's own name (`CHARACTERS[wick].name`, the name the Journal's title
already uses: "Taper's Journal"), its glyph the passive's small picture (`ui-icons.passiveIcon`), and while anything on the
page is new, the pink drop (§5.2) after the name. The Journal still opens on the water's tab when opened from the HUD glyph,
the lectern or the Chart's book glyph; it opens on the sheet when opened from the pause item, the rack or an **Odds ›**. The
tab keys (`tabKeys`) take the sheet first. The tab's accessible name is the Wick's name.

The flyleaf is **paper**: one page of Murk's catalogue's vellum (its `--cat-paper` tokens, its noise and fibre, its corner
ornaments and its rule) laid on the Journal's night pool, so the engravings print in their own ink and the sheet reads as the
page the Wick wrote its name on. The other tabs stay night ink.

### 2.2 The pause menu

| where | today (SPEC §8.5) | with the sheet |
|---|---|---|
| on a trip (`openTripPause`) | **Resume** · **Home** · **Settings** | **Resume** · *the Wick's name* · **Home** · **Settings** |
| at home (`openHomePause`, Escape or the pause glyph) | **Resume** · **Settings** | **Resume** · *the Wick's name* · **Settings** |

The item is a menu button (`gw-mbtn`) with the passive's picture as its icon and the pink drop while something is new. It
opens the Journal on the sheet over the pause (`pauseChild`); **Back** returns to the pause. **On a trip it is refused while a
line is out**, exactly as the Journal glyph is (`K.refuseLocked`, `K.logLocked`): the item is dimmed and carries the built
"Reel in first." (`AUTOFISH.text.logLocked`) as its small second line, so no odd is ever on screen during a bite, a play or
the show (SPEC decision 62).

### 2.3 On the barge: the rod rack (the seam with `BARGE-INSIDE.md`)

**The object is the rod rack by the cabin door**: the two pegs on the cabin's aft wall, port of the door, where the rod you own
already hangs in its tier's colour (`actors-home.js`, "the rod you own, on its rack on the cabin's aft wall"; M1 §2.6: "the rod
you own on the barge's rack"). It is the Wick's kit wall: the gear the sheet describes is the gear that hangs there. A tap
opens the Journal on the sheet at **Tackle**. The Journal's lectern beside the door keeps opening the Journal (its flyleaf is
one tab away).

- **Today's home view** (the third-person home camera and its DOM targets, `home-targets.js`): a fifth target, **`rack`**,
  after `journal` and before `wall` in the focus order, over the rack's projected bounds (`TARGET_BOXES.rack`: x −1.12 … −0.88,
  y deck + 0.15 … deck + 2.05, z the aft wall … + 0.2, in the barge's frame, from the rack the actor already builds). Like the
  wall's doorway it draws **no word**; its accessible name is the Wick's name. `validate-data --loop`'s mooring frame check
  takes it (`which` gains `rack`): ≥ 44 px, no overlap at 358 px in portrait and at 960 × 540. **If the check cannot place it
  clear of the doorway at 358 px**, the rack target is dropped on a phone only (the sheet is still the pause item and the
  Journal's first tab there), and the lane says so.
- **Inside the barge** (`BARGE-INSIDE.md`, first person): whichever section shows the cabin's aft wall (the stern deck under
  the awning, with the chart table and the lectern) has the rack as an object you can tap; inside the cabin, if that design
  hangs the kit by the bunk instead, the rack moves with it. **The seam is one call and one id**: the object is `rack`, and its
  tap is `screens.openSheet({from: 'rack', section: 'tackle'})`. The interiors own where it is and how it is drawn (a gentle
  lean toward it before the page opens is theirs to choose); the sheet owns what opens. Whichever lane lands second wires the
  call.
- The rack's art grows a little with the sheet (a could, either lane): the fitted lure on its own peg below the rod, the tin
  on the shelf under it.

### 2.4 Every Odds › and the old gear log

Under the loop **the gear log is the sheet**: `ui-screens.js` `openTackle(extra)` opens the Journal on the sheet at **Odds**
(`openSheet({section: 'odds', ...extra})`), so every caller follows with no change of its own:

| caller | today | with the sheet |
|---|---|---|
| the catalogue's foot, **Odds ›** (`renderCataloguePage`) | the gear log | the sheet's Odds (the same Journal, its first tab) |
| a caught fish's species page, the gear link (`speciesDetail`) | the gear log | the sheet's Odds **with that fish as the reference** (§3.2) |
| Murk's book, its last page's **Odds ›** (`gw-mvp-catalogue`: `deps.openOdds`) | the gear log | the sheet's Odds over the book; **Back** returns to the book at that page |
| the shelf's Tackle tab **Odds ›** (the book's card fallback) | the gear log | the sheet's Odds |
| debug `openTackle()` | the gear log | the sheet |

The gear log's own content moves onto the sheet: its rows become the plates' lines (§3.2), its rating sentence the Tackle
head (§3.2), WC-3's **Who bites** the Odds table (§3.5), its pinned compare the plates' compare lines (§3.2, §8.4). Off the
loop `openTackle` is the built gear log, byte for byte.

---

## 3. What it shows

The worked example throughout (*measured*): **Taper**, evening 14, at home; the **Double Creel** (Hold 5); **Ashwood**,
**Braided Gut**, **Clockwork** (Rod T1, Line T1, Reel T2); the **Glimmer Spoon** fitted, tipped with **Mire Worms** (7 in the
tin; 3 Cut Strip in the bag; the Feather Fly also owned); **Oars I**, **Keel II**, **Lantern I**; **Murk's Order Board I**,
**Bait Bed I**, **the Long Wall, wing I**; found: the **Rust Buoy-Bell** and the **Gate Lamp-Glass**; worn: the **Slate Cloak
Dye** and the **Oxblood Pennant**; places owned: the Lily Maze and Under the Span; met: every fish of the open water but the
Milkeye Perch and the Lampsipper, the Bridgechain Sturgeon and the Thousandcast Pike, which the player has pinned at Trophy.
Prices at today's shipped factor, ×2 (`LOOP.cost.shipped`).

### 3.1 The head: the Wick

| element | what | from |
|---|---|---|
| portrait | the Wick's small candle portrait, in the dye it wears (`ui-icons.wickPortrait(look)` with a worn cloak dye's colour) | `CHARACTERS`, `meta.loop.looks` |
| name | the Wick's name, spaced capitals (Marcellus SC, 29 px phone / 36 px desktop) | `CHARACTERS[wick].name` |
| passive | its picture (`passiveIcon`, 56 px), its name and its built line ("Long Reach" · "Evenings start with a rarer fish.") | `TEXT_LOOP.passives`, `.wicks` |
| **exact** | one line in a smaller italic: the passive's own numbers, filled from `LOOP.wicks` (never typed) | §6 `sheet.exact` |
| worn | the looks the Wick wears, as small plates (name only, no number): the Slate Cloak Dye; the Knotted Rod Tassel sits on the rod's plate | `meta.loop.looks`, `meta.loop.finds.worn` |

The five exact lines (*from `LOOP.wicks` as it stands*):

| Wick | passive | exact line | numbers from |
|---|---|---|---|
| the Wick | Curious | "Kept firsts +40%, at least +3. Not giants." | `firstMult` 1.4, `firstFloor` 0.4 × the water's tier 7 |
| Taper | Long Reach | "First bite never common. Giants ×1.3, to 12%." | `firstBites` 1, `giantShare` 1.3, `giantCap` 0.12 |
| Stub | Moth-Bright | "Waits ×0.78. Quiet water −0.08 a bite, no slower." | `waitMul`, `quietStep`, `quietWait` false |
| Tallow | Broad Back | "+1 slot. +1 good bite at every water." | `slots` 1, `good` 1, `everyWater` |
| Ashwick | Burns Back | "A lost fish returns once, +4 Hold. Not giants." | `hold` 4 (never a giant or a legend, WICKS §2.5) |

Ashwick's line never says whether a fish is waiting (WATERCRAFT §7: the lost fish is a mystery).

### 3.2 Tackle: Rod, Line, Reel, the lure, the bait

**The head line** is the built rating sentence (`catchRating` through `ui-af.ratingLine`, words only), shown once its
reference fish (the Reedjaw Pike on the Mossmere) has been met: *"Against the Reedjaw Pike: holds Prizes. Trophies are a coin
flip."* (*measured* on the example kit with the spoon; "holds Keepers. Prizes are a coin flip." on the same tackle with no lure;
"holds Keepers. Prizes are a long shot." on a fresh save's).

**A plate** (one per piece):

```
[ engraving ]  ASHWOOD                    ▮▯          ← name (Marcellus SC) · the notches
               Casts 17.5 m · 4% longer to strike     ← what it does (the rod only)
               +2 Hold on every fish · counts ×1.6 against leapers.   ← the built gear line
               Next: Whalebone · 600                  ← the next tier on Murk's shelf, its price
               Thousandcast Pike (Trophy): 25% → 29% with this.        ← the built compare line
```

- **The engraving** is Murk's catalogue's (`murk-engrave.engrave(card)`, the shelf's card id: `rod:1`, `line:1`, `reel:2`,
  `lure:glimmer_spoon`, `tin:mireworm`, `bait:heartmoss`), 120 × 90 on a desktop, 44% of the plate on a phone. The lane adds
  the four plates the shelf never needed: the **Willow Switch**, **Twine**, the **Wooden Winch** (tier 0) and **the bare hook**,
  in the same hand. A found look worn on a piece is drawn on its plate (the Knotted Rod Tassel on the rod).
- **The quality mark: the float's notches.** The same slanted ink strokes the float shows its favour with (`.gw-fav-ticks`),
  inked on paper: **one solid notch for each tier you own, one hollow notch for each tier Murk sells now that you do not**
  (`LOOP.tackle.shelfAt` with the waters you own; the hold's ladder to `LOOP.hold.shelfMax`; a raft or home part's
  `with`). In M1 a tackle slot has two notches (T1, T2), so the Willow Switch is ▯▯, the Ashwood ▮▯, the Whalebone ▮▮. Nothing
  past the shelf's era is drawn (M1 §2.5: no T3, no Hold 7, no Keel III): when Sporewood's map puts Glassreed on the shelf, a
  third hollow notch appears. Its accessible text is "{n} of {of}", numbers only.
- **What it does**, plainly, in numbers:
  - **Rod**: "Casts {m} m · {n}% longer to strike" (`TACKLE.rod[t].castMax`, `(hookWindow − 1) × 100`): the Willow Switch
    16 m and 0%, the Ashwood 17.5 m and 4%, the Whalebone 19 m and 8%.
  - **Rod, Line, Reel**: the built gear line, "+{hold} Hold on every fish · counts ×1.6 against {styles}." (`ui-af.gearLine`;
    the rod against leapers, the line against thrashers, sinkers and sulkers, the reel against runners: `CATCH_V3.emphasis`).
  - **The lure and the bait** (§3.2.1).
- **Next**: the card Murk's shelf offers for that slot now (`progression-loop.shelfItems`' unbought card for the slot, its
  price as the shelf prints it, the factor already in), in the goal line's own form, "Next: {name} · {price}". At home a tap
  on it opens Murk's book at that card (`openShelf({focus: id})`, the book's `focusPage`); on a trip it is not a button. A slot
  at the shelf's top has no Next line.
- **The compare**: the built line "{name} ({class}): {from} → {to} with this." (`AUTOFISH.text.gear.compare`), the land chance
  of **the reference fish** at **the reference class** with your kit now and with that one tier changed (`data.catchChance`,
  the struck strike the logs use, the hook's Hold as §3.5 counts it). On the example: the Thousandcast Pike (Trophy), the
  Whalebone **25% → 29%**, Waxed Silk **25% → 35%** (*measured*; the line counts ×1.6 against a thrasher). With no pin, the
  default reference is the water's reference fish, the Reedjaw Pike (Trophy): **42% → 46%** and **42% → 52%**.
  - **The reference fish** is the player's pin, else the water's reference fish once met, else the first fish of the water's
    list the player has met, else none (no compare line is drawn). **The pin is set on the Odds table** (§3.5): a tap on a
    fish's row pins it, a second tap unpins it; the pinned row carries the gear log's hook glyph. The pin is the save's
    `meta.gearPin` (`progression-af.pinGear`, built, never called today: WC-3 retired the auto-pin of the last lost fish,
    and the sheet must not bring it back).
  - **The reference class** is the class picked on the Odds table (§3.5), Trophy until the player picks another.

#### 3.2.1 The lure and the bait

Two plates side by side on a desktop (stacked on a phone): **the lure on the hook** and **the bait on the hook**, each with
the owned others as small glyph chips beneath it (the Chart's slot glyphs, `ui-gear.GEAR_GLYPH`, the bait's count on its
chip, and a **—** chip for none). **At home a tap on a chip fits it** through the same call the Chart's slots make
(`ctx.progression.loop.fit('lure' | 'bait', id)`), and the whole page re-reads (§5.1); **on a trip the chips are read only**
(the hook is the run's). The plate's lines:

| item | its lines (the exact values from `CATCH_V3.items`, `BALANCE.favour.tackle`, `LOOP.baitRule`) |
|---|---|
| a tin (Mire Worms, Lumen Moss) | "+5 Hold on the fish it suits (8 you have met)." (WC-3's line, `TEXT_LOOP.log.gear`; Mire Worms suits eight Mossmere fish, all met in the example) · "Bigger fish +0.3" |
| Cut Strip | "+4 Hold on the fish it suits (…)." · "Bigger predators +0.3" |
| the Glimmer Spoon, the Bone Jig | "+6 Hold on the fish it suits (…)." · "Bigger predators +0.2" / "Bigger bottom feeders +0.2" |
| the Feather Fly | "+5 Hold on the fish it suits (…)." |
| the Harbour-Bell Spinner | "+10 Hold on the fish it suits (…)." · "Giants ×1.5" (`LOOP.lures.bell_spinner.share`) |
| the Heartmoss Ball | the built shelf line "For the Belled Matriarch. One try." · its count |
| the bare hook | no line |

"The fish it suits" is `watercraft.gradeTargets(itemId)` (grade 2 or 3; the Spinner its named giants), counted, never named,
exactly as WC-3 wrote it, and **it is now true in the land roll too** (§8.1). A lure tipped with a bait: each plate keeps its
own lines, and the land chance takes the larger of the two Holds for each fish (the built rule, never both).

### 3.3 Raft and Home: what you have as upgrades

The same plates, smaller (two to a row on a phone), under the shelf's own tab words **Raft** and **Home**:

| plate | its line (built words, the shelf's) and its numbers | notches in M1 |
|---|---|---|
| the hold (Wicker Creel … Wellbox) | "Hold {n}" (Tallow's one more counted) · the good bites it gives open water, as the float's dots (`goodBitesFor`) | 3 (Hold 4, 5, 6) |
| Oars I–II | "Faster." · "+{v} m/s" (`LOOP.raft.oars.speed` × level: +1.5, +3.0) | 2 |
| Keel I–II | "Bigger fish." · "+{f}" (`LOOP.raft.keel.favour` × level: +0.1, +0.2) | 2 |
| Lantern I–II | "Bigger fish at night." · "+{f} · light +{p}%" (+0.1 / +0.2; 15% / 30%) | 2 |
| Murk's Order Board I–II | "Orders pay double." · the count of orders as chalk ticks (`orderCount`, the Buoy-Bell's included) | 2 |
| Bait Bed I–II | "Free bait every evening." · "{n}" with the tin's glyph (`LOOP.home.baitBed.floor`: 3, 6) | 2 |
| the Long Wall, wing I | "Your best prints, on the wall." | 1 |
| Barge lights I | no line (lights and looks carry none, SPEC §8.4) | 1 |
| a found part (Rust Buoy-Bell, Gate Lamp-Glass, Moat Bollard) | its drawing (`ui-finds.drawFindArt`), its name and its effect as a glyph and a number: the chalk tick "+1" (the bell, once the board is owned; faint before), the float's dot "+1" (the glass, at the Mossmere's open water), the tin "+10" (the bollard, at Sail) | none (a find is had or not) |
| a look (bought or found) | its name, under what wears it: the raft's (the Oxblood Pennant, the Amber Lantern Glass, the Toll-Tower Vane), the barge's (the Night-Lily Window Boxes), the Wick's (§3.1), the rod's (§3.2) | none |

**Not owned yet**: the plate's engraving in the faint ink (`--cat-faint`), its name in the dim ink, its notches all hollow,
no line and no number; a tap at home opens Murk's book at its card. A found part or look not yet had is **not drawn at all**
(it is the catalogue's to show, as a hatched silhouette under its rate).

### 3.4 Buffs

One list, a row each: **the source** (its glyph and its name: an item's, a place's, the passive's, the built hour words "Last
Light" and "Night Rise") and **its effect** (a number with its unit or glyph). Only what is on is listed; nothing is listed
that the player does not own or cannot see.

| source | effect | rule |
|---|---|---|
| the passive | its exact line (§3.1) | always first |
| a tin on the hook | "Bigger fish +0.3" | every fish (`LOOP.baitRule.favour`) |
| Cut Strip on the hook | "Bigger predators +0.3" | the predators (`speciesTerms`) |
| the Glimmer Spoon / the Bone Jig on the hook | "Bigger predators +0.2" / "Bigger bottom feeders +0.2" | its family (`BALANCE.favour.tackle.lure`) |
| the Harbour-Bell Spinner on the hook | "Giants ×1.5" | its named giants, at their places |
| Keel I–II | "Bigger fish +0.1" / "+0.2" | everywhere |
| Lantern I–II | "Bigger fish at night +0.1" / "+0.2" | after dark only |
| the hold | "Hold {n}" | the Wick's slots |
| good bites | "Good bites" and a row of the float's dots for each owned water and place: the Mossmere ●●●●●●● (7), the Lily Maze ●● (2), Under the Span ●●● (3) | `goodBitesFor` (+ the Gate Lamp-Glass's +1 at open water, Tallow's +1 everywhere) |
| the Gate Lamp-Glass | "+1 ●" (open water) | `findBiteBonus` |
| Murk's Order Board, the Rust Buoy-Bell | "Orders pay double." and the chalk ticks (1 + 1) | `orderCount` |
| the Bait Bed, the Moat Bollard | "Free bait every evening." and "3" with the tin glyph (+10 with the bollard) | `baitBedFloor`, `findBaitFloor` |
| Oars I–II | "Faster." "+1.5 m/s" | `raftStats` |
| **on a trip, at the water you are on** | "Let go +0.2" (to +0.4) · "Quiet water −0.30" (−0.15 a bite past the good ones, to −1.2; Stub −0.08) | `loop.favour(waterKey)`: its `mercy` and its `favour` |

**Never listed**: a Marked giant's +6, a legend's wounds, a waiting comeback (WATERCRAFT §7.1: the lost fish is named nowhere);
a sign's favour, the clean cast and the depth band (they are the cast's, read on the water, not owned); an area.

### 3.5 Odds: what it all does to your chances

**The picks** (the section's head; the only buttons that change nothing in the game):

- **Where**: a chip for the water (its name, "the Mossmere", the open water) and one for each place you own (its kind glyph and
  its name, the Chart's). On a trip it starts where the raft is (the place it is in, else the open water); at home, on the
  place picked on the Chart (`meta.loop.chartPick`), else the open water. **No area is ever offered or named** (§8.3).
- **Hour**: three glyph chips, day, dusk and night (the catalogue's hour glyphs; accessible names "Day", "Dusk", "Night"). On a
  trip it starts on the hour it is; at home on dusk. A night place (the Buoy Lights) picked moves the hour to night (it is open
  water before then, `placePool`), and the day and dusk chips dim while it is picked.
- **Hook**: the lure and bait chips of §3.2.1, the same two rows (at home a tap fits; on a trip read only).

**Bigger fish here**: one line, the favour of a plain cast at the picks (no sign, not clean, not the depth band) as a sum of its
sources, then the float's notches for it: *"Under the Span +0.55 · Last Light +0.2 · Mire Worms +0.3 · Keel II +0.2 = 1.25
▮▮▮▮▯"* (*measured*; capped at 1.8 as the float is). On a trip at the water the raft is on, the let-go and quiet water terms
join it. A family term (the spoon's +0.2 on predators) is the plate's and the Buffs' line, not the sum's.

**How big they run**: the share of bites in each size class for that plain cast, from the size roll's own law (z ~ N(μ, 1)
truncated to [−2, min(3.6, the place's cap)], `fishing-reel.rollZ`; the cap `capZ`: Elders only in old water and for a giant
at its own place): *Under the Span at dusk, the example kit: Small 7% · Keeper 35% · Prize 32% · Trophy 19% · Elder 7%*;
the open water at dusk on the same hook, Small 17% · Keeper 48% · Prize 26% · Trophy 10% · Elder —; a fresh save at the open
water at dusk, Small 32% · Keeper 48% · Prize 16% · Trophy 4% · Elder — (*measured*, and against 200,000 seeded `rollZ`
draws within 0.3 points). This is where the Keel, the Lantern and a tin become numbers: on the open water at dusk with a tin,
Keel II moves Trophy from 7% to 10%.

**Who bites, and your odds**: one table, every fish that can bite at the picks.

| column | what | from |
|---|---|---|
| the fish | its name, ★ for a giant; the pinned fish's row carries the hook glyph; a tap pins it (§3.2) | met fish only (`meta.journal[id]`) |
| **Who bites** | its share of the bites, whole percent, **"<1%" under one**, so every fish that won't take the hook reads "<1%" (the user's rule, on the page) | a place: `watercraft.castOdds(D, {pool: placePool(…), area: null, phase, lure, bait, wickId})`; the open water: the blind caster's mix over the areas at that hour (`watercraft.openMix`, §7.3), WC-3's evening mix made one hour |
| **Your odds**: Small · Keeper · Prize · Trophy · Elder | the land chance of each class with your tackle and the hook (the larger of the lure's and the bait's Hold for that fish), the struck strike; "—" for a class the place cannot roll | `data.catchParts` (§8.1) |
| the foot | "and {n} you have not met" (WC-3's words) | the pool's unmet fish, giants and the legend included |

The legend: at the Bell Pool, on the Heartmoss Ball, in her hours, her row is the whole of the bites (her sure bite, SPEC
§3.5), and her odds are her one figure (`catchChance(id, 'legend')`, no wounds: §3.4). Elsewhere she is not in the table.

*The example, at home, Under the Span, dusk, the spoon tipped with worms (measured):*

| fish | Who bites | Small | Keeper | Prize | Trophy | Elder |
|---|---|---|---|---|---|---|
| Overbold Bass | 25% | 92% | 90% | 79% | 64% | 16% |
| Mossback Perch | 19% | 92% | 91% | 81% | 67% | 19% |
| Kissmark Trout | 17% | 90% | 89% | 74% | 57% | 10% |
| Likely Chub | 15% | 92% | 91% | 80% | 66% | 18% |
| ★ Thousandcast Pike (pinned) | 8% | 79% | 73% | 44% | 25% | 1% |
| Reedjaw Pike | 4% | 87% | 83% | 62% | 42% | 4% |
| Dusk Minnow · Gutter Crayfish · Rustfin Sucker · Weeping Carp · Candlefin Koi · Bridgechain Sturgeon | <1% each | 89–92% | 86–91% | 67–80% | 48–66% | 6–18% |
| *and 1 you have not met* (the Milkeye Perch, 8%) | | | | | | |

Taper's giant: the Thousandcast Pike is 7.8% of the bites there at dusk (6% × 1.3), shown as 8%. The same picks on Mire Worms
alone put the two pikes at "<1%" at every place and hour: the user's rule, readable.

*A fresh save at home* (the Wick, the Willow Switch, Twine, the Wooden Winch, the bare hook, nothing met): the table is empty
but its foot, "and 11 you have not met"; it fills as fish are met. Its land figures, when they come, are the bare tackle's:
the Dusk Minnow 85 / 81 / 57 / 37, the Reedjaw Pike 69 / 61 / 30 / 16 (*measured*).

### 3.6 What the sheet never shows

- **An area's name, weight or share** (WATERCRAFT §2.6). The open water is one row of picks, as WC-3's Who bites shows it.
  §11 question 41 asks the user.
- **A fish you have not met**, by name, drawing or silhouette: it is counted.
- **A lost fish in any form**: no Marked giant and its +6, no legend's wounds, no waiting comeback, no last-lost pin.
- **A size in pounds** (a class is its name), and nothing about a fish on the line: the page is never open while a line is out.
- **Anything past Murk's shelf's era**: no tier, level, look or place the save cannot buy yet; nothing of Sporewood.
- **A typed number**: every figure is computed when the page opens; a word scan finds no percentage literal in `TEXT_LOOP`,
  `ui-sheet.js` or the data (as the catalogue's scan, SPEC §8.8).

---

## 4. Layout

### 4.1 Desktop: a spread

At 960 × 540 the Journal's panel holds the tab row and, under it, **two paper pages side by side** (each about 430 px wide,
each scrolling on its own under a fixed running head, as Murk's book's pages do): the left page **is you**, the right page
**is what it does**. At 1280 × 720 the same, larger.

```
+--------------------------------------------------------------------------------------------------+
| [✦ Taper•] [ the Mossmere 10/12 ] [ Prints ] [ ★ ]                                         Close |
| +------------------------------------------------+ +-------------------------------------------+ |
| | (portrait)  TAPER                              | |  ───────────── BUFFS ─────────────        | |
| |  (pic)  LONG REACH                             | |  ✦ Long Reach  First bite never common.   | |
| |  Evenings start with a rarer fish.             | |                Giants ×1.3, to 12%.        | |
| |  First bite never common. Giants ×1.3, to 12%. | |  worm Mire Worms   Bigger fish +0.3        | |
| |  [Slate Cloak Dye]                             | |  spoon Glimmer Spoon  Bigger predators +0.2| |
| |  ──────────────── TACKLE ────────────────      | |  keel Keel II      Bigger fish +0.2        | |
| |  Against the Reedjaw Pike: holds Prizes.       | |  lamp Lantern I    Bigger fish at night +0.1 |
| |  Trophies are a coin flip.                     | |  creel Hold 5 · Good bites  ●●●●●●● ●● ●●● | |
| |  [rod ] ASHWOOD ▮▯  Casts 17.5 m · 4% longer…  | |  board Orders pay double.  ✓ ✓             | |
| |         +2 Hold on every fish · ×1.6 …leapers. | |  tin  Free bait every evening.  3          | |
| |         Next: Whalebone · 600                  | |  oars Faster.  +1.5 m/s                    | |
| |         Thousandcast Pike (Trophy): 25% → 29%… | |  ───────────── ODDS ──────────────         | |
| |  [line] BRAIDED GUT ▮▯ … Next: Waxed Silk · 600| |  [≈ the Mossmere] [◇ Lily Maze] [◎ Under   | |
| |  [reel] CLOCKWORK ▮▮  +5 Hold … runners.       | |  the Span•]   [☀] [◐•] [☾]                 | |
| |  [spoon] GLIMMER SPOON  [worms] MIRE WORMS 7   | |  [spoon•][fly][—]   [worms 7•][strip 3][—] | |
| |   [fly][—]               [strip 3][—]          | |  Under the Span +0.55 · Last Light +0.2 ·  | |
| |  ──────────────── RAFT ─────────────────       | |  Mire Worms +0.3 · Keel II +0.2 = 1.25 ▮▮▮▮▯|
| |  [creel] DOUBLE CREEL ▮▮▯ [oars] OARS I ▮▯ …   | |  How big they run: Small 7% · Keeper 35% · | |
| |  ──────────────── HOME ─────────────────       | |  Prize 32% · Trophy 19% · Elder 7%         | |
| |  [board] … [bed] … [wall] … [lights] (faint)   | |          Who bites  Small Keeper Prize …   | |
| |  [bell] Rust Buoy-Bell ✓+1 [glass] Lamp-Glass ●+1 |  Overbold Bass  25%   92   90   79  64 16 | |
| +------------------------------------------------+ +-------------------------------------------+ |
+--------------------------------------------------------------------------------------------------+
```

In the drawings, • is the pink drop (§5.2), ▮ ▯ the notches, ● the float's good-bite dots and [chip•] the chosen chip.
The Odds table's seven columns fit the right page (the name 140 px, the share and the five classes 48 px each, the class names
and the figures in Alegreya at 16 px, the figures tabular). Opening at **Odds** scrolls the right page to its head; at
**Tackle** the left page.

### 4.2 Phone: one scroll

At 390 × 844 (and 390 × 664) the page is one paper column, 358 px, scrolling under the fixed tab row: the head, then a **jump
row** of six glyph buttons (the passive's picture, the rod, the raft, the hearth, the buffs' ✦, the float for the odds), each
44 × 44 and named by its section's word, then
the sections in the same order: **Tackle** (a plate a row: the engraving left, 44%; the words right), **Raft** and **Home**
(two plates a row: the engraving above its name), **Buffs** (a row each), **Odds**.

```
+--------------------------------------+
| [✦ Taper•][Mossmere 10/12][Prints][★] |
|  (portrait) TAPER                     |
|   (pic) LONG REACH                    |
|   Evenings start with a rarer fish.   |
|   First bite never common. Giants     |
|   ×1.3, to 12%.                       |
|  [pic] [rod] [raft] [hearth] [✦] [float]|
|  ─────────── TACKLE ───────────       |
|  +-----------+----------------------+ |
|  |  (rod     | ASHWOOD          ▮▯  | |
|  |  engraving| Casts 17.5 m · 4%    | |
|  |   44%)    | longer to strike     | |
|  |           | Next: Whalebone · 600| |
|  +-----------+----------------------+ |
|  …                                    |
|  ─────────── ODDS ───────────         |
|  [≈ the Mossmere] [◇ Lily Maze]       |
|  [◎ Under the Span•]                  |
|  [☀] [◐•] [☾]                         |
|  [spoon•] [fly] [—]                   |
|  [worms 7•] [strip 3] [—]             |
|  Under the Span +0.55 · Last Light    |
|  +0.2 · Mire Worms +0.3 · Keel II     |
|  +0.2 = 1.25  ▮▮▮▮▯                   |
|  How big they run                     |
|  Small 7% · Keeper 35% · Prize 32% ·  |
|  Trophy 19% · Elder 7%                |
|  [Small] [Keeper] [Prize] [Trophy•]   |
|  [Elder]                              |
|              Who bites   Your odds    |
|  Overbold Bass      25%       64%     |
|  Mossback Perch     19%       67%     |
|  …                                    |
|  and 1 you have not met               |
+--------------------------------------+
```

On a phone the table has three columns (the fish, Who bites, Your odds at **the class picked** by a row of class chips: the
five class names, ≥ 44 px each, Trophy until picked; the picked class is also the compare lines' class, §3.2). Every chip row
wraps; nothing scrolls sideways; every text is ≥ 16 px; every target ≥ 44 px and none overlap at 358 px.

### 4.3 The look

Old paper (`--cat-paper`), the Chart's ink (`--cat-ink`), the book's corner ornaments at the page's corners and its rule under
each section's word (Marcellus SC, spaced capitals, 18 px phone / 22 px desktop), engravings in their own hatching, numbers in
Alegreya's tabular figures. **Candle amber only on a price.** The notches are the float's strokes in ink (solid) and faint ink
(hollow). The chosen chip is the built Drowned Filigree mark (ink with its twin hook curls drawing in); the fitted chip carries
a small solid ink dot under it, the good-bite dot. The pink drop of §5.2 is the only pink. Nothing glows; nothing moves except
a hook curl drawing in and the drop fading when seen; under reduced motion nothing moves.

---

## 5. Live

### 5.1 How it updates

The page is drawn from `sheetModel` (§7) and re-drawn whenever the save or the run changes while it is open: on `loop:fit`
(a lure or bait fitted, from the page's own chips or the Chart's slots), `loop:buy`, `bait:change` (a bait spent on a trip),
`fishing:found` and the dawn's fitting of a part, `home:enter`, `run:start` and `run:end`. A pick (where, hour, class, pin)
re-draws it at once; picks are the page's own state (`entry.state.view`) and persist for the session, never in the save except
the pin (`meta.gearPin`). A fit from the page is exactly the Chart's (`loop.fit`): the Chart's slot shows the same bait when it
next opens, and the HUD on the next trip. The model is cheap (one `castOdds` or one hour's open mix, 13 fish × 5 classes of
`catchParts`, one size law): under 5 ms on the low tier (*est.*; the gate measures it), so the page re-draws on every event
without a debounce.

### 5.2 The "new" mark

**A small ink drop in nebula pink** (DESIGN §21.6's colour for "new" moments, deepened for paper), 8 px, beside the name of
every owned thing the player has not yet seen on the sheet: a piece of tackle, a hold step, a raft or home part, a lure, a
look, a found part (its key is the shelf's card id, `rod:2`, `hold:5`, `keel:2`, `lure:bone_jig`, `look:slate_dye`, or
`find:gate_glass`; tins, Cut Strip and the Heartmoss Ball are consumables and never marked). The same drop sits after the
Wick's name on the Journal's tab and on the pause item while any mark is on the page. **No word** (its accessible name is
"New").

A mark is **seen** when at least half of its plate has been on screen for 0.8 s while the page is open (an
`IntersectionObserver`), and the save is written when the page closes (`loop.markSheetSeen(keys)` →
`meta.loop.sheetSeen`). A buy at Murk's book, a find fitted at dawn or a pick-up from the water marks its key fresh by being
owned and unseen: no event has to remember it. **`migrateLoop` seeds `sheetSeen` with every key the save already owns** the
first time the field is added, so an older save opens with no marks; a fresh save starts with none owned and none marked.

---

## 6. Words

Every string the sheet draws is below: built words (SPEC §8's, `TEXT_LOOP`'s, `AUTOFISH.text`'s), names and numbers, and the
few new ones (`TEXT_LOOP.sheet`, each ≤ 36 characters a row, two rows at most at 18 px in a 358 px column). `textAllowed`
gains the screen `'sheet'`, where a percentage, "<1%", a signed favour ("+0.3", "−0.30"), a multiplier ("×1.6"), a length in
metres ("17.5 m"), a speed ("+1.5 m/s") and "= 1.25" are allowed; everywhere else nothing changes.

| where | words | built or new |
|---|---|---|
| the tab, the pause item, the rack's accessible name | the Wick's name | a name |
| section heads | **Tackle** · **Raft** · **Home** | built (the shelf's tabs) |
| | **Buffs** · **Odds** | **new** (`sheet.buffs`, `sheet.odds`; "Odds" is the book's chapter word and **Odds ›**'s) |
| the head | the passive's name and line | built |
| | the five exact lines (§3.1) | **new** (`sheet.exact.{wick,taper,stub,tallow,ashwick}`, templates filled from `LOOP.wicks`) |
| the Tackle head | "Against the {species}: holds {held}s. {next}s are {word}." | built (`AUTOFISH.text.rating`) |
| a plate | the piece's name; "Casts {m} m · {n}% longer to strike" | name; **new** (`sheet.cast`) |
| | "+{hold} Hold on every fish · counts ×1.6 against {styles}."; "+{n} Hold on the fish it suits ({m} you have met)." | built (`AUTOFISH.text.gear.tackle`, `TEXT_LOOP.log.gear`) |
| | "Next: {name} · {price}"; "{name} ({class}): {from} → {to} with this." | built (the goal line, `AUTOFISH.text.gear.compare`) |
| | "Hold {n}"; "Faster."; "Bigger fish."; "Bigger fish at night."; "Orders pay double."; "Free bait every evening."; "Your best prints, on the wall."; "For the Belled Matriarch. One try." | built (`TEXT_LOOP.holdName`, `.shelf`) |
| a buff | "Bigger fish {f}" · "Bigger fish at night {f}" · "Bigger {who} {f}" ({who}: "predators", "bottom feeders", the built family plurals) · "Giants ×{k}" · "Good bites" · "Let go {f}" · "Quiet water {f}" | **new** templates (`sheet.buff.*`), built words in them ("Let go", "Quiet water", the shelf's "Bigger fish") |
| | the hour sources "Last Light", "Night Rise"; place names | built (the float's term words), names |
| Odds | "How big they run" | **new** (`sheet.size`) |
| | "Who bites" · "and {n} you have not met" · "<1%" · "Your odds" · the five class names | built (`TEXT_LOOP.log`, `AUTOFISH.text.log.title`, `SIZE_CLASSES`) |
| accessible names only | "Day" · "Dusk" · "Night" (the hour chips) · "New" (the drop) · "Pinned" (the hook glyph) · "{n} of {of}" (the notches) | **new** (`sheet.hours`, `sheet.fresh`, `sheet.pinned`) |
| the trip pause, a line out | "Reel in first." | built (`AUTOFISH.text.logLocked`) |

**New: 22 strings** (two heads, five exact lines, the cast line, seven buff templates, "How big they run", and six
accessible names). No new word on the water, on a card, on the catalogue or on the shelf.

---

## 7. The pure model and its tests

### 7.1 `src/loop-sheet.js` (new; pure: no DOM, no three.js, no `data.js` import; `D` is passed in)

It imports only pure modules: `watercraft.js` (`castOdds`, `openMix`, `gradeTargets`), `fishing-reel.js` (`normCdf`, `capZ`),
`loop-gear.js` (`raftStats`, `raftTerms`, `orderCount`), `loop-finds.js` (`owned`, `findBiteBonus`, `findBaitFloor`),
`home-shelf.js` (`baitBedFloor`) and `progression-loop.js`'s pure `shelfItems`.

```
sheetModel(meta, D, { run = null, view = {}, live = null }) → Sheet
  meta  the save (meta.loop, meta.journal, meta.gearPin)
  run   the trip's run on a trip (its lure, equippedBait, bait counts, zone, character, bites, mercy), else null
  view  the page's picks: { place: placeId | null, light: 'day' | 'dusk' | 'night', cls: 'trophy', section }
  live  on a trip: { waterKey, place, light } (where the raft is and the hour, from main), else null
sheetKeys(metaLoop, D) → string[]           every owned key a "new" mark can carry (§5.2)
sizeOdds(mu, { min, max, cap }) → { small, keeper, prize, trophy, elder }   the size roll's truncated normal, exactly
favourHere(D, metaLoop, { place, light, bait, quiet, mercy }) → { terms: [{family, id, value}], mu, notches }
passiveExact(D, wickId, waterId) → { id, values }   the exact line's numbers
```

**`Sheet`**:

```
{ water, wick: { id, name, look, passive: { id, exact: { id, values } }, worn: [lookId] },
  tackle: { rating: { reference, held, next, word } | null, slots: [Plate rod, line, reel], hook: Hook },
  raft:   [Plate hold, oars, keel, lantern], raftLooks: [lookId],
  home:   [Plate orders, baitBed, wall, lights], parts: [{ key, id, effect: { glyph, n, on } , fresh }], homeLooks: [lookId],
  buffs:  [{ key, source: { kind, id }, effect: { kind, value, scope }, live }],
  odds:   { where: { place, choices: [{ id | null, kind }] }, light, hook: Hook,
            here: { terms, mu, notches }, size: { small, keeper, prize, trophy, elder }, elderHere,
            bites: { good, spent | null }, rows: [{ id, giant, legend, share, land: { small … elder } | { legend } }], unmet,
            ref: { speciesId, cls, pinned } | null },
  fresh:  [key] }
Plate = { key, slot, level, name, owned, notches: { on, of }, values: {…}, next: { key, name, price, compare: { from, to } | null } | null, fresh }
Hook  = { lure, bait, lures: [id], baits: [{ id, count }], canFit }
```

It holds ids and numbers only; `ui-sheet.js`'s `sheetView(model, D, {phone})` (pure strings, node-testable, as
`catalogueView`) turns them into words through `TEXT_LOOP.sheet` and the built formatters (`ui-af.gearLine`, `compareLine`,
`ratingLine`, `bitesBlock`'s "<1%" and unmet rules, `data.catchDisplay`).

### 7.2 The rules it follows

- **Defaults**: the picks of §3.5; the hook from `run` on a trip, else `meta.loop.fitted`; the reference of §3.2.
- **Who bites** at a place: `castOdds(D, {pool: D.placePool(D.SPECIES, {placeId, phase, bait, wickId, water}), area: null,
  phase, lure, bait, wickId})`, the entries summed by species (no rule, no pre-roll, no comeback, no Taper first bite: a plain
  cast). In the open water: `watercraft.openMix(D, {light, lure, bait, wickId})` (§7.3). The legend's row at her crown on her
  bait in her hours (§3.5).
- **Your odds**: `D.catchParts(sp, cls, {rod, line, reel}, {strike: 'struck'})` with the hook's Hold for that fish (the
  larger of the lure's and the bait's, `D.catchItemHold` as §8.1 makes it); a class the place cannot roll (`capZ`) is null.
  Never `marked`, `wounds` or a comeback's buff.
- **Bigger fish here**: the species-independent terms of a plain cast as `fishing.js` builds them under the loop (the place's
  `LOOP.place.favour`, the hour's `BALANCE.favour.hour`, the tin's `BALANCE.favour.tackle.bait`, `raftTerms`, and on a trip at
  `live.waterKey` the quiet and let-go terms of `loop.favour`), summed and capped as `sumFavour`, notched as `favourNotches`.
- **Notches**: tackle `of` = the tiers whose `shelfAt` water is owned (T1–T2 in M1); the hold's = the ladder to `shelfMax`;
  a raft or home part's = its levels whose `with` water is owned. `on` = owned.
- **Next**: the slot's unbought card from `shelfItems(D, metaLoop)` (its id, name and price, the factor in); none at the top.
- **Names**: a row only for a met fish (`meta.journal[id]` caught or seen); `unmet` counts the rest; the rating line only once
  its reference fish is met.
- **Fresh**: `sheetKeys(metaLoop, D)` minus `metaLoop.sheetSeen`.

### 7.3 The helpers it adds elsewhere (small, additive)

| file | what | why |
|---|---|---|
| `src/watercraft.js` | **`openMix(D, {light, lure, bait, wickId})`**: the blind caster's open-water mix at one hour (the private `eveningMix` made one light, which `eveningMix` then sums); `bitesTable` unchanged | the Odds' open water at the hour picked (WC-3's Who bites is the evening's day and dusk only: `LOOP.evening.night` is null, so it never shows the night's fish) |
| `src/data.js` | **`catchItemHold`** on the Mossmere under the loop: a tin's or lure's Hold goes to `watercraft.gradeTargets(itemId)` (the Spinner its named giants) for a fish with a hook row, as the sim's `itemHold` already does; `import` of `watercraft.js` (pure, no cycle) | §8.1: one rule for the roll, the sim, the gear line and the sheet |
| `src/data.js` | `TEXT_LOOP.sheet` (§6) | the words |
| `src/progression-loop.js` | `loop.sheet(view)` (the model on the live save and run), `loop.markSheetSeen(keys)`, `migrateLoop` seeding `sheetSeen`, both in `LOOP_METHODS` | the view's one door; the save |
| `src/murk-engrave.js` | the plates `rod:0`, `line:0`, `reel:0` and `hook:bare` | the tier-0 tackle and the bare hook were never sold |
| `src/ui-catalogue-murk.js` | `export` of `PAPER_NOISE`, `FIBRE`, `CORNER`, `RULE` and the `--cat-*` token block as `PAPER_CSS` | the flyleaf is the book's paper |

### 7.4 The node tests (`tools/tests/loop-sheet.test.mjs`, new)

| # | the test |
|---|---|
| S1 | **Shape**, on a fresh save for each of the five Wicks and on the example save: every section present; the exact line's values equal `LOOP.wicks`'s (Taper 1.3 and 12; the Wick 40 and round(0.4 × 7) = 3; …) |
| S2 | **Tackle**: T0–T2 names and notches (`of` 2 in M1, 3 once Sporewood's map is owned in a fixture); `next` equals `shelfItems`' unbought card for the slot, id and price, at factors 1 and 2; no T3, Hold 7 or Keel III in M1; the rod's cast and strike values equal `TACKLE.rod` |
| S3 | **The Hold rule** (§8.1): for every Mossmere fish × every hook item, `D.catchItemHold` equals the sim's `itemHold` (`clams.mjs`), and the fish it helps are `gradeTargets`; off the loop `catchItemHold` is the built one (the v1 fingerprint unchanged) |
| S4 | **Who bites**: for every owned place and the open water × day, dusk and night × every owned hook and the bare hook, the rows plus the unmet sum to 1 within 1e-9 and equal `castOdds` (a place) or `openMix` (the open water); the evening's mean of `openMix` (each light weighted by `LOOP.evening` × its summed area shares, as `eveningMix` does) equals `bitesTable` within 1e-9 |
| S5 | **The user's rule on the page**: every grade-0 fish's share is ≤ 0.01 and prints "<1%"; on Mire Worms and on the bare hook the Reedjaw Pike prints "<1%" at every place and hour |
| S6 | **Your odds**: every figure equals `catchParts` with the hook's larger Hold and the struck strike; Elder is null in the open water, the Lily Maze and the Buoy Lights (but for the Hullkiss Lamprey there, a giant at its own
place) and a number at Under the Span; the legend's one figure equals `catchChance(id, 'legend')` with no wounds |
| S7 | **How big they run**: `sizeOdds` against 200,000 seeded `rollZ` draws within 0.3 points at μ 0, 0.7 and 1.25 and both caps; `favourHere` equals `fishing.js`'s species-independent terms for a plain cast at each place × light × bait (through `loop-watercraft.test.mjs`'s fishing harness) |
| S8 | **Buffs**: each owned item's buff with its exact value; on a trip the let-go and quiet terms equal `loop.favour(key)`; the good bites equal `goodBitesFor` with the Lamp-Glass and Tallow; **the hidden save** (a marked Thousandcast Pike, a wounded Matriarch, Ashwick's comeback waiting) gives exactly the figures of the same save without them, and no field names them |
| S9 | **Names**: no unmet fish's id or name in the view's strings; the rating line absent until the Reedjaw Pike is met; the pin to an unmet fish is refused |
| S10 | **Fresh**: a buy marks its key; `markSheetSeen` clears it; a fitted find marks `find:<id>`; `migrateLoop` on an older save seeds every owned key (no marks), a fresh save none; consumables never marked |
| S11 | **Words**: every string `sheetView` returns passes `textAllowed(t, {screen: 'sheet'})`; no `AREAS` id and no area word of WATERCRAFT §2.1 anywhere; no percentage literal in `TEXT_LOOP`, `loop-sheet.js` or `ui-sheet.js` (the catalogue's scan extended) |
| S12 | **Live**: with `fakeLoop`, a `fit('bait', 'cut_strip')` changes exactly the hook-dependent fields (the bait plate, the buffs' tin row, here, size, rows, land); a pick of the Buoy Lights moves the light to night |
| S13 | **Flag off**: no sheet, no tab, no pause item, `openTackle` the built gear log; `validate-data` passes 1 and 2 bit-identical |

---

## 8. The rulings on the audit's conflicts

### 8.1 The Hold targets: one rule, made true in the roll

WATERCRAFT §3.7 (binding) says a tin's or lure's Hold helps the fish that like it or better (`gradeTargets`), and WC-1's sim
does so (`clams.mjs`'s `itemHold`), and WC-3's gear line says so; but **the land roll the game draws from**
(`data.catchItemHold`, through `catchParts`) still used CATCH_V3's family and attract rules. *Measured* differences: the Bone
Jig's roll helped the Mossback Perch, the Gutter Crayfish, the Rustfin Sucker, the Weeping Carp and the sturgeon, while its
line named the perch, the bass, the zander, the trout and both pikes; Mire Worms' roll left out the chub, the bass and the
sturgeon; Lumen Moss helped only the koi; the Feather Fly helped the koi and not the bass or the trout; the Glimmer Spoon
helped the Hullkiss Lamprey (its line did not) and not the Mossback Perch. **Ruling: the game's `catchItemHold` follows §3.7
on the Mossmere under the loop** (decision 108), so the roll, the sim, the gear line, the Journal's "With the {item}" and the
sheet are one rule. The sim's pacing does not move (the sim already used it); test S3 holds them together.

### 8.2 Three copies of `watercraft.js`

WC-1's is merged (b527fae). WC-2's is the same file. **WC-3's older copy is dropped at its merge** (the integrator takes WC-1's
file whole; WC-3 reads it and never edits it, CONTRACT §14.16). The sheet's `openMix` is added to the merged file.

### 8.3 Per-area odds

The user's words ("different areas … different % chances") are built: `castOdds` uses the area. WATERCRAFT §2.6 keeps each
area's share off every screen so that reading the water stays the player's skill, and **the sheet keeps it** (decision 106):
its open water is one row, at an hour and on a hook, the blind caster's mix over the areas. A place is not an area: it is
named on the Chart and sold by its map, and its pool is shown. **§11 question 41 asks the user** whether the sheet should also
show "Here", the chances where your float last landed, the area unnamed (cheap: `castOdds` with the cast's stored
`S.cast.area`; it would make the sheet an area scanner, which is why the default is no).

### 8.4 The compare after WC-3

WC-3 stopped the auto-pin of the last lost fish and nothing calls `pinGear`, so the gear log's compare never shows. **Ruling:
the reference is the player's own pin, set by a tap on the Odds table, else the water's reference fish once met** (decision
109). A lost fish never pins itself (WATERCRAFT §7).

### 8.5 The gear log and the sheet: merged

The gear log under the loop listed every tier to T4 (Glassreed and Lantern-Spine, not on M1's shelf), every lure on the
shelf with its Who bites, and its compare. **Ruling: merged into the sheet** (decision 105): one page with one source for each
number, owned things and the next tier only, the Who bites at the hook you pick. Murk's book keeps selling: its plates and
their lines are the buying page; its last page's **Odds ›** opens the sheet.

### 8.6 Prices

The sheet prints the shelf card's price (`shelfItems`, the factor applied once there), never `LOOP.tackle.price` (which the
gear log read without the factor). Whatever factor the integrator's step P lands (×2 shipped today; ×3 designed; the sim's ×4),
the sheet and the book agree.

### 8.7 The double tables

| table | the sheet reads | the other copy |
|---|---|---|
| the marked giant's +6 (`LOOP.giant.markedHold`, `CATCH_V3.markedFish`) | neither: never shown | unchanged |
| Taper's giant rule (lane 4's `lurePool`, WC-1's `finishPool`) | `castOdds` (`finishPool`) | `lurePool` stays exported for other waters |
| Stub's light (`LOOP.wicks.stub.stats.lightRadius` +1.5 m, the light's look; WC-2's `sight.lantern.stub` ×1.5, how far a silhouette is seen at night) | neither: Stub's exact line carries no light figure, and the Lantern's "+15% light a level" is true of both | **for the lead**: one rule for both (WICKS §2.3 calls Stub's light "the look"; WC-2 made it see farther); until then the sheet prints no figure for it |

---

## 9. The build lane: one MEDIUM lane after tonight's merge (`gw-mvp-sheet`)

**Base**: `gw-m1-mvp` after tonight's merges (WC-1 is in; WC-3, WC-2, Murk's catalogue and the teach caption merge first, then
the integrator's step P). The lane needs WC-3's `bitesBlock` and the catalogue's `murk-engrave.js` and paper; if the catalogue
slips, the flyleaf falls back to the Journal's night ink with the engravings in pale ink (`currentColor`), and the lane says so.

**Read**: this document; SPEC §8.5, §8.8, §8.11, §8.12; WATERCRAFT §2.6, §3.7, §3.9, §4; WICKS §2; FINDS §3; CONTRACT §14.4,
§14.13, §14.15, §14.16; M1 §2.18; `BARGE-INSIDE.md`'s object list (for the rack).

**Builds**:

1. **The rule** (first commit, alone): `data.catchItemHold`'s Mossmere rule (§8.1) and its test S3; `clams.mjs
   --shipped=mossmere --step=5` re-run and unchanged.
2. **The model**: `src/loop-sheet.js` (§7.1–§7.2), `watercraft.openMix` (§7.3), `TEXT_LOOP.sheet` (§6), `loop.sheet(view)`,
   `loop.markSheetSeen(keys)`, `migrateLoop`'s `sheetSeen`; `loop-fixture.mjs`'s `fakeLoop` gains both methods; tests S1–S13.
3. **The view**: `src/ui-sheet.js` (new; its CSS injected once, as `ui-gear.js` does): `renderSheet(K, entry, content, model,
   {phone})`, the plates (`murk-engrave.engrave` and the four new plates, `ui-finds.drawFindArt`, `ui-icons.wickPortrait` and
   `passiveIcon`), the notches, the chips, the table, the jump row, the drop and its observer, the paper (`PAPER_CSS`); the
   desktop spread and the phone scroll of §4.
4. **The seams**:
   - `ui-screens.js`: the Journal's first tab `'sheet'` (the tab list, `tabKeys`, `catalogueBack`), `openSheet({from, section,
     pin, pauseChild, titleChild})` (opens or re-points the Journal; refused while a line is out), `openTackle` under the loop →
     `openSheet({section: 'odds'})`, the species page's gear link → `openSheet({section: 'odds', pin: speciesId})`, the trip
     pause's item (§2.2).
   - `ui-loop.js`: the home pause's item; the book's `openOdds` (already `openTackle`: unchanged, follows); `textAllowed`'s
     `'sheet'` screen and `allowedWords` with `TEXT_LOOP.sheet`; the home target `rack` (its button, no word, its accessible
     name), `homeTargetIds`.
   - `home-targets.js`: `TARGET_ORDER` and `TARGET_BOXES.rack`, `BARGE_LOCAL.rack`; `actors-home.js`: the rack's bounds in its
     target boxes (no new mesh, no new call); `tools/validate-data.mjs`: the frame check with `rack`, `TEXT_LOOP.sheet`'s
     scans (rows, words, no percentage literal).
   - The interiors (`BARGE-INSIDE.md`'s lane): `rack` and `openSheet({from: 'rack', section: 'tackle'})` (§2.3); whichever
     lands second wires it.
   - Murk's catalogue: the four new plates in `murk-engrave.js`; the paper's exports in `ui-catalogue-murk.js`.
   - WC-3: `ui-af.bitesBlock` is the table's formatter; `ui-gear.whoBitesHtml` is no longer drawn under the loop (it stays
     exported).
   - CONTRACT §14.17 (new): `loop-sheet.js`'s exports, `loop.sheet`, `loop.markSheetSeen`, `meta.loop.sheetSeen`,
     `screens.openSheet`, the `rack` target, `watercraft.openMix`, the Hold rule.
5. **Tests**: `tools/tests/loop-sheet.test.mjs` (S1–S13); the built suites green (`loop`, `loop-trip`, `ui-loop`,
   `ui-catalogue`, `loop-4`, `loop-5b`, `loop-finds`, `watercraft`, `loop-watercraft`, `murk-catalogue`, `loop-lost`).

**Files it owns**: `src/loop-sheet.js`, `src/ui-sheet.js`, `tools/tests/loop-sheet.test.mjs`,
`tools/tests/loop-sheet.scenario.mjs`; its additive edits in `data.js` (`catchItemHold`, `TEXT_LOOP.sheet`), `watercraft.js`
(`openMix`), `progression-loop.js`, `ui-screens.js`, `ui-loop.js`, `home-targets.js`, `actors-home.js`, `murk-engrave.js`,
`ui-catalogue-murk.js`, `validate-data.mjs`, `loop-fixture.mjs`, CONTRACT §14.17. It does not edit `fishing.js`.

**The browser gate** (`tools/tests/loop-sheet.scenario.mjs`, desktop 960 × 540 and 1280 × 720, phone 390 × 844 and 390 × 664;
the example save as a fixture, and a fresh save):

1. **Every way in**: the home pause item, the trip pause item (line in), the Journal's first tab, the rack target at home, the
   catalogue's foot **Odds ›** (lands at Odds), a caught fish's gear link (lands at Odds with that fish pinned), Murk's book's
   **Odds ›** (lands at Odds; **Back** returns to the book's page). **Refused while a line is out**: the trip pause item dimmed
   with "Reel in first."; the Journal glyph locked as built.
2. **Live**: at home a tap on the Cut Strip chip fits it (the Chart's slot then shows Cut Strip), and the Odds table, the
   buffs and the bait plate change to the node model's figures; on a trip the chips do nothing.
3. **The picks**: Under the Span brings the Thousandcast Pike's row (if met) and Elder figures where the open water shows
   "—"; the Buoy Lights moves the hour to night; every figure on screen equals `loop.sheet(view)`'s (a scan of the table against the model).
4. **The user's rule**: Mire Worms fitted and the pikes met: both read "<1%" at every place and hour.
5. **New**: a buy in Murk's book, then the pause item and the tab carry the drop; the sheet's plate carries it; scrolled into
   view for a second and the page closed, it is gone after a reload.
6. **Phone**: no horizontal scroll at 358 px; every text ≥ 16 px (a computed-style scan); every target ≥ 44 px and no two
   overlap (bounding rects); the tab row fixed, the page scrolling; the jump row reaches each section.
7. **Words**: every visible text node and accessible name passes `textAllowed(t, {screen: 'sheet'})`; no area word; no unmet
   fish's name; after a forced Trophy loss and a forced giant loss, nothing on the page differs.
8. **Look**: captures of the spread and the phone column, fresh save and the example save; two look-and-fix rounds; the user's
   look before the merge.
9. **Budgets**: `clarity-perf --home` and `--loop` unchanged (the page is DOM; the rack adds no draw call); the page opens in
   under 50 ms on the low tier (model and DOM); `index.html` ≤ 3.3 MB.

**Size: MEDIUM** (3–6 days): the rule and the model a day, the view two, the seams a day, the tests and the gate one to two.

---

## 10. What this changes elsewhere

- **SPEC v8.8**: §0 row 38 (the user's words), §0.14, decisions 105–110; §3.7 (the Hold row, the odds row); §8's rule (the sheet is the logs' page); §8.4 (the
  shelf's **Odds ›** opens the sheet); §8.5 (the pause menus' item); §8.8 (the catalogue's foot **Odds ›**); §8.11 (the gear
  log's words now print on the sheet); §8.12 (new: the sheet's words); §12 (this file binding); §16 questions 41–43.
- **M1 revision 9**: the header, §0 (the user's words), §2.5's Odds › box, §2.6 (the rack), §2.8 (the screen list), §2.10
  (words), §2.18 (new: the sheet's boxes, among them every Odds ›), §4 step S (new), §9.
- **WATERCRAFT.md**: §3.7 is now true in the land roll (§8.1; no word of it changes); §3.9's gear log is the sheet's Odds
  (its Who bites at an hour and a place, the same rows).
- **CONTRACT**: §14.17, by the lane.
- **BARGE-INSIDE.md**: the rack's seam (§2.3), for its author to place.

---

## 11. Questions only the user can answer (each with the default this document builds)

41. **Should the sheet show the chances where your float is, by area?** *Default: no.* The sheet shows the open water as a
    whole and each place you own, at the hour and on the hook you pick; which part of the lake is better stays something you
    read on the water (WATERCRAFT §2.6). The other way: a "Here" row with the chances where your float last landed, the area
    never named; it would let the page tell you where to cast.
42. **What is the page called on the pause menu and the tab?** *Default: your Wick's own name* (with its passive's picture),
    the way the Journal is already "Taper's Journal". The other way: one word for every Wick, "Sheet".
43. **Can you change your bait and lure on the sheet?** *Default: yes, at home*: a tap on a bait or lure on the sheet puts
    it on the hook, exactly as the Chart's slots do, and every number on the page changes with it; on a trip the hook stays as
    you sailed. The other way: the sheet only shows; you fit them on the Chart.

---

## 12. After the lane (could)

- A small drawn map in the Odds' head: the chart table's own sheet (`chart-top.drawToTexture`) with the owned places' blots as
  the Where chips.
- The rack's art: the fitted lure on its peg, the tin on its shelf, the line on the reel (with the interiors).
- The species page's "Your odds" block gains the sheet's hook chips (fitted from there too).
- Each later water fills the sheet with its own rows as its slice ships: its places, its hook rows, its tiers' notches.
- A per-Wick history line (firsts sold, comebacks landed), if the user asks for records on the sheet.
