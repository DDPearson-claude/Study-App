# The Wick's sheet: your gear, your buffs and your odds on one page (binding design, v2)

*Written 16 November 2026, after the user's hour with the published preview; **v2** the same evening, after the design and
build reviews (§13 logs every finding and what became of it). Binding with `SPEC.md` v8.8 (§0 row 38, decisions 105–110,
§0.14, §8.12) and `M1.md` revision 9 (§2.18, §4 step S). It builds on `WATERCRAFT.md` revision 2 (§2.6, §3.7, §3.9, §4),
`WICKS.md` §2, `FINDS.md` §3 and §6, SPEC §8.8 (the catalogue) and Murk's catalogue (`gw-mvp-catalogue`). The barge's
interiors are `docs/loop/BARGE-INSIDE.md` (branch `gw-design-inside` @03cae59, written beside this one); §2.3 is the seam, and
both documents bind it. Scope: the Mossmere (M1); every later water fills the same page with its own rows. Design only: no
`src/` or `tools/` file is changed by this document.*

*Figures marked *measured* come from scratch probes against `gw-m1-mvp` @3cb9539 (WC-1, WC-3, WC-2 and the teach caption
merged) through `tools/tests/loop-fixture.mjs`, the merged `src/watercraft.js`, `tools/sim/clams.mjs` and the home targets'
own projection, with the land roll's Hold rule made as §8.1 makes it. None of them is typed into the game: the page prints
what the game's own functions give. Never name any television series or presenter in anything written from this document.*

**What v2 changed.** The rarity bonus a tin carries (Lumen Moss's +0.10) is in every bite figure, as the roll has it (§3.5,
§7.2). The size figures carry the lure's and Cut Strip's family terms and the pinned fish's own terms (§3.5). Every upgrade's
effect is shown **as a chance** ("Trophy 15% → 19%"), owned and next, not as unitless favour (§3.3, §3.4). "Hold" means the
grip only; the creel is its name and its glyph (§3.3). The page is "Taper's Sheet" on the pause menu and the tab (§2.1, §11
question 42). On a phone, Buffs come straight under the Wick, and plates fold to one row (§4.2). The Hold rule is a loop-only
data patch, not an edit of `catchItemHold` (§8.1, the review's blocker). The home target sits clear of the chart table at
every validator size (§2.3); the model's place, hour and phase words are named (§5.1, §7.2).

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
| a page | **the Wick's sheet**, "Taper's Sheet": one page, the Journal's first tab (its flyleaf); opened from the pause menu, from **the ledger on the Wick's desk inside the cabin** and the rod rack by its door (`BARGE-INSIDE.md` §4.3), and from every **Odds ›** | §2 |
| our gear quality | each piece of tackle, raft and home drawn as an engraved plate (Murk's catalogue's hand) with its name and a **quality mark in the float's own notches**: one ink notch for each tier or level you own, a hollow notch for each one Murk sells that you do not | §3.2, §3.3 |
| what we have as upgrades | every upgrade you own, the raft's and the home's, the barge parts you found and the looks you wear, each with what it does; the next tier of each piece Murk sells, with its price and what it would do | §3.2, §3.3 |
| how they impact our catch chances | **every upgrade's effect as a chance**: a tackle tier as the land chance of the fish you pin ("Thousandcast Pike (Trophy): 25% → 29% with this."), a keel, lantern or tin as the share of bites in a size class ("Bigger fish." then "Trophy 15% → 19%"); **who bites** where you fish, at that hour, on that hook (the 1% rule shows as "<1%"); and **your odds**, the land chance of each fish you have met | §3.2–§3.5 |
| a master character sheet or stats page … to see our buffs | the Wick, its passive and the passive's **exact** effect; **Buffs**: every modifier that is on, each with its source and what it does to your chances, at the top of the page on a phone | §3.1, §3.4, §4.2 |

**The standing taste (binding).** "Art, atmosphere and fishing those are our key drivers." Drowned Filigree: the sheet is a
page of old paper inside the Journal's night ink, its plates engraved, its rules and corners Murk's book's, candle amber only on
a price. The sheet is a **log**: it shows chances, plainly, and it is the one page where they live; nothing it shows ever
reaches the water, a card or the catalogue's fish. No way to fail. Few words: every string is §6's. Sizes in pounds and ounces
(the sheet shows none: a size class is its name). Phone 390 × 844 and 390 × 664, a 358 px column, text ≥ 16 px, targets ≥ 44 px.

---

## 1. The design on one page

1. **One page, "Taper's Sheet".** The Journal's first tab is the sheet, its flyleaf: the tab reads the Wick's name with
   "Sheet" ("Taper's Sheet", as the Journal is already "Taper's Journal") beside the Wick's small portrait. The pause menu (at
   home after the tutorial, and on a trip) carries the same label and portrait. Aboard, the ledger on the Wick's desk opens it
   at its head and the rod rack opens it at Tackle; every **Odds ›** opens it at its Odds. It replaces the gear log under the
   loop (§8.5); off the loop the built gear log is untouched.
2. **What you are**: the Wick's portrait, its name, its passive's name, picture and line, and **one more line with the
   passive's exact numbers** in the same plain register ("First bite never a common fish. Giants ×1.3 as often, to 12%.").
3. **What is on (Buffs)**: every modifier with its source and **what it does to your chances at the water, hour and class you
   picked**: "Keel II · Bigger fish. · Trophy 15% → 19%". On a phone this is the second thing on the page.
4. **What you own**: Tackle (Rod, Line, Reel; the lure and the bait on the hook), Raft (the creel, Oars, Keel, Lantern), Home
   (Murk's Order Board, the Bait Bed, the Long Wall, Barge lights) and the barge parts you found, each an engraved plate with
   its name, its notches, what it does, and the next tier Murk sells with its price and its effect as a chance. Things you do
   not own yet are drawn faint, with no line and no number.
5. **What it does to your chances (Odds)**: for a water or place you pick, an hour, a hook and a size class: how big the fish
   run there (the plain cast's line, one line for each family a lure or Cut Strip favours, and the pinned fish's own line);
   **who bites** (every fish you have met by name with its share of bites, the rest counted); and **your odds** (the land
   chance of each at the class picked; the pinned fish's row opens to all five classes). Every number comes from the function
   the game draws from (`watercraft.castOdds` with the roll's rarity bonus, `data.catchParts`, the size roll's own truncated
   normal), so the page cannot disagree with the lake.
6. **It never shows** an area's share or name (WATERCRAFT §2.6; §11 question 41 asks the user), a fish you have not met, a
   marked giant, a legend's wounds or a waiting comeback, a size of a hooked fish, or anything while a line is out.
7. **Live and new**: the page re-reads the save on every change (a bait fitted, a buy, a find fitted at dawn); a tap on the
   page's hook fits it at home, as the Chart's slots do; a newly bought or found thing carries **a small pink ink drop** until
   you have seen it on the page, and so do the ways in.
8. **One pure model**, `loop-sheet.js`'s `sheetModel(meta, D, opts)`, with its node tests; **one MEDIUM build lane after
   tonight's merge** (§9).

---

## 2. Where it lives

### 2.1 The Journal's flyleaf (the tab)

The loop's Journal (`ui-screens.js` `renderCatalogue`) has, today, one tab per owned water, **Prints** and the giants' ★. The
sheet becomes **the first tab**. Its label is `TEXT_LOOP.sheet.title` filled with the Wick's name ("{name}'s Sheet": "Taper's
Sheet", "The Wick's Sheet"), the possessive the Journal's title already uses; its glyph is **the Wick's small portrait**
(`ui-icons.wickPortrait`, in the dye it wears); while anything on the page is new, the pink drop (§5.2) follows the label. **At
358 px, if the tab row does not fit** with the full label (the lane measures it), the tab shows the portrait and the bare
name; the pause item always carries the full label. The tab's accessible name is always the full label.

The Journal still opens on the water's tab when opened from the HUD glyph, the lectern or the Chart's book glyph; it opens on
the sheet when opened from the pause item, the ledger, the rack or an **Odds ›**. The tab keys (`tabKeys`) take the sheet first.

The flyleaf is **paper**: one page of Murk's catalogue's vellum (its `--cat-paper` tokens, its noise and fibre, its corner
ornaments and its rule, exported as `PAPER_CSS`, §7.3) laid on the Journal's night pool, so the engravings print in their own
ink and the sheet reads as the page the Wick wrote its name on. The other tabs stay night ink.

### 2.2 The pause menu

| where | today (SPEC §8.5) | with the sheet |
|---|---|---|
| on a trip (`openTripPause`) | **Resume** · **Home** · **Settings** | **Resume** · **Taper's Sheet** · **Home** · **Settings** |
| at home (`openHomePause`, Escape or the pause glyph) | **Resume** · **Settings** | **Resume** · **Taper's Sheet** · **Settings**, once the opening's tutorial is done |

The item is a menu button (`gw-mbtn`) with the Wick's portrait as its icon and the pink drop while something is new. It opens
the Journal on the sheet over the pause (`pauseChild`); **Back** returns to the pause.

- **During the opening's tutorial** the item is not offered, at home or on the tutorial's trip: the home pause stays exactly
  **Resume** · **Settings**, so loop-1a's T73 holds unchanged, and the tutorial's few words stay few. The sheet's scenario
  checks the three-item pause after it.
- **On a trip it is refused while a line is out**, exactly as the Journal glyph is (`K.refuseLocked`, `K.logLocked`): the item
  is dimmed and carries the built "Reel in first." (`AUTOFISH.text.logLocked`) as its small second line, so no odd is ever on
  screen during a bite, a play or the show (SPEC decision 62).

### 2.3 On the barge: the ledger inside, the rod rack by the door (the seam with `BARGE-INSIDE.md`)

`BARGE-INSIDE.md` (committed on `gw-design-inside` @03cae59, its §4.3 and decision 116) gives the sheet two things aboard, in
first person, and this design binds both:

| object | where (BARGE-INSIDE's place) | the call | opens at |
|---|---|---|---|
| **the ledger** (target id `ledger`) | on the Wick's desk **inside the cabin**, aft-starboard under the aft window, in the **Hearth**'s frame (27% across, the window's cool light on it, its candle the desk's living light) | `screens.openSheet({from: 'ledger'})` | the head: the Wick, and on a phone Buffs right under it |
| **the rod rack** (target id `rack`) | on the cabin's aft wall port of the door, on the stern deck under the awning, in the **Deck**'s frame; the rod you own hangs on it in its tier's colour, the rods it replaced on pegs below | `screens.openSheet({from: 'rack', section: 'tackle'})` | Tackle |

**The seam is two ids and two calls, and they are a must in both documents.** The interiors own where the objects are, how
they are drawn and the close look that leans in before the page opens; the sheet owns what opens. Closing the sheet returns to
the close look, which glides back (BARGE-INSIDE §4.3). Whichever lane lands second wires the calls; until the sheet lands, the
ledger opens the built gear log (BARGE-INSIDE §9). The rack's art may grow with the sheet (a could, either lane): the fitted
lure on its own peg below the rod, the tin on a shelf under it.

**Today's third-person home view** (`home-targets.js`, the arrival framing; BARGE-INSIDE keeps it as the tutorial's view and
the fallback) gains a fifth target, **`rack`**, after `journal` and before `wall` in the focus order. It draws **no word**; its
accessible name is the full label.

- **Its box**: `TARGET_BOXES.rack` = x −1.12 … −0.88, **y deck + 1.0 … deck + 2.05**, z the aft wall (`cabinAft`) … + 0.2, in
  the barge's frame: the rack's upper half, where the rod hangs. A box from deck + 0.15 fails `frameCheck` at every phone size,
  because from the portrait pose the chart table sits in front of the rack's lower half (*measured*: at 358 × 664 the rack
  projects to x 127–135, y 291–339 and the chart to x 93–128, y 326–357). From deck + 1.0 there is **no raw overlap and the
  layout passes at all eight validator sizes** (358 × 664, 358 × 775, 390 × 844, 390 × 664, 960 × 540, 1280 × 720,
  1920 × 1080, 844 × 390; *measured* with the shipped cameras), so no phone-only drop is needed.
- **Its word slot**: `frameCheck` (`home-targets.js`) and `ui-loop.js` `placeTargets` both hard-code `words: {wall: false}`;
  both gain `rack: false`, so the rack is checked and laid out with no word slot.
- **Its id everywhere the targets are listed**: `TARGET_ORDER`, `targetCorners`' id list, `actors-home.js` `targetBoxes`' id
  list, and `ui-loop.homeTargetIds(metaLoop)` → `['murk', 'chart', 'journal', 'rack', …wall]`. `loop-5a.test.mjs` lines
  255–256 deep-equal `homeTargetIds`' output and are updated with it; loop-5a (test and scenario) joins the suites that must stay
  green (§9).

### 2.4 Every Odds › and the old gear log

Under the loop **the gear log is the sheet**: `ui-screens.js` `openTackle(extra)` opens the Journal on the sheet at **Odds**
(`openSheet({section: 'odds', ...extra})`), so every caller follows with no change of its own:

| caller | today | with the sheet |
|---|---|---|
| the catalogue's foot, **Odds ›** (`renderCataloguePage`) | the gear log | the sheet's Odds (the same Journal, its first tab) |
| a caught fish's species page, the gear link (`speciesDetail`) | "Your gear log ›", only while `ctx.flow === 'playing'` | under the loop: **"Odds ›"** (`TEXT_LOOP.odds`), **at home and on a trip**; it pins that fish at the class the page lights (`s.hl`, else Trophy) through `ctx.progression.pinGear(id, cls)` and opens the sheet's Odds; off the loop as built |
| Murk's book, its last page's **Odds ›** (`gw-mvp-catalogue`: `deps.openOdds`) | the gear log | the sheet's Odds over the book; **Back** returns to the book at that page |
| the shelf's Tackle tab **Odds ›** (the book's card fallback) | the gear log | the sheet's Odds |
| debug `openTackle()` | the gear log | the sheet |

The gear log's own content moves onto the sheet: its rows become the plates' lines (§3.2), its rating sentence the Tackle
head, WC-3's **Who bites** the Odds table (§3.5), its pinned compare the plates' compare lines (§8.4). Off the loop
`openTackle` is the built gear log, byte for byte.

---

## 3. What it shows

The worked example throughout (*measured*): **Taper**, evening 14, at home; the **Double Creel** (five slots); **Ashwood**,
**Braided Gut**, **Clockwork** (Rod T1, Line T1, Reel T2); **Mire Worms** on the hook (7 in the tin; 3 Cut Strip in the bag;
the **Glimmer Spoon** and the Feather Fly owned); **Oars I**, **Keel II**, **Lantern I**; **Murk's Order Board I**, **Bait
Bed I**, **the Long Wall, wing I**; found: the **Rust Buoy-Bell** and the **Gate Lamp-Glass**; worn: the **Slate Cloak Dye**
and the **Oxblood Pennant**; places owned and lifted: the Lily Maze and Under the Span; met: every open-water fish but the
Milkeye Perch and the Lampsipper, and the Bridgechain Sturgeon and the Thousandcast Pike, which the player has pinned at Trophy.
The picks: Under the Span, dusk, Trophy. Prices at today's shipped factor, ×2 (`LOOP.cost.shipped`). **The worms come first**
(the user's rule is the first thing the page shows); §3.5's second table fits the spoon over them.

### 3.1 The head: the Wick

| element | what | from |
|---|---|---|
| portrait | the Wick's small candle portrait, in the dye it wears (`ui-icons.wickPortrait(look)` with a worn cloak dye's colour) | `CHARACTERS`, `meta.loop.looks` |
| name | the Wick's name, spaced capitals (Marcellus SC, 29 px phone / 36 px desktop) | `CHARACTERS[wick].name` |
| passive | its picture (`passiveIcon`, 56 px), its name and its built line ("Long Reach" · "Evenings start with a rarer fish.") | `TEXT_LOOP.passives`, `.wicks` |
| **exact** | one line under the built line, in the same plain register, a little smaller and in italic: the passive's own numbers, filled from `LOOP.wicks` (never typed) | §6 `sheet.exact` |
| worn | the looks the Wick wears, as small plates (name only, no number): the Slate Cloak Dye; a look worn on the rod sits on the rod's plate | `meta.loop.looks`, `meta.loop.finds.worn` |

The five exact lines (*from `LOOP.wicks` as it stands*; each ≤ 72 characters, two rows at most in the 358 px column):

| Wick | its built line | the exact line | filled from |
|---|---|---|---|
| the Wick | "New kinds and new bests sell higher." | "Each sells ×1.4, at least 3 more. Never a giant." | `firstMult` 1.4; `firstFloor` 0.4 × the water's tier (7 on the Mossmere) = 3 |
| Taper | "Evenings start with a rarer fish." | "First bite never a common fish. Giants ×1.3 as often, to 12%." | `firstBites` 1, `giantShare` 1.3, `giantCap` 0.12 |
| Stub | "Fish bite sooner and keep biting." | "Bites sooner ×1.28. Quiet water costs ×0.5 as much, and never slows them." | 1 / `waitMul` 0.78; `quietStep` 0.08 ÷ the built 0.15 a bite; `quietWait` false |
| Tallow | "One more slot in the hold." | "+1 good bite at every water and place, too." | `good` 1, `everyWater` (its `slots` 1 is the built line's) |
| Ashwick | "A fish that gets away comes back." | "Once, tired: +4 Hold when it bites again. Never a giant." | `hold` 4 (never a giant or a legend, WICKS §2.5) |

Ashwick's line never says whether a fish is waiting (WATERCRAFT §7: the lost fish is a mystery). "Hold" here is the grip, the
only meaning the word has on the sheet (§3.3).

### 3.2 Tackle: Rod, Line, Reel, the lure, the bait

**The head line** is the built rating sentence (`catchRating` through `ui-af.ratingLine`, words only), shown once its
reference fish (the Reedjaw Pike on the Mossmere) has been met: *"Against the Reedjaw Pike: holds Prizes. Trophies are a coin
flip."* with the spoon on; "holds Keepers. Prizes are a coin flip." on the same tackle with worms alone; "holds Keepers. Prizes
are a long shot." on a fresh save's (*measured*).

**A plate** (one per piece; on a desktop always open, on a phone folded to one row until tapped, §4.2):

```
[ engraving ]  ASHWOOD                    ▮▯          ← name (Marcellus SC) · the notches
               Casts 17.5 m · 4% longer to strike     ← what it does (the rod only)
               +2 Hold on every fish · counts ×1.6 against leapers.   ← the built gear line
               Next: Whalebone · 600                  ← the next tier on Murk's shelf, its price
               Thousandcast Pike (Trophy): 16% → 19% with this.        ← the built compare line
```

- **The engraving** is Murk's catalogue's (`murk-engrave.engrave(card)`, the shelf's card id: `rod:1`, `line:1`, `reel:2`,
  `lure:glimmer_spoon`, `tin:mireworm`, `bait:heartmoss`), 120 × 90 on a desktop, 56 px square folded on a phone and 44% of
  the plate open. The lane adds the four plates the shelf never needed: the **Willow Switch**, **Twine**, the **Wooden
  Winch** (tier 0) and **the bare hook**, in the same hand (§7.3: `engrave` today draws `rod:0` as the Ashwood, and `plateKey`
  has no `hook` slot). A look worn on a piece is drawn on its plate.
- **The quality mark: the float's notches.** The same slanted ink strokes the float shows its favour with (`.gw-fav-ticks`),
  inked on paper: **one solid notch for each tier you own, one hollow notch for each tier Murk sells now that you do not**
  (`LOOP.tackle.shelfAt` with the waters you own; the creel's ladder to `LOOP.hold.shelfMax`; a raft or home part's `with`).
  In M1 a tackle slot has two notches (T1, T2): the Willow Switch ▯▯, the Ashwood ▮▯, the Whalebone ▮▮. Nothing past the
  shelf's era is drawn (M1 §2.5: no T3, no sixth slot past the Wellbox, no Keel III): when Sporewood's map puts Glassreed on
  the shelf, a third hollow notch appears. Its accessible text is "{n} of {of}", numbers only.
- **What it does**, plainly, in numbers:
  - **Rod**: "Casts {m} m · {n}% longer to strike" (`TACKLE.rod[t].castMax`, `(hookWindow − 1) × 100`): the Willow Switch
    16 m and 0%, the Ashwood 17.5 m and 4%, the Whalebone 19 m and 8%.
  - **Rod, Line, Reel**: the built gear line, "+{hold} Hold on every fish · counts ×1.6 against {styles}." (`ui-af.gearLine`;
    the rod against leapers, the line against thrashers, sinkers and sulkers, the reel against runners: `CATCH_V3.emphasis`).
  - **The lure and the bait** (§3.2.1).
- **Next**: the card Murk's shelf offers for that slot now (the shelf the model is given, §7.1: `progression-loop.shelfItems`'
  unbought card for the slot, its price as the shelf prints it, the factor already in), in the goal line's own form, "Next:
  {name} · {price}". At home a tap on it opens Murk's book at that card (`openShelf({focus: id})`, the book's `focusPage`); on
  a trip it is not a button. A slot at the shelf's top has no Next line.
- **The compare**: the built line "{name} ({class}): {from} → {to} with this." (`AUTOFISH.text.gear.compare`), the land chance
  of **the reference fish** at **the reference class** with your kit now and with that one tier changed (`data.catchParts`,
  the struck strike the logs use, the hook's Hold as §3.5 counts it). On the example (worms alone): the Thousandcast Pike
  (Trophy), the Whalebone **16% → 19%**, Waxed Silk **16% → 23%** (*measured*; the line counts ×1.6 against a thrasher). With
  the spoon fitted over the worms: **25% → 29%** and **25% → 35%**. With no pin, the default is the water's reference fish, the
  Reedjaw Pike (Trophy): 29% → 33% and 29% → 39% on worms; 42% → 46% and 42% → 52% with the spoon. A compare whose two figures
  are equal is not drawn.
  - **The reference fish** is the player's pin, else the water's reference fish once met, else the first fish of the water's
    list the player has met, else none (no compare line is drawn). **The pin is set on the Odds table** (§3.5): a tap on a
    fish's row pins it, a second tap unpins it; the pinned row carries the gear log's hook glyph. The pin is the save's
    `meta.gearPin` (`progression-af.pinGear(speciesId, sizeClass)`, built, never called today: WC-3 retired the auto-pin of the
    last lost fish, and the sheet must not bring it back).
  - **The reference class** is the one picked on the page (§3.5's class chips): `meta.gearPin.sizeClass` while a fish is
    pinned (a class pick re-pins at that class), the page's own pick otherwise, Trophy until the player picks another. One
    class governs every compare and every move on the page.

#### 3.2.1 The lure and the bait

Two plates side by side on a desktop (stacked on a phone): **the lure on the hook** and **the bait on the hook**, each with
the owned others as small glyph chips beneath it (the Chart's slot glyphs, `ui-gear.GEAR_GLYPH`, the bait's count on its
chip, and a **—** chip for none). **At home a tap on a chip fits it** through the same call the Chart's slots make
(`ctx.progression.loop.fit('lure' | 'bait', id)`), and the whole page re-reads (§5.1); **on a trip the chips are read only**
(the hook is the run's).

**A lure tipped with a bait.** When both are on, the lure's chip carries the fitted mark and the bait's chip carries a small
**tipped** glyph (a barb under the count; accessible name "Tipped", no visible word): the lure decides who bites (`gradeOf`:
the lure's grade, one step up where the bait suits the fish too), and the bait's Hold counts only where it is the larger of
the two. So a worm tipped on a spoon can bring a pike to the hook, and the page shows why before anything else does.

The plates' lines:

| item | its lines (the exact values from `CATCH_V3.items`, `BALANCE.favour.tackle`, `LOOP.baitRule`, `BAITS[].bonus`) |
|---|---|
| Mire Worms | "+5 Hold on the fish it suits (8 you have met)." (WC-3's line, `TEXT_LOOP.log.gear`) · "Bigger fish." · "Bites sooner ×1.3." (`bonus.biteSpeed` 0.3) |
| Lumen Moss | "+5 Hold on the fish it suits (…)." · "Bigger fish." · "Rarer fish." (`bonus.rarityBonus` 0.10) |
| Cut Strip | "+4 Hold on the fish it suits (…)." · "Bigger predators." |
| the Glimmer Spoon / the Bone Jig | "+6 Hold on the fish it suits (…)." · "Bigger predators." / "Bigger bottom feeders." |
| the Feather Fly | "+5 Hold on the fish it suits (…)." |
| the Harbour-Bell Spinner | "+10 Hold on the fish it suits (…)." · "Giants ×1.5." (`LOOP.lures.bell_spinner.share`) |
| the Heartmoss Ball | the built shelf line "For the Belled Matriarch. One try." · its count |
| the bare hook | no line |

Each effect word is followed by its **move** in Buffs (§3.4), and each plate by **its compare for the reference fish, without
it → with it**: the spoon over the worms, "Thousandcast Pike (Trophy): 16% → 25% with this."; the worms under the spoon draw
none (the spoon's +6 already holds the pike). "The fish it suits" is `watercraft.gradeTargets(itemId)` (grade 2 or 3; the
Spinner its named giants), counted, never named, exactly as WC-3 wrote it, and **it is now true in the land roll too** (§8.1).

### 3.3 Raft and Home: what you have as upgrades

The same plates, smaller (two to a row on a desktop's left page, folded rows on a phone), under the shelf's own tab words
**Raft** and **Home**. **The word "Hold" never names the creel on the sheet**: the creel is its built name and its glyph, the
creel drawn with one tick for each slot (as the order board's count is chalk ticks), so "+5 Hold" can only mean the grip.

| plate | its line (built words, the shelf's) and its effect | its Next (*measured* on the example) | notches in M1 |
|---|---|---|---|
| the creel (Wicker Creel … Wellbox) | its name and the creel glyph with a tick a slot (Tallow's one more drawn as a ring-tick) · the good bites it gives open water, as the float's dots (`goodBitesFor`) | "Next: Wellbox · 900" · the glyph with six ticks and open water's dots, ●×7 → ●×8 | 3 (the Lidded Creel, the Double Creel, the Wellbox) |
| Oars I–II | "Faster." · "+{v} m/s" (`LOOP.raft.oars.speed` × level: +1.5, +3.0) | "Next: Oars II · 600" · "+3.0 m/s" | 2 |
| Keel I–II | "Bigger fish." · its move at the picks: "Trophy 15% → 19%" (Keel II, Under the Span at dusk; on the open water at dusk with a tin, 7% → 10%) | none at Keel II; from none, "Next: Keel I · …" and its move with " with this." | 2 |
| Lantern I–II | "Bigger fish at night." · its move at the picked place at night (the night glyph beside it): "Trophy 19% → 21%" (its wider light is seen on the water, not printed) | "Next: Lantern II · 1,000" · "Trophy 21% → 23% with this." | 2 |
| Murk's Order Board I–II | "Orders pay double." · the count of orders as chalk ticks (`orderCount`, the Buoy-Bell's included) | "Next: Murk's Order Board II · 800" · one more chalk tick | 2 |
| Bait Bed I–II | "Free bait every evening." · "{n}" with the tin's glyph (`LOOP.home.baitBed.floor`: 3, 6) | "Next: Bait Bed II · 1,400" · "6" with the tin's glyph | 2 |
| the Long Wall, wing I | "Your best prints, on the wall." | — | 1 |
| Barge lights I | no line (lights and looks carry none, SPEC §8.4) | — | 1 |
| a found part (Rust Buoy-Bell, Gate Lamp-Glass, Moat Bollard) | its drawing (`ui-finds.drawFindArt` with the sheet's paper ink, §7.3), its name and its effect as a glyph and a number: the chalk tick "+1" (the bell, once the board is owned; faint before), the float's dot "+1" (the glass, at the Mossmere's open water), the tin "+10" (the bollard, at Sail) | — (a find is had or not) | none |
| a look (bought or found) | its name, under what wears it: the raft's (the Oxblood Pennant, the Amber Lantern Glass, the Toll-Tower Vane), the barge's (the Night-Lily Window Boxes), the Wick's (§3.1), the rod's (§3.2) | — | none |

**A move** is the size compare of §3.4: the share of bites in the reference class at the picks without that one effect, then
with it ("Trophy 15% → 19%"), from the same size law the roll uses; a Next line's move adds the built " with this.". The
Lantern's term acts only after dark, so its move is computed at the picked place **at night** and carries the night glyph
whatever hour is picked. The creel, the Oars, the board and the bed change no chance, so their effects stay glyphs and counts.

**Not owned yet**: the plate's engraving in the faint ink (`--cat-faint`), its name in the dim ink, its notches all hollow,
no line and no number; a tap at home opens Murk's book at its card. A found part or look not yet had is **not drawn at all**
(it is the catalogue's to show, as a hatched silhouette under its rate).

### 3.4 Buffs

One list, a row each: **the source** (its glyph and its name: an item's, a place's, the passive's, the built hour words "Last
Light" and "Night Rise") and **its effect**: the effect's built words, then **its move as a chance** at the picks (the water or
place, the hour, the class; one small line under the Buffs head names them: "Under the Span · ◐ · Trophy", names and a glyph,
a button to the picks). Only what is on is listed; nothing is listed that the player does not own or cannot see.

| source | effect | its move (the example, Under the Span · dusk · Trophy, *measured*) | rule |
|---|---|---|---|
| the passive | its exact line (§3.1) | — | always first; on a phone left out, since the head sits right above |
| a tin on the hook | "Bigger fish." | "Trophy 13% → 19%" | every fish (`LOOP.baitRule.favour` +0.3) |
| Mire Worms on the hook | "Bites sooner ×1.3." | — | `BAITS.mireworm.bonus.biteSpeed` (the waits ÷ 1.3) |
| Lumen Moss on the hook | "Rarer fish." | the met fish it raises most at the picks: "Weeping Carp 22% → 25%" | `bonus.rarityBonus` 0.10: uncommon fish ×1.2, rare ×1.4 in the bite (§3.5) |
| Cut Strip on the hook | "Bigger predators." | "Trophy 13% → 19%" on the predators' line (+0.3; Cut Strip in the worms' place) | the predators (`speciesTerms`) |
| the Glimmer Spoon / the Bone Jig on the hook | "Bigger predators." / "Bigger bottom feeders." | with the spoon over the worms, "Trophy 19% → 22%" | its family (`BALANCE.favour.tackle.lure` +0.2) |
| the Harbour-Bell Spinner on the hook | "Giants ×1.5." | the pinned giant's share of bites at its place, "{giant} {from} → {to}" | its named giants, at their places |
| Keel I–II | "Bigger fish." | "Trophy 15% → 19%" (Keel II) | everywhere (+0.1 a level) |
| Lantern I–II | "Bigger fish at night." | "Trophy 19% → 21%" at night, the night glyph beside it | after dark only (+0.1 a level) |
| the creel | its name and its glyph (five ticks) | — | the Wick's slots |
| good bites | "Good bites" and a row of the float's dots for each owned water and lifted place: the Mossmere ●●●●●●● (7), the Lily Maze ●● (2), Under the Span ●●● (3) | — | `goodBitesFor` (+ the Gate Lamp-Glass's +1 at open water, Tallow's +1 everywhere) |
| the Gate Lamp-Glass | "+1 ●" (open water) | — | `findBiteBonus` |
| Murk's Order Board, the Rust Buoy-Bell | "Orders pay double." and the chalk ticks (1 + 1) | — | `orderCount` |
| the Bait Bed, the Moat Bollard | "Free bait every evening." and "3" with the tin glyph (+10 with the bollard) | — | `baitBedFloor`, `findBaitFloor` |
| Oars I–II | "Faster." "+1.5 m/s" | — | `raftStats` |
| **on a trip, at the water you are on** | "Let go" · "Quiet water" | each its move: on the open water at dusk on the example's kit, one let go "Trophy 10% → 13%", quiet water at −0.30 "Trophy 10% → 6%" (*measured*) | `loop.favour(waterKey)`: its `mercy` and its `favour` |

**Never listed**: a Marked giant's +6, a legend's wounds, a waiting comeback (WATERCRAFT §7.1: the lost fish is named nowhere);
a sign's favour, the clean cast and the depth band (they are the cast's, read on the water, not owned); an area. On a desktop
the unitless favour stays in one place only, Odds' "Bigger fish here" sum (§3.5); on a phone it is not shown at all.

### 3.5 Odds: what it all does to your chances

**The picks** (the section's head on a phone; the right page's head on a desktop, above Buffs, since they govern both; the
only buttons on the page that change nothing in the game):

- **Where**: a chip for the water (its name, "The Mossmere": the open water) and one for each place you own **and have lifted**
  (`meta.loop.lifted`; its kind glyph and its name, the Chart's). An owned place still in its mist is no chip: a cast there
  draws no bite (`mistCast`). On a trip it starts where the raft is (§5.1: `ctx.fishing.waterAt`; in a lifted place, that
  place; in the open water or in a mist bank, the open water); at home on the place picked on the Chart (`meta.loop.chartPick`,
  if lifted), else the open water. **No area is ever offered or named** (§8.3).
- **Hour**: three glyph chips, day, dusk and night (the catalogue's hour glyphs; accessible names "Day", "Dusk", "Night"). On a
  trip it starts on the hour it is; at home on dusk. A night place (the Buoy Lights) picked moves the hour to night (it is open
  water before then, `placePool`), and the day and dusk chips dim while it is picked. Every call takes the hour as the phase
  the game uses: **day → 'calm', dusk → 'dusk', night → 'gloomtide'** (§7.2).
- **Hook**: the lure and bait chips of §3.2.1, the same two rows (at home a tap fits; on a trip read only), the tipped glyph on
  a bait under a lure.
- **Class**: five chips, the class names, ≥ 44 px each, Trophy until picked (§3.2's reference class).

**Bigger fish here** (desktop only; the line draws no label of its own, it opens the Odds section): the favour of a plain cast at the picks (no sign, not clean, not the depth band) as a
sum of its sources, then the float's notches for it: *"Under the Span +0.55 · Last Light +0.2 · Mire Worms +0.3 · Keel II +0.2
= 1.25 ▮▮▮▮▯"* (*measured*; capped at 1.8 as the float is). On a trip at the water the raft is on, the let-go and quiet water
terms join it. On a phone only the notches are drawn, beside "How big they run here."; the moves carry the meaning.

**How big they run here.** (the built teach caption, `TEXT_LOOP.teach.notches`): the share of bites in each size class, from
the size roll's own law (z ~ N(μ, 1) truncated to [the fish's floor, min(3.6, the place's cap)], `fishing-reel.rollZ`; the cap
`capZ`: Elders only in old water and for a giant at its own place; the floor −2, a giant's `LOOP.giant.minZ` −0.25). Up to
three lines, each from the **full μ the roll uses for those fish**:

| line | its μ | the example, Under the Span at dusk (*measured*) |
|---|---|---|
| the plain cast (no label) | the species-independent terms | Small 7% · Keeper 35% · Prize 32% · Trophy 19% · Elder 7% |
| one line per family a term on the hook favours, labelled with the family's plural ("Predators:", "Bottom feeders:") | + the spoon's or the jig's +0.2, Cut Strip's +0.3 on predators | with the spoon over the worms, **Predators:** Small 5% · Keeper 30% · Prize 33% · Trophy 22% · Elder 10% |
| the pinned fish, labelled with its name, when its own terms differ from its line's (a giant's +0.3 and floor, its own place's cap) | + its family's terms, + `LOOP.giant.favour` 0.3 | spoon over worms, **★ Thousandcast Pike:** Small — · Keeper 23% · Prize 33% · Trophy 28% · Elder 16% |

The same picks in the open water at dusk on worms: Small 17% · Keeper 48% · Prize 26% · Trophy 10% · Elder —; a fresh save
there, Small 32% · Keeper 48% · Prize 16% · Trophy 4% · Elder — (*measured*, and against 200,000 `rollZ` draws within 0.3
points). The line is the plain cast's on purpose: a sign, a clean cast or the depth band adds to it on the water, unseen here.

**Who bites, and your odds**: one table of three columns, every fish that can bite at the picks.

| column | what | from |
|---|---|---|
| the fish | its name, ★ for a giant; the pinned fish's row carries the hook glyph and **opens under itself to all five classes** ("Small — · Keeper 61 · Prize 31 · Trophy 16 · Elder 1"); a tap pins or unpins (§3.2) | met fish only (`meta.journal[id]`) |
| **Who bites** | its share of the bites, whole percent, **"<1%" under one**, so every fish that won't take the hook reads "<1%" (the user's rule, on the page) | a place: `watercraft.castOdds(D, {pool: placePool(…), area: null, phase, lure, bait, wickId, rb})`; the open water: the blind caster's mix over the areas at that hour, `watercraft.openMix(D, {light, lure, bait, wickId, rb})` (§7.3); **`rb` is the bait's rarity bonus plus the stats' (§7.2)** |
| **Your odds · {class}** (the column head carries the picked class, and the head stays fixed while the table scrolls on a phone) | the land chance at that class with your tackle and the hook (the larger of the lure's and the bait's Hold for that fish), the struck strike; "—" for a class the fish cannot roll at the picks | `data.catchParts` (§8.1); **an Elder is the share-weighted mean** of the Elder and Ancient land chances, by `data.classOdds`' Ancient share at that fish's μ (§7.2) |
| the foot | "and {n} you have not met" (WC-3's words); then the built strike line, "A clean strike adds a little; an early or late one costs a little." (`AUTOFISH.text.log.strike`), so the struck reference is honest | the pool's unmet fish, giants and the legend included |

The legend: at the Bell Pool, on the Heartmoss Ball, in her hours, her row is the whole of the bites (her sure bite, SPEC
§3.5), and her odds are her one figure: `catchChance(id, 'legend')` with **no wounds and her landings at 0**, as the roll reads
them (`meta.records.legendGrowth`, which the loop never writes; §8.7 notes the Journal's row). Elsewhere she is not in the
table.

*Table A: the example on Mire Worms alone, Under the Span, dusk, "Your odds · Trophy" (measured):*

| fish | Who bites | Your odds · Trophy |
|---|---|---|
| Dusk Minnow | 19% | 66% |
| Mossback Perch | 13% | 66% |
| Rustfin Sucker | 13% | 66% |
| Overbold Bass | 11% | 62% |
| Likely Chub | 10% | 66% |
| Gutter Crayfish | 9% | 62% |
| Weeping Carp | 8% | 54% |
| Kissmark Trout | 5% | 44% |
| Candlefin Koi | 4% | 48% |
| Bridgechain Sturgeon | 3% | 50% |
| ★ Thousandcast Pike (pinned) | **<1%** | 16% · *Small — · Keeper 61 · Prize 31 · Trophy 16 · Elder 1* |
| Reedjaw Pike | **<1%** | 29% |
| *and 1 you have not met* (the Milkeye Perch, 4%) | | |

On worms alone both pikes read "<1%" at every place and hour (*measured*: the worst place-and-hour share over all five pools is
0.19% for the Reedjaw Pike and 0.84% for the Thousandcast Pike, Taper's ×1.3 inside the cap): the user's rule, readable, first.

*Table B: the Glimmer Spoon fitted, tipped with the same worms (measured):*

| fish | Who bites | Your odds · Trophy |
|---|---|---|
| Overbold Bass | 25% | 64% |
| Mossback Perch | 19% | 67% |
| Kissmark Trout | 17% | 57% |
| Likely Chub | 15% | 66% |
| ★ Thousandcast Pike (pinned) | 8% | 25% · *Small — · Keeper 73 · Prize 44 · Trophy 25 · Elder 1* |
| Reedjaw Pike | 4% | 42% |
| Dusk Minnow · Gutter Crayfish · Rustfin Sucker · Weeping Carp · Candlefin Koi · Bridgechain Sturgeon | <1% each | 48–66% |
| *and 1 you have not met* (the Milkeye Perch, 8%) | | |

The spoon is what the pikes take; the worm is tipped (its glyph says so), so the pikes come to the hook (§3.2.1). Taper's
giant: the Thousandcast Pike is 7.8% of the bites there at dusk (6% × 1.3), shown as 8%. *On Lumen Moss* (same place and hour,
*measured*): the Weeping Carp 25%, the Dusk Minnow 19%, the Candlefin Koi 18%, the Likely Chub 16%; without the moss's rarity
bonus the page would print 22%, 21%, 16% and 18%, figures the water does not use.

*A fresh save at home* (the Wick, the Willow Switch, Twine, the Wooden Winch, the bare hook, nothing met): the table is empty
but its foot, "and 11 you have not met"; it fills as fish are met. Its land figures, when they come, are the bare tackle's:
the Dusk Minnow 85 / 81 / 57 / 37 at Small to Trophy, the Reedjaw Pike 69 / 61 / 30 / 16 (*measured*).

**Left out on purpose**: Taper's first bite of the evening (never a common fish) is one cast's, not the water's, so the table
is a plain cast's; the exact line says it in words (§3.1). So are a sign's pre-rolled fish and Ashwick's comeback.

### 3.6 What the sheet never shows

- **An area's name, weight or share** (WATERCRAFT §2.6). The open water is one row of picks, as WC-3's Who bites shows it.
  §11 question 41 asks the user.
- **A fish you have not met**, by name, drawing or silhouette: it is counted.
- **A lost fish in any form**: no Marked giant and its +6, no legend's wounds, no waiting comeback, no last-lost pin.
- **A size in pounds** (a class is its name), and nothing about a fish on the line: the page is never open while a line is out.
- **Anything past Murk's shelf's era**: no tier, level, look or place the save cannot buy yet; nothing of Sporewood.
- **The creel as "Hold {n}"**: on the sheet "Hold" is the grip only (§3.3).
- **A typed number**: every figure is computed when the page opens; a scan finds no digit before a percent sign (`/\d\s*%/`)
  in `TEXT_LOOP.sheet`, `loop-sheet.js` or `ui-sheet.js` (templates such as "{n}% longer to strike" are allowed: the % follows
  a slot, not a digit).

---

## 4. Layout

### 4.1 Desktop: a spread

At 960 × 540 the Journal's panel holds the tab row and, under it, **two paper pages side by side** (each about 430 px wide,
each scrolling on its own under a fixed running head, as Murk's book's pages do): the left page **is you and what you own**
(the head, Tackle, Raft, Home), the right page **is what it does** (the picks, Buffs, Odds). At 1280 × 720 the same, larger.

```
+--------------------------------------------------------------------------------------------------+
| [(p) Taper's Sheet•] [ The Mossmere 10/12 ] [ Prints ] [ ★ ]                               Close |
| +------------------------------------------------+ +-------------------------------------------+ |
| | (portrait)  TAPER                              | | [≈ The Mossmere] [◇ Lily Maze] [◎ Under   | |
| |  (pic)  LONG REACH                             | |  the Span•]  [☀] [◐•] [☾]                 | |
| |  Evenings start with a rarer fish.             | |  [spoon][fly][—•]  [worms 7•][strip 3][—]  | |
| |  First bite never a common fish. Giants ×1.3   | |  [Small][Keeper][Prize][Trophy•][Elder]    | |
| |  as often, to 12%.                             | |  ───────────── BUFFS ─────────────        | |
| |  [Slate Cloak Dye]                             | |  worm Mire Worms  Bigger fish.             | |
| |  ──────────────── TACKLE ────────────────      | |                   Trophy 13% → 19%         | |
| |  Against the Reedjaw Pike: holds Keepers.      | |                   Bites sooner ×1.3.       | |
| |  Prizes are a coin flip.                       | |  keel Keel II     Bigger fish.             | |
| |  [rod ] ASHWOOD ▮▯  Casts 17.5 m · 4% longer…  | |                   Trophy 15% → 19%         | |
| |         +2 Hold on every fish · ×1.6 …leapers. | |  lamp Lantern I   Bigger fish at night.    | |
| |         Next: Whalebone · 600                  | |                   ☾ Trophy 19% → 21%       | |
| |         Thousandcast Pike (Trophy): 16% → 19%… | |  creel Double Creel ▮▮▮▮▮ · Good bites ●●… | |
| |  [line] BRAIDED GUT ▮▯ … Next: Waxed Silk · 600| |  board Orders pay double.  ✓ ✓  …          | |
| |  [reel] CLOCKWORK ▮▮  +5 Hold … runners.       | |  ───────────── ODDS ──────────────         | |
| |  [—] (no lure)        [worms] MIRE WORMS 7     | |  Under the Span +0.55 · Last Light +0.2 ·  | |
| |   [spoon][fly]          [strip 3]              | |  Mire Worms +0.3 · Keel II +0.2 = 1.25 ▮▮▮▮▯|
| |  ──────────────── RAFT ─────────────────       | |  How big they run here.                    | |
| |  [creel] DOUBLE CREEL ▮▮▯ [oars] OARS I ▮▯ …   | |  Small 7% · Keeper 35% · Prize 32% · …     | |
| |  ──────────────── HOME ─────────────────       | |          Who bites   Your odds · Trophy    | |
| |  [board] … [bed] … [wall] … [lights] (faint)   | |  Dusk Minnow    19%      66%               | |
| |  [bell] Rust Buoy-Bell ✓+1 [glass] Lamp-Glass ●+1 |  Mossback Perch 13%      66%  …            | |
| +------------------------------------------------+ +-------------------------------------------+ |
+--------------------------------------------------------------------------------------------------+
```

In the drawings, • is the pink drop (§5.2) or the chosen chip, ▮ ▯ the notches, ● the float's good-bite dots, (p) the Wick's
portrait. **The table is three columns on a desktop too** (the fish about 190 px with its ★ and hook glyph, Who bites 60 px,
Your odds 80 px, in Alegreya at 16 px with tabular figures: about 330 px inside a 430 px page with its margins and corner
ornaments); the class is the chip picked, as on a phone, and the pinned row opens to all five. Opening at **Odds** scrolls the
right page to its head; at **Tackle** the left page; from the ledger, both pages at their tops. The gate checks the spread at
960 × 540: nothing clipped, every text ≥ 16 px (§9 item 6).

### 4.2 Phone: one scroll, Buffs first

At 390 × 844 (and 390 × 664) the page is one paper column, 358 px, scrolling under the fixed tab row: **the head**, then a
**jump row**, then **Buffs** (the at-a-glance summary the user asked for), **Tackle**, **Raft**, **Home**, **Odds**.

- **The jump row**: five buttons, each its section's glyph with **its word under it** (Buffs · Tackle · Raft · Home · Odds,
  the section heads' own words), 70 × 56 px each, so nothing has to be guessed.
- **Folded plates**: each plate is one row, 56 px tall: the engraving's thumbnail · the name · the notches · **its one key
  figure**; a tap opens it to its full lines (and a second tap folds it). Opened from the rack, Tackle's plates start open.

| plate | its key figure, folded |
|---|---|
| Rod | "17.5 m" |
| Line, Reel | "+{hold} Hold" |
| the lure, a tin, Cut Strip, the ball | "+{n} Hold" (a lure), the count with the tin's glyph (a bait) |
| the creel | its glyph with a tick a slot |
| Oars | "+1.5 m/s" |
| Keel, Lantern | its move's "to", "Trophy 19%" (the Lantern's with the night glyph) |
| Order Board, Bait Bed, a found part | its chalk ticks, its tin count, its glyph and number |
| the Long Wall, lights, a look | no figure |

```
+--------------------------------------+
| [(p) Taper's Sheet•][Mossmere 10/12][Prints][★] |
|  (portrait) TAPER                     |
|   (pic) LONG REACH                    |
|   Evenings start with a rarer fish.   |
|   First bite never a common fish.     |
|   Giants ×1.3 as often, to 12%.       |
|  [✦ ][rod][raft][hearth][float]       |
|  Buffs Tackle Raft Home  Odds         |
|  ─────────── BUFFS ───────────        |
|  Under the Span · ◐ · Trophy ›        |
|  worm Mire Worms   Bigger fish.       |
|                    Trophy 13% → 19%   |
|                    Bites sooner ×1.3. |
|  keel Keel II      Bigger fish.       |
|                    Trophy 15% → 19%   |
|  lamp Lantern I    Bigger fish at night.|
|                    ☾ Trophy 19% → 21% |
|  creel Double Creel ▮▮▮▮▮             |
|  Good bites ●●●●●●● ●● ●●●            |
|  …                                    |
|  ─────────── TACKLE ───────────       |
|  [rod] ASHWOOD        ▮▯   17.5 m     |
|  [line] BRAIDED GUT   ▮▯   +2 Hold    |
|  …                                    |
|  ─────────── ODDS ───────────         |
|  [≈ The Mossmere] [◇ Lily Maze]       |
|  [◎ Under the Span•]                  |
|  [☀] [◐•] [☾]                         |
|  [spoon] [fly] [—•]                   |
|  [worms 7•] [strip 3] [—]             |
|  [Small] [Keeper] [Prize] [Trophy•]   |
|  [Elder]                              |
|  How big they run here.  ▮▮▮▮▯        |
|  Small 7% · Keeper 35% · Prize 32% ·  |
|  Trophy 19% · Elder 7%                |
|        Who bites  Your odds · Trophy  |  ← fixed while the table scrolls
|  Dusk Minnow      19%      66%        |
|  Mossback Perch   13%      66%        |
|  …                                    |
|  and 1 you have not met               |
|  A clean strike adds a little; an     |
|  early or late one costs a little.    |
+--------------------------------------+
```

The folded page at 390 × 844 is about 2.5 screens (*est.*: the head 230 px, the jump row 70, Buffs about 600, Tackle's five
rows 300, Raft and Home 500, Odds' picks 330 and the table about 700), against about five with open plates. Every chip row
wraps; nothing scrolls sideways; every text is ≥ 16 px; every target ≥ 44 px and none overlap at 358 px.

### 4.3 The look

Old paper (`--cat-paper`), the Chart's ink (`--cat-ink`), the book's corner ornaments at the page's corners and its rule under
each section's word (Marcellus SC, spaced capitals, 18 px phone / 22 px desktop), engravings in their own hatching, numbers in
Alegreya's tabular figures. **Candle amber only on a price.** The notches are the float's strokes in ink (solid) and faint ink
(hollow). The chosen chip is the built Drowned Filigree mark (ink with its twin hook curls drawing in); the fitted chip carries
a small solid ink dot under it, the good-bite dot; the tipped glyph is a barb in the same ink. A move's arrow is the compare
line's own "→". The pink drop of §5.2 is the only pink. Nothing glows; nothing moves except a hook curl drawing in, a plate
unfolding (0.18 s) and the drop fading when seen; under reduced motion nothing moves.

---

## 5. Live

### 5.1 How it updates, and where the page reads the raft and the hour

The page is drawn from `sheetModel` (§7) and re-drawn whenever the save or the run changes while it is open: on `loop:fit`
(a lure or bait fitted, from the page's own chips or the Chart's slots), `loop:buy`, `bait:change` (a bait spent on a trip),
`fishing:found` and the dawn's fitting of a part, `home:enter`, `run:start` and `run:end`. A pick (where, hour, class, pin)
re-draws it at once; picks are the page's own state (`entry.state.view`) and persist for the session, never in the save except
the pin (`meta.gearPin`, with its class). A fit from the page is exactly the Chart's (`loop.fit`): the Chart's slot shows the
same bait when it next opens, and the HUD on the next trip.

**`live`** (where the raft is and the hour; the model cannot know them): on a trip `ui-sheet.js` reads
`ctx.fishing.waterAt(ctx.player.position)` (public, read-only: `{waterKey, placeId, mist}`) and `D.loopLight(K.phaseInfo().phase)`
(`'day' | 'dusk' | 'night'`), and passes `{waterKey, place: mist || !lifted(placeId) ? null : placeId, light}` as
`loop.sheet(view, live)`'s second argument. The raft in a mist bank counts as the open water. At home `live` is null. The lane
does not edit `fishing.js` (its private `waterKeyNow` stays private).

The model is cheap (one `castOdds` or one hour's open mix, 13 fish × 5 classes of `catchParts`, three size lines and a move a
buff): under 5 ms on the low tier (*est.*; the gate measures it), so the page re-draws on every event without a debounce.

### 5.2 The "new" mark

**A small ink drop in nebula pink** (DESIGN §21.6's colour for "new" moments, deepened for paper), 8 px, beside the name of
every owned thing the player has not yet seen on the sheet: a piece of tackle, a creel step, a raft or home part, a lure, a
look, a found part (its key is the shelf's card id, `rod:2`, `hold:5`, `keel:2`, `lure:bone_jig`, `look:slate_dye`, or
`find:gate_glass`; tins, Cut Strip and the Heartmoss Ball are consumables and never marked). The same drop sits after the
label on the Journal's tab and on the pause item while any mark is on the page. **No word** (its accessible name is "New").

A mark is **seen** when at least half of its plate (folded or open) has been on screen for 0.8 s while the page is open (an
`IntersectionObserver`), and the save is written when the page closes (`loop.markSheetSeen(keys)` → `meta.loop.sheetSeen`). A
buy at Murk's book, a find fitted at dawn or a pick-up from the water marks its key fresh by being owned and unseen: no event
has to remember it.

**Seeding, in this order.** `freshLoop` gives `sheetSeen: []` (a fresh save owns nothing to mark). `migrateLoop` seeds **at
its top, before its fill loop**: `if (L.sheetSeen === undefined) L.sheetSeen = sheetKeys(L, D)`, so an older save opens with
no marks. (Seeded after the fill, the fill would copy `freshLoop`'s `[]` first and every owned key would show the drop.)
`loop.test.mjs` and `loop-trip.test.mjs` deep-equal `freshLoop`'s shape where they do, and are updated with it.

---

## 6. Words

Every string the sheet draws is below: built words (SPEC §8's, `TEXT_LOOP`'s, `AUTOFISH.text`'s), names and numbers, and the
few new ones (`TEXT_LOOP.sheet`, each ≤ 36 characters a row, two rows at most at 18 px in a 358 px column). `textAllowed`
gains the screen `'sheet'`. There a text node passes if it is an allowed string, a number form the sheet uses (a percentage,
"<1%", a signed favour "+0.3" or "−0.30", a multiplier "×1.6", "17.5 m", "+1.5 m/s", "= 1.25"), or **a `TEXT_LOOP.sheet`
template or a built template the sheet fills** (the compare line, the gear lines, the goal line, the move, the sum line, the
cast line) **with its slots filled** by numbers and allowed names: `textAllowed` turns each template into a pattern, each `{x}`
a slot. Everywhere else nothing changes.

| where | words | built or new |
|---|---|---|
| the tab, the pause item, the ledger's and the rack's accessible names | "{name}'s Sheet" | **new** (`sheet.title`; "Sheet" the one new word) |
| section heads | **Tackle** · **Raft** · **Home** | built (the shelf's tabs) |
| | **Buffs** · **Odds** | **new** (`sheet.buffs`, `sheet.odds`; "Odds" is the book's chapter word and **Odds ›**'s) |
| the jump row | the five heads, under their glyphs | the heads' |
| the head | the passive's name and line | built |
| | the five exact lines (§3.1) | **new** (`sheet.exact.{wick,taper,stub,tallow,ashwick}`, templates filled from `LOOP.wicks`) |
| the Tackle head | "Against the {species}: holds {held}s. {next}s are {word}." | built (`AUTOFISH.text.rating`) |
| a plate | the piece's name; "Casts {m} m · {n}% longer to strike" | name; **new** (`sheet.cast`) |
| | "+{hold} Hold on every fish · counts ×1.6 against {styles}."; "+{n} Hold on the fish it suits ({m} you have met)." | built (`AUTOFISH.text.gear.tackle`, `TEXT_LOOP.log.gear`) |
| | "Next: {name} · {price}"; "{name} ({class}): {from} → {to} with this." | built (the goal line, `AUTOFISH.text.gear.compare`) |
| | "Faster."; "Bigger fish."; "Bigger fish at night."; "Orders pay double."; "Free bait every evening."; "Your best prints, on the wall."; "For the Belled Matriarch. One try."; the creel's built names | built (`TEXT_LOOP.shelf`, `LOOP.hold`) |
| a buff, an effect word | "Bigger fish." · "Bigger fish at night." · "Faster." · "Orders pay double." · "Free bait every evening." | built (the shelf's) |
| | "Bigger predators." · "Bigger bottom feeders." · "Giants ×{k}." · "Rarer fish." · "Bites sooner ×{k}." · "Good bites" (a label before the dots) | **new** (`sheet.bigger.{predator,bottom}`, `sheet.giants`, `sheet.rarer`, `sheet.sooner`, `sheet.good`) |
| | "Let go" · "Quiet water"; the hour sources "Last Light", "Night Rise"; place names | built (the card's button, the float's term words), names |
| a move | "{what} {from} → {to}" and, on a Next line, "{what} {from} → {to} with this." ({what}: a class name or a met fish's name) | **new** templates (`sheet.move`, `sheet.moveNext`), no new word |
| Odds | "Predators:" · "Bottom feeders:" (a size line's label) | **new** (`sheet.family.{predator,bottom}`) |
| | "How big they run here." · "Who bites" · "and {n} you have not met" · "<1%" · "Your odds" · the five class names · "A clean strike adds a little; an early or late one costs a little." | built (`TEXT_LOOP.teach.notches`, `TEXT_LOOP.log`, `AUTOFISH.text.log`, `SIZE_CLASSES`) |
| accessible names only | "Day" · "Dusk" · "Night" (the hour chips) · "New" (the drop) · "Pinned" (the hook glyph) · "Tipped" (the bait under a lure) · "{n} of {of}" (the notches) | **new** (`sheet.hours`, `sheet.fresh`, `sheet.pinned`, `sheet.tipped`, `sheet.notches`) |
| the trip pause, a line out | "Reel in first." | built (`AUTOFISH.text.logLocked`) |
| the species page's link, under the loop | "Odds ›" | built (`TEXT_LOOP.odds`) |

**New: 26 strings** (the title, two heads, five exact lines, the cast line, six effect words, two move templates, two size
labels, and seven accessible names). No new word on the water, on a card, on the catalogue or on the shelf.

---

## 7. The pure model and its tests

### 7.1 `src/loop-sheet.js` (new; pure: no DOM, no three.js, no `data.js` import; `D` is passed in)

It imports only pure modules: `watercraft.js` (`castOdds`, `openMix`, `gradeTargets`, `gradeOf`), `fishing-reel.js`
(`normCdf`, `capZ`), `loop-gear.js` (`raftStats`, `raftTerms`, `orderCount`), `loop-finds.js` (`owned`, `findBiteBonus`,
`findBaitFloor`) and `home-shelf.js` (`baitBedFloor`). **It does not import `progression-loop.js`** (whose `loop.sheet` calls
it): the shelf comes in through the options, so there is no import cycle.

```
sheetModel(meta, D, { run = null, view = {}, live = null, shelf = [] }) → Sheet
  meta   the save (meta.loop, meta.journal, meta.gearPin)
  run    the trip's run on a trip (its lure, equippedBait, bait counts, zone, character, bites, mercy), else null
  view   the page's picks: { place: placeId | null, light: 'day' | 'dusk' | 'night', cls: 'trophy', section }
  live   on a trip: { waterKey, place, light } (§5.1), else null
  shelf  progression-loop.shelfItems(D, meta.loop) (loop.sheet passes it)
sheetKeys(metaLoop, D) → string[]                     every owned key a "new" mark can carry (§5.2)
sizeOdds(mu, { min = −2, cap = 3.6 }) → { small, keeper, prize, trophy, elder, ancient }   the size roll's truncated normal
favourHere(D, metaLoop, { place, light, bait, lure, quiet, mercy }) → { terms: [{family, id, value}], mu, notches,
                                                         families: { predator?: mu, bottom?: mu } }
moveOf(D, sheetCtx, term, { next = false }) → { what, from, to } | null      a buff's or a Next line's move (§3.3)
passiveExact(D, wickId, waterId) → { id, values }     the exact line's numbers
```

**`Sheet`**:

```
{ water, picks: { place, light, phase, cls, choices: [{ id | null, kind }] },
  wick: { id, name, look, passive: { id, exact: { id, values } }, worn: [lookId] },
  tackle: { rating: { reference, held, next, word } | null, slots: [Plate rod, line, reel], hook: Hook },
  raft:   [Plate creel, oars, keel, lantern], raftLooks: [lookId],
  home:   [Plate orders, baitBed, wall, lights], parts: [{ key, id, effect: { glyph, n, on }, fresh }], homeLooks: [lookId],
  buffs:  [{ key, source: { kind, id }, effect: { kind, value, scope }, move: { what, from, to, night } | null, live }],
  odds:   { hook: Hook, here: { terms, mu, notches },
            size: [{ label: null | family | speciesId, mu, shares: { small … elder } }],
            bites: { good, spent | null }, rows: [{ id, giant, legend, pinned, share, land: { small … elder } | { legend } }],
            unmet, ref: { speciesId, cls, pinned } | null },
  fresh:  [key] }
Plate = { key, slot, level, name, owned, notches: { on, of }, key: figure, values: {…},
          next: { key, name, price, compare: { from, to } | null, move: { what, from, to } | null } | null, fresh }
Hook  = { lure, bait, tipped, lures: [id], baits: [{ id, count }], canFit }
```

It holds ids and numbers only; `ui-sheet.js`'s `sheetView(model, D, {phone})` (pure strings, node-testable, as
`catalogueView`) turns them into words through `TEXT_LOOP.sheet` and the built formatters (`ui-af.gearLine`, `compareLine`,
`ratingLine`, `bitesBlock`'s "<1%" and unmet rules, `data.catchDisplay`).

### 7.2 The rules it follows

- **Defaults**: the picks of §3.5; the hook from `run` on a trip, else `meta.loop.fitted`; the reference of §3.2.
- **The hour's words.** The page's light is `'day' | 'dusk' | 'night'`; **every** call takes the game's phase for it:
  day → `'calm'`, dusk → `'dusk'`, night → `'gloomtide'` (`placePool`, `castOdds`, `openMix`, `giantShare`, `raftTerms`, the
  hour term). `castOdds` and `placePool` would read 'night' through `lightOf` and `LOOP_LIGHT`, but `fishing.baseTerms` adds
  Night Rise only for `'gloomtide'` and `loop-gear.raftTerms` the Lantern only when `phase === 'gloomtide'`: passed 'night',
  both drop without an error.
- **The rarity bonus of a plain cast** is everything owned on the hook and in the stats, as `fishing.js` `rollBite` builds it
  (`rb = stats.rarityBonus + baitBonus(bait, 'rarityBonus') + spot + clean + pity`), **less the cast's own terms** (the spot,
  the clean cast, the pity): `rb = num(stats.rarityBonus) + num(D.BAITS.find((b) => b.id === bait)?.bonus?.rarityBonus)`.
  Under the loop `stats.rarityBonus` is 0 (`progression.tripStats` sets none), so it is the bait's: Lumen Moss 0.10, every
  other M1 bait 0. The model takes `stats` from the run on a trip and the loop's trip stats at home, so a later bonus counts.
- **Who bites** at a place: `castOdds(D, {pool: D.placePool(D.SPECIES, {placeId, phase, bait, wickId, water}), area: null,
  phase, lure, bait, wickId, rb})`, the entries summed by species (no rule, no pre-roll, no comeback, no Taper first bite: a
  plain cast). In the open water: `watercraft.openMix(D, {light, lure, bait, wickId, rb})` (§7.3). The legend's row at her
  crown on her bait in her hours (§3.5).
- **Your odds**: `D.catchParts(sp, cls, {rod, line, reel, item: lure, upgrade: {id: bait}}, {strike: 'struck'})` (the larger
  of the two items' Holds, by `catchItemHold` with §8.1's data); a class the fish cannot roll at the picks (`capZ` above, a
  giant's floor below) is null. **Elder** = (1 − a) × p(elder) + a × p(ancient), a = `classOdds`' Ancient share over its Elder
  share at that fish's μ (at Under the Span at μ 1.25, 1.6 of 7.2: 22%; the Dusk Minnow's Elder prints 15%, not 18%). The
  legend: `catchChance(id, 'legend', kit, {strike: 'struck'})`, wounds 0 and landings 0. Never `marked`, `wounds` or a
  comeback's buff.
- **The sizes**: `sizeOdds(mu, {min, cap})` with the fish's floor and the place's `capZ`. It is written in `loop-sheet.js` on
  `fishing-reel.normCdf` (the roll's own), not as an edit of `data.classOdds`, whose source the v3 fingerprint hashes; at the
  floor −2 it equals `classOdds` within 1e-6 (*measured*: 6.7 / 35.4 / 32.2 / 18.5 / 7.2, Ancient 1.6, at μ 1.25). The plain
  line's μ is `favourHere`'s; a family's line adds that family's terms (`speciesTerms`: the spoon's or the jig's +0.2 on its
  family, Cut Strip's +0.3 on predators); the pinned fish's line adds its own (`LOOP.giant.favour` 0.3 for a giant, its floor
  `LOOP.giant.minZ` −0.25, its own place's cap). Each line's μ equals `fishing.js`'s full favour for a fish of that family at
  a plain cast (test S7).
- **Bigger fish here**: the species-independent terms of a plain cast as `fishing.js` builds them under the loop (the place's
  `LOOP.place.favour`, the hour's `BALANCE.favour.hour`, the tin's `BALANCE.favour.tackle.bait`, `raftTerms`, and on a trip at
  `live.waterKey` the quiet and let-go terms of `loop.favour`), summed and capped as `sumFavour`, notched as `favourNotches`.
- **Moves**: a buff's move is `sizeOdds` at μ without its term → with it, at the picks' cap, in the reference class (a family
  term on its family's line; the Lantern at the picked place at `'gloomtide'`); Lumen Moss's is the met fish whose share rises
  most, `rb` 0 → its `rb`; the Spinner's the pinned giant's share at its place without → with the lure. A Next line's move is
  now → with the next level. A move whose two rounded figures are equal is null (nothing drawn).
- **Notches**: tackle `of` = the tiers whose `shelfAt` water is owned (T1–T2 in M1); the creel's = the ladder to `shelfMax`;
  a raft or home part's = its levels whose `with` water is owned. `on` = owned.
- **Next**: the slot's unbought card from `opts.shelf` (its id, name and price, the factor in); none at the top.
- **Names**: a row only for a met fish (`meta.journal[id]` caught or seen); `unmet` counts the rest; the rating line only once
  its reference fish is met.
- **Fresh**: `sheetKeys(metaLoop, D)` minus `metaLoop.sheetSeen`.

### 7.3 The helpers it adds elsewhere (small, additive)

| file | what | why |
|---|---|---|
| `src/watercraft.js` | **`openMix(D, {light, lure, bait, wickId, rb = 0})`**: the blind caster's open-water mix at one hour, with castOdds' step 7 before `finishPool` (uncommon ×(1 + 2rb), rare ×(1 + 4rb)); the private `eveningMix` then sums `openMix` at rb 0, so **`bitesTable` is unchanged** (WC-3's Who bites stays rb-free, and §8.7 notes its gap) | the Odds' open water at the hour picked, with the bonus the roll uses (WC-3's Who bites is the evening's day and dusk only: `LOOP.evening.night` is null) |
| `src/data.js` | **the Hold rule as a loop-only data patch** in the loop's apply block, after lane 4's (§8.1); **`catchItemHold`'s text is not touched** | §8.1: the v3 fingerprint hashes `catchItemHold`'s source |
| `src/data.js` | `TEXT_LOOP.sheet` (§6) | the words |
| `src/progression-loop.js` | `loop.sheet(view, live)` (the model on the live save and run, with `shelf: shelfItems(D, ml)`), `loop.markSheetSeen(keys)`, `migrateLoop`'s seeding at its top (§5.2), `freshLoop`'s `sheetSeen: []`, both methods in `LOOP_METHODS` | the view's one door; the save |
| `src/murk-engrave.js` (`gw-mvp-catalogue`) | **`engrave` handles level 0** (`lv = Number.isFinite(Number(rest)) ? Number(rest) : 1`: today `Number('0') \|\| 1` draws `rod:0` as the Ashwood); **`plateKey` gains a `hook` slot** (`'hook:bare'` falls to `'parcel'` today); the plates `rod:0`, `line:0`, `reel:0` and `hook:bare` | the tier-0 tackle and the bare hook were never sold |
| `src/ui-catalogue-murk.js` (`gw-mvp-catalogue`) | **the paper split out**: the `--cat-*` tokens (today inside the `.gw-book {…}` rule beside its layout) move into an exported `PAPER_CSS` keyed on a root class argument, with the knock-outs `.cat-pp` and the engraving ink `.cat-eng`; `.gw-book` and the sheet's root both take it; `PAPER_NOISE`, `FIBRE`, `CORNER`, `RULE` exported | the flyleaf is the book's paper |
| `src/ui-finds.js` | `drawFindArt(…, {ink})`: an ink colour option (today its pale night ink is hard-coded and would not read on paper) | the found parts' plates |
| `src/ui-screens.js` | the species page's link (§2.4) | every way in |

### 7.4 The node tests (`tools/tests/loop-sheet.test.mjs`, new)

| # | the test |
|---|---|
| S1 | **Shape**, on a fresh save for each of the five Wicks and on the example save: every section present; the exact line's values equal `LOOP.wicks`'s (Taper 1.3 and 12; the Wick 1.4 and round(0.4 × 7) = 3; Stub 1.28 and 0.5; …) |
| S2 | **Tackle**: T0–T2 names and notches (`of` 2 in M1, 3 once Sporewood's map is owned in a fixture); `next` equals `shelfItems`' unbought card for the slot, id and price, at factors 1 and 2; no T3, sixth-slot step past the Wellbox or Keel III in M1; the rod's cast and strike values equal `TACKLE.rod` |
| S3 | **The Hold rule** (§8.1): for every Mossmere fish × every class × every hook (each lure, each bait, each lure tipped with each bait, the bare hook) × the example's and the fresh tackle, `D.catchParts(sp, cls, {rod, line, reel, item: lure, upgrade: {id: bait}}, {strike: 'struck'}).p` equals the sim's exported `SIM.landP(simSp, cls, {rod, line, reel, lure, bait}, 'struck', night)` (`clams.mjs`, its own records as `loop-4.test.mjs` reads them) within 1e-9 (any difference named, fish by fish); the fish each item helps are `gradeTargets`; and **`node tools/validate-data.mjs --v3` and `--loop` pass** (the v3-without-loop fingerprint holds), beside `clams.mjs --shipped=mossmere --step=5` re-run and unchanged |
| S4 | **Who bites**: for every lifted place and the open water × day, dusk and night × every owned hook and the bare hook, the rows plus the unmet sum to 1 within 1e-9 and equal `castOdds` (a place) or `openMix` (the open water) **called with `rb` built as `fishing.js` line 1204 builds it, less spot, clean and pity**; **on Lumen Moss each row equals `castOdds` with rb 0.10**, and differs from rb 0 (the Weeping Carp at Under the Span at dusk 24.7% against 22.3%); the evening's mean of `openMix` at rb 0 (each light weighted by `LOOP.evening` × its summed area shares, as `eveningMix` does) equals `bitesTable` within 1e-9 |
| S5 | **The user's rule on the page**: every grade-0 fish's share is ≤ 0.01 and prints "<1%"; on Mire Worms and on the bare hook the Reedjaw Pike and the Thousandcast Pike print "<1%" at every place and hour, Taper included; a Lumen Moss case: no grade-0 fish passes 1% with its rb |
| S6 | **Your odds**: every figure equals `catchParts` with the hook's larger Hold and the struck strike; **Elder equals the share-weighted mean of `catchParts('elder')` and `catchParts('ancient')` by `classOdds`' Ancient share** (the Dusk Minnow at Under the Span at dusk on worms: 15); Elder is null in the open water, the Lily Maze and the Buoy Lights (but for the Hullkiss Lamprey there, a giant at its own place) and a number at Under the Span; a giant's Small is null; the legend's one figure equals `catchChance(id, 'legend')` with wounds 0 and landings 0 |
| S7 | **The sizes**: `sizeOdds` equals `classOdds` within 1e-6 at the floor −2 at μ 0, 0.7, 1.25 and 1.8 and both caps, and matches 200,000 seeded `rollZ` draws within 0.3 points with a giant's floor −0.25; `favourHere`'s μ and **each family line's μ** equal `fishing.js`'s favour for a plain cast at each place × light × hook (the species-independent terms, then a predator's and a bottom feeder's full μ with the spoon, the jig and Cut Strip on; through `loop-watercraft.test.mjs`'s fishing harness); **the hour's words**: at the Buoy Lights at night with Lantern I, `favourHere` holds Night Rise +0.25 and Lantern +0.1 (and passed 'night' unmapped it would hold neither: the test proves the mapping is used) |
| S8 | **Buffs**: each owned item's buff with its exact value and its move (Keel II at Under the Span at dusk, Trophy 15% → 19%; the Lantern's at night, 19% → 21%; Lumen Moss's the carp, 22% → 25%; Mire Worms' "Bites sooner ×1.3"); on a trip the let-go and quiet terms equal `loop.favour(key)`; the good bites equal `goodBitesFor` with the Lamp-Glass and Tallow; **the hidden save** (a marked Thousandcast Pike, a wounded Matriarch, Ashwick's comeback waiting) gives exactly the figures of the same save without them, and no field names them |
| S9 | **Names**: no unmet fish's id or name in the view's strings; the rating line absent until the Reedjaw Pike is met; the pin to an unmet fish is refused; an owned place still in its mist is no Where chip |
| S10 | **Fresh**: a buy marks its key; `markSheetSeen` clears it; a fitted find marks `find:<id>`; `migrateLoop` on an older save (no `sheetSeen`) seeds every owned key **before its fill** (no marks), a fresh save none; consumables never marked |
| S11 | **Words**: every string `sheetView` returns passes `textAllowed(t, {screen: 'sheet'})`, the templates with their slots filled; no `AREAS` id and no area word of WATERCRAFT §2.1 anywhere; no `/\d\s*%/` in `TEXT_LOOP.sheet`, `loop-sheet.js` or `ui-sheet.js`; **no sheet string matches `/(^\|[^+\d])Hold \d/`** (the creel's "Hold {n}" form): "Hold" appears only as the grip ("+{n} Hold") |
| S12 | **Live**: with `fakeLoop`, a `fit('bait', 'cut_strip')` changes exactly the hook-dependent fields (the bait plate, the buffs' tin row, here, the size lines, rows, land, moves); a pick of the Buoy Lights moves the light to night; a `live` in a mist bank picks the open water |
| S13 | **No cycle**: `loop-sheet.js` imports none of `progression-loop.js`, `data.js`, the DOM or three.js (a source scan) |
| S14 | **Flag off**: no sheet, no tab, no pause item, `openTackle` the built gear log, the species page's link as built; `validate-data` passes 1 and 2 bit-identical |

---

## 8. The rulings on the audit's conflicts

### 8.1 The Hold targets: one rule, made true in the roll, without touching a hashed function

WATERCRAFT §3.7 (binding) says a tin's or lure's Hold helps the fish that like it or better (`gradeTargets`), and WC-1's sim
does so (`clams.mjs`'s `itemHold`), and WC-3's gear line says so; but **the land roll the game draws from**
(`data.catchItemHold`, through `catchParts`) still used CATCH_V3's family and attract rules. *Measured* (the Mossmere's fish
each helps, the roll's rule against §3.7's): Mire Worms 5 against 8 (the roll left out the chub, the bass and the sturgeon);
Lumen Moss 2 against 6; Cut Strip 6 against 10; the Feather Fly 4 against 5; the Bone Jig's roll helped the bottom family while
its line named the perch, the bass, the zander, the trout and both pikes; the Glimmer Spoon helped the Hullkiss Lamprey (its
line did not) and not the Mossback Perch.

**Ruling: on the Mossmere under the loop the roll follows §3.7** (decision 108), so the roll, the sim, the gear line, the
Journal's "With the {item}" and the sheet are one rule. **How (the review's blocker):** `catchItemHold`'s body is **not**
edited. `tools/fingerprint.mjs` hashes each export's source text, `tools/tests/v3-exports.json` lists `catchItemHold` (and
`classOdds`, `catchParts`, `CATCH_V3`, `catchItemTargets`), and that file is written once: any edit of the function's text
fails the v3-without-loop proof even behind `LOOP_ENABLED`. The rule is instead **a loop-only data patch** in the loop's apply
block (after lane 4's block, which already gives the Spinner its `species` the same way), which the fingerprint never sees
because it is taken with `GW_LOOP` unset:

```
for (const id of HOOK_ITEMS) {                       // watercraft.HOOK_ITEMS, less 'bare' and 'bell_spinner' (lane 4's)
  if (id === 'bare' || id === 'bell_spinner' || !CATCH_V3.items[id]) continue;
  const rows = gradeTargets(id);                     // the Mossmere's fish with a hook row that it suits (grade 2 or 3)
  const rest = SPECIES.filter((s) => s.rarity !== 'legendary' && gradeOf(s.id, {}) === undefined
    && catchItemHold(id, s) > 0).map((s) => s.id);   // every other species, by the built rule, read before the patch
  CATCH_V3.items[id] = { ...CATCH_V3.items[id], species: [...rows, ...rest] };   // `family` and `attract` stay on the record
}
```

`catchItemHold` checks `species` before `family`, `night` and `attract`, so it gives exactly the sim's `itemHold`. The
record keeps `family` and `attract`, because the sim's `ITEM` fallback reads them for the waters it drafts. `data.js` imports
`watercraft.js` for `gradeTargets` and `gradeOf` (pure, no import of its own: no cycle). The sim's pacing does not move (the
sim already used the rule); test S3 holds the two together, with `validate-data --v3` and `--loop`.

### 8.2 Three copies of `watercraft.js` (resolved)

WC-1's file is merged (b527fae) and WC-3 (2494b37) and WC-2 (3cb9539) merged with it kept whole (one md5 on all three
branches). The sheet's `openMix` is added to the merged file.

### 8.3 Per-area odds

The user's words ("different areas … different % chances") are built: `castOdds` uses the area. WATERCRAFT §2.6 keeps each
area's share off every screen so that reading the water stays the player's skill, and **the sheet keeps it until the user
answers** (decision 106): its open water is one row, at an hour and on a hook, the blind caster's mix over the areas. A place
is not an area: it is named on the Chart and sold by its map, and its pool is shown. The standing rule also allows odds in the
player's own logs, and the sheet is a log, so **§11 question 41 puts it to the user with both outcomes and a middle way**:
the middle way shows "where you last cast" (the area never named), only once you have fished it, from `castOdds` with the
cast's stored `S.cast.area` (cheap; a seam `fishing.lastCastArea()` the lane would add, read-only).

### 8.4 The compare after WC-3

WC-3 stopped the auto-pin of the last lost fish and nothing calls `pinGear`, so the gear log's compare never shows. **Ruling:
the reference is the player's own pin, set by a tap on the Odds table or the species page's **Odds ›**, else the water's
reference fish once met** (decision 109); the reference class travels with the pin. A lost fish never pins itself (WATERCRAFT
§7).

### 8.5 The gear log and the sheet: merged

The gear log under the loop listed every tier to T4 (Glassreed and Lantern-Spine, not on M1's shelf), every lure on the
shelf with its Who bites, and its compare. **Ruling: merged into the sheet** (decision 105): one page with one source for each
number, owned things and the next tier only, the Who bites at the hook you pick. Murk's book keeps selling: its plates and
their lines are the buying page; its last page's **Odds ›** opens the sheet.

### 8.6 Prices

The sheet prints the shelf card's price (`shelfItems`, the factor applied once there), never `LOOP.tackle.price` (which the
gear log read without the factor). Whatever factor the integrator's step P lands (×2 shipped today; ×3 designed; the sim's ×4),
the sheet and the book agree.

### 8.7 The double tables, and two gaps for the lead

| table | the sheet reads | the other copy |
|---|---|---|
| the marked giant's +6 (`LOOP.giant.markedHold`, `CATCH_V3.markedFish`) | neither: never shown | unchanged |
| Taper's giant rule (lane 4's `lurePool`, WC-1's `finishPool`) | `castOdds` (`finishPool`) | `lurePool` stays exported for other waters |
| Stub's light (`LOOP.wicks.stub.stats.lightRadius` +1.5 m, the light's look; WC-2's `sight.lantern.stub` ×1.5, how far a silhouette is seen at night) | neither: Stub's exact line and the Lantern's plate carry no light figure (the light is seen on the water) | **for the lead**: one rule for both (WICKS §2.3 calls Stub's light "the look"; WC-2 made it see farther); until then the sheet prints no figure for it |
| a legend's landings | the roll's: `meta.records.legendGrowth`, which the loop never writes, so 0 (the Matriarch 31% at the example's tackle) | **for the lead**: the Journal's odds row (`progression-af`) counts her landings from the Journal (one landing: 28%, *measured*), so after a landing the Journal and the roll disagree; the sheet follows the roll |
| WC-3's Who bites (`bitesTable`) | `openMix` with the bait's rb | **for the lead**: `bitesTable` (and so the built gear log's block, off the sheet) has no rb step, so on Lumen Moss it prints the evening's shares without the moss's bonus; the sheet replaces it under the loop, so it is shown nowhere the loop draws |
| the creel's "Hold {n}" (`TEXT_LOOP.holdName`) and the grip's "+{n} Hold" (`AUTOFISH.text.gear`) | the grip only (§3.3) | **for the lead**: Murk's shelf and book still print the creel's step as "Hold {n}"; if the user finds it confusing there too, the book can take the creel glyph the sheet draws |

### 8.8 The stern line (BARGE-INSIDE §5)

Aboard, the stern gallery fishes the Mossmere's open water at first light, read as day, by the area the float lands in, with
its own guard (three good bites a dawn, let go only; BARGE-INSIDE §5.7). Its odds are hidden on the water like every other
cast. On the sheet, **the open water at Day is the stern's water**: its Who bites rows are the stern's (the stern reaches no
place, no giant and no legend, and the open water's rows hold none). The stern's own favour (no let-go, its own quiet count)
is the stern lane's; if it differs from the open water's at day, a "stern" Where chip is a could for after both lanes (§12).

---

## 9. The build lane: one MEDIUM lane after tonight's merge (`gw-mvp-sheet`)

**Base**: `gw-m1-mvp` after tonight's merges. Already in it at 3cb9539: steps 1–3, 5a/5b, lane 4, 5c, **WC-1 (b527fae), WC-3
(2494b37), the teach caption (9923a6e) and WC-2 (3cb9539)**. Still to merge first: **Murk's catalogue** (`gw-mvp-catalogue`;
it merges cleanly onto 2494b37 and after) and the integrator's step P (the price factor). The lane needs WC-3's `bitesBlock`
and the catalogue's `murk-engrave.js` and paper; if the catalogue slips, the flyleaf falls back to the Journal's night ink with
the engravings in pale ink (`currentColor`), and the lane says so.

**Read**: this document; SPEC §8.5, §8.8, §8.11, §8.12; WATERCRAFT §2.6, §3.7, §3.9, §4; WICKS §2; FINDS §3; CONTRACT
§14.4, §14.12, §14.13, §14.15, §14.16 and the catalogue's section; M1 §2.18; `BARGE-INSIDE.md` §4.3 and its object table
(the `ledger` and `rack` rows, on `gw-design-inside`).

**Builds** (in this order, each its own commit):

1. **The rule** (first commit, alone): §8.1's loop-only `CATCH_V3.items` patch in `data.js`'s loop apply block, with
   `data.js` importing `watercraft.js`; `catchItemHold`'s text untouched; test S3; `node tools/validate-data.mjs --v3` and
   `--loop` green; `clams.mjs --shipped=mossmere --step=5` re-run and unchanged.
2. **The model**: `src/loop-sheet.js` (§7.1–§7.2: the light-to-phase map, the plain cast's `rb`, `sizeOdds` with the floor,
   the family and pinned size lines, the moves, the mixed Elder, the legend at landings 0), `watercraft.openMix` with `rb`
   (§7.3; `eveningMix` on it, `bitesTable` unchanged), `TEXT_LOOP.sheet` (§6), `loop.sheet(view, live)` with the shelf passed
   in, `loop.markSheetSeen(keys)`, `migrateLoop`'s seeding at its top and `freshLoop`'s field; `loop-fixture.mjs`'s
   `fakeLoop` gains both methods; tests S1–S14.
3. **The view**: `src/ui-sheet.js` (new; its CSS injected once, as `ui-gear.js` does): `renderSheet(K, entry, content, model,
   {phone})`, `live` from `ctx.fishing.waterAt` and `loopLight(K.phaseInfo().phase)` (§5.1), the plates (folded on a phone),
   the notches, the chips with the tipped glyph, the class chips, the three-column table with its fixed head and the pinned
   row's five classes, the moves, the jump row with its words, the drop and its observer, the paper (`PAPER_CSS`); the
   desktop spread and the phone scroll of §4.
4. **The seams**:
   - `ui-screens.js`: the Journal's first tab `'sheet'` (the tab list, `tabKeys`, `catalogueBack`; the label and its 358 px
     fallback, §2.1), `openSheet({from, section, pin, pauseChild, titleChild})` with `from` ∈ {`pause`, `ledger`, `rack`,
     `odds`, `species`, `book`} (opens or re-points the Journal; refused while a line is out), `openTackle` under the loop →
     `openSheet({section: 'odds'})`, the species page's link (§2.4), the trip pause's item (after the tutorial, §2.2).
   - `ui-loop.js`: the home pause's item (after the tutorial); the book's `openOdds` (already `openTackle`: unchanged, follows);
     `textAllowed`'s `'sheet'` screen with its template patterns and `allowedWords` with `TEXT_LOOP.sheet`; the home target
     `rack` (its button, no word, its accessible name), `placeTargets`' `words: {wall: false, rack: false}`, `homeTargetIds`.
   - `home-targets.js`: `TARGET_ORDER`, `TARGET_BOXES.rack` (§2.3: y from deck + 1.0), `targetCorners`' id list,
     `frameCheck`'s `words` with `rack: false`; `actors-home.js`: `rack` in `targetBoxes`' id list (no new mesh, no new call);
     `tools/validate-data.mjs`: the mooring frame check with `rack`, `TEXT_LOOP.sheet`'s scans (rows, words, `/\d\s*%/`).
   - The interiors (BARGE-INSIDE's lane I-4, `aboard-touch.js`): `ledger` → `openSheet({from: 'ledger'})` and `rack` →
     `openSheet({from: 'rack', section: 'tackle'})` (§2.3); whichever lands second wires them.
   - Murk's catalogue: `murk-engrave.js` (level 0, the `hook` key, the four plates) and `ui-catalogue-murk.js` (`PAPER_CSS`
     split from `.gw-book`, `.cat-pp` and `.cat-eng` under the sheet's root) (§7.3); `ui-finds.drawFindArt`'s `ink`.
   - WC-3: `ui-af.bitesBlock` is the table's formatter; `ui-gear.whoBitesHtml` is no longer drawn under the loop (it stays
     exported).
   - CONTRACT: a new §14 section, **the next free number after the catalogue's merge** (likely §14.18, if the catalogue's
     colliding §14.15 is renumbered §14.17 at its merge; §14.20 is the interiors'): `loop-sheet.js`'s exports, `loop.sheet`,
     `loop.markSheetSeen`, `meta.loop.sheetSeen`, `screens.openSheet` and its `from` values, the `rack` and `ledger` ids,
     `watercraft.openMix`, the Hold rule's data patch.
5. **Tests**: `tools/tests/loop-sheet.test.mjs` (S1–S14) and `tools/tests/loop-sheet.scenario.mjs` (the gate below); the built
   suites green: `loop`, `loop-trip`, `ui-loop`, `ui-catalogue`, `loop-4`, `loop-5a` (test and scenario, with `homeTargetIds`'
   two lines updated), `loop-5b`, `loop-finds`, `loop-lost`, `loop-teach`, `watercraft`, `loop-watercraft`,
   `watercraft-face`, `murk-catalogue`, and **`loop-1a`** (T73 unchanged: the home pause is Resume · Settings during the
   tutorial).

**Files it owns**: `src/loop-sheet.js`, `src/ui-sheet.js`, `tools/tests/loop-sheet.test.mjs`,
`tools/tests/loop-sheet.scenario.mjs`; its additive edits in `data.js` (the loop apply block's patch, the `watercraft.js`
import, `TEXT_LOOP.sheet`), `watercraft.js` (`openMix`), `progression-loop.js`, `ui-screens.js`, `ui-loop.js`,
`home-targets.js`, `actors-home.js`, `murk-engrave.js`, `ui-catalogue-murk.js`, `ui-finds.js`, `validate-data.mjs`,
`loop-fixture.mjs`, `loop-5a.test.mjs` (two lines), `loop.test.mjs` / `loop-trip.test.mjs` (`freshLoop`'s shape, if they
deep-equal it), CONTRACT's new section. It does not edit `fishing.js`, `clams.mjs` or `catchItemHold`.

**The browser gate** (`tools/tests/loop-sheet.scenario.mjs`, desktop 960 × 540 and 1280 × 720, phone 390 × 844 and 390 × 664;
the example save as a fixture, and a fresh save):

1. **Every way in**: the home pause item (after the tutorial; Resume · Taper's Sheet · Settings), the trip pause item (line
   in), the Journal's first tab, the rack target at home (third person), the catalogue's foot **Odds ›** (lands at Odds), a
   caught fish's **Odds ›** at home and on a trip (lands at Odds with that fish pinned at the lit class), Murk's book's
   **Odds ›** (lands at Odds; **Back** returns to the book's page); aboard, once the interiors land, the ledger (the head) and
   the rack (Tackle). **Refused while a line is out**: the trip pause item dimmed with "Reel in first."; the Journal glyph
   locked as built.
2. **Live**: at home a tap on the Cut Strip chip fits it (the Chart's slot then shows Cut Strip), and the Odds table, the
   size lines, the buffs, their moves and the bait plate change to the node model's figures; on a trip the chips do nothing.
3. **The picks**: Under the Span brings the Thousandcast Pike's row (if met) and Elder figures where the open water shows
   "—"; the Buoy Lights moves the hour to night; an owned place in its mist is no chip; every figure on screen equals
   `loop.sheet(view, live)`'s (a scan of the page against the model).
4. **The user's rule, first**: Mire Worms alone fitted and the pikes met: both read "<1%" at every place and hour; then the
   spoon fitted over them: the pikes come to the hook, and the worm's chip carries the tipped glyph.
5. **New**: a buy in Murk's book, then the pause item and the tab carry the drop; the sheet's plate carries it; scrolled into
   view for a second and the page closed, it is gone after a reload.
6. **Fit**: at 390 × 844 and 390 × 664, no horizontal scroll at 358 px; at 960 × 540, the spread with nothing clipped; every
   text ≥ 16 px (a computed-style scan, both); every target ≥ 44 px and no two overlap (bounding rects); the tab row fixed,
   the page scrolling, the table's head fixed while it scrolls; the jump row reaches each section; the folded page about
   2.5 screens at 390 × 844 (measured).
7. **Words**: every visible text node and accessible name passes `textAllowed(t, {screen: 'sheet'})`; no area word; no unmet
   fish's name; no "Hold {n}"; after a forced Trophy loss and a forced giant loss, nothing on the page differs.
8. **Look**: captures of the spread and the phone column, folded and open, fresh save and the example save; two look-and-fix
   rounds; the user's look before the merge.
9. **Budgets**: `clarity-perf --home` and `--loop` unchanged (the page is DOM; the rack adds no draw call); the page opens in
   under 50 ms on the low tier (model and DOM); `index.html` ≤ 3.3 MB.

**Size: MEDIUM** (3–6 days): the rule and the model a day and a half, the view two, the seams a day, the tests and the gate one
to two.

---

## 10. What this changes elsewhere

- **SPEC v8.8**: §0 row 38 (the user's words), §0.14, decisions 105–110; §3.7 (the Hold row, the odds row); §8's rule (the
  sheet is the logs' page); §8.4 (the shelf's **Odds ›** opens the sheet); §8.5 (the pause menus' item, "Taper's Sheet", after
  the tutorial); §8.8 (the catalogue's foot **Odds ›**); §8.11 (the gear log's words now print on the sheet); §8.12 (new: the
  sheet's words); §12 (this file binding); §16 questions 41–43.
- **M1 revision 9**: the header, §0 (the user's words), §2.5's Odds › box, §2.6 (the rack and the ledger), §2.8 (the screen
  list), §2.10 (words), §2.18 (new: the sheet's boxes, among them every Odds ›), §4 step S (new), §9.
- **WATERCRAFT.md**: §3.7 is now true in the land roll (§8.1; no word of it changes); §3.9's gear log is the sheet's Odds
  (its Who bites at an hour and a place, the same rows, with the bait's rarity bonus).
- **CONTRACT**: the next free §14 section, by the lane.
- **BARGE-INSIDE.md** (@03cae59): already carries the seam (its §4.3, decision 116, its object table's `ledger` and `rack`);
  nothing to change there.

---

## 11. Questions only the user can answer (each with the default this document builds)

41. **Should the sheet show the chances for a part of the lake?** You said different areas should have different chances, and
    they do: a pike's chance in the reeds is not its chance in open water. The sheet can show that, or leave it for you to read
    on the water.
    - *Default: not yet* (until you answer): the sheet shows the open water as a whole and each place you own, at the hour and
      on the hook you pick. Which part of the lake is better is something you learn by fishing it (WATERCRAFT §2.6).
    - *All of it*: the sheet names each area and its chances, as it does for a place. You would know where to cast before you
      cast.
    - *A middle way*: once you have fished a spot, the sheet shows the chances "where you last cast", the area unnamed. You
      learn the water by fishing, and the sheet tells you what you found.
42. **What is the page called on the pause menu and the tab?** *Default: "Taper's Sheet"* (your Wick's name and "Sheet", with
    its portrait), as the Journal is already "Taper's Journal". The other way: your Wick's name alone, "Taper".
43. **Can you change your bait and lure on the sheet?** *Default: yes, at home*: a tap on a bait or lure on the sheet puts
    it on the hook, exactly as the Chart's slots do, and every number on the page changes with it; on a trip the hook stays as
    you sailed. The other way: the sheet only shows; you fit them on the Chart.

---

## 12. After the lane (could)

- A small drawn map in the Odds' head: the chart table's own sheet (`chart-top.drawToTexture`) with the lifted places' blots
  as the Where chips.
- A "stern" Where chip, if the stern line's favour differs from the open water's at day (§8.8).
- The rack's art: the fitted lure on its peg, the tin on its shelf, the line on the reel (with the interiors).
- The species page's "Your odds" block gains the sheet's hook chips (fitted from there too).
- Each later water fills the sheet with its own rows as its slice ships: its places, its hook rows, its tiers' notches.
- A per-Wick history line (firsts sold, comebacks landed), if the user asks for records on the sheet.

---

## 13. The reviews of v1, and what became of each finding

Two reviews read v1 (698ebc2): a design review and a build review. Every blocker and major held and is applied; so is every
minor, but where noted.

| # | finding (severity) | held? | what v2 does | where |
|---|---|---|---|---|
| B0 | The Hold rule as an edit of `catchItemHold` breaks `validate-data` pass 3: `v3-exports.json` hashes its source (build, **blocker**) | yes (checked: `catchItemHold` is in `v3-exports.json`'s names) | a loop-only `CATCH_V3.items` patch (`species` lists, `family` and `attract` kept for the sim's fallback); `--v3` and `--loop` in S3's gate | §8.1, §9 step 1, S3 |
| D1 / B1 | Who bites leaves out the rarity bonus: Lumen Moss's 0.10 (design and build, **major**) | yes (checked: `rollBite` line 1204; *measured* the carp 22.3% → 24.7%) | `rb` = the stats' plus the bait's, less the cast's own; `openMix` gains it; Lumen Moss in Buffs as "Rarer fish" with its move; S4 builds `rb` as `fishing.js` does, S5 a Lumen Moss case; WC-3's gap noted | §3.4, §3.5, §7.2, §7.3, §8.7, S4, S5 |
| D2 | The size line ignores the lure's and Cut Strip's family terms (design, **major**) | yes | one size line per family term on, labelled with the family plural, each μ the roll's full μ for that family; the pinned fish's own line too (B6); S7 covers a family term | §3.5, §7.2, S7 |
| D3 | Upgrades show as unitless favour, never as chances (design, **major**) | yes | every favour buff and every raft plate's Next carries a **move**, "Trophy 15% → 19%", at the picks and the reference class; the lure and bait plates carry a land compare for the reference fish; the sum line is desktop-only | §3.2.1, §3.3, §3.4, §4 |
| D4 | "Hold" means the creel and the grip on one page (design, **major**) | yes | the creel is its name and its slot-tick glyph; "Hold" is the grip only; S11 bans the "Hold {n}" form; the shelf's own use noted for the lead | §3.3, §3.6, §8.7, S11 |
| D5 | A bare name on the pause menu does not read as "my gear and buffs" (design, **major**) | yes | "Taper's Sheet" (one new word) with the portrait on the pause item and the tab; the tab falls back to the bare name at 358 px only if it does not fit; Q42 restated | §2.1, §2.2, §6, §11 |
| B2 | The rack's box fails `frameCheck` on every phone; the word maps; `homeTargetIds` (build, **major**) | yes (re-measured: from deck + 1.0, clear at all eight sizes) | the box from deck + 1.0; `rack: false` in both `words` maps; the id in `TARGET_ORDER`, `targetCorners`, `targetBoxes`, `homeTargetIds`; loop-5a's two lines and suite | §2.3, §9 |
| B3 | `live` has no source; a misted place offered as a chip (build, **major**) | yes | `ctx.fishing.waterAt` + `loopLight(K.phaseInfo().phase)` into `loop.sheet(view, live)`; Where chips only for lifted places; mist is the open water | §3.5, §5.1, S9, S12 |
| B4 | 'night' silently drops Night Rise and the Lantern (build, **major**) | yes (checked: `baseTerms` and `raftTerms` test `'gloomtide'`) | day → 'calm', dusk → 'dusk', night → 'gloomtide' for every call; S7's Buoy Lights case | §3.5, §7.2, S7 |
| d6 | On a phone Buffs are five screens down; the jump glyphs must be guessed (design, minor) | yes | Buffs straight under the head; plates fold to one row with a key figure; the jump row's words under its glyphs | §4.2 |
| d7 | "64%" in a bare "Your odds" column reads as a catch chance; the struck reference is hidden (design, minor) | yes | the head "Your odds · Trophy", fixed while scrolling; the built strike line under the table | §3.5, §4.2 |
| d8 | The exact lines read as formulas (design, minor) | yes | rewritten in the built lines' register, numbers kept, filled from `LOOP.wicks` | §3.1 |
| d9 | The headline example shows a worm on and the pikes at 8% (design, minor) | yes | worms alone first (both pikes "<1%"), then the spoon tipped; the tipped glyph explains it; gate item 4 the same order | §3.2.1, §3.5, §9 |
| d10 | Seven columns overflow the desktop page (design, minor) | yes | three columns and the class chips on a desktop too; the pinned row opens to five classes; a 960 × 540 fit check | §4.1, §9 item 6 |
| d11 | The rack is outside the cabin; the interiors' seam one-sided (design, minor) | yes, and overtaken: BARGE-INSIDE @03cae59 now puts **the ledger on the desk inside the cabin** and keeps the rack | both objects, both calls, binding in both documents | §2.3 |
| d12 | Q41 leans to no (design, minor) | yes | put neutrally with both outcomes and the middle way; the default stays "not yet" until the user answers | §8.3, §11 |
| b5 | Elder ignores the Ancient share (build, minor) | yes | the share-weighted mean; S6. **Not as asked**: `sizeOdds` is not built as an edit of `data.classOdds` (also hashed by the v3 fingerprint) but in `loop-sheet.js` on the roll's `normCdf`, tested equal to `classOdds` | §3.5, §7.2, S6, S7 |
| b6 | One size line is not the pinned giant's or a predator's; Taper's first bite missing (build, minor) | yes | the family and pinned lines; the plain line named as the plain cast's; Taper's first bite left out on purpose, said | §3.5 |
| b7 | S3 cannot reach the sim's private `itemHold` (build, minor) | yes | S3 compares `catchParts` with the sim's exported `landP` | S3 |
| b8 | `loop-sheet` ↔ `progression-loop` import cycle (build, minor) | yes | the shelf passed in; S13 scans for it | §7.1, S13 |
| b9 | `sheetSeen` seeded after `migrateLoop`'s fill (build, minor) | yes | seeded at the top, before the fill; the deep-equal tests noted | §5.2, S10 |
| b10 | The legend's landings read two ways (build, minor) | yes | the sheet takes the roll's (0); the Journal's gap noted for the lead | §3.5, §8.7 |
| b11 | Four catalogue-side gaps (engrave level 0, `plateKey` hook, the paper tokens inside `.gw-book`, `drawFindArt`'s ink) (build, minor) | yes (checked on `gw-mvp-catalogue`: `Number(rest) \|\| 1`) | each spelled out | §7.3, §9 |
| b12 | The species page's gear link: only while playing, a dead label, no pin (build, minor) | yes | "Odds ›" at home and on a trip, pinning that fish at the lit class; the reference class travels with the pin | §2.4, §3.2, §8.4 |
| b13 | Suites missing; the % scan; whole composite lines in `textAllowed` (build, minor) | yes; **T73 not edited**: the sheet's pause item waits for the tutorial's end, so T73's "exactly Resume · Settings" still holds and loop-1a joins the suites unchanged | the suites listed; `/\d\s*%/`; templates as patterns | §2.2, §6, §9, S11 |
| b14 | CONTRACT numbering, BARGE-INSIDE missing, the merge base (build, minor) | yes | "the next free §14 number"; BARGE-INSIDE @03cae59 read and bound; the base re-stated at 3cb9539 | §2.3, §9, §10 |

**Added by v2, not asked by either review**: Mire Worms' quicker bites (`bonus.biteSpeed` 0.3, applied in the bite's wait under
the loop) were missing from Buffs; they are now "Bites sooner ×1.3", and Stub's exact line speaks in the same words. The stern
line (BARGE-INSIDE §5) is the open water at Day on the sheet (§8.8).
