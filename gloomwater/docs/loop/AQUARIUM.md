# The aquarium: the Well under the Slow Hearth

*Design for the aquarium the user asked for (revision 2, 15 November 2026). **Written now, built after M1** (SPEC v8.3 §13's
after-M1 list, `M1.md` §5): nothing here is in M1, and M1's budgets, shelf and pacing do not count on it. Binding with
`SPEC.md` v8.3 (§0 rows 20 and 22, decisions 58 and 66–70, §3.2, §6.3, §8.2, §8.3, §8.4, §10, §13, §16 questions 22, 23 and
25), `FINDS.md` revision 3 (its fittings and dressings are finds), `LORE.md` v2.2 and `WATERS.md`. Design only: no `src/` or
`tools/` file changed with this document. Every number is a starting number for the build to measure; figures marked *(est.)*
come from a scratch run of the committed sim's exported `trip()` (the natural rule, 1,500 evenings a water on the kit the sim
settles it with, the pacing player's 90% and +25% applied by hand), and none may be quoted as measured until the balancing
job's `clams.mjs --well` (§12) prints them.*

*Revision 2 (15 November 2026): **the user's word on who lives there** (§0). The Well is no longer drawn from the Journal.
It holds only the fish you choose to place: a rare fish, a giant, a legend, or any fish landed at Trophy or bigger; the card
offers a third choice, **Aquarium**, which gives up that fish's sale; a full Well offers a swap; and its room grows by tanks
bought from Murk's shelf, from 4 places to 96. Its rooms, camera, controls, finds, sound and fish-model needs stand from
revision 1, adjusted where who lives there changed them. §19 is its log.*

---

## 0. The user's words, and the lead's defaults

> "We also need to have an aquarium feature that we can dive into as a 3d world. The character doesn't need to be in it,
> just a camera that can swim around the 3d aquarium world. This is attached to our barge and we can fish items to upgrade it
> and cosmetics from each location. This doesn't need to be built properly yet but it could do with he written about."
> (15 November 2026)

> "The aquarium is only for the rare fish or giants of normal species, like exceptionally large species. Maybe the player
> needs an option of they want to add it to the aquarium? We also need to be able to upgrade the aquarium as we go to hold
> more fish as there are alot to catch." (15 November 2026; SPEC §0 row 22, answering §16 question 22)

**The lead's defaults on the first** (revision 1; this design improves their details, never their direction): written now as
this file, built after M1; entered from the Slow Hearth (a hatch or a glass floor); a free-swimming camera with no Wick through
a 3D underwater scene; how fish get into it keeps "you sell what you keep" honest; its upgrades and cosmetics are finds, each
water its own themed set; controls on desktop and phone; an art and performance budget with a low tier; its sound; what it
needs from the fish models.

**The lead's defaults on the second** (revision 2, binding): **eligible** is a rare species (rarity rare or above), a giant or
the legend, or any species landed at Trophy class or bigger; the catch card offers a third choice, **Aquarium**, beside Keep
and Let go, only when the fish is eligible and the aquarium exists; choosing it gives up that fish's sale, and the fish lives
there at its caught size, in its water's room; when the Well is full the card offers a **swap** (pick an occupant to release;
nothing is paid back); capacity grows by **tank upgrades** bought from Murk's shelf with clams, a ladder like the hold's from a
few tanks to dozens, sized against how many eligible fish a full road yields and priced so it never blocks the 47.6 h pacing;
finds keep giving the rooms' dressing; a giant or legend placed still counts for its records, gold frame and keys (placing is
a sale given up, not a catch undone); built after M1. This reverses revision 1's default, "every species you have landed lives
there, from the Journal".

---

## 1. In one breath

Amidships the Slow Hearth has an old **wet well**, the flooded hold the barge road's families kept their catch alive in, with
a round glass hatch in the deck. When a fish worth keeping comes up (a rare one, a giant, a legend, or one of any kind landed
huge), its card offers a third choice: **Aquarium**. Choose it and Murk never sees that fish: it rides home in the Well's
basket over the raft's side and goes down the hatch at dawn. At home, tap the hatch and the view sinks through the glass into
the water under the barge: you are a slow swimming eye under the Slow Hearth's keel, and an underwater road runs on, room by
room, one room for each water the barge has moored at, each built from that water's drowned works and dressed with what you
have fished up there. **The fish you chose swim in their own water's rooms, at the size you caught them.** The Well starts
with room for four; Murk sells tanks that give it room for up to 96.

---

## 2. When

- **After M1**, as its own job (size **L**, §16); M1 is "the Mossmere and the home barge, complete" without it, and its
  done-list, shelf, sim and budgets stand alone. Until the Well is built the card has two buttons, as M1 builds it.
- It needs M1's barge (the hatch and the home flow), M1's fish on their plans, the card of slice 1a, and `FINDS.md`'s finds
  (its fittings and dressings are finds). It opens with the rooms of the waters shipped by then (the Mossmere's, at least) and
  grows a room with each water after.
- Where it sits in QUEUE's order after M1 is SPEC §16 question 23 (default: the first job after M1's polish pass).

---

## 3. What it is, in the world (and why it needs no magic)

- **The wet well is real** (`LORE.md` §6's barge family): barge-houses of the barge road had a flooded well amidships, its
  sides slatted so the water flowed through and fish kept alive; the Slow Hearth's is old and was empty until you put a fish in
  it. Keeping a fish alive in it is what it was built for. A lamp over the glass draws fish, as any lamp does (`LORE.md` §7.5).
- **The Well's basket**: a slatted basket the raft trails on a short line, the wet well's own, so a fish chosen for the Well
  rides home alive and takes no slot in the hold. It is part of the Well, free, never on the shelf.
- **The fish in it are real; the rooms are a picture**, the way the Chart is a drawing and the Long Wall is prints: the game
  shows the fish you have kept back each in the room of the water it came from, under your own barge, wherever the barge lies.
  Nothing in the world claims the rooms are a real place under the hull. So the only wonders stay `LORE.md` §2.13's four.
- **It is the one place a fish is kept back from Murk**, by your choice, card by card. It is not the parked Live Well or
  keep-pond (SPEC §6.4, §9): nothing in it is ever sold, eaten, cut or carried on a trip.

---

## 4. Getting in and out

| | |
|---|---|
| **the hatch** | a round glass hatch in the deck amidships, between the cabin and the bow, rimmed in brass, lit faintly from below by the water's own glow. At home it is a **fifth target** among the barge's places (`SPEC.md` §6.1), with no word under it (its accessible name is "the Well"; selector `[data-tile=well]`). It is there from the aquarium's build, free (the well is the barge's own); its tanks are bought (§8) and its fittings and dressings are finds (§9) |
| **in** | tap the hatch: the home camera eases down onto the glass (0.8 s); one ink dip (0.6 s, held until the Well's first frame is drawn, which hides the scene's build, ≤ 0.6 s on a mid phone); you are under the hull in the home pool, looking up at the keel and the light through the hatch, the raft's small hull at the stern. The first time a fish is placed, the hatch breathes once at home as it goes down (as the chart table's target did), no words |
| **out** | **Back** (top left, inside the safe area, ≥ 44 px; the built word), Escape, or swim up into the hatch's light: one ink dip back to the home camera at the hatch |
| **never** | during a trip (nothing on the barges can be tapped on the water, `SPEC.md` §6.1); during the opening or the tutorial; while a card or the tally is open. Time stands still at home, so the Well has no clock and no evening; it is always the light of home |
| **the flow** | a new flow `well` beside `home`: the water scene is kept but not drawn (no rebuild on the way back), the Well's scene is built on entry and disposed on exit; input goes to the swim controls; nothing casts, and `fishing.onPointerDown` is never reached |

An empty Well can be entered: its rooms are dressed (§9) and its road runs on, so a first dive before any fish is placed shows
where they will live.

---

## 5. The world

- **The home pool**: about 20 m across under the Slow Hearth, its keel and the hatch's light overhead, the moored water's
  floor below (the Mossmere's at the Jetty: soft silt and a few fallen stones). **The tanks are seen here** (§8): each step
  adds to the pool under the hatch, so the Well's size is visible the moment you dive. The road starts here.
- **The road**: a sandy channel with lamp-stones along it, running from room to room in the Lamp Road's order, as the Chart
  draws the road on land. Rooms join it through arches. Past the last room the road fades into soft dark water: nothing
  unowned is drawn.
- **One room per water**, opened the first evening the barge moors there (its tow; `SPEC.md` §6.5), so the Well follows the
  barge, never a purchase. Each room is about 30–40 m across (the Rime Sound's about 60 m, so the Long Winter's 560 cm fits
  with room to turn), built from its water's drowned works and its lushness step (`WATERS.md`: under water too, the Mossmere
  room keeps green as a trace and the later rooms grow greener, weed, moss and root rather than any green in the water's
  colour). Its water's name shows once, small, in the Chart's hand, the first time you swim in.
- **The look**: the Starlit palette under water: lavender-blue depths, the violet-dusk sky a soft brightness at the surface,
  each room's own glow (glowcaps, crystal, coral, lanterns), the fish's own glow, and one warm light, home's, falling through
  the hatch into the home pool. Clear water near you, gentle depth haze beyond (never fog thick enough to hide a fish you
  are looking for). No ring or disc anywhere.

---

## 6. Who lives there

**Only the fish you place, and only a fish that is eligible.** Nothing is drawn from the Journal: a species you have landed
but not placed does not swim there.

| eligible (any one of these, at the card) | the Mossmere's, for example |
|---|---|
| **a rare species**: rarity rare or above (rare, epic, legendary) | the Reedjaw Pike, the Gloam Eel, the Bridgechain Sturgeon |
| **a giant** (★) or **the legend** | the Thousandcast Pike, the Hullkiss Lamprey; the Belled Matriarch |
| **any species landed at Trophy class or bigger** (Trophy, Elder, Ancient): "giants of normal species" | a Trophy Dusk Minnow, an Elder Weeping Carp |
| **a curiosity** whose rarity is rare (seven of the eight; the Mudlark Crab, uncommon, at Trophy or bigger) | — (none at the Mossmere) |

**Never eligible**: a find (a find's card never offers it); a common or uncommon fish below Trophy; a fish that got away or
was only glimpsed.

- **The road's count** (*est.*, §12): 93 species are eligible by rarity (25 roster rares, 12 built rares, 33 giants, 16
  legends and 7 rare curiosities), and any of the other 103 at Trophy or bigger. About **2.3 eligible fish come home an
  evening** (1.4 at the Mossmere, 2.1–2.9 from Glasswater on), so a full road of about 530 evenings yields **about 1,200**.
  The ladder (§8) is sized against that: its top, 96, holds one of every rare species, giant and legend with a few to spare,
  and about one in twelve of the eligible fish a road brings up. Choosing stays a choice to the end.
- **Each placed fish is one fish**, at its caught size (its length and z, the weight shown by `data.fmtWeight` as everywhere),
  in the room of the water it was caught in (a fish of two waters, the Lampspot Snakehead, in the room of the water it came
  from), at its haunt's depth and in its play's manner (a sulker on the floor, a darter quick and high).
- **More than one of a kind may live there**: two Reedjaw Pike, a Trophy and an Elder, swim together. A bigger one does not
  replace a smaller unless you swap it (§7.3).
- **Giants** swim in their place's corner of the room (the Thousandcast Pike under the room's fallen arch, the Hullkiss
  Lamprey by its buoy-light stones), slower and alone; **legends** keep their room's deep end, at most one in view at a time.
- **Records are not touched by placing.** The Journal page, the best print, the class seal, the giant's gold frame, the
  legend's print along the eaves and her gilded stone, the catalogue's ink drawing and a list's count (the catch key, SPEC
  §5.5) are all written at the measure, before the card. A placed fish counts for every one of them exactly as a fish sold or
  let go: placing is a sale given up, not a catch undone.

---

## 7. The choice on the card, and the swap

### 7.1 The card's third choice

The card is SPEC §8.2's, unchanged but for one button. **Aquarium** shows only when the fish is eligible (§6), the Well has
been built, and the tutorial is over (from the save's second evening). Otherwise the card has its two buttons, as built.

| button | words | what it does |
|---|---|---|
| keep | **Keep** · clam glyph · the value | as built: into the hold, sold at the tally. The default (first in order, the focused button) |
| aquarium | **Aquarium** · the hatch glyph · the Well's count ("3/8") | the fish goes to the Well: **no clams**, no hold slot (it rides home in the Well's basket), its good bite spent as a keep spends it, no favour added. With the Well full, it opens the swap (§7.3) |
| let go | **Let go** (held on a Small or a Keeper from slice 3: the knife, as built) | as built: the bite refunded, +0.2 favour |

- **The trade is in sight**: **Keep** shows the clams you would be paid beside **Aquarium**, so the sale you give up is
  the number on the button next to it (a legend's first landing shows her crown's price, "Keep · 580.3k" for the Banked Fire).
- **What placing gives up**: the sale and everything paid only at a sale: an order the fish would fill stays chalked (it
  fills with the next fish of its kind you keep), the Old Ledger's double (from slice 9) stays unpaid for that species, the
  Wick's firsts bonus is not paid. A legend's first landing placed pays no crown price; her next landing that is kept pays her
  later 40%.
- **With a full hold**: **Keep** is dimmed as built, and **Aquarium** still works, because the basket is not the hold. Placing
  never shortens or lengthens an evening by a slot.
- **Words**: one new word, **Aquarium** (the user's), and the count. The count is the one number form the Well adds ("5/8",
  the list's form; SPEC §8's rule).
- **Continue** with a card open reopens it with its three buttons. A fish in the basket is part of the trip: a reload restores
  it (`run.toWell`), and the boot rule with the loop's flag off places it rather than selling it (§16).

### 7.2 On desktop and on a phone

| | desktop | phone (portrait, ≤ 480 px wide) |
|---|---|---|
| the buttons | one row under the card's hero: **Keep** (widest), **Aquarium**, **Let go**, each ≥ 44 px tall | **Keep** across the card's width on the first row (≥ 56 px tall); **Aquarium** and **Let go** half width side by side beneath it (≥ 48 px tall each); all inside the safe area |
| keyboard | Tab order Keep, Aquarium, Let go; Enter on the focused one; no new shortcut | — |
| the count | under the word, small, the card's dim ink | the same |
| when it is not offered | the row is the built two buttons, unchanged in place and size | the built two, unchanged |

### 7.3 The swap (when the Well is full)

**Aquarium** on a full Well opens the **swap sheet** in the card's frame, the new fish's ink drawing small at its top.

| | |
|---|---|
| **words** | "Well's full." (one line, as "Hold's full." is), **Swap**, **Back** |
| **the occupants** | each a small card: its ink drawing, its name, its weight, its water's glyph; a giant's gold edge; grouped by water in road order, **the new fish's own water first, and in it the same species first, smallest first**, so the natural swap (a bigger one of a kind you have) is the first card |
| **choosing** | tap an occupant: it is picked (ink ring); **Swap** lights. Tap **Swap**: the picked fish fades out of the sheet in an ink wash, the new one takes its place, and the card closes as a placing does. Two steps, so no swap is made by one stray tap |
| **what the released fish gets** | nothing paid back, no clams, no bite, no favour; it is let go from the Well. Its records stay (they were never the Well's) |
| **Back** | returns to the catch card with its three buttons; nothing changes |
| **desktop** | a grid four across (six on a wide screen), scrolled; arrows move the pick, Enter swaps, Escape is **Back** |
| **phone** | two across, scrolled with a thumb; **Swap** and **Back** pinned at the bottom in the safe area, ≥ 48 px |

A fish can leave the Well only by a swap: there is no release from inside the Well, so swimming there never asks for a choice.

### 7.4 The tally and home

At the tally, after the fish and the finds (SPEC §8.3), each fish for the Well is let down the hatch: its ink glyph, its name
and weight, and the hatch glyph; no price; then the total, which a placed fish never touches. `endTrip()` writes the basket
into the Well in the same save as the sale. The next dive finds it swimming in its room.

---

## 8. The tanks: the capacity ladder

The Well's room is counted in **places**, one fish each (a legend too). It starts with 4 and grows by **tanks** bought from
Murk's shelf with clams: the Home tab, under the Well's own small heading (the hatch glyph), each card "Room for 4 more in the
Well." (the step's number), its price, and **Yours.** once bought, in order like the hold's.

| step | places | name | price | on the shelf with (SPEC decision 38) | price, in evenings of income then *(est.)* | what you see in the home pool |
|---|---|---|---|---|---|---|
| — | **4** | the Old Well | free (comes with the Well) | — | — | the old slatted well under the hatch |
| I | **8** | Slatted Pens | **400** | the start (the Mossmere) | 1.4 | new slatted pens along the keel |
| II | **12** | Reed Cribs | **800** | the Sporewood map | 1.5 | woven reed cribs on the pool's floor |
| III | **18** | Stone Cisterns | **1,800** | the Glasswater map | 1.5 | two cistern rings of fitted stone |
| IV | **24** | Glass Panes | **3,500** | the Pallid Deep map | 1.6 | glass panes set in the pens' sides |
| V | **36** | Lantern Tanks | **4,500** | the Rime Sound map (water 5) | 1.5 | lantern tanks lit along the road's start |
| VI | **48** | the Deep Cistern | **9,000** | the Pyrefall Gorge map (water 8) | 1.6 | a cistern shaft dropping under the pool |
| VII | **64** | the Drowned Hall | **40,000** | the Salt Gate map (water 12) | 1.4 | a hall of arches opening off the pool |
| VIII | **96** | the Moon Pool | **100,000** | the Lanternroot Lagoon map (water 15) | 1.4 | the pool's floor opens to a round, lit deep |

All eight: **160,000 clams, about 12 evenings of income** spread over the road (*est.* about 65 minutes in all).

**How it is sized.** From the Rime Sound on, each step holds about one of every rare species, giant and legend of the waters
on the shelf by then (36 by the Rime Sound, 52 by Pyrefall Gorge, 70 by the Salt Gate, 86 by Lanternroot Lagoon and 93 by
the Inkwood, the rare curiosities included); before it, the Well is smaller than that (4 against the Mossmere's 6, 12 against 16 by Sporewood, 24 against 32 by
the Pallid Deep), so the first waters are where placing is a choice between your best. At every step the eligible fish coming
home outnumber the places many times over (about 1,200 against 96 by the end), so a full Well is always a chosen one. A
Trophy fish of a common kind competes with the rares for a place; that is the user's "giants of normal species".

**How it is priced**: like the hold's last steps and the looks (SPEC §4.2), one and a half evenings of income at the water
whose map puts it on the shelf, rounded; each is bought once, pays no clams and opens nothing.

**Outside "everything bought"** (the lead's choice; SPEC decision 69). The tanks are on the shelf but are **not among the
pacing run's 144 purchases**: the shelf's "everything bought" (47.6 h), M1's 32 items and 7,750 clams, the goal line (it never
names a tank) and the long game's end do not count them. Why outside:

1. **It is the player's option** (the user's "Maybe the player needs an option"). A tank pays nothing back and opens nothing;
   its only use is to keep back fish whose sales you give up. Inside the count, every player would be taxed to finish the road
   for a choice some never make.
2. **The Well's real price is the sales given up**, and that differs from 0 to about 10 hours between players (§12). Inside,
   the 47.6 h proof would hang on a choice; outside, the pacing run stays the proof of the shelf and the Well-keeper's run is
   the gate on the Well (§12).
3. **Nothing measured moves.** M1 is untouched (the Well is after M1), the 144 purchases, 47.6 h, the 76-minute longest wait
   and every §4.9 mark stand byte for byte, and no tank is a gear key, so an unbought tank never holds a water or the shelf
   shut.

---

## 9. How the rooms fill: the fish you place, and the finds that dress them

- **The fish**: each placed fish swims in its water's room (§6). A room whose water has given you no placed fish is still
  open and dressed, with its own small unnamed life (water snails on the stones, a drift of seed-glow, weed swaying) but no fish.
  A room with many swims them all; the art budget draws the nearest (§13).
- **The finds dress the rooms**, as revision 1 set it and `FINDS.md` §3.4 keeps it: the Well's base (the hatch, the home
  pool, the road and each water's plain room) comes free with the barge; from the Well's build, each water's finds table
  (`FINDS.md` §3.4) gains **four well pieces**, drawn like barge parts and looks (kept, never sold, a slot each, never
  repeated). Two are **fittings**, which grow that water's room; two are **dressings**, which dress it. No find adds a place:
  the Well's room comes only from its tanks (§8).

| a fitting | what it does in the room |
|---|---|
| **light** | the room's own lamps or glow light up: farther seeing, the room's colours fuller |
| **space** | a second chamber of the room opens (rubble clears from an arch, a door swings open), so its fish have more water to swim |
| **life** | the room's weed and roots sway fuller and its small unnamed life thickens (more snails, a drift of glowing seed, a few freshwater shrimp as motes); never a fish |
| **sound** | the room's own sound wakes (a bell tolling far down, a chime of crystal, a lock gate's groan) |

**The Mossmere's set (drowned stone)**: the **Fallen Arch-Stone** (fitting, space: the arch's rubble clears and the room's
inner court opens, where a placed Thousandcast Pike cruises), the **Gate Lamp-Stones** (fitting, light: the room's slit-stones
glow amber), a **Moat Lily Bed** (dressing: pale lilies on long stems up toward the light), a **Bridge-Chain Swag** (dressing:
old chain hung across the room, never the worn last link, which stays on the bridge).

| water | its room's theme (its drowned works) |
|---|---|
| 2. Sporewood Pools | the glowcap garden and its pots |
| 3. Glasswater Vault | crystal shelves and prisms |
| 4. The Pallid Deep | the chain garden and pale stones (no statues) |
| 5. The Rime Sound | kelp and ice-rock; the widest room, for the Long Winter |
| 6. The Thin Water | weir stones over pale sand |
| 7. The Last Light | lighthouse rocks and wreck timbers |
| 8. Pyrefall Gorge | the temple's steps and coin-strewn gravel |
| 9. The Waxen Reef | coral |
| 10. The Thunder Stair | lock stones and foam pools |
| 11. Rushlight Fen | papyrus and the dam's foot |
| 12. The Salt Gate | hull ribs on the slipway |
| 13. Lampmoss Slough | the lock gate and waterweed |
| 14. The Siltway | a sunk barge and the floating meadow's roots |
| 15. Lanternroot Lagoon | mangrove roots and paper lanterns |
| 16. The Inkwood | orchard roots and lantern-gourds |

Each dressing has its authored place in its room (no placing screen: the room is designed with it). The sim re-runs the full
pacing with the well pieces in the draw when the Well ships (`FINDS.md` §11).

---

## 10. The camera: a swimming eye, no Wick

| | |
|---|---|
| **movement** | first person, with gentle inertia: cruise 1.6 m/s, held 3.2 m/s, eased in and out (about 2 m/s²); turns eased; no roll; the pitch held within ±70°; a slow bob when still (off with reduced motion) |
| **swim where you look** | forward moves along the view, so looking down and swimming takes you down; no separate up and down needed on a phone |
| **collision** | a 0.6 m sphere against each room's colliders (the floor, the walls, its rocks as circles); it slides along, never stops dead, never passes through anything; the surface is a ceiling except at the hatch's light, which takes you home |
| **the fish around you** | they part around the camera (2 m), as a school parts round a diver; nothing ever bumps it |
| **follow** | tap a fish to follow it: the camera trails about 2.5 m behind and a little above, matching its turns gently; its name and **its own weight** (the size you caught it at) show small at the bottom ("Reedjaw Pike · 4 lb 6 oz", the Journal's words and `data.fmtWeight`); tap again, drag or swim to stop. A followed giant or legend shows its ★ |
| **reduced motion** | slower turns, no bob, follow by cuts between still views instead of a trailing glide, the dips held at once |

---

## 11. Controls

| | desktop | phone (one thumb) |
|---|---|---|
| look | drag with the mouse held; or the arrow keys | drag anywhere |
| swim forward | W or ↑ (held) | **press and hold** (0.25 s without moving) to swim forward where you look; moving the held thumb steers; release to coast to a stop |
| swim back, sideways | S, A, D | — (turn and swim) |
| up, down | Space, C | — (look up or down and swim) |
| follow a fish | click it | tap it |
| leave | **Back**, Escape, or swim into the hatch's light | **Back** (top left), or swim into the hatch's light |

Every target ≥ 44 px; the Back word ≥ 16 px; nothing else on screen but the followed fish's line. Keyboard alone can do
everything (arrows to look, W/S to swim, Enter on a focused fish to follow, Escape to leave). A gamepad is not planned. The
choosing is all on the card (§7); the Well itself only shows.

---

## 12. The economy, and the sim requirement

**You sell what you keep** (SPEC §4) stays true: a placed fish is not kept, it is given to the Well, and its sale is the price.

**The sale given up per eligible fish** (*est.*; the mean eligible fish kept, its value, and that value in the pacing
player's minutes of income at that water):

| water | eligible fish an evening | their share of its clams | the mean eligible fish | in minutes of income |
|---|---|---|---|---|
| 1. The Mossmere | 1.4 | 64% | 145 | 2.2 |
| 2. Sporewood Pools | 1.7 | 68% | 237 | 2.2 |
| 3. Glasswater Vault | 2.4 | 79% | 448 | 2.1 |
| 4. The Pallid Deep | 2.4 | 72% | 712 | 1.9 |
| 5. The Rime Sound | 2.5 | 70% | 924 | 1.7 |
| 8. Pyrefall Gorge | 2.4 | 82% | 2,158 | 2.0 |
| 12. The Salt Gate | 2.8 | 80% | 8,681 | 1.8 |
| 16. The Inkwood | 2.2 | 66% | 33,709 | 2.0 |

Every water's mean eligible fish is **about 2 minutes of income (1.7–2.2)**, a third to a half of an evening's clams, the same
at every water because a water's prices scale with it. A giant is dearer: a Keeper giant about 2 minutes, a Trophy giant about
14 at its water (the Mossmere's Trophy Thousandcast Pike, 944, against an evening of about 276). A **legend's first landing**
is the dearest placing there is: her crown's price, 4–35 minutes each, **about 6.2 hours for all sixteen**, because her first
landing pays back her crown map (SPEC §4.6); a later landing gives up 40% of that.

**Expected placements** (*est.*):

| player | what they do | placements | the sales given up | the road's end |
|---|---|---|---|---|
| **the pacing player** (SPEC §4.9) | buys no tank, places nothing | 0 | 0 | **47.6 h**, unchanged: the proof of the shelf |
| **a casual keeper** | places when the Well has room and the fish is a giant or the first of its kind there, buys a tank only when one is cheap against an evening; never swaps; never a legend's first landing | about 40–60 | about 1.5–2 h | about 49–50 h |
| **the Well-keeper** (the sim's gate) | buys each tank as soon as it is on the shelf, after that era's lake map; places the first landing of every rare species, giant and legend while there is room (a legend at her first landing); when full, swaps the smallest of a species for one of it a class bigger, else places nothing | about 115 (about 90 firsts, 25 swaps; 16 of them legends) | about 3.3 h for the fish, 6.2 h for the legends, 1.1 h for the tanks | **about 58 h**, inside the long game's 40–60 h |

**Placing never makes the shelf unreachable**, by four rules the build tests and one gate the sim proves:

1. **Keep is always there.** The card offers Keep whenever a slot is free; Aquarium never dims it or moves it from first; no
   default ever places.
2. **The Well is bounded.** At most 96 fish can be in it; once full, every further placing is a swap the player chose, and a
   swap pays nothing either way, so it never costs more than the one sale.
3. **Nothing needs the Well.** No shelf item, gear key, list, order or map asks for a fish in the Well, and no tank is among
   the 144 or a gear key, so an unbought tank or an empty Well holds nothing shut. A placed fish counts for the lists (§6).
4. **Clams only go out by choice**: the Well takes no fee, no upkeep and no bait; its tanks are bought once.
5. **The gate** (the balancing job, which owns `tools/sim/clams.mjs`; this design edits no tool): `clams.mjs --well` adds
   `LOOP.well` (the eligibility rule; the tanks' places, prices and shelf gates) and the **Well-keeper** policy above to the
   pacing run. **Gates**: the pacing run without the Well byte-identical (144 purchases, 47.6 h, every §4.9 mark); the
   Well-keeper buys all 144 and all eight tanks **within 60 h** (the long game's target's top), its **longest wait for one
   purchase ≤ 90 min**, every lake map still bought, and "a new water is the best water from the day its map is bought" still
   holding; `--shipped=mossmere` unchanged (M1 has no Well); `--wicks` with the Well-keeper within ±10% of its own five-Wick
   mean. **Reports**, per water: eligible fish an evening, their share of clams, the mean sale given up per placement (clams
   and minutes of income), the Well-keeper's placements and swaps, and its hours given up to the fish, the legends and the
   tanks. **Knobs**, in order: the tanks' prices (−50% saves about half an hour), the top two tanks' shelf gates later by one
   water; never the eligibility rule or the sale given up, which are the user's and the lead's.

---

## 13. Art and performance budget

The Well is a separate, small scene built on entry; the lake is not drawn while you are in it. It must hold the game's phone
line (p95 ≤ 33 ms on the real phones of `M1.md` §2.12) with room to spare.

| | high | medium | **low** |
|---|---|---|---|
| draw calls, the whole frame | ≤ 120 | ≤ 80 | ≤ 50 |
| fish drawn at once (individuals) | 24 | 16 | 8 |
| small life drawn (instanced, one call each kind) | 4 kinds | 3 | 2 |
| triangles, the whole frame | ≤ 250k | ≤ 160k | ≤ 80k |
| rooms live | the current one and its two neighbours | the current one and one neighbour | the current one |
| caustics on the floor (one texture in the floor's material) | on | on | off |
| light shafts from the hatch (one additive mesh) | on | on | off |
| motes and bubbles (one points call each) | on | on | motes only |
| render scale | 1.0 | 1.0 | 0.75 |
| shadows, mirror pass | none | none | none |
| PointLights | none (emissive and the hemisphere light only) | none | none |

- **Fish**: each ≤ 2 calls (the body and its fin cards); only the nearest fish up to the tier's count are drawn, the rest of
  the live rooms' fish swim in as you near them (a fade, never a pop). A full Well is 96 fish; a room may hold all of them if
  the player chose so, so the tier's count, not the room, sets the cost.
- **Rooms**: each merged by material, ≤ 10 calls, kit pieces from the lake kits (`world-art.js`) and the finds' props
  (`models-finds.js`), culled by room; the tanks' pieces in the home pool (§8) merged into the pool's ≤ 10.
- **CPU**: the fish's steering (wander, avoid the camera, keep the band) ≤ 2.0 ms a frame for 96 fish on a mid phone, the
  fish not drawn stepped at a quarter rate; the camera's collision ≤ 0.2 ms.
- **Memory and loading**: the scene built ≤ 0.6 s on a mid phone (under the dip) and disposed on exit; the heap, geometries
  and textures flat within 10% over 20 dives (`--mobile`).
- **Measured by** `clarity-perf --well` (a new mode: the home pool at 96 places, the Mossmere room holding 40 placed fish, and
  a late room at its tier's counts), never by a wall-clock frame time on the shared software-GL machines.

---

## 14. Sound

An underwater bed: home's bed low-passed (the stove's crackle and Murk's hand bell far above through the hull, the water
against the keel), a soft deep hum, bubbles rising, the hull's slow creak. Each room its water's motif, muffled and slow (the
Mossmere's far bell, Glasswater's crystal ring, the Fen's reed whisper, the Inkwood's frog chorus heard as through a wall);
a **sound** fitting wakes it fully. Fish are silent but for a soft swish when one passes close; a legend's own breath (the
Banked Fire's slow warm pulse) when she is near. In: a muffled plunge; out: a breath at the surface and home's bed coming
back. At the tally, a placed fish going down the hatch: a soft splash under the glass. Inside the −1.0 dBFS master;
`audio-render --set=well` renders the bed and one room for its gate.

---

## 15. What it needs from the fish models

The built plans (`models-fish.js`, the plans `models-fish` adds with each slice) swim there. They were made to be seen from
above on the water and from the side in the show; the Well sees them from everywhere, so the fish lane owes it:

1. **A free-swim mode** outside fishing: cruise, turn, hover, a short burst, driven by the Well's steering through the
   existing bend shader's uniforms (`uSwim`, its phase), with no line, hook, struggle or flop and no dependence on the
   fishing actor.
2. **Honest scale** from `createFish({z})` (built, A1), so each placed fish is exactly the size it was caught at.
3. **Every side holds up**: the belly, the underside of the fins, the mouth seen head-on and the tail from behind, at the
   camera's closest (about 1 m); a check frame per plan from six sides.
4. **Instancing for the small life** (snails, shrimp motes): one call a kind. Fish are individuals, each its own size.
5. **A cheap far version**: beyond about 15 m the fin cards fold into the body (one call) and the bend runs on fewer
   segments.
6. **Swim data per species**, derived by the roster converter (`src/roster-species.js`): `swim: {band, speed}` from its
   `haunt` (its depth band) and its `play` (a sulker slow and low, a darter quick, a steady fish steady); legends and giants
   keep their authored models and get a slow cruise.
7. **Turning without clipping**: at the free-swim mode's tightest turn no plan's fins or barbels pass through its body (a
   pose test per plan, the way the show's poses are tested).
8. **Clean disposal**: every geometry, material and texture a Well fish makes is freed on exit (the memory line, §13).
9. **The plans that come after M1** (catfish's later fish, bream, disc, tuna, snakehead, gar, cod, flatfish, jack, shark,
   billfish, dogtooth, sawfish and the curiosities' squid, softshell and salamander) each pass 3 and 7 before their fish
   swim in the Well; until then such a fish may be placed and waits in the home pool's tanks, drawn as its ink glyph on a
   slate, and swims in its room once its plan passes (`SPEC.md` §13's rule 2, applied to the Well).

---

## 16. The build (after M1)

| | |
|---|---|
| **size** | L (a new scene, its controls, the fish's free swim, the rooms of the waters shipped, the card's third choice and the swap, the tanks, the finds' well pieces) |
| **needs** | M1 done; the waters it opens with shipped (their fish on their plans); `FINDS.md`'s step 5c (the finds engine) |
| **save** | `meta.loop.well = {tanks: 0–8, fish: [{id, species, water, len, z, cls, evening}]}` (the tanks bought; each placed fish by its length, never a weight, as SPEC's pounds rule D5 keeps it); the trip's `run.toWell: [...]`, restored by Continue and written into `well.fish` by `endTrip()` in the sale's one save; places counted are `well.fish` plus `run.toWell`. `migrateLoop`: a block without `well` gains `{tanks: 0, fish: []}`. The boot rule with the flag off places a saved trip's basket into `well.fish` as it sells the hold |
| **modules** | `src/aquarium.js` (new: the scene, the rooms, the road, the fish's steering, the tanks' pieces) · `src/aquarium-swim.js` (new: the camera and its controls) · `progression-loop.js` (`eligibleForWell`, `placeInWell`, `swapInWell`, the tanks as shelf items outside the 144, `endTrip()`'s basket) · `ui-loop.js` (the card's **Aquarium** and its count, the swap sheet, the hatch's target, **Back**, the follow line, the tally's hatch rows, the shelf's Well heading) · `models-fish.js` (free swim, the far version) · `models-finds.js` (the well pieces) · `actors-home.js` (the hatch; the basket on the raft's stern line) · `main.js` (the flow `well`, in and out) · `render.js` (the scene switch, the underwater grade) · `audio.js` (§14) · `data.js` (`LOOP.well`: the eligibility rule, the tanks' places, prices and gates, rooms per water, budgets per tier, the well pieces in `LOOP.finds`) · `src/roster-species.js` (the swim data) · `tools/validate-data.mjs` (every water's room and its four pieces; every room fits its largest fish ×6; the tanks' places rising, their prices rising, each gate a lake map in road order, none in the 144) · `tests/clarity-perf.scenario.mjs` (`--well`) · `tests/well.scenario.mjs` (new) |
| **tests** | eligibility: a rare, a giant, a legend and a Trophy common offer **Aquarium**; a Prize common, a find and any card before the Well's build or in the tutorial do not, and the card then is the built two buttons · placing: no clams, no slot, the bite spent, no favour, an order unfilled, no Old Ledger or firsts bonus; the records, the gold frame, the legend's stone and the list's count written exactly as for a fish sold · with a full hold **Keep** dimmed and **Aquarium** live · the count on the button · a full Well opens the swap; the swap takes two steps; the released fish pays nothing; **Back** changes nothing · the tally lets the basket down the hatch and its total is the sale alone · Continue restores the basket; the flag-off boot places it · the Well's fish are exactly `well.fish`, each in its water's room at its own weight; none unplaced drawn · the tanks: in order, on the shelf with their maps, outside the 144, never named by the goal line, the places 4 → 96 · the hatch is a target only at home, never on a trip, in the opening or under a card · in and out through one dip each, no frozen frame · the camera never leaves a room's shell and never stops dead on a wall · the phone hold-to-swim, drag-to-look and tap-to-follow; keyboard alone, on the card, the swap and in the Well · each fitting changes its room (a before-and-after pair each) · §13's budgets per tier by `clarity-perf --well` · memory flat over 20 dives · reduced motion · the flag-off build and the v3 scenarios unchanged |
| **the user's look** | a card with **Aquarium** on desktop and a phone, a swap, and a dive from the hatch into the Mossmere room to the placed fish and out, before the merge |

---

## 17. Risks, and the knobs

| risk | guard, and the knob |
|---|---|
| **Placing costs too much of the road** (a legend's first landing, a swap habit) | Keep shown beside Aquarium with its price; the Well bounded at 96; the Well-keeper gated at ≤ 60 h and ≤ 90 min a wait (§12); knobs: the tanks' prices, the top tanks' gates; SPEC §16 question 25 (a legend's first landing) |
| **A swap by mistake** | two steps (pick, then **Swap**), the new fish at the sheet's top, **Back** changes nothing |
| **A third button crowds the card on a phone** | Keep full width on its own row, the other two half width beneath, all ≥ 48 px; the button shown only for an eligible fish (about 2 of an evening's 6–8 fish) |
| **Phones cannot hold a free 3D scene beside the game** | its own small scene, the lake not drawn, tiers with a low line of 50 calls and 8 fish; knobs in order: the fish count per tier, the small life, the caustics and shafts, the render scale |
| **The camera makes people seasick** | no roll, eased turns, a pitch limit, swim-where-you-look, reduced motion's cuts; knob: the turn and speed eases |
| **It feels empty early** (4 places, the Mossmere's 6 eligible species) | each room's dressing, small life and finds, the tanks visible in the home pool, the road visibly going on to waters to come (the dark past the last room); Slatted Pens at 400, on the shelf from the start |
| **The fish models break up close** | §15's checks 3 and 7 per plan before a species swims there; a fish on a plan not yet passed waits on its slate in the home pool |
| **Words creep in** | **Aquarium**, its count, "Well's full.", **Swap**, **Back**, the tanks' one line, a room's name once, and the followed fish's name and weight; nothing else |

---

## 18. Questions for the user

SPEC §16: **question 22 is answered** (the user's words in §0; this revision); question 23 (when it is built) stands on its
default; **question 25** is new:

25. **May a legend be placed at her first landing?** Her first landing pays back her crown map's price (SPEC §4.6), so placing
    her then gives up 4–35 minutes of income each, about 6 hours for all sixteen. **Default: yes, she may be placed at any
    landing**, with **Keep** showing her price beside **Aquarium**, as the lead's rule has it (placing gives up that fish's
    sale), and the Well-keeper's gate counts it. The other way: **Aquarium** is offered for a legend only once she has been
    sold once, so the Well costs a legend 40% of her crown, never all of it.

---

## 19. Review log

| revision | what changed, and why |
|---|---|
| 1 (15 November 2026) | written for the user's words of 15 November 2026 (§0's first): the Well under the Slow Hearth, a swimming camera, one room per water, every landed species drawn from the Journal, its fittings and dressings found; built after M1 |
| 2 (15 November 2026) | **the user's second words** (§0), with the lead's defaults; a small docs job, one writer, no reviewer. Who lives there: only eligible fish you place (a rare species, a giant or the legend, or any fish at Trophy or bigger), reversing revision 1's Journal default (SPEC §16 question 22 answered, decision 66). The card's third choice **Aquarium**, its words and layout on desktop and phone, the sale and the sale-only extras given up, the records kept (§7, decision 67). The swap, two steps, nothing paid back (§7.3, decision 68). The tanks: 4 → 8 → 12 → 18 → 24 → 36 → 48 → 64 → 96 places, 400 to 100,000 clams, 160,000 in all, each about one and a half evenings at its map's water, **outside** the 144 so the 47.6 h proof stands (§8, decision 69). The economy: about 2 minutes of income given up per eligible fish, the Well-keeper's gate at ≤ 60 h, four rules that keep the shelf reachable (§12, decision 70). The rooms keep the finds' dressing; the commons' schools go (no fish but the placed ones), the life fitting grows small unnamed life instead (§9). The save gains `meta.loop.well`; the budget is re-set for 96 fish (§13, §16). One new question (§18, SPEC §16 question 25) |
