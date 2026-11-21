# The Slow Hearth inside: aboard in first person, and the stern line (binding design, revision 2)

*Written 16 November 2026 for after tonight's MVP merge, from the user's words after an hour's play-test of the published
preview. Revision 2 applies the two reviews of revision 1 (Appendix B lists every finding and what was done). Binding with
`SPEC.md` v8.7 (amended here to v8.9: §0 row 39, §0.15, decisions 111–122, §3.3, §3.4, §6.1–§6.3, §6.6 new, §8.2, §8.3,
§9, §13 step 5d, §16 questions 17 and 44–47), `M1.md` revision 8 (revision 10 here, revision 9 being the sheet's: the header,
§0, §1, §2.6, §2.8, §2.10, §2.11, §2.14, §4 step 5d, §8 question 5), `WATERCRAFT.md` revision 2 (read, not changed),
`OPENING.md` revision 5 (§6.2 and §9, one line each) and `CONTRACT.md` (§14.20, new). Its sibling is `SHEET.md`, the gear and
character sheet asked for in the same message, designed beside this on `gw-design-sheet` (550c5c5). That design owns the
sheet's screen; this one gives it a home aboard: the ledger on the Wick's desk and the rod rack by the door (§4.3). Design
only: no `src/` or `tools/` file is changed. The base is `gw-m1-mvp` at c34557d (3cb9539, with WC-1–3 and the float's
teaching captions merged, plus the Chart art's CSP fix). Figures marked *measured* come from scratch probes run read-only
against that tree: the world's layout, `data.loopMooring`, `watercraft.areaAt`, `home-targets.js`'s own `project`,
`rectOf`, `layoutTargets` and `frameCheck` through the poses below, and `clarity-perf --home` on the published preview build
(Appendix A). *est.* marks a hand estimate.*

*At the user's answers (17 November 2026), amended in place on step 5d's integration branch `gw-inside` with the seed. The user
answered §12's four questions: 44 **"Let go, known fish"** (the default); 45 **"A person's"** eye, about 1.5 m, not the Wick's
0.78 m; 46 **"Only when I tap the barge"**, not at once after the tally; 47 **"Morning rises on the bench"**. §0's second table
lists every section they change. The figures a person's eye moves are measured again on the built barge at abe394b (the cabin's
real ceiling, the awning, the door's lintel, every eye, every frame: Appendix A.2), and the seed's `src/aboard-layout.js` holds
them; its node test re-measures them against the built mesh on every run.*

## 0. The user's words, and what each becomes

> "Also I want to be able to be inside my barge. We dont need to be able to physically move around inside it, but I want
> atleast interiors of our barge where we can see our home, Interact with aspects of it and move to different sections of
> our barge. There should also be a balcony area or viewing area at the rear where we can stand and fish and also just look
> out at the scenery if we want. All of this should be from a first person perspective." (16 November 2026)

| the user | what it becomes | where |
|---|---|---|
| "be inside my barge" | **Aboard.** Home stays the view from the water after the tally; a tap on the barge itself takes you aboard the Slow Hearth by one ink dip, in first person, and Back at the Deck (or Escape) steps you off again (question 46) | §2 |
| "We dont need to be able to physically move around inside it" | **Seven places and no walking.** The eye glides between fixed viewpoints, and you drag to look within each one. The walked barge stays parked | §3 |
| "interiors of our barge where we can see our home" | **The cabin, built inside**: the stove with Murk's banked fire, taller than you; the Wick's bunk with the four other Wicks dozing in a basket at its foot; the desk and its ledger; the Long Wall's prints at true size on the port wall; the beams; windows that look out | §3.1, §6 |
| "Interact with aspects of it" | **Things you touch.** Each built screen opens from its object: the Chart, the Journal, Murk's shelf and catalogue, and the sheet. You can lean in to each print. Small pleasures change nothing: the stove door, the kettle, a Wick stirring, lying on the bunk, the window, the moss, the bell | §4 |
| "move to different sections of our barge" | **Tap a doorway or a mark**: the door, the rungs to the roof, an edge mark with its place's glyph, Turn and Back. Keys work too | §3.3 |
| "a balcony area or viewing area at the rear" | **The stern gallery, new**: a railed porch over the rudder, with a low bench across its forward edge facing the lake and a holder for the rod | §5.1 |
| "where we can stand and fish" | **The stern line.** At the gallery's rail, tap the water to cast; drag anywhere to look. Fish with the rod you own, in first person. Let go only, three good bites a dawn | §5.3–§5.7 |
| "and also just look out at the scenery" | **The Bench.** Sit facing astern and look round freely: the Sluice Veil's falls dead ahead, Root Isle and the lily bed either side, your raft's lantern over the gallery's rail, the awning's edge overhead. The marks fade away while you sit, and **the morning comes up slowly** until you get up (question 47) | §5.2 |
| "All of this should be from a first person perspective" | **A person's eye everywhere aboard** (question 45), about 1.5 m over what you stand on, including the cast, the play and the catch (the fish shown in your hands, at a person's scale). Third person stays on the water and on home's view from the water | §2.3, §3.0, §5.6 |
| (the same message) "a master character sheet or stats page" | The sheet's screen is `SHEET.md`'s. Its home aboard is the ledger on the Wick's desk, and the rod rack by the cabin door opens it at Tackle (`SHEET.md` §2.3's seam) | §4.3 |

**Rulings this reverses** (each amended in place, §11):
- M1 §8 question 5 and SPEC §16 question 17. Their default was "no cast at home"; the user's words reverse it.
- M1 §2.6's box "No cast at home".
- `loop-5a.scenario.mjs`'s "no cast at home" check.
- SPEC §6.1's "a press anywhere else at home does nothing, and never casts".

**What the user's answers change** (17 November 2026, §12; every section named is amended in place):

| question | the user's answer | what it changes | where |
|---|---|---|---|
| 44, fish off the stern | **"Let go, known fish"** (the default) | Nothing: only fish already landed on a trip bite at the stern; their best, class seals and print are written; nothing is paid; three good bites a dawn | §5.3, §5.7, §12 |
| 45, whose eye | **"A person's"**, about 1.5 m, not the Wick's 0.78 m | Every place's eye and look re-derived at a person's eye, measured against the cabin's real ceiling (the roof's underside, 1.79–1.85 m over the floor), the awning (1.49–1.82 m over the deck) and the door's 1.48 m (its lintel's underside 1.89 m): **1.50 m standing** at the Hearth, the Long Wall, the Rail, the Balcony and the Roof; **the Deck 1.38 m**, the highest that clears the awning's sag by 0.15 m where one frame still holds the chart table, the rod rack and the door; **the Bench seated**, 1.25 m over the gallery's boards; **the door's glide stoops** to 1.30 m. The barge and its furniture stay people-sized, so it reads cosier and smaller; the stern gallery's rail and bench are made people-sized; the hands and the rod are drawn at a person's scale. The barge's outside silhouette is unchanged | §1, §3.0–§3.5, §4.4, §5.1, §5.2, §5.4, §5.6, §6.5, §6.6, §8.3, §10, §13, Appendix A.2 |
| 46, after the tally | **"Only when I tap the barge"** | The view from the water stays home's view: the arrival after the tally and where Continue lands, its targets as built. A new wordless home target over the barge's lit windows steps aboard by the ink dip; Back at the Deck and Escape there step off to the view from the water; Sail from inside dips out to the trip as designed. The tutorial is never aboard; the first time aboard is the first tap | §1, §2.1–§2.6, §3.3, §4.2, §9.0, §9.2, §9.6, §10, §13 |
| 47, the sky at home | **"Morning rises on the bench"** | While you sit on the Bench the morning comes up slowly (the mist thinning, the light warming) and goes back to first light when you get up; no clock moves. It moves from §9.7's later list into lane I-1 (the world's morning), driven by lane I-2's bench state | §5.2, §7, §8.2, §9.1, §9.2, §9.5, §9.7, §10 |

## 1. The design on one page

- **Aboard is the home flow's inside.**
  - The flow stays `home` and the scene is the same water scene, so nothing loads.
  - The sail home, its glide and the tally over the mooring's framing are as built, and so is what follows **Sold**: home's view from the water, with its targets (question 46).
  - **A tap on the barge** (a new wordless target over its lit windows) puts you aboard on the stern deck by a 0.6 s ink dip, in first person.
  - Back at the Deck, or Escape, dips you back out to the view from the water. Sail from the Chart dips you out to the mooring's framing, and the glide out runs as built.
- **A person's eye in a people's barge** (question 45).
  - The barge was built by people, to their size, and the eye is a person's: 1.5 m over what you stand on (*measured* against its ceiling, its awning and its door; Appendix A.2).
  - So it reads cosy and small: the cabin's ceiling a hand's breadth over your head, the door bowing you through, the stove's glow at your knee and its kettle at your hip, the chart table and the desk at your waist.
  - The awning's sag holds the Deck's eye at 1.38 m (your head just under the canvas), and the Bench is sat on.
- **Seven places**:
  - the Deck, the hub under the awning;
  - the Hearth and the Long Wall, in the cabin;
  - the Rail, with Murk alongside;
  - the Balcony, fishing at the gallery's rail;
  - the Bench, sitting and looking while the morning comes up;
  - the Roof, with the Bait Bed.

  Glides between them take 0.8–1.3 s with the look leading; under reduced motion each is an ink dip. Within a place you drag to look inside a cone, and at the Long Wall the eye slides along the wall.
- **Things you touch** are DOM buttons over their objects, as the Jetty's are: the Jetty's own tile elements, moved by the director, plus new wordless ones.
  - Each is at least 44 px, and no two overlap at any of four screen sizes (*measured*).
  - Murk, Chart and Journal keep their built ids and words.
  - They are signalled by light, lift and flicker, never a ring, an outline or a rim.
  - A tap leans the eye in (a close look) and then opens the built screen over it.
- **The stern line.** At the Balcony you tap the water to cast; a drag anywhere looks.
  - The float, the bite, the strike tap and the automatic play are fishing's own, from a new origin, in an explicit fishing mode `'stern'`.
  - The catch is shown in your hands or on the boards. Its card's one button is **Let go**, and a tap anywhere on it lets go too.
  - **It revisits, never discovers**: only fish already landed on a trip bite there. It writes their bests, class seals and prints, and never a first landing or the list's tick.
  - It pays nothing: no clam, no slot, no hold, no evening, no Memories.
  - Three good bites a dawn, then quiet water's rule.
  - While the float waits, you can look out freely and leave; leaving reels in.
- **One barge, inside and out.**
  - The interior is merged into the barge's own meshes; nothing swaps in.
  - Its light is baked into the vertices, with no PointLight.
  - The barge stays at ≤ 6 main-pass, 2 mirror and 2 shadow calls. Each place's frame is ≤ 150 calls on low and no slower than the arrival shot on a phone.
  - The Wick's own model is hidden aboard.
- **It is built as M1 step 5d**, after tonight's merge and after the sheet's lane, before the polish pass: one seed commit, then four lanes (§9): the scene; the eye; the stern line; what you touch.

## 2. The way in and the way out (A)

*Amended at the user's answer to question 46 (17 November 2026): "Only when I tap the barge".*

### 2.1 Coming home from a trip, and going aboard

| beat | what you see | camera | time |
|---|---|---|---|
| the sail home | As built: the 2 s glide to the stern. The raft ties at the Jetty, off the transom | `'sail'`, then `'home'` (the mooring's framing, a 1.2 s ease) | 2 s |
| the tally | As built, over the mooring's framing at first light: **the view from the water**, home seen from the lake with every light and look you have bought | `'home'` | the tally's own |
| **Sold** | As built: the view from the water stays, with its targets (Murk, Chart, Journal, the rod rack, and from wing I the cabin's doorway) and **one more: the barge** | `'home'` | — |
| **a tap on the barge** | One ink dip: 0.25 s to the violet ink, then the swap, held until the first frame aboard is drawn, then 0.35 s back. You are aboard at **the Deck**, at the gallery's step, looking forward across the chart table to the rod rack and the open door with the stove's glow inside | `'aboard'` | 0.6 s |

- **The barge target** (`[data-tile=barge]`, new; §4.2) is a wordless DOM button over the cabin's lit starboard windows (barge-local x 1.10…1.45, y 1.05…2.30, z −3.20…0.50), laid out with the Jetty's others by `home-targets.js` (`TARGET_ORDER`'s last, `TARGET_BOXES.barge`) under int-C's word rules (the built words keep 16 px from each other, from the Wick and from every button).
  - *Measured* at all fifteen of the validator's sizes (358 × 664 to 1920 × 1080, 844 × 390): no raw overlap with Murk, the chart table, the lectern, the rack or the doorway, and the laid-out buttons and words pass at every size (Appendix A.2). Of seven boxes tried, only it and the roof's forward half passed everywhere; the windows are the barge's own light.
  - Its accessible name is "Go aboard" (`TEXT_LOOP.aboard.barge`, never drawn). No word is added on screen.
  - It is shown only once the tutorial is done, and hidden while aboard.
- **Its signal** is the barge's own light, never a ring or an outline: on hover or touch-down the starboard windows brighten 15% for 0.4 s, and until you have been aboard once (`meta.loop.stern.boarded`, §10) they glint once a visit after 9 s with no input on the view from the water.
- Under the dip the Wick's own model, its rod and its flame hide, and stay hidden while aboard (you are the one looking). They show again under every dip out.
- Under the dip the raft turns on its rope to lie with its pole on its far side (§5.1), and it turns back under the dip out.
- The raft stays tied below the stern with its lantern lit, the one warm light on the water, as built.
- A tap during the dip is held and does nothing. The dip never strands you: a reload during it lands on the view from the water (§2.4).

### 2.2 Leaving: Back, and Sail

- **Back at the Deck** (the hooked arrow at the bottom centre, §3.3), or **Escape** there, dips you out (0.6 s) to the view from the water, with its targets. On the view from the water Escape opens the home pause, as built.
- **Sail** is pressed on the Chart, opened aboard from the chart table (§4.2) or from its target on the view from the water, as built.
  - From aboard, the Chart closes and **the dip out** (0.6 s) puts the camera back on the mooring's framing, with the Wick on the raft. The glide out then runs as built: the home pose eases out over the glide's first 0.6 s (`render.js`).
  - A tow (a new water's first Sail, after M1) and the way back by the lamps start from that same framing, as they do today.
- No way out of the home flow leaves the Wick hidden: `aboard:leave` shows it again on every exit (Back, Sail, the title, a tow).

### 2.3 Today's third-person home view: what stays

- **It stays home's view** (question 46): the arrival after the tally, where Continue lands, and where Back from the Deck steps off to.
  - Its targets are as built: Murk opens his shelf, Chart the Chart, Journal the Journal, the rod rack the sheet, and the cabin's doorway (wing I) the gallery. When I-4 lands the Long Wall, the doorway dips aboard to the Long Wall instead and the 2D gallery leaves home (§4.2). The barge target is the one thing added.
  - The 5b before-and-after pairs of every purchase are still taken there.
  - The new stern gallery and its bench join that frame, people-sized (§5.1). *Measured* at 1280 × 720, 690 × 760 and 390 × 844: the bench's back stays below the chart table's top, and the gallery's forward port post rises at the table's port end, so the tutorial's chart target is not covered (Appendix A.2). I-1 retakes the 5b pairs.
  - **The lectern stays where it is built** (1.25, 3.00), on the deck's starboard side. *Measured*: moved to the port side, its target box overlaps the chart table's at all eight validator sizes and the sheet's rack at the four phone sizes, so `frameCheck` would fail.
- **It stays for the tutorial**, unchanged: the opening's glide in and the chart beat over the moored barge, before the first Sail, keep the chart table's target (`[data-tile=chart]`) and its breathe. The barge target is not shown until the tutorial is done.
- **Its DOM targets are the aboard targets.** Aboard, the director takes the Jetty's own tile elements (`[data-tile=murk|chart|journal|wall]`, and the sheet's `rack`) and places each over its object at its own place, through a projector hook in `placeTargets` (§9.5); the barge target hides while aboard. No element is duplicated, so every selector still matches one element.
- **When the aboard view cannot start** (no mooring, or the director refuses), a tap on the barge only reports the error: you stay on the view from the water, never stranded.
- **The one rod.**
  - In third person (the view from the water, the tutorial) the Wick holds its rod on the raft and the rack shows the rod you own, as 5b built them. The gallery's holder is always empty in third person.
  - Aboard the Wick is hidden and the rod is drawn once: on the rack's top peg, in your hands at the Balcony, or in its holder at the Bench. The rack's top peg is empty while the rod is in your hands or in the holder.

### 2.4 Continue and reload

Continue at home always lands on **the view from the water** (question 46), as it does today. Where you were aboard is not saved.

| at the close | Continue lands |
|---|---|
| home, the tutorial done, nothing open (outside or aboard) | the view from the water, its targets (a cut; no dip from the title) |
| home with the tally unseen | the tally over the view from the water, then **Sold**, as built |
| home mid-dip, mid-glide or in a close look | the view from the water |
| home with a screen open (the Chart, the shelf, the Journal, the sheet) | the view from the water, the screen closed (as the Jetty does today) |
| home at the stern with the float waiting | the view from the water, the line in |
| home at the stern with a bite open or the play running | the view from the water, the line in. The open bite goes back to the dawn's count, as a trip refunds one |
| home with the stern's card open | the view from the water, the fish let go (its records were written at the measure) |
| home before the first Sail (the tutorial) | as built: the chart beat over the barge, in third person |
| on a trip | as built |

- **The count is saved at once.** A good bite is counted when it opens and saved then, and given back only if a reload finds it open. So a reload never refunds a bite that closed (`meta.loop.stern`, §10). There is no autosave at home without a run, so the stern line saves for itself.

### 2.5 The tutorial

Nothing in the tutorial changes.
- **When its beats play**: all of them (the wake at the Landing, the tow, the glide in, the chart beat over the barge, and out) happen before the first Sail, in the views they use today.
- **Its clock** still runs only while the top screen is the Jetty or the Chart (`TUTORIAL_TOPS`).
- **It never sees the aboard view**: the barge target is not shown while `tutorial.done` is false, and the director refuses to start then. So no cue moves, no selector changes, and T65–T72's timings stand.
- **The aboard view is the `jetty` screen's content** once you have tapped the barge, and its modal id stays `jetty`. So `LOOP_MODALS`, the Chart's and the shelf's Escape back to it, and the tests that read `top() === 'jetty'` all keep working.
- **The scenarios that tap a home tile straight after Sold** (seven: `loop-1a`, `loop-4`, `loop-4-look`, `loop-5a`, `loop-5b`, `loop-time`, `watercraft-face`) need no change, since Sold leaves you on the view from the water with those tiles where they are. Lane I-2's walk adds the barge's tap and `debug.aboard.go(place)` for the places.

### 2.6 The first time aboard

The first tap on the barge after the first evening is the player's first step aboard. It has no words:
1. The dip lands at the Deck **looking astern**, over the gallery: the bench and the bollards just ahead, the gallery's rail, your raft's lantern below, the lake and the Sluice Veil's white falls under the dawn.
2. After 2 s the look turns slowly (5 s) round to the Deck's own look: the chart table, the rod rack and the door's warm gap with the stove's glow inside. Then it settles.
3. The stove breathes, and Murk's barge's lamp shows past the cabin's corner.
4. After 9 s with no input, the nearest thing you can touch lifts and glints once (§4.1).
5. **Until you have been to the Balcony once**, the Turn mark is what glints first, once a visit (`meta.loop.stern.seen`, §10).

That is all the teaching it gets. Before that first tap, the barge's windows glint once a visit on the view from the water (§2.1).

## 3. The places aboard (B)

### 3.0 The scale rule: a person's eye in a people's barge

*Amended at the user's answer to question 45 (17 November 2026): "A person's" eye, about 1.5 m, not the Wick's 0.78 m.*

**The barge is people-sized.** The Slow Hearth is a people's barge-house ("a barge family's floating home", `LORE.md` §6), built to their size (*measured* on the built barge, Appendix A.2):
- the cabin's floor is the deck (y 0.42) and its ceiling is the roof's underside, 2.21 m over the water at the walls and 2.27 m amidships: **1.79–1.85 m over the floor**;
- its door is 0.8 × 1.48 m, its lintel's underside 1.89 m over the water (1.47 m over the floor);
- its windows' centres are 1.02 m over the deck and their tops 1.24 m;
- the awning over the stern deck falls from 2.24 m at the cabin to 1.92 m at its aft edge, sagging up to 0.14 m in its middle: **1.49–1.82 m over the deck**;
- its chart table is 0.78 m high and its lectern's desk 1.0 m; **its stove is a people's pot-belly, 1.05 m tall**, the firebox door 0.40–0.74 m over the floor and the kettle on top at 1.05–1.27 m.

**The eye is a person's.** It is 1.50 m over what you stand on, at least 0.15 m from every overhead and every box (§3.2). Where an overhead leaves less, the eye is the highest that clears it, never under 1.35 m, and recorded:
- **five places stand at 1.50 m**: the Hearth, the Long Wall and the Rail (1.92 m over the water), the Balcony (2.10 m, on the gallery's boards) and the Roof (3.87 m, on the cabin roof);
- **the Deck stands at 1.38 m** (1.80 m over the water). The awning's canvas sags to 1.96 m over the deck's aft starboard corner, and that corner is the only place where one frame holds the chart table, the rod rack and the door. *Measured*: forward of z 3.6, where a 1.5 m eye fits under the canvas, those three are 86° apart, wider than the 82° landscape frame (Appendix A.2). You stand there with your head just under the canvas;
- **the Bench is sat on**: a person's seated eye, the seat 0.46 m and the eye 0.79 m over it, so 1.25 m over the gallery's boards (1.43 m over the deck);
- **the door makes you stoop**: through its depth the glide's eye drops to 1.30 m over the floor (y 1.72), 0.17 m under the lintel's underside (§3.3).

**So it reads cosier and smaller.** The ceiling is a hand's breadth over your head, the beams just over it; the door bows you; the stove's banked glow is at your knee and its kettle at your hip; the chart table and the desk are at your waist and you read their tops; the windows sit below your eye, so you look down and out of them; the bunk is low. The people's house is lived in at its own size. The Wicks' adaptations (crates for steps, cushions on the chair, tiny cloaks drying, rungs up the wall) are the clutter that tells you who lives here now (§6.2).

**The hands and the rod are drawn at a person's scale** (§5.4, §5.6, §6.6): the Wick's wax hands in its cloak's cuffs, as large in the frame as a person's. The candle stays: a warm wash at the frame's top edge (§6.6). The camera is the person-sized eye the user chose.

The Wick's eye (0.78 m) was this design's default (§12 question 45, answered).

### 3.1 The layout

Coordinates are barge-local: the bow at −z, the stern at +z, starboard at +x, y up from the waterline, the deck at y 0.42. Looking aft, starboard is on your left. Every box below is in `src/aboard-layout.js` (`BOXES`, the seed's), people-sized: the built ones measured off `actors-home.js` and its mesh, the designed ones I-1's to build at these sizes (question 45: the furniture stays people-sized).

```
              bow (−z)                         the plan from above, the bow up, starboard on the right (not to scale)
   z −6.0     ╭───────────╮  the bell post (the Rust Buoy-Bell, found)
              │  fore deck │
   z −3.5  ┌──┴───────────┴──┐ fore bulkhead: its window; wing I's port half · the dresser (stbd)
           │W│   H (eye)     │
           │I│    [hatch]    │ the wet well's hatch, amidships (the Well's glass, after M1)
     port  │N│               │ starboard ──→ Murk's barge alongside (centre x +4.7, z −2.0)
    (shore)│G│  L (track)  [b│   side deck · the Order Board · rungs up → ROOF · RAIL (x 1.5, z 0.95)
           │ │             [u│
   z +1.2  │▓│stove        [n│ the four Wicks' basket on the bunk's foot (under the starboard aft window)
   z +2.25 └─┴──[door]─(desk)┘ the sill's stones at the door's foot; the rod rack port of it
           │ chart          J│  the lectern with the Journal (as built), under the awning
           │ table    DECK   │  the tiller, lashed along the starboard rail
   z +5.3  ├─step──┬[bench]bol┤  the gallery's step (port half) · the bench for one · the bollards
           │ BALCONY         │  the rod's holder on the aft rail's post (x 0.70)
   z +6.6  └─────────────────┘
                 the raft, tied at the Jetty (z +8.8), its lantern
             astern: Root Isle 23 m, the lily bed 22 m, the Sluice Veil's falls 51 m
```

| thing | where (x, z; y) | size | notes |
|---|---|---|---|
| **the stove** | aft-port corner (−1.00, 1.84), on the hearthstone | 0.44 × 0.44 m, **1.05 m tall** | A people's iron pot-belly on four feet, its firebox door facing forward into the cabin at your knee (y 0.82–1.16). Its pipe rises 0.6 m from its top, then runs aft and up under the roof between the beams (its underside y 2.00) to the built collar (−0.40, 1.70), so the outside does not change; the run clears the door's glide by 0.18 m |
| the kettle | on the stove top (y 1.47–1.69) | 0.2 m | a people's kettle, at your hip |
| the hearthstone | x −1.27…−0.60, z 1.20…2.22 | — | pale stone, ash at the stove's foot |
| the bait shelf | port wall over the wood stack (x −1.27…−1.07, z 1.20…1.60; y 1.25…1.75) | — | the save's bait for this water, drawn as tins and jars (§6.5) |
| the wood stack | under the aft port window (z 0.75…1.20) | up to 0.75 m | split wood |
| **the bunk** | starboard, x 0.50…1.27, z −0.55…0.95 (mattress y 0.87, 0.45 m over the floor) | 1.5 m | The people's box-bed, open under the window, now the Wick's own: a headboard to y 1.30 at its forward end, its pillow there, and two crates at its side for the Wicks' step |
| **the dozing Wicks** | a moss-lined basket on the bunk's foot (x 0.75…1.15, z 0.58…0.92) | 0.4 × 0.35 m | The four Wicks not chosen at New Descent, each by its look (flame, cloak), sleeping with their flames low at first light, in the stove's warm pool (`LORE.md` §5.1). Under the starboard aft window, where the arrival shot already sees their flames (`actors-home.js` 5b), so the outside does not change |
| **the desk** | aft-starboard, under the aft window (x 0.25…1.25, z 1.75…2.20; top y 1.16, at your waist) | — | A people's writing desk. On it are **the ledger** (0.75, 1.17, 1.97), a candle in a dish and an inkpot. The chair before it (0.75, 1.42) is a people's chair (seat 0.46 m), the Wicks' crate and cushions on it |
| the hatch | amidships floor, x −0.35…0.35, z −1.00…−0.40 | — | In M1, the wet well's wooden hatch with an iron ring. After M1, the Well's glass hatch (`AQUARIUM.md`) |
| the dresser | starboard fore corner, x 0.60…1.27, z −3.45…−2.75 | up to 1.5 m (y 1.92) | the people's painted cups, a basket, and a tin candle mould of four cups, one dented |
| **the Long Wall, wing I** | the port wall (z −3.40…0.60) and the port half of the fore bulkhead (x −1.27…0) | two rows, y 0.70…2.04 | the long fish above the windows at your eye, the small between them (§6.5) |
| the beams | across at z −2.95, −1.95, −1.60, −0.40, 0.05, 1.00, 1.90; y 2.08…2.16 | 0.08 × 0.10 m | Resting on the walls' top plates (2.16, *measured*), so a 1.5 m eye passes under each with 0.16 m to spare. The skylight's frame beams are at −1.60 and −0.40. From the hooks hang a candle lantern over the bunk (x 0.80…1.00, z 0.10…0.30, its foot at y 1.86: out of every eye and glide), dried herbs by the stove (z 1.00…1.50) and a line of the Wicks' tiny cloaks drying (port, z 0.30…0.90) |
| the windows | as built: three a side, one fore, one aft by the door | 0.44 m | now openings (§8.1), with inner frames and sills added |
| the door | as built (x −0.70…0.10, 1.48 m; its lintel's underside y 1.89, *measured*) | — | Its leaf, built swung 36° in across the doorway (its free edge at (−0.55, 1.82), *measured*: a person could not pass), is re-hung open flat inside the starboard jamb (x 0.08…0.13, z 1.47…2.25); from outside the gap stays and the silhouette is unchanged. Its inner jamb carries a Wick's notches, one per evening, in fives (§6.2). The barge family's house-mark is painted over it inside (a glyph, never a word) |
| the sill's stones | as built, at the door's foot outside | — | Seen as you pass through the door (§3.3), and drawn on the chart table's sheet (5b's chart top) |
| **the lectern** | **as built** (1.25, 3.00), the deck's starboard side | as built | the Journal open on it |
| the chart table | as built (−1.00, 4.60), its stool at (−0.85, 3.98) | — | |
| the rod rack | as built: the aft wall outside, port of the door (−1.00, 2.32) | — | The rod you own hangs on its top peg, in its tier's colour; the rods it replaced hang on pegs below it (§2.3's one rod) |
| the tiller | **unshipped and lashed** along the starboard rail (x 1.45, z 3.6…4.8) | — | out of every view aft (the barge is towed; it never steers itself) |
| the rungs | iron rungs up the cabin's starboard wall by the side deck (z −0.45…−0.25, between the two forward windows) | to the roof's edge | the way up to the Roof from the Rail, 1.2 m forward of its eye |
| **the stern gallery** | new: z 5.30…6.60, x −1.25…1.25, floor at y 0.60 | §5.1 | people-sized: its rail 0.76 m over its boards, its step on the port half, the bench for one on the starboard half of its forward edge |

### 3.2 The seven places

- **Each place is one authored pose** in barge-local metres, held in `src/aboard-layout.js` (`PLACES`). The Hearth also has its own portrait eye, 1.05 m further forward and 0.46 m to starboard, so a phone held upright holds the stove, the ledger and the dozing Wicks together.
- **It rides the barge.** Each frame the pose is turned to the world through the barge's own `bob` group, so the eye rides the swell: the barge's roll and pitch of ±0.02–0.025 rad, scaled ×0.5 on the eye, and none under reduced motion.
- **Field of view.** Landscape is 52° vertical. Portrait is 66–70°.
- **The cone belongs to the place**, the same in both orientations: portrait only starts at a different look inside it.
- **Every eye is checked** by `tools/tests/aboard-layout.test.mjs` (Appendix A.2): inside its room; ≥ 0.15 m from every box of §3.1 and from the built barge's timber (a closest point on the mesh's triangles); ≥ 0.15 m under the overhead (a ray up through the mesh); 1.50 m over its floor standing, or the highest that clears the overhead and never under 1.35 m.
- **What is *measured*:** where each place's targets fall at 1280 × 720, 1920 × 1080, 390 × 844 and 358 × 664, through `home-targets.js`'s `project`, `rectOf` and `layoutTargets` (`aboardFrameCheck`, which `validate-data --loop` runs). No two target boxes overlap at any of the four, and the laid-out buttons pass at all four, clear of the chrome (the pause glyph, the purse, the bottom band of Turn and Back, and the edge marks' lower thirds).

| place | where you stand | eye (x, y, z) | over the floor | overhead margin (*measured*) | looks at | cone (yaw · pitch) |
|---|---|---|---|---|---|---|
| **Deck** (the hub) | on the stern deck at the gallery's step, starboard, head under the awning | (1.40, 1.80, 4.85) | **1.38 m**, capped by the awning | 0.16 m to the canvas (0.159 on the mesh) | forward-port, yaw 117°, pitch −10° (through (−1.23, 1.28, 3.51)); portrait the chart table (−1.00, 1.15, 4.55), fov 68 | −60…+80° · −30…+20° |
| **Hearth** | on the cabin floor, forward of the hatch, facing aft | (−0.30, 1.92, −2.20); portrait (0.16, 1.92, −3.25) | 1.50 m | 0.34 m to the roof | (−0.10, 1.15, 2.00), aft; portrait (0.20, 1.12, 2.00), fov 70 | ±55° · −35…+25° |
| **Long Wall** | in the aisle, square to the port wall, clear of the bunk | (0.30, 1.92, z), on a track along z −2.90…0.30, resting at −1.10 | 1.50 m | 0.34 m to the roof, 0.16 m under each beam it passes | the wall (−1.27, 1.60, z); portrait fov 70 | the track · ±30° · −25…+25° |
| **Rail** | on the starboard side deck, outboard of the cabin's aft window | (1.52, 1.92, 0.95) | 1.50 m | 0.33 m (the roof's mossy lip over and inboard) | forward-starboard, yaw −157°, pitch −12°; portrait at Murk (4.71, 1.75, −2.02), fov 70 | ±60° · −25…+30° |
| **Balcony** (fishing) | at the gallery's port rail, aft | (−0.85, 2.10, 6.05) | 1.50 m, on the gallery's boards | open sky | dead astern, pitch −10° | ±70° · −35…+15° |
| **Bench** (looking) | sat on the bench for one, facing astern | (0.32, 1.85, 5.74) | **1.25 m, seated** (1.43 m over the deck) | open (the awning's hem 0.25 m forward) | dead astern, pitch −4° | ±80° · −25…+25° |
| **Roof** | on the cabin roof, aft | (0.25, 3.87, 2.05) | 1.50 m, on the roof (2.37) | open sky | forward and down, yaw 177°, pitch −28°; portrait fov 70 | ±150° · −50…+25° |

Each frame reads in three values: a warm pool, a working surface, and a cool exit (§6.1).

| place | the frame (warm · surface · cool exit) | what you can touch | ways on |
|---|---|---|---|
| **Deck** | the stove's glow in the door (right) · the chart table (left) and the rod rack between them · the dawn past the port rail; a drag right finds the Journal on its lectern | Chart, Journal, the door, the rod rack | the door → Hearth · Turn → Balcony · the right edge's lamp → Rail, opening Murk's shelf · Back → off the barge |
| **Hearth** | the stove and its kettle (right, 63%) · the desk and its ledger (38%), the bunk's foot with the four Wicks dozing (30%) · the door's dawn (centre, 53%) | the stove, the kettle, the bunk, the ledger, the door | right mark → Long Wall · Back or the door → Deck |
| **Long Wall** | the prints' candles in a row · the prints' pale paper and their rulers · the port windows' lavender between them | the wall, each print, the port window | left mark → Hearth · Back → Hearth |
| **Rail** | Murk's green lamp (right) · the Order Board (left of centre) and the rungs (left) · the open water past his barge | Murk, the Order Board, the eave's print (once the Matriarch is home), the rungs | the rungs → Roof · Back → Deck |
| **Balcony** | the raft's lantern below-left · the water: Root Isle (left) and the lily bed (right of centre) · the dawn over the Sluice Veil (centre) | the water (cast) | left mark → Bench · Turn → Deck · Back → Deck |
| **Bench** | the raft's lantern over the gallery's rail, a little left · the lake, Root Isle left and the lily bed right · the Veil dead ahead under the awning's edge, the morning rising over it | the rod in its holder | right mark → Balcony · Back → Deck |
| **Roof** | the pipe's ember and smoke · the Bait Bed's moss (green, living) · the whole lake | the moss, the bell (once found) | Back → Rail |

*Measured framing* (centres as a share of the screen across and down; landscape 1280 × 720, portrait 390 × 844; Appendix A.2):

| place | in frame, landscape | in frame, portrait |
|---|---|---|
| Deck | the chart table's top (29%, 66% down), the rack (70%, 31%), the door (84%, 58%). The Journal is 60° right of the look, a drag | the chart table (50%). The rack, the door and the Journal are drags right |
| Hearth | the stove's door (63%, 55% down) with the kettle above it (63%, 40%), the door (53%), the ledger (38%), the bunk's foot and the basket (30%, 63% down) | from its own eye: the stove (86%), the kettle (87%), the door (64%), the ledger (34%), the basket of dozing Wicks (22%) |
| Long Wall | the middle port window (41%), the frames either side | the window (25%) |
| Rail | Murk (80%), the Order Board (33%, 70% down), the rungs (16%) | Murk (55%) |
| Balcony | the Sluice Veil (51%, 30% down), Root Isle (35%), the lily bed (61%), the raft's deck at the frame's foot (34%, 96% down), its lantern (12%) | the Veil (54%); Root Isle and the lily bed at the edges |
| Bench | the Veil (53%, 41% down), Root Isle (39%), the lily bed (64%), the raft's lantern over the rail (37%), the rod in its holder (23%) rising out of the frame | the Veil (57%), the lantern (13%), the holder off the left edge |
| Roof | the near planter (46%, 76% down), the far one (50%, 32%), the bell's post (65%) | the far planter (51%) |

Every target box measured at least 44 px on a phone once `layoutTargets` grows the smallest (the kettle, 24 × 22 px raw at 358 × 664, and the ledger, 39 × 13), with no raw overlap and no overlap after layout. The Balcony's water and the Long Wall's prints are not boxes in this check: the water is the input layer's (§5.4), and the prints' frames are placed by I-4's atlas packing and checked by its gate (§9.4).

### 3.3 Moving between them

- **The doorway is the target.** Tap the door (Deck ↔ Hearth) or the rungs (Rail → Roof). This is the main way to move, and it needs no new UI.
- **Marks.** A mark is a small filigree arrow carrying a glyph of where it goes: a stove door, a wave over a rail, Murk's lamp, a frame, a bench, a tuft of moss.
  - Edge marks sit at the screen's left or right edge in the lower third: thumb height on a phone, never at the top. Each is ≥ 44 px, drawn at 60% ink, with at most two per edge. A mark is spatial: a place to your right is on the right edge.
  - **Turn** is a curved arrow at the bottom centre, and **Back** a hooked arrow just to its right, ≥ 56 px: both in the thumb's reach. Back always goes one place toward the Deck, and **at the Deck Back steps off the barge** to the view from the water, by the dip (question 46).
  - **The Deck's right-edge mark carries Murk's lamp.** One tap glides to the Rail (the glide is the close look) and opens his shelf. Closing the shelf glides back to the Deck, where the Chart is. Sell, buy, Sail is then three taps, as at the Jetty.
  - Marks have no words. Each mark's accessible name is its place's (§10).
- **Glide times:**
  - 0.8 s within the deck and the cabin;
  - **1.3 s through the door**: through it facing in, up the cabin, and turning on the last metre to face the hearth (and the same back out). The path passes the door's centre and **stoops**: the eye eases down from the Deck's 1.38 m to 1.30 m over the floor (y 1.72) from 0.23 m before the door's plane to 0.23 m after it, 0.17 m under the lintel's underside (1.89, *measured*) with the head clear of it, and rises to 1.50 m by z 1.20 inside. The look dips 8° to the sill's stones as it crosses. Its points are `DOOR_GLIDE` (`aboard-layout.js`), each ≥ 0.10 m from every box (a test);
  - 0.8 s for Turn (a step back and 180°);
  - 1.1 s up or down the rungs.
- **How a glide moves.** Position and the look point move together on one smoothstep, with the look leading (a slight ease-in on the yaw). A 4 cm dip at mid-glide gives a step's settle; there is never a bob.
- **Reduced motion:** every move is an ink dip (0.25 + 0.35 s).
- **Taps during a glide:** one is queued; any more are dropped.
- **Hidden while busy.** Marks and doorway taps hide while a screen is open, and at the stern only while `fishing.sternActive()` is true: the bite, the play, the present and the card (§5.4). While the float waits, the look and the marks work, and leaving reels the line in (as a recast does).
- **Fading at the view.** At the Bench, and at the Balcony while the float waits, the marks, Back and Turn fade to nothing after 4 s with no input and come back on any touch, key or mouse move. The view is then clean.
- **Keys** (the Jetty's key handler hands them to the director first, §9.5):
  - Tab and the arrow keys move focus through the place's targets and marks: the built tiles' ids first (Murk's mark, Chart, Journal), then the place's own objects, then the marks. The look turns to frame the focused one.
  - Enter or Space activates.
  - Escape or Backspace goes back. At the Deck it steps off the barge to the view from the water (question 46); there Escape opens the home pause, as built.
  - Q and E turn the look 20° within the cone.
  - While a bite is open, Space and Enter strike first, before any of these (§5.5).

### 3.4 Looking within a place

- **Drag to look**, with one finger or the mouse, anywhere on the view that is not a button.
  - On a desktop, the look turns 0.18° per pixel dragged.
  - On touch, the cone's full width maps onto 60% of the screen's width, so one thumb sweep covers it.
  - The outer 15% of the cone is a soft spring, never a hard stop. On release the look damps to rest (λ 6).
  - It never recentres itself. Arriving at a place resets it to the place's look.
- **The Long Wall's track.**
  - A horizontal drag slides the eye along the wall (z −2.90…0.30) instead of turning it. The look stays square to the wall, with a small yaw cone for a glance.
  - On release the eye settles on the nearest print.
  - At the fore end the track turns 45° to face the bulkhead's prints.
  - On a phone in portrait, about 1.4 m of wall is in view, so this is how the wall is seen.
- **Desktop.** The look moves only when dragged or turned by keys. There is no cursor-follow (it slid the targets under the pointer) and no pointer lock.
- **Gyro** is not built (§9.7).

### 3.5 Close looks

- **What a close look is.** Tapping a thing leans the eye in to a close look: a short glide (0.6 s) to a pose authored at that thing. A close look has a small cone of its own (±25°).
- **Then the screen.** The thing's screen opens over it. The scene is dimmed under the screen but not blurred, since a blur would cost a render pass.
- **Coming back.** Closing the screen glides back (0.5 s). A close look without a screen (a window) returns on a tap anywhere, or on Back. The bunk's returns on Back.
- **The promise kept.** Close looks are the "camera moves inside" that SPEC §6.1 promised for the gallery, made general.

| close look | where the eye goes (a person; `CLOSE` in `aboard-layout.js` for the first six) | what it sees | then |
|---|---|---|---|
| the chart table | standing at the table's forward edge by the stool, leaning over it (−0.95, 1.80, 4.02), looking down 44° | the drawn sheet on the table (its built top) with the road's four stones on it, the weight, the rolled sheet | the Chart |
| the Journal | standing at the lectern's aft side (1.22, 1.85, 3.52), looking down 38° | the open book | the Journal |
| the ledger | sat on the people's chair at the desk (0.75, 1.64, 1.38), looking down 38° | the ledger open under the aft window's light | the sheet (`SHEET.md`) |
| the rod rack | facing the rod on its pegs (−0.95, 1.85, 2.98), looking down 28° | the rod you own and the rods it replaced | the sheet, at Tackle |
| a print | standing 0.6 m from the wall, square to the print, looking at it (level at the long row, 39° down at the small) | the print at true size on its ruler, and its candle | the print's card (§4.2) |
| the port window | stooped to the middle port window (−0.90, 1.55, −0.85), 0.43 m from the glass | the shore 12 m off, its reeds, the dawn mist, a heron if one stands there, and the Night-Lily boxes if worn | — |
| **the bunk** | standing at the bunk's side in the aisle (0.10, 1.92, 0.17), looking down across it (42°) | the four Wicks dozing in their basket at its foot (right), the pillow at its head (left), the starboard window over it | two things to touch: **the basket** (a Wick stirs) and **the pillow** (lie back, the eye on the pillow (0.90, 1.05, −0.25): the beams, the lantern's slow swing 0.8 m over you, the skylight's sky paling, until your next tap) |
| Murk | from the Rail, the eye turning to his face, level | — | his shelf, as the catalogue (`gw-mvp-catalogue`) |
| the Order Board | from the Rail, a step forward along the side deck, looking down 25° at it | the chalked orders | the shelf, opened at its orders |
| the eave's print | from the Rail, turning inboard to the eave at your eye's height | the Matriarch's print in its gold frame along the starboard eave | her print's card |
| the moss | kneeling on the Roof by a planter (the eye 1.10 m over the roof), looking down 60° | the moss parting; a Mire Worm curls and goes back | — |

## 4. What you can touch (B)

### 4.1 Signalled without rings or outlines

Never a ring, disc, glowing outline, rim light or radial highlight round anything. The signals work together:

- **Composition.** What you can touch is where the light falls: the stove's pool, the candles under the prints, the aft window's cool light on the ledger, the lantern's light on the chart table. Set dressing sits in the dim. This is the strongest signal, and it costs nothing.
- **Lift and glint.** On hover (desktop) or touch-down (phone), the thing rises 1–2 cm and tilts 2–4° toward the eye, and **its whole lit side brightens 15%** for 0.4 s.
  - The brightening is emissive on the part's own surface, scaled by its baked light, so it never draws a silhouette, a rim or a fresnel term. I-1's look sheets check that no lift reads as an outline.
  - The ledger's cover opens a crack, the kettle's lid lifts, a print's candle leans.
  - This is built as per-part values on the merged mesh (§8.2), so it costs no draw call.
- **Living light.** What you can use has a little living light near it, slow and irregular (two summed sines at 0.7 and 1.9 Hz, plus a little noise).
  - It shows in the stove's banked breath, the ledger's candle, the prints' candles and the raft's lantern below the gallery.
  - Idle things are still.
- **The idle hint.** After 9 s with no input at a place, the nearest thing you can touch lifts and glints once. It happens once per visit to that place, and not again until you leave and come back. Until the Balcony has been visited, the Deck's hint is the Turn mark's glint (§2.6).
- **The cursor** on a desktop becomes a small filigree hand over a target.
- **Focus** (from keys) uses the built Jetty targets' focus style (the word brightens and gains its filigree underline), plus the thing's lift. No box is drawn.
- **Words.** The three built tile words, **Murk**, **Chart** and **Journal**, sit under their things while in view (16 px and up, Drowned Filigree), as at the Jetty. Every other target has no words, only an accessible name (§10).

### 4.2 Every target

| id | at | the thing | what it does | opener (built unless marked) |
|---|---|---|---|---|
| `barge` (`[data-tile=barge]`, new: question 46) | the view from the water, once the tutorial is done | the cabin's lit starboard windows | steps aboard by the ink dip, to the Deck (§2.1) | `game.aboard.enter()` (the seed's stand-in director, then I-2's) |
| `chart` (`[data-tile=chart]`) | Deck | the chart table | a close look, then **the Chart**, then Sail | `openChart()` |
| `journal` (`[data-tile=journal]`) | Deck (a drag right) | the lectern's open book | a close look, then **the Journal** (its Prints page and catalogue as built) | `openJournal({from: 'jetty'})` |
| `door` | Deck, Hearth | the cabin door | go through | — |
| `rack` (the sheet's id) | Deck | the rod rack | a close look, then **the sheet at Tackle** | `screens.openSheet({from: 'rack', section: 'tackle'})` (`SHEET.md` §2.3) |
| `go:rail` (Murk's lamp) | Deck, the right edge | — | glides to the Rail and opens **Murk's shelf**; closing it glides back to the Deck | `openShelf()` |
| `stove` | Hearth | the stove's firebox door | opens on the banked fire, which breathes brighter, then closes (§4.4) | — |
| `kettle` | Hearth | the kettle on the stove | sings after 2 s, with a curl of steam | — |
| `bunk` | Hearth | the bunk's foot, with the dozing Wicks' basket | a close look at the bunk's side (§3.5) | — |
| `wicks` | the bunk's close look | the basket | one Wick stirs (§4.4) | — |
| `pillow` | the bunk's close look | the pillow | lie back until your next tap | — |
| `ledger` | Hearth | the ledger on the desk | a close look, then **the sheet**, at its head | `screens.openSheet({from: 'ledger'})` (`SHEET.md`) |
| `wall` (`[data-tile=wall]`) | Long Wall; the view from the water (the cabin's lit doorway, wing I) | the wall as a whole (its built accessible name, "The Long Wall") | aboard, brings the eye to the wall's resting point; on the view from the water it opens the gallery as built until I-4's Long Wall lands, then steps aboard to the Long Wall by the dip | — |
| `print:<speciesId>` | Long Wall; Rail (the eave) | a hung print | a close look, then **its print card** (below) | new view in `ui-prints.js` |
| `window` | Long Wall | the port window | a close look | — |
| `murk` (`[data-tile=murk]`) | Rail | Murk on his barge | **Murk's shelf**, as the catalogue (`gw-mvp-catalogue`) | `openShelf()` |
| `orders` | Rail | the Order Board | the shelf, at its orders | `openShelf({focus: 'orders'})` |
| `rungs` | Rail | the iron rungs | climb to the Roof | — |
| `water` | Balcony | the water astern | casts there (§5.4) | `fishing.sternPress` |
| `rod` | Bench | the rod in its holder | takes the rod up and moves you to the Balcony | — |
| `moss:1`, `moss:2` | Roof | the Bait Bed's planters (I, II) | a close look; the moss parts | — |
| `bell` | Roof | the Rust Buoy-Bell on the bow post (once found) | it rings once | — |

**Cut from revision 1, each for a reason:** the sill's stones as a target (their box lay inside the door's on screen; they are now seen as you pass the door and on the chart table's sheet); the rod at the Balcony (it lay across the lower right, where the right thumb casts); the bollard's moss (from the bench it sits exactly abeam, never in a look); the dozing Wicks as a Hearth target of their own (they are the bunk's close look's).

**A print's card** draws the print large, using `ui-prints.js`'s drawing. It shows the fish's name, its weight and small cm line, where it was caught and which evening. This is the Journal's Prints page entry, so it needs no new word.

**The 2D gallery leaves home** once I-4's Long Wall lands. Its screen (`ui-prints.js` `createGalleryView`) leaves the home flow, because the Long Wall is then the place you look at, and the doorway's target on the view from the water steps aboard to it (§2.3). The Journal's Prints page stays the 2D record of every print.

### 4.3 The sheet's home: the ledger and the rod rack

`SHEET.md` (written beside this, on `gw-design-sheet`) designs the gear and character sheet as a screen: gear quality, what is fitted as upgrades, how each changes the catch, and the Wick's stats and buffs. This design gives the sheet two things to open it from.

- **The ledger** on the Wick's desk, in the cabin's aft-starboard corner under the aft window.
  - It is a people's account book that the Wick keeps: its cover is the barge road's faded rose, with a ribbon and the candle in its dish beside it.
  - Tap it: a close look at the desk, then the sheet at its first page.
  - It sits in the Hearth's frame (38% across, with the window's cool light on it). Its candle is the desk's living light.
- **The rod rack** by the door on the stern deck: `SHEET.md`'s object (its §2.3), the Wick's kit wall.
  - The rod you own hangs on its top peg in its tier's colour. Below it, on pegs, hang the rods it replaced (T0's Willow Switch once you own Ashwood, and so on), with the reel and line you had.
  - A could, either lane's (`SHEET.md` §2.3): the fitted lure on its own peg below the rod, and the tin on a shelf under it.
  - Tap the rack: the sheet, at **Tackle**.

**The seam (§9.5).** The sheet is the Journal's first tab, its flyleaf (`SHEET.md` §2.1), opened by `SHEET.md`'s one opener:
- the rack calls `screens.openSheet({from: 'rack', section: 'tackle'})`, and its id is `rack`, as `SHEET.md` §2.3 fixes;
- the ledger calls `screens.openSheet({from: 'ledger'})`, the sheet at its head (the Wick and its passive).

The Journal's lectern keeps opening the Journal on its water's tab, one tab from the sheet. The sheet's lane merges before step 5d starts (§9.0), so I-4 wires both calls; if it slips, they open the built gear log until it lands.

The sheet's own third-person `rack` target (`SHEET.md` §2.3, a fifth DOM target over the arrival framing) is the same element the director places at the Deck (§2.3). *Measured* with the lectern where it is built: the rack, the chart table, the Journal, the door and Murk have no raw overlap and pass the layout at all eight validator sizes. Closing the sheet returns to the close look, which glides back.

### 4.4 Small pleasures

Each pleasure changes nothing in the save, and each has its sound (§7).

- **The stove door** opens on **Murk's banked fire**.
  - The embers under their ash breathe redder for a few seconds. The room's warm pool brightens 25%, the glow spills across the floor at your feet from the open door at your knee, and the dozing Wicks' flames lean toward it. Then the door closes.
  - The fire is never stirred, raked, fed or made to blaze: Murk rakes it open once, at the end of the road (`LORE.md` §8). Tapping it again only opens the door again.
- **The kettle** at your hip sings thinly after 2 s, with a curl of steam rising past your face from the shared smoke pool.
- **A dozing Wick stirs** (the basket, in the bunk's close look). One of the four lifts its flame, opens its amber eyes a crack, and settles again.
  - They take turns, and the one you play is never among them.
  - They never speak (`CHARACTERS.md` §3, who talks).
- **The bunk** (the pillow, in the bunk's close look). Lie back on the people's bed and look up at the beams, the lantern's slow swing 0.8 m over you and the skylight's sky, **for as long as you like**: your next tap sits you up.
  - A window candle lives from dusk to first light (`LORE.md` §2), so first light is the Wick's bedtime.
  - No time passes.
- **The port window.** Lean in and look out at the shore: the reeds 12 m off, the dawn mist, a heron if one stands there (WC-3's heron).
- **The sill's stones** show the journey so far as you pass through the door, and on the chart table's sheet.
- **The moss** on the roof parts under the Wick's hand, and a Mire Worm curls and goes back (the Bait Bed's free tins, seen).
- **The bell**, once found, rings once.
- **The hanging lantern** swings slowly with the barge. It is not tapped; it is life.

## 5. The stern gallery and the stern line (C)

### 5.1 The stern gallery (new on the hull)

The gallery is a railed porch over the rudder, the barge-house's own:
- **The floor** is at y 0.60 (one 0.18 m Wick-step up from the deck). It runs from z 5.30 to 6.60 and x −1.25 to 1.25, overhanging the transom (z 6.0) by 0.6 m on two curved knees.
- **The step** up to it is its forward edge's port half (x −1.20…−0.05), beside the chart table.
- **The rail** runs on its three open sides, **people-sized** (question 45): its cap at y 1.36, 0.76 m over its boards, with a rope at half height. That is a gallery's rail, a little under the deck's own (0.88 m over the deck), and *measured* in the arrival frame it keeps the porch under the chart table's top (Appendix A.2).
- **The bench**, a bench for one, runs across the forward edge's starboard half (x 0.00…0.64, z 5.50…5.95, clear of both bollards), **facing astern**: a plank on two crates, its seat 0.46 m over the boards (y 1.06) and a low back of crate boards to y 1.36 at its forward edge. Your seated eye is 0.25 m aft of the awning's hem. Sitting and looking agree: you sit facing the lake, your back to the deck, with the quarter lanterns either side.
- **The rod's holder** is an iron ring atop the aft rail's post at x 0.70 (y 1.30–1.46). It holds the rod upright while you sit on the Bench, 23% across the Bench's frame.
- **The bollard** stays as built at the starboard fore corner (0.95, 5.50), with the found Moat Bollard beside it (0.95, 5.35) when owned, both at the bench's starboard end, with the raft's rope running down.
- **The rail lanterns** of Barge lights I stand just forward of the gallery on the quarters (z 5.2, as built).
- **The tiller** is unshipped and lashed along the starboard rail.

**The raft aboard.** At its built tie-up heading, the raft's crooked pole and hanging lantern stand dead astern of the Balcony (*measured*: the pole 3–6° right and the lantern 4° left, 3.0–3.3 m off), right across the cast and the Veil. So under the dip aboard the raft turns on its rope to lie with **its pole on its starboard beam** (the pole at barge-local (1.28, 8.80)), and turns back under the dip out. *Measured* from the Balcony: the pole 38° left and the lantern 29° left. From the Bench: the lantern hangs 4° left below the falls, the pole 14° left. The heading aboard is data (`LOOP.stern.raftAboard`, §10).

**Clearances (*measured*).**
- The raft's circle (centre z 8.80, r 1.6) is 0.60 m clear of the gallery's aft rail.
- The gallery lies inside the aft hull circle's reach (z 4.8 + 1.8 = 6.6). So the obstacles, the raft's tie-up at the Jetty and the glide in and out do not change.
- The half-beam at the transom is 1.44 m, so the gallery sits inside the hull's width.

**Outside, it changes the arrival shot.**
- The mooring's camera sits aft-starboard, 12.8 m off the stern at 39° (*measured*). So the gallery and its bench are in that frame: the barge gains a porch. The holder is empty there (§2.3's one rod).
- The bench sits below the chart table's top in that frame at every size (*measured*), so the tutorial's chart target is never covered.
- The 5b before-and-after pairs and `frameCheck` are taken again.

### 5.2 Standing and looking

*Measured* from the poses of §3.2. Angles are from dead astern; "left" and "right" are as you look out.

- **Dead astern, 51 m**: the Sluice Veil's water-curtain on the east cliff (`WATERS.md`), with its inflow's seam and gravel fan at 48 m. It is the brightest part of the frame at first light: white water under the dawn.
- **Root Isle**, 23 m away at 12–14° left (radius 5 m), with its drowned roots.
- **The lily bed** at (40, 28), 22 m away at 11–13° right (radius 5 m): pads, with the near shore closing in beyond it on the right (27 m at 40°, 21 m at 60°).
- **The open lake** on the left: the Drowned Gatehouse (52 m, 43°); the pylons (46–65 m, 36–55°); the Bell Pool (60 m, 68°) at the cone's edge; and the Toppled Bridge's piers beyond it (54–76 m, 92–97°, seen from the Bench by turning).
- **Below**: your raft at the Jetty, 2.8 m off the transom, with its lantern lit, the creel or chest you own on its deck, and its pennant and lantern glass if worn. The Jetty's two posts are there too.
- **The two poses frame it differently.**
  - Standing at the Balcony (the port rail, aft): the raft lower-left, Root Isle left, the Veil centre, the lily bed right of centre.
  - Seated on the Bench (starboard of centre, forward): the Veil dead ahead, Root Isle left, the lily bed right, the raft's lantern over the gallery's aft rail (the raft's deck hidden under it from a seated eye), the rod in its holder at the left, the awning's edge overhead and a quarter lantern at each side. The cone is the widest aboard (±80°).
- **The sky: the morning rises on the bench** (question 47). Home is first light, held, because the clock stands still at home (SPEC §3.4), and the dawn mist lies on the far shore (`world.js`'s dawn air).
  - **While you sit on the Bench the morning comes up slowly**: over 150 s (`LOOP.aboard.morning.rise`) the mist on the far shore thins (the fog's density eased to 55%), the key light warms and lifts, the sky's low band warms toward pale gold, the quarter lanterns fade, and birds join the bed (§7).
  - **When you get up** (any move off the Bench: a mark, Back, Turn, or taking the rod) it goes back to first light over 3 s.
  - Nothing else moves: no clock, no evening, no bite rule (the stern's light is day either way). It is the world's (`world.setMorning(k)`, lane I-1), driven by the Bench's state (lane I-2), with no new draw call or program (§8.2).
- **The view stays clean.** At the Bench the marks fade after 4 s with no input (§3.3), and no word is on screen.

### 5.3 The water it fishes

**Where it is.** The stern fishes the Mossmere's open water at its mooring.
- The nearest place is the Bell Pool, 60 m off. The arc never reaches a place, a mist bank, the inflow or the outflow.
- So the stern fishes **open water's pool** (WATERCRAFT §2.4), by the area the float lands in. That area comes from `watercraft.areaAt` with the world's probe, docks and hull circles, as for a trip's cast.
- **Of that pool, only fish already landed on a trip** bite at the stern (§5.7, §12 question 44). Until one of them has been landed, the Balcony has no `water` target and is a place to look.

**The arc.**
- It runs from the Balcony's eye, from 6 m out to the rod's reach: castMax is 16 m for the Willow Switch, 17.5 m for Ashwood, 19 m for Whalebone.
- It spans ±60° of astern.
- It never falls inside the raft's circle plus 1 m (the raft's far edge is 4.48 m from the eye, so the 6 m near edge already clears it by 0.5 m) or inside a hull circle.
- **It leaves out the raft's pole and lantern**: the bearings whose line would pass within 0.4 m (in plan) of either, computed from the raft's pose aboard (*measured* at `LOOP.stern.raftAboard`: 22–44° left). Elsewhere over the raft the line runs ≥ 0.5 m above its deck.
- A tap outside the arc slides to the nearest legal point.

**What is in it (*measured*, the same on c34557d as on b527fae).** Shares come from a 1 m grid by area. Numbers in brackets are polar shares (sampled by angle and distance, which weights the near water); the stones' three-way split is polar too.

| rod (reach) | open | drop-off | stones (the Jetty's posts · the hull · Root Isle's roots) | margin | pads (the lily bed's rim) | deep |
|---|---|---|---|---|---|---|
| Willow Switch (16 m) | 47% | 27% | 21% (19 · 8 · 2) | 5% | 0 | 0 |
| Ashwood (17.5 m) | (40%) | (24%) | (17 · 7 · 5) | (6%) | (1%) | 0 |
| Whalebone (19 m) | 40% | 22% | 22% (15 · 6 · 7) | 9% | 4% (3%) | 1% |

So the porch has real watercraft:
- perch and bass on the Jetty's posts and in the hull's shade right below;
- the shelf's drop-off beyond;
- Root Isle's roots and the lily bed's rim at the edge of a better rod's reach.

A rod bought on the shelf is felt from the porch.

**The tells and the shapes** (WC-2) play at the stern as on a trip, but **only in the arc and a 15 m margin round it, ahead of the eye** (within ±75° of astern, at least 6 m out, clear of the hull circles and the raft's circle by 2 m).
- Each follows its own rules: a rise where its fish are, the water's answer when the tell is obeyed, and none on quiet water.
- Silhouettes show where the water is shallow enough (near Root Isle), up to three on low. Their spawn bearing comes from the stern's arc, never from the camera's bearing off the origin (at the stern the camera is the origin).
- They cost one instanced call while in view, as built.

### 5.4 The cast, the float and the line, from the eye

- **The rod** is in your right hand at the Balcony, entering from the lower right, held at a person's scale (question 45).
  - The grip is at your hip, 0.45 m forward, 0.50 m below and 0.22 m right of the eye; the rod (2.4–2.7 m by tier) rises to its tip about 2.2 m forward and 0.5 m over the eye, so the tip sits about 64% across and 24% down the frame.
  - The line therefore always has its origin in view. The rod looks like the one you own (§6.6).
  - The rod is not a target: you leave the Balcony by the left mark (to the Bench), Turn or Back.
- **Aiming, on a phone.** **A tap on the water casts there.** A drag anywhere looks round, as at every place. There is no drag-to-aim: a tap is precise enough, and nothing can be lost by a cast landing a little off.
  - A press on the water shows the built arc dots from the rod tip to the landing point while the finger is down: the trip's own aid under the loop, no ring, no reticle, no disc on the water. If the finger moves past the drag threshold it becomes a look, and no cast is made.
- **Aiming, on a desktop.** A click on the water casts there; a drag looks. Space or Enter casts to the water at the centre of the view (where you are looking).
- **The cast.**
  - A 0.25 s wind-up: the rod tip lifts out of the top of the frame, then whips down.
  - The float's flight is as built: 0.45 s, plus 0.03 s per metre.
  - The eye drifts 10% toward the landing and settles. The eye never chases the float.
- **The line** is the built ribbon (`actors.js` `makeLine`), drawn from the first-person rod's tip.
  - The built line has a fixed width in world units, so it thins with distance. Here its width grows with distance so it is never narrower than 1.5 px on screen.
- **The float** is as built. Its size reads well at 16–19 m, the trip's own range. The HUD's fishing layer shows at the Balcony: the float's good-bite dots (three) and the strike tip, and nothing of the trip's (§9.3). The float's teaching captions never show at the stern; they wait for a trip if unseen.
- **While the float waits** you can look anywhere in the cone, and the marks work. A tap on the water recasts there; the line comes in first, as on the raft. Leaving the Balcony reels the line in, as a recast does.

### 5.5 The bite and the automatic play

`fishing.sternActive()` is true from the bite to the card's close: the bite, the play, the present and the card. Only then do the marks hide and the look lock to its follow.

The bite is as built: the float's nibbles and its strike, the strike tap anywhere (or Space or Enter, which win over every other key and press at home while the bite is open), then the automatic play (CONTRACT §13.7a). In first person:
- **The rod** bends in your hand (the built bend, `ROD_PARS`'s `uBend`, on the first-person rod).
- **The line** tightens and swings with the fish's runs.
- **The eye** leans 1–2° toward the fish and eases 15% toward it.
- **A soft vignette** deepens with the line's tension. The trip's camera shake is scaled ×0.2 aboard.
- **No meter, no class stamp, no word** (SPEC §8.1).
- **A fish that gets away is named nowhere** (WATERCRAFT §7): the line goes slack, the float pops up, and there is a splash and a wake.

**Round the raft.** The play brings its fish toward the origin, to 2.2 + 0.5 L m of it. From the Balcony that last stretch would run under the raft for about a third of the arc (*measured*: the raft is 2.88 m off at 17° left and subtends ±34°). So at the stern:
- **The fish is led round to the port quarter.** Over the play's last 40%, its bearing eases from where it was hooked to 40° right of astern, and it is brought in to max(2.6, 2.2 + 0.5 L) m there. *Measured* at 2.6 m: 1.03 m clear of the raft's circle, 2.3 m of the hull circles and 1.9 m of the gallery.
- **While its bearing is in the raft's shadow**, it stays at least 5.5 m out (the raft's far edge plus 1 m).
- **No ring near the barge.** The ring rule (`ringOk`) keeps its raft term, measured from the real raft (`raft()`, not the origin), and gains the hull circles and the gallery's box: a splash or ripple whose half-life radius would reach any of them keeps its spray and drops and draws no ring. Never a ring around the raft, the player or the barge.
- **`ctx.cinematic` holds** from `fishing:caught` to the card at home as on a trip (main's exception, §9.5), so the signs and shapes freeze and taps stay off the strike.

### 5.6 The catch, in first person

The show's beats and timings are kept: the rise, the hold, the pause, the measure, the card. The subject is the fish in your hands, seen from your eye at a person's scale (question 45). How it is held depends on the fish's length L (a person about 1.62 m tall, the eye at 1.5 m; `LOOP.stern.present`):

| L | the present | the eye |
|---|---|---|
| ≤ 45 cm | **In the hands**: lifted over the rail in the two wax hands, side-on, 0.45 m from the eye at chest height, with the cloak's cuffs at the bottom of the frame | level; the field of view as it is |
| 45–90 cm | **In the arms**: held across the chest, the hands under its head and belly, its tail flexing past the edge of the frame | the field of view eased to 60° |
| > 90 cm | **On the boards**: laid on the gallery's wet boards, you kneeling over it, your hands at the gills and the tail. The whole fish is in frame | looking down 55°, the eye 1.10 m over the boards, the field of view 58° |

**The present.**
- A slow 15–20° turn shows both flanks. On the boards, a hand lifts the head instead.
- The scene lights it: the raft's lantern from below and aft, and the dawn.
- The Wick's own flame stays just above the eye: a warm wash at the top edge of the frame (6% amber), and on the tops of the hands (§6.6).
- The fish's flop is the built `fishUpd` struggle.

**The card** is the built catch card: the name, the class stamp, the weight as the hero, the small cm line and the record kicker. A stern fish is never a first landing (§5.7), so the card never carries the list's seal or count.
- Its one button is **Let go** (key 2 or Enter; ≥ 56 px), for clarity and the keyboard.
- **A tap anywhere on the card lets go too**, once the measure's beat has played. A press during that beat does nothing.
- There is no knife, so no Cut Strip at home.
- There is no Aquarium either. After M1 the Well takes fish only from a trip's card (§5.7).

**Let go** calls the stern's own path (`loop.sternLetGo`, §9.3), never the trip's `letGo`, which would give back a bite and add favour.
1. The hands lower the fish over the rail, the eye tilting down 20°.
2. It drops: a splash, ripples spreading away from the gallery, and a wake by its size.
3. The eye comes back up.

The Wick's third-person show (`actors-show.js`) is not used aboard. A reload during the present lands at the Balcony with the fish let go (§2.4).

### 5.7 The economy guard: fishing at home never breaks the trip loop

**Fishing gets an explicit mode** (`'trip' | 'stern' | null`, §9.3). The stern never borrows `run()`, the trip's `LOOP()` or the v3 cove path. Checked rule by rule against SPEC §3.1–§3.6, §4.10, §5.5, `WICKS.md` §2 and the sim:

| rule | on a trip | at the stern |
|---|---|---|
| **clams** (§4) | a kept fish sells at the tally | **None.** A stern fish is never sold, never kept and never on the tally. Nothing at home pays |
| **the hold** (§3.1) | a kept fish takes a slot | **Untouched.** There is no hold at home (`run` is null), and the stern never creates one |
| **keep or let go** (§3.2) | Keep · value, or Let go | **Let go only**, through `sternLetGo`: it gives back no bite and adds no favour |
| **good bites** (§3.3) | open water: slots + 1 (4–9) | **Three a dawn** (`LOOP.stern.bites` 3), at open water's favour of 0.<br>Every bite struck, passed or spooked spends one, landed or lost. It is counted and saved when it opens.<br>After that, **quiet water's rule as written**: favour −0.15 a bite down to −1.2, waits ×1.3 a bite up to ×2.2. Nothing ever stops biting.<br>The float's dots show the three (built). The count belongs to the dawn: it comes back when the next evening is sold |
| **the evening** (§3.4) | late day, then dusk, then night | **First light, held.** The clock stands still at home and the stern does not move it.<br>The bite roll reads the light as day (`watercraft.lightOf`), so only fish whose hour is day or any can bite, with no phase favour. Night fish never bite here.<br>No evening is counted |
| **the hook** (WATERCRAFT §3) | the fitted lure and bait | **The same, from the save's fit** (`meta.loop.fitted`), never `run().lure` or `run().equippedBait`, so the 1% rule holds: a worm never brings a pike.<br>**No bait is spent at home**, since the bag belongs to the evening. A tin counts only while it holds some |
| **places, giants, legends, Elders** (§3.5) | at their places | **Never.** No place is in reach, so no giant bites (each bites only at its own place), no legend (she bites only in her pool), no Elder (old water only) and no Marked Fish |
| **finds** (§4.10) | 1 bite in 20 is a snag | **Never at the stern.** A find needs the hold or a fitting, so the snag roll is off |
| **the Wicks' passives** (`WICKS.md` §2) | each works from the first evening | **Only Stub's quick waits** (×0.78), because they belong to the bite.<br>These do not act at the stern: Tallow's good bites (the hold's), Taper's first non-common bite (an evening's), Ashwick's comeback (an evening's), and the found bite part (part of open water's evening count).<br>**A stern catch does not write the Wick's firsts ledger** (`meta.loop.firsts`) |
| **who bites** (WATERCRAFT §4) | the pool by area and hook | **Revisit, never discover.** The pool by area and hook, then only the species whose Journal entry has `caught > 0`: fish already landed on a trip. If the float's area holds none of them yet, the bite comes from open water's landed fish; if open water holds none either, the Balcony has no `water` target yet (§5.3) |
| **first landings** (SPEC §3.4, §5.5) | the Journal's new page, "Evening N", the first-landing beat | **Never at the stern**, since every stern fish has been landed before. A fish's first landing always happens on a trip, behind the trip's catch show |
| **the list and its keys** (§5.5 (c), (f)) | a first landing of a listed fish ticks the water's list, one of the three keys to the next water | **Never moved.** `listCount` reads `caught > 0`, and the stern only bites fish that already have it, so the list's count, the catch seal, Murk's "list complete" line and Sporewood's catch key cannot change from the porch |
| **the pull** (§5.5 (d)) | listed fish not yet landed are pulled by evenings, with the ninth evening's guarantee | **Not applied** at the stern, and **not moved** by it: it counts evenings and unlanded listed fish, and the stern changes neither |
| **records** (§6.4) | written at the measure | **The best, the class seal and the ink print** are written as for any catch: the Journal page's best, its class seals, and the print on the Long Wall, so the wall fills from the porch as well. The print's "where" is the Mossmere and its evening is `meta.loop.evenings`; `printWhere` reads the stern's key as its water's name, so no new word |
| **Memories, toasts, challenges** (v3) | parked on a trip | **None.** `measure()` gets a stern branch: no Memories banked, no "New in the Journal" or mastery toast, no `challenges.hooks.fish`, no `cove` flag on `fish:landed`, no `meta.runs` change |
| **orders** (§6.3) | a fish that fills one sells double | **Never filled**, since nothing is sold |
| **odds** (§3.7) | hidden except in the logs | **Hidden.** No area name, rate or size shows before the card. The gear log's Who bites is unchanged |
| **no way to fail** (§3.6) | | Nothing is spent or lost at the stern.<br>The stern line opens from the first dawn home (`evenings ≥ 1`, the tutorial done), never on the opening's chart beat |

**The sim is unchanged, and why.**
- A stern catch pays 0 clams. It changes no clam, slot, `run.bites`, evening or shelf item.
- **It cannot move the list** (section 7 of the sim: each list ≤ 60 min, and under 5% with a list still open once the map and gear are held), because it never lands a fish whose `caught` is 0. So Sporewood's opening stays bounded by its map and gear, the pull's evening counts behave as modelled, and M1's hours are still hours of trips.
- So these all stand: `clams.mjs`'s natural rule, the anti-grind proof (sim section 2), sections 7's list figures, M1's pacing (WATERCRAFT §8.3: the first purchase on trip 3–5 and the empty shelf in 4.5–7.5 h) and T104.
- Lane I-3's node test proves it through the real ledger (§9.3): 300 seeded stern bites over 100 dawns change `meta.loop` only in `stern`, `prints` and the bests and class seals of fish already landed; `listCount` is identical before and after; no Memories, no `meta.runs`, no challenge progress.
- **The user chose this way** (§12 question 44, answered 17 November 2026: "Let go, known fish"), so no porch player is added to the sim.

### 5.8 What this reverses

- **M1 §8 question 5 and SPEC §16 question 17** (fishing at home; the default was "no cast"): **answered by the user's words** of 16 November 2026. The answer is the stern line: let go only, and it revisits fish already landed.
- **M1 §2.6's box "No cast at home"** becomes "**The stern line**". A press at home reaches `fishing` only at the Balcony; its catch never fills a slot, pays, counts an evening, lands a first fish or ticks the list (a test).
- **SPEC §6.1's** "a press anywhere else at home does nothing, and never casts" gains "…and never casts, except the stern line at the Balcony (§6.6)".
- **`tools/tests/loop-5a.scenario.mjs`'s "no cast at home" check** (line 131) is reversed to "a cast at home only from the Balcony, and it never pays, fills, counts an evening or moves the list".
- **The Quayling** stays the v3 build's. The stern fishes the Mossmere's own fish.

## 6. Art (D)

### 6.1 The look, in the Clear Night palette

- **Inside is candle-amber against the violet night's last light outside.**
  - Every interior frame reads three values (§3.2): a warm pool (the stove's banked glow, the candles), a mid-tone working surface (the desk, the chart table, the prints' paper, the bunk's blanket), and a cool exit (a window, the door, the skylight: lavender and pale violet first light).
  - The eye goes from warm, to surface, to exit, and the exit is where you go next.
- **Palette.**
  - Candle amber and pale stone on the timber: the hearthstone, the sill's stones, the prints' paper, the people's cups.
  - Lavender in the window light and in the door's rectangle on the floor.
  - Violet-dusk in the shadows. A shadow is violet, never black, as `world.js` keeps it.
  - **Green only on living things**: the Bait Bed's moss, the moss pot by the door, the moss lining the Wicks' basket, the Night-Lily window boxes, the faint glow of the Lumen Moss jars on the bait shelf.
  - Dried herbs are straw and lavender, never green.
- **The UI** over it is Drowned Filigree, as built: the marks, the words under Murk, Chart and Journal, and the cards. Aboard has its own veil, lighter than the Jetty's: at the stern it darkens only the bottom 8% of the frame, so the near water and the float stay clear.

### 6.2 The drowned kingdom's timber, and the clutter that tells the story

- **The people's house.**
  - Wide planks gone silver-brown.
  - The barge road's faded lavender band and the rose door's paint, as outside.
  - Carved beam ends and iron hooks.
  - The family's house-mark over the door, the painted cups on the dresser, a basket.
  - The tin candle mould with its dented cup: where window candles came from.
  - The people are shown only by what they made and left (`LORE.md` §2).
- **The Wicks' adaptations.**
  - Crates for steps, cushions piled on the people's chair, a crate at the rail, rungs up the wall, the bench of a plank on crates at the stern.
  - The tiny cloaks drying on a line over the stove.
  - A Wick's notches on the door's inner jamb, one an evening in fives: the evenings counted with no number.
- **What grows with play.** Home starts sparse and fills in; this is its progress, shown with no numbers.
  - The prints on the Long Wall, their candles lit one by one.
  - The rods replaced, on the rack's lower pegs.
  - The bait shelf's tins and jars (the bait bag).
  - The notches and the sill's stones.
  - Each found part and look in its place (§6.5).
  - After M1, a keepsake from each water the barge is towed to.
- **Ceiling and floor give the scale.**
  - The beams and their hooks: the hanging lantern, the herbs, the cloaks.
  - The floorboards run fore and aft toward the door, paler where feet go and darker at hand height along the edges.

### 6.3 Light without lights

There is no PointLight and no real-time light inside. All of the light lives in the vertices and in a few uniforms on the built materials.

**The indoor term.**
- A third channel is added to the timber's baked `gwWarm`: 0 outside, 1 inside, smoothed through the door and the window reveals.
- It scales the toon's key and rim light by (1 − 0.85 × indoor), and the hemisphere light by (1 − 0.6 × indoor).
- So the low tier (which has no shadow map) and the high tier read as the same dark room, lit by its bake.
- It is hooked in `actors-home.js`'s own `onBeforeCompile`, since the timber's material is that file's own. `toon.js` changes only if its shader chunks offer no hook.

**The warm bake** (`bakeWarm`, grown). Each is drawn on `gwWarmA`, the stove's colour:
- the stove's pool, 2.6 m from its mouth across the floor, the walls, the bunk's foot and the underside of the beams, with a soot fan up the wall behind the stove and a brighter fall on the floor in front of its door;
- each print's candle (0.35 m);
- the desk's candle and the hanging lantern's stub.

The bake breathes slowly, with a 0.2 Hz swell under the built flicker: "the way a banked fire breathes" (`LORE.md` §6's Banked Fire).

**The cool spill.**
- Each window's and the skylight's lavender pool on the sill, the floor and the opposite wall, and the door's rectangle on the floor.
- These are baked into the vertex colours and do not change, since home is always first light.
- Contact shadows are a darker band of vertex colour under each piece of furniture.

**Outside sees inside.**
- The dark box and the glow quads in the doorway go. Through the open door, the arrival shot now sees the real interior, with its floor and far wall lit warm by the bake.
- The windows keep their warm glow quads on the outside, among them the dozing Wicks' three small flames in the starboard aft window. The quads are single-sided, so from inside you look through them and see the basket itself.

### 6.4 Ink up close

- **The barge's ink** (the inverted-hull outline) gains the interior's big shapes: the stove, the desk, the chair, the bunk, the beams, the gallery's rail and bench, the dresser.
- **Up close**, its depth evening already thins lines and never fattens them.
- **The trap is closed.** The closed `cabinShell` box in the ink is rebuilt with openings for the door and the windows, so seen from inside no solid ink fills a doorway or a window (§8.1).
- **Aboard, the ink draws after the timber** (its render order raised while aboard), so the walls hide it by depth instead of the whole shell being shaded first (§8.3).

### 6.5 Every M1 home upgrade and found part, inside and out

**The Long Wall, wing I** (250 clams). Outside it is the cabin's warm doorway, as built. Inside it hangs on the port wall and the port half of the fore bulkhead, in two rows:
- The long fish hang in a row above the windows at your eye (centres 1.42 m over the floor, y 1.84), under the beams. The small fish hang between the windows and below them (centres 1.02 m).
- Each frame is at true size on its painted ruler, with a candle on a ledge under it, lit once its print is hung. The giants' frames are gold.
- Before wing I: bare boards, nails and the people's paint.
- Once bought, all 16 frames hang at once, with blank paper and unlit candles. Each fills as its species is printed (`galleryModel` gains the blank frames, §9.4).
- *Est.* capacity: 15 m of print, against wing I's 16 best prints of about 11 m with their margins.

Everything else:

| what | outside (as built, or as amended) | inside, or seen from aboard |
|---|---|---|
| **the Matriarch's print** (a legend landed) | along the starboard eave, gold-framed (as built) | seen from the Rail, looking up 20°. A target: her print's card |
| **Bait Bed I–II** | the roof's moss planters (as built) | The Roof's beds: living green, and the moss parts. Inside, the bait shelf's moss-lined crate of Mire Worms, topped up to the Bed's floor at dawn |
| **Barge lights I** | the rail lanterns (as built) | the two quarter lanterns either side of the bench, fading as the sky pales, with their light on the gallery's boards |
| **Murk's Order Board I–II** | on the starboard rail (as built) | **Turned to face the side deck**, so the Wick reads it from the Rail (Murk leans across to chalk it) |
| **tackle: Rod, Line, Reel T0–T2** | the rod on the rack (as built) | **The rod in your hand** at the Balcony and in its holder at the Bench, by tier (§6.6), with its reel and line. The rod you own hangs on the rack's top peg otherwise, with the rods it replaced below |
| **the raft: Hold, Oars, Keel, Lantern** | on the raft (as built) | seen below the gallery: the creel or the chest on its deck, the oars shipped, the lantern |
| **Slate Cloak Dye** | on the Wick | **The first-person cuffs** at the bottom of the frame are slate, on the hands and at the present |
| **Oxblood Pennant, Amber Lantern Glass** | on the raft | below the gallery |
| **the sill's stones** (arc I) | at the door (as built) | seen as you pass through the door, and on the chart table's sheet in its close look |
| **the Rust Buoy-Bell** (found) | on the bow post (as built); it rings at the tie-up | the Roof's view forward. A target: it rings |
| **the Gate Lamp-Glass** (found) | the windows warmer and seen farther (as built) | inside, the window glass's edges are amber and the windows' light warmer |
| **the Moat Bollard** (found) | on the stern deck; the raft ties to it | at the bench's starboard end, its moss crown at the Wick's elbow, seen when you turn left from the Bench (dressing, not a target) |
| **the Knotted Rod Tassel** (found look) | on the rod | on the butt of the first-person rod, in view at the Balcony |
| **the Toll-Tower Vane** (found look) | on the raft | below the gallery |
| **the Night-Lily Window Boxes** (found look) | under the windows | in the port window's close look, and at the bottom of the windows from inside (living green) |

**After M1.**
- The Painted Prow, the Bell Buoy and the Moon Lamp are seen from the Roof.
- The Star Pennant flies from the gallery's flagstaff.
- The Gilt Lantern and the Reed Sail are on the raft, below the gallery.
- Wing II goes on the starboard wall (its 5.7 m: §13 risk 6), wing III under the awning, wing IV along the hull.
- The Well gets its glass hatch amidships.

### 6.6 First-person things

**The rod, by tier**, a person's rod (question 45): 2.4 m, 2.55 m and 2.7 m. It is one small merged mesh, vertex-coloured toon, in the tier's look (as `actors-home.js`'s rack already colours it):
- **Willow Switch** (T0): a pale green-brown switch with a cord-wrapped grip, the line on a wooden winder.
- **Ashwood** (T1): honey-coloured wood, a cork grip, a small wooden reel.
- **Whalebone** (T2): pale bone with brass ferrules and a brass reel.

The Line's tier tints the line (undyed, amber, lavender). The Reel's tier sets the reel's look. The found tassel hangs from the rod's butt.

**The hands.**
- Two wax hands (the Wick's `wax` colour) drawn at a person's scale, and the cloak's cuffs, in its cloak colour (slate if the Slate Cloak Dye is worn).
- About 400 triangles, merged with the rod into one mesh with one ink: **2 calls together**.
- They are seen only holding the rod and at the present.

**The flame above the eye.**
- A 6% amber wash at the top edge of the frame, breathing with the Wick's flame. It is a screen-space gradient in the grade, not a light.
- A warm top-light term on the hands and the presented fish.
- You are a candle: you can see your own light at the edge of sight.

**Never** a crosshair, a reticle, a body, feet or a head bob.

### 6.7 Originality

- Point-and-look navigation between fixed viewpoints is a general technique.
- The rooms, their props and their names come from the Slow Hearth's own fiction (`LORE.md`): the people's barge-house, Murk's banked fire, the window candles, the Long Wall, the Bait Bed, the sill's stones, the Wicks' crates and bench.
- No other game's interiors, names or art are copied, and no TV series or presenter is named.

## 7. Sound

`audio-home.js`'s home bed is kept and placed by where you are: the stove, water against the hulls, a far bell, and Murk's hand bell.

| where | what you hear |
|---|---|
| **inside** | the outdoor bed low-passed (the cabin is dry and close); the stove's slow breath and tick and the dozing Wicks' faint purr, rising at the Hearth and at the bunk |
| **on the deck** | the awning's canvas, and the water against the hull |
| **at the stern** | open water, the Sluice Veil's far rush, birds at first light, the raft knocking at its rope |
| **on the bench** | the stern's bed, and the dawn chorus rising with the morning (§5.2), falling back as you get up |
| **on the roof** | the wind and the whole lake |

- **Moving.** A glide is one board creak: the door's latch going through the door, and the rungs' iron going up.
- **Each pleasure has one sound**: the stove door's iron, the embers' hush, the kettle's thin song, a sleepy hum, the bunk's creak and a long breath, the glass, the moss's rustle, the bell.
- **The stern line** reuses fishing's and the show's cues: the cast's swish, the float's plip, the strike, the line's hiss, the present, the splash of the release.
- **All of it** stays inside the −1.0 dBFS master. `audio-render.mjs --set=home` gains the aboard beds.

## 8. Performance (E)

### 8.1 One barge, inside and out (shared meshes, no swap)

**How it is built.** The interior is merged into the barge's own meshes (timber, glow, ink), and `setVariants` rebuilds them as today.

**Why not swap.** No second "interior" model swaps in under a dip. So:
- the door and the windows look both ways;
- the arrival shot sees the real interior through the door;
- nothing is drawn twice.

**The costs this accepts.**
- The interior's vertices are drawn in the mirror and shadow passes too, hidden by the walls (*est.* about 6k triangles).
- The merged mesh is never culled; it never was.
- The windows become openings: holes in the board walls, with inner frames and sills. The ink's `cabinShell` gets the same holes.

### 8.2 The budget (low tier and phones first)

| what | budget | how |
|---|---|---|
| the barge's main-pass calls | **≤ 6** (today 4: timber, glow, ink, the chart table's top) | Adds the Long Wall's print atlas (1, frustum-culled: drawn only when a cabin place can see it), and the first-person rod and hands (2: one merged mesh and its ink, only at the stern). The atlas is behind the eye at the stern, so the stern's frame holds 4 + 2 = 6 |
| mirror · shadow | **≤ 2 · ≤ 2** (today 2 · 1) | The interior goes inside timber and glow. The rod, the hands and the atlas are kept out of both (`noReflect`, `noCast`) |
| the gate on calls | measured, not declared | `clarity-perf`'s barge share (the frame drawn again with the barge hidden), per pass. `calls()` is derived from the meshes the barge holds, never a constant |
| PointLights | **none added** | The raft's lantern stays the one warm light, and Murk's stays held at 0 |
| triangles | The interior and the gallery ≤ 8k (*est.* 5–6k).<br>*Est.* by part: the stove ~600, the desk and chair ~300, the bunk ~300, the Wicks' basket ~600, beams and hooks ~400, wing I's 16 frames and candles ~700, the gallery and bench ~700, the rungs ~150, clutter ~1k.<br>The rod ≤ 600; the hands ≤ 400 | spent on silhouettes near the eye: the stove's belly, the desk's edge, the door frame, the gallery's rail |
| textures | **One new**: the print atlas, one 1024 × 1024 canvas (4 MB, 5.3 MB with mips), drawn from `galleryModel`'s frames.<br>The chart top stays as built. The hands, the rod and the interior are vertex-coloured, so nothing else | 512 px a metre, so a 0.5 m print is about 256 px across at the Long Wall's 1.9 m. Its close look opens the print card's own drawing for detail.<br>**A new print redraws the atlas only after the present ends or on the next Long Wall visit**, never during the measure |
| per-part motion | 0 calls | Each part's pivot and hinge axis are baked into vertex attributes on the timber (`gwPart` and `gwPivot`), and the material keeps **one vec4 per part** (lift, angle, glint, spare) in a uniform array of 24 slots: the 16 print candles, the stove's door, the kettle's lid, the ledger's cover, the hanging lantern and 4 spare. A candle lit by a new print is a glint value, so no rebuild |
| a rebuild | ≤ 15 ms on the low desktop (*est.*) | `setVariants` and `bakeWarm` grow with the vertices, and run only when what you own changes, never during the present |
| **each place's frame** | **≤ 150 calls on low**: the home frame's line. The arrival shot at first light measured **144 on low, on desktop and on a phone** (*measured* on the current preview; the phone was 139 at b527fae, so tonight's watercraft added 5 there). At the stern: 144 less the hidden Wick (6–10), plus the rod and hands (2) and the tells (1), so *est.* 137–141.<br>On medium and high, no worse than the arrival shot's (227 and 228, over 200 and reported, not failed) | measured per place (`clarity-perf --aboard`) |
| **each place's cost** | **cpuMs no worse than the arrival shot's** at the phone size on low, and **p95 ≤ 33 ms on the software-GL tier** at every place, at the stern during a play | `clarity-perf --aboard`, its cpuMs per place against the arrival shot's (§8.3: aboard the cost is fill, not calls) |
| the Wick aboard | hidden | Its meshes, outlines and flame are not drawn aboard (*est.* 6–10 calls saved) |
| the morning on the bench (question 47) | 0 calls, no program | Uniforms only: the fog's density, the key and hemisphere light, the sky's low band, the mist banks and the lanterns' level, eased by one weight (`world.setMorning(k)`); I-1's gate counts the renderer's programs before sitting down and after getting up |

### 8.3 What each place costs

- **The cabin's places** (the Hearth, the Long Wall and their close looks) look at walls with small windows.
  - The world in front of them is still in the frustum and still drawn, since there is no occlusion culling.
  - **On medium and high, the water's mirror is skipped in the cabin, with no recompile.** The water keeps its `GW_REFL` define and its reflection target; a uniform weight (`uReflW`) eases to the analytic water over 0.3 s and the reflection render is skipped while it is 0. The window's close look eases it back. Each place's data carries `mirror: false` or `true`. I-2's gate checks that the renderer's program count does not change across 20 door glides. The saving is measured, not promised (*est.* tens of calls on medium and high).
  - **Fill, not calls, is the cost aboard.** In the cabin the timber covers the whole screen; the water (render order −10, drawn first) would shade the half hidden under the floor, and the barge's ink (drawn before the timber) every pixel of the shell. So **aboard, the water and the barge's ink draw after the timber**, and depth rejects what the walls hide. Off aboard both keep their built order.
- **The deck** faces the cabin and the shore.
- **The balcony and the bench** face the open lake like the arrival shot, plus the tells' one call and the rod and hands' two, with the Wick hidden.
- **No pixel-ratio change in motion.** Revision 1 lowered the pixel ratio during glides; a change of pixel ratio reallocates the composer's targets, the bloom's mips and the reflection target each time, so it is dropped.
- **The lens.** Aboard, the far plane is 400 m (the dawn fog at 0.0055 is near opaque by then; I-2 checks the sky vault's radius first). The near plane is 0.15 m at the places and 0.10 m at the Balcony (a person's hands are 0.45 m from the eye) and in close looks. The Roof's eye is 3.87 m over the water, so it sees more of the lake than revision 1's: `clarity-perf --aboard` measures it first.
- **Memory**: the 20 round trips of M1 §2.14 (home to the evening and back) stay flat within 10%, now through the dip aboard and out, with no render target created during a glide.

### 8.4 Phones

- **Portrait sees one subject at a time.** Its horizontal field is about 33° at 66° vertical.
  - Each place has a portrait look on its hero: the chart table at the Deck, the stove and the dozing Wicks at the Hearth (from its own eye), Murk at the Rail.
  - The cone and the Long Wall's track carry the rest under one thumb.
  - The marks sit in the lower third; Turn and Back at the bottom centre.
- **M1 §2.12's sizes hold.**
  - Every target is ≥ 44 px wherever it is in frame.
  - Every primary button is ≥ 56 px.
  - Text is ≥ 16 px.
  - The safe areas are kept.
  - **The Jetty's own chrome is reserved**: the pause glyph, the purse, Murk's line with its seal and the goal line are reserved rects in the layout and the validator at all four sizes, so no target or mark lands on them.
- **On real phones** (M1 §2.12's two), p95 is ≤ 33 ms aboard, and at the stern during a play.

## 9. Build plan (F): M1 step 5d, after tonight's merge (LARGE)

### 9.0 Where it sits

- **M1 step 5d** (QUEUE job 13, after tonight's MVP merge), before step 6's polish pass, so the polish pass and the playthrough cover it. "The home barge, complete" includes being inside it.
- **Base**: the MVP integration branch after tonight's merges (5B, 5C, WC-1–3, the teaching captions, the catalogue on `gw-mvp-catalogue`) **and after the sheet's lane** (`gw-mvp-sheet`, one medium lane on the same base), which merges first. If the sheet's lane slips, step 5d starts without it and the sheet's lane rebases onto 5d, keeping only its hunks of §9.5's table.
- **One seed commit first, alone**, written at the user's answers (17 November 2026) on the integration branch `gw-inside`, which the four lanes branch from: `aboard-layout.js` (every box and eye of §3.1–§3.2 at a person's eye, measured, with the door's stoop and `aboardFrameCheck`), `LOOP.aboard`, `LOOP.stern` and `TEXT_LOOP.aboard` in `data.js`, `actors.setAboard(on)` (the Wick, its rod and its flame hidden), the `'aboard'` camera mode in `render.js` (the pose applied after the floor clamp), `render.afterCamera(fn)`, `debug.aboard` (`go(place)`, `close(id)`, `pose()`), **the barge target** on the view from the water (`home-targets.js` `TARGET_ORDER` and `TARGET_BOXES.barge`, `frameCheck`'s word rules; `homeTargetIds` once the tutorial is done), **a minimal stand-in director** (`src/aboard.js`: the dip in on the barge's tap, cuts between places, a wordless Back mark that steps off from the Deck, Escape the same, Sail's dip out; I-2 grows it into the full director), and `validate-data --loop`'s aboard frame check on that layout at the four sizes with the arrival and tutorial frames unchanged. Node tests for the layout (every eye inside its room, ≥ 0.15 m from every box and from the built timber, under the overhead; the door's glide stooping under the lintel) and the barge target's layout.
- **Four lanes then** run together. I-1's first commit is the parts API and the atlas mesh; I-4 needs them.
- **Merge order**: I-1, I-2, I-4, I-3, with the whole gate and one browser walk after each.
- **Sizes**: I-1 L, I-2 M–L, I-3 L, I-4 M; about two weeks of wall time with four lanes.

### 9.1 Lane I-1: the interior's art and scene (`gw-inside-scene`, L)

**Owns:**
- `src/actors-home.js`:
  - the gallery and its bench, the tiller;
  - the shell's holes, the windows' openings, and the doorway's box and glow quads removed;
  - the indoor term, `bakeWarm`'s pools, the parts' attributes and uniforms;
  - the ink's render order while aboard (§8.3);
  - `calls()` derived from its meshes, plus `toWorld` and `bob` on the API.
- `src/actors-home-inside.js` (new): the cabin's geometry and its variants.
- `src/aboard-layout.js` (after the seed): its numbers, if the look rounds move a box.
- `src/actors-finds.js`: the found parts' places inside and on the gallery.
- `src/world.js`, one hunk (question 47): `world.setMorning(k)`, k 0 first light … 1 the risen morning: the fog's density to 55%, the key and hemisphere light warmed and lifted, the sky's low band toward pale gold, the mist banks thinned, the rail lanterns' level down; uniforms only, no clock, no recompile.
- `tools/tests/aboard-scene.test.mjs` (new).
- `tools/tests/clarity-perf-home.mjs` (`--aboard`).
- `tools/tests/loop-aboard-look.scenario.mjs` (new).

`home-targets.js` needs no change from I-1 now that the lectern stays (§2.3).

**Builds:**
- §3.1's furniture and §5.1's gallery at a person's scale (question 45): the gallery's rail 0.76 m over its boards, the bench for one, the door's leaf re-hung open, the flue's run under the roof, the beams on the walls' top plates, the lantern over the bunk.
- §6's art whole, and §6.5's inside column.
- The print atlas's mesh: 16 quads with UVs into one canvas that I-4 draws.
- The parts mechanism, `actors.home.parts.set(id, {lift, angle, glint})`.

**MVP gate.**
- Node tests:
  - every interior box is inside the cabin's walls and clear of the door's path;
  - every place's eye is ≥ 0.15 m from every box and inside its room, and `aboard-layout.test.mjs` passes against I-1's built mesh (the eyes ≥ 0.15 m from the timber and under its overheads; the doorway clear once the dark box goes and the leaf is re-hung);
  - the gallery is clear of the raft's circle by ≥ 0.5 m and inside the aft hull circle;
  - the shell's holes match the door and the windows;
  - no PointLight in the barge's tree;
  - the indoor term is 1 at every interior vertex and 0 on the hull's outside;
  - the parts' uniform array is ≤ 24 vec4.
- Look sheets of every place, desktop and phone, taken through the seed's `'aboard'` camera and `debug.aboard`, so the lane needs no director. At least three look-and-fix rounds. Each sheet checks that no lift or glint reads as an outline.
- The arrival shot before and after (the gallery, the bench, the door's interior), and every upgrade's and part's before-and-after pair inside.
- The morning from the Bench at k 0, 0.5 and 1 on look sheets (desktop and phone), and the renderer's program count unchanged across sitting down and getting up.
- The Deck under the awning's canvas at 1.38 m judged on the look sheets: if it reads cramped rather than cosy, its eye moves forward to (1.30, 1.89, 3.62), 1.47 m, with the door a drag right (§13 risk 4).
- `clarity-perf --aboard` per place, with the Wick hidden through `actors.setAboard`: the barge's measured share ≤ 6 / 2 / 2; ≤ 150 calls on low; on medium and high, no worse than the arrival shot; cpuMs no worse than the arrival shot's at the phone size on low.

### 9.2 Lane I-2: the eye: camera, look, places, the way in and out, the input (`gw-inside-eye`, M–L)

**Owns:**
- The seed commit (§9.0).
- `src/aboard.js` (new): the director.
  - the places, with their poses turned from local to world through the barge's `bob`;
  - the cone and its spring, and the Long Wall's track;
  - glides, dips and close looks, the queue, and focus;
  - the `aboard:*` events, and `ctx.game.aboard`;
  - `debug.aboard.go(place)` for the scenarios.
- `src/ui-aboard.js` (new):
  - **the aboard input layer**: one DOM layer inside the Jetty's body, under its targets, taking pointer capture for drags; a tap on the water goes to `fishing.sternPress`, and a press while `fishing.state` is `'bite'` goes to main's strike first;
  - the place's new targets and the marks, Back and Turn, focus and keys, the fade;
  - the stand-in openers (Chart, Journal, Murk) until I-4's `aboard-touch.js` replaces them;
  - its own veil.
- `src/render.js`:
  - camera mode `'aboard'`: the director's pose applied **after** the floor clamp and exactly, with no sway and no title roll, the barge's roll ×0.5 and the trauma shake ×0.2;
  - `getYaw()` returns the director's look yaw while aboard (fishing's default aim and the show read it);
  - the near and far planes of §8.3;
  - the cabin's mirror weight (with `water.js`).
- `src/water.js`: `uReflW` and the skipped reflection render (no define change, no target disposed); the water's render order while aboard.
- `src/loop-home.js`: no dip on Sold (the view from the water stays, question 46), the dip out on Sail from aboard, Continue on the view from the water, and `aboard:leave` on every exit.
- The barge target's behaviour (from the seed's stand-in): the dip in, its windows' hover and idle glint until `meta.loop.stern.boarded`, and Back and Escape at the Deck stepping off.
- The Bench's state for the morning (question 47): `world.setMorning` rising over `LOOP.aboard.morning.rise` while seated, back over `back` on getting up.
- `src/main.js`:
  - at home a press goes to the aboard layer, and while `biting()` it and Space or Enter go to the strike before the Jetty's keys;
  - `ctx.cinematic` is kept in flow `home` while `fishing.sternActive()` (the exception beside `playing`, `hub` and `intro`).
- `src/ui-loop.js`, two hunks only:
  - a projector hook in `placeTargets`, so the director places the Jetty's own tile elements at their places (no duplicate elements);
  - the Jetty's `onKey` and `onEscape` hand the key to `ctx.game.aboard.key(code)` first, and fall back to `jettyKeys` and `openHomePause` when it returns false.
- `src/actors.js`, one hunk: `setAboard(on)` (in the seed).
- `src/data.js`: `LOOP.aboard`, `LOOP.stern`, `TEXT_LOOP.aboard` (§10).
- `tools/validate-data.mjs`: the aboard checks, with the Jetty's chrome as reserved rects.
- The seven scenarios of §2.5 need no move (Sold stays on the view from the water); the walk adds the barge's tap.
- `tools/tests/aboard.test.mjs` (new), `tools/tests/loop-aboard.scenario.mjs` (new).

**MVP gate.**
- Node tests:
  - local-to-world with the bob, and the pose applied after the floor clamp;
  - the cone's clamp and spring;
  - every glide's path is clear of the layout's boxes by ≥ 0.1 m and goes through the door's opening;
  - the graph is connected, and Back always reaches the Deck;
  - focus order starts with Murk's mark, Chart, Journal;
  - the flow: Sold stays on the view from the water, a tap on the barge goes aboard, Back and Escape at the Deck step off, Sail goes out, Continue lands on the view from the water, and the tutorial is never aboard (the barge target hidden until it is done);
  - the input: a press while a bite is open strikes, at every place.
- `validate-data --loop`:
  - every place's targets are ≥ 44 px and never overlap (raw or laid out) at 358 × 664, 390 × 844, 1280 × 720 and 1920 × 1080, in their look or within their cone, clear of the Jetty's chrome;
  - each portrait look holds its hero.
- The renderer's program count is unchanged across 20 door glides, and no render target is created during a glide.
- **The browser walk** (`loop-aboard.scenario.mjs`), from a save with wing I, Bait Bed I and Barge lights I owned:
  - come home, tap the barge, Back off and tap it again;
  - every place, every mark, Back and Turn, and the Deck's lamp to Murk and back;
  - sit on the Bench a full rise of the morning, get up, and see first light come back;
  - the Chart opened from the chart table through the stand-in opener and Sail from it (the other screens are I-4's gate);
  - keys only (with Escape as back), then touch only;
  - desktop, and a phone in portrait;
  - reduced motion's dips.

  It passes with no console error, no stuck screen, and the Wick shown again after Sail; the seven moved scenarios pass.

### 9.3 Lane I-3: balcony fishing in first person, the stern line (`gw-inside-stern`, L)

**Owns:**
- **The audit, as the first commit alone**: a table of every `LOOP()` (48), `run()` (36) and `playing()` (10) site in `fishing.js` and every `onTrip()` (32) in `progression-loop.js` (counts at c34557d), each marked **same at stern**, **off at stern** or **stern variant**, locked by a node test that fails when a site is added unmarked.
- `src/fishing.js`:
  - an explicit fishing mode `mode()` → `'trip' | 'stern' | null`, read by every audited site instead of borrowing `run()` or the cove path;
  - the stern's gate beside `playing()`, so `update()` no longer hard-resets at home while the stern is on;
  - two accessors: `origin()` (the cast, the line, the aim, the target ray, the charge preview, the break distance and the play) and `raft()` (the ring rule);
  - the stern's key (`stern:<water>`), its light, its arc (with the pole-and-lantern strip), its pool with the revisit rule, its lure and bait from `meta.loop.fitted`;
  - the play led round to the port quarter, `ringOk` extended to the hull circles and the gallery, the tells' and silhouettes' spawn in the arc;
  - no hold, no snag, no pull and no evening passives at the stern;
  - `fishing.setOrigin(o | null)`, `fishing.sternPress(e)` and `fishing.sternActive()`.
- `src/fishing-fx.js`, and `src/fishing-signs.js` and `src/fishing-sight.js` where their spawn reads the origin: the arc dots from the first-person tip, the line's 1.5 px floor, the spawn of §5.3.
- `src/progression-loop.js`:
  - `meta.loop.stern = {evening, spent, seen}`, seeded by `freshLoop` and `migrateLoop` after the sheet's line, with no schema step;
  - `sternBitesLeft()`, `noteSternBite()` (counted and saved when it opens), `closeSternBite()` and `sternLetGo(fish)` (no bite back, no favour);
  - the dawn's refresh on a new evening, and an open bite given back on Continue.
- `src/progression.js`: `measure(fish, {stern: true})`, a real stern branch: the best, the class seals and the print (`notePrint` with `meta.loop.evenings`); no Memories, no toasts, no challenges, no `cove` flag, no `meta.runs`; `firstEvening` = `meta.loop.evenings` (for §12 question 44's other way); never the firsts ledger, never the hold.
- `src/ui.js`: the catch queue drains in flow `home` while `fishing.sternActive()`, and `flow:change` no longer empties it at home; the HUD's fishing layer shows at the Balcony.
- `src/ui-hud-v3.js` and `src/ui-measure.js`, as needed: the float's dots and the strike tip at the stern; the measure's hold at home.
- `src/ui-screens.js`, one hunk: `showCatch`'s stern branch (Let go only, a tap anywhere lets go). `src/ui-loop.js`, one hunk: `cardActions({stern: true})`.
- `src/actors.js` (but the seed's `setAboard`): the rod source for `getRodTip()`, the line's start and its bend.
- `src/actors-rod-fp.js` (new): the first-person rod by tier and the hands, one merged mesh and its ink, placed through `render.afterCamera`.
- `src/aboard-present.js` (new): the first-person present and the release.
- `tools/tests/stern-line.test.mjs` (new).
- `tools/tests/loop-5a.scenario.mjs`: line 131 reversed.
- `tools/tests/loop-stern.scenario.mjs` (new).

**MVP gate.**
- Node tests, taking §5.7's economy guard row by row:
  - the audit table is complete;
  - 300 seeded stern bites over 100 dawns leave `clams`, the hold, `run`, `evenings`, `run.bites`, `firsts`, the pull, the Memories, `meta.runs` and every challenge's progress unchanged, and `listCount('mossmere')` identical;
  - they write only the bests, class seals and prints of fish already landed, and never a first landing;
  - three good bites a dawn, refreshed only by a new evening, and saved when each opens;
  - a let go refunds nothing;
  - no snag, giant, legend or Elder at the stern;
  - the light is day, and no night fish bites;
  - the 1% rule holds on the stern's casts (WC-1's `castOdds` with the stern's area);
  - the lure and bait come from `meta.loop.fitted`; no read of `run()` or `ctx.player.position` is left in the cast path while the stern is on;
  - across seeded stern plays, no ring or splash ring within its half-life radius touches the raft, a hull circle or the gallery, and the play's fish never passes under the raft;
  - `ctx.cinematic` holds from `fishing:caught` to the card.
- The browser walk:
  - 20 casts from the Balcony on desktop and on a phone in portrait, with one thumb: taps cast, drags look, and the look and marks work while the float waits;
  - leaving while the float waits reels in;
  - a strike and the play;
  - the present for a Small, a 45 cm fish and a pike in portrait, then Let go by its button and by a tap on the card;
  - quiet water after three bites;
  - a reload with the float out, mid-bite, and with the card open.
- `clarity-perf --aboard` at the Balcony during a play: ≤ 150 on low, and p95 ≤ 33 ms on the software-GL tier.

### 9.4 Lane I-4: what you touch: the screens from inside, the sheet's object, the pleasures, the sound (`gw-inside-touch`, M)

**Owns:**
- `src/aboard-touch.js` (new): each target's behaviour, the close looks' screens and the pleasures, driving `actors.home.parts` and the glow levels. It replaces I-2's stand-in openers.
- `src/home-prints-atlas.js` (new): draws wing I's prints into the atlas canvas from `galleryModel` and the fish art, packs their rects for I-1's quads, and defers its redraw to the present's end or the next Long Wall visit.
- `src/home-prints.js`: `galleryModel(meta, D, {blanks: true})` returns all of a wing's frames, each with `printed`.
- `src/ui-prints.js`: the print card; the 2D gallery taken out of the home flow.
- `src/ui-loop.js`: the openers exported for the aboard targets, and the fallback's wall target opening the Journal's Prints page.
- `src/ui-screens.js`: the Journal opened at a species from a print.
- `src/audio-home.js`: §7.
- `tools/tests/aboard-touch.test.mjs` (new).
- `tools/tests/loop-aboard-screens.scenario.mjs` (new).

**The sheet's seam.** The ledger and the rack call `screens.openSheet` (`SHEET.md` §2.3, §9). The sheet's lane merges before step 5d (§9.0); if it has not, they open the built gear log (`ui-gear.js`), the nearest built screen, so the lane never waits.

**MVP gate.**
- Node tests:
  - each target opens its built screen through the built opener, and returns to its place;
  - the print card reads `meta.loop.prints`;
  - the atlas packs the 16 best prints at true size into 1024 × 1024, and does not redraw during a present;
  - `galleryModel` with blanks gives 16 frames for wing I;
  - no pleasure changes `meta`.
- The browser walk:
  - **every built screen opened and closed from its thing** (the Chart, the Journal, Murk's shelf and catalogue, a print's card, the sheet from the rack and the ledger), desktop and phone;
  - every close look and every pleasure; the bunk's lie-back lasts until a tap;
  - the stove's fire is never brighter than the top of its breath.
- `audio-render.mjs --set=home` with the aboard beds: peaks ≤ −1.0 dBFS.

### 9.5 Seams

| from → to | what |
|---|---|
| the seed → everyone | `aboard-layout.js` (the boxes and eyes at a person's eye, `aboardFrameCheck`), `LOOP.aboard`, `LOOP.stern`, `TEXT_LOOP.aboard`, `actors.setAboard(on)`, render's `'aboard'` mode, `render.afterCamera(fn)`, `debug.aboard`, the barge target `[data-tile=barge]` and the stand-in director `ctx.game.aboard = {enter(), leave(), go(place), close(id), back(), active(), place(), pose()}` |
| I-1 → I-2, I-4, the validator | `actors.home.toWorld(x, y, z, out)`, `actors.home.bob`, `actors.home.parts.set(id, {lift, angle, glint})`, `actors.home.atlas(canvas, rects)`, `actors.home.calls()` (derived); `world.setMorning(k)` (question 47) |
| I-2 → I-3, I-4 | `ctx.game.aboard = {place(), go(id), close(id, {onArrive, onBack}), back(), active(), eye(), look(), yaw(), follow(point, k), lock(on), key(code)}`; events `aboard:enter {place}`, `aboard:place {place, prev}`, `aboard:close {id}`, `aboard:leave`; the aboard input layer's hand-off (a water tap to `fishing.sternPress`, a press while biting to the strike); `ctx.cinematic` kept at home while `sternActive()`; `render.getYaw()` aboard |
| I-3 → I-2 | `fishing.sternPress(e)` and `fishing.sternActive()` (the bite, the play, the present and the card only); the director hides the marks and locks the look only while it is true, and calls `fishing.setOrigin(null)` (which reels in) when you leave the Balcony |
| I-3 → I-4 | none: the stern's card (`cardActions({stern: true})`, `showCatch`'s stern branch, the catch queue at home) is all I-3's |
| I-4 ↔ the sheet's lane (`gw-mvp-sheet`) | `screens.openSheet({from: 'rack', section: 'tackle'})` on the `rack` object and `screens.openSheet({from: 'ledger'})` on the ledger (`SHEET.md` §2.3, §9) |
| everyone | the built ids `[data-tile=murk\|chart\|journal\|wall]` and the sheet's `rack` are the Jetty's own elements, placed by the director; the new ones are `[data-aboard=<id>]` and `[data-go=<place>]` |

**Who owns which hunk of the files the sheet's lane also edits** (the sheet's lane merges first):

| file | the sheet's lane (`gw-mvp-sheet`) | step 5d |
|---|---|---|
| `actors-home.js` | `rack` in `targetBoxes`' id list | I-1: everything else |
| `home-targets.js` | `TARGET_ORDER`'s `rack`, `TARGET_BOXES.rack`, `targetCorners`' id list, `frameCheck`'s `words.rack` | nobody (the seed's validator check imports it read-only) |
| `ui-loop.js` | the home pause's item, `textAllowed`'s `'sheet'`, the `rack` target, `placeTargets`' `words.rack`, `homeTargetIds` | I-2: the projector hook in `placeTargets`, the Jetty's `onKey` and `onEscape` hand-off · I-3: `cardActions({stern})` · I-4: the openers exported, the fallback's wall target |
| `ui-screens.js` | the Journal's first tab, `openSheet`, `openTackle` under the loop, the species page's link, the trip pause's item | I-3: `showCatch`'s stern branch · I-4: the Journal at a species from a print |
| `progression-loop.js` | `loop.sheet`, `loop.markSheetSeen`, `meta.loop.sheetSeen` in `freshLoop` and `migrateLoop` | I-3: `meta.loop.stern` seeded after the sheet's line, the stern's bite methods, `sternLetGo`, the audit |

### 9.6 The integration gate

1. The whole node gate (`node tools/check.mjs`) and `validate-data --loop`.
2. The v3 scenarios and the flag-off run, unchanged: none of this is built off the loop.
3. The four lanes' browser walks once more on the merged tree, on desktop and on a phone in portrait.
4. `clarity-perf --home` and `--aboard` (calls and cpuMs per place), and the 20 round trips' memory.
5. `clams.mjs --shipped=mossmere --step=5`, unchanged, and the list-count invariant of §9.3: a check that the stern did not move the economy.
6. Then the user's look: a short film of coming home, tapping the barge and going aboard (the first time, looking astern first), each place, a cast and a catch at the stern, the bench as the morning rises, and Back off the barge, on desktop and phone.

### 9.7 What stays for later

- The Well's glass hatch, with the aquarium.
- The five's beats aboard (after M1, `CHARACTERS.md` §3.5), played at the Deck or the Rail.
- The bow as an eighth place, when the bow gets its looks.
- Wings II–IV inside, and the Long Winter's 560 cm print (§13 risk 6).
- A left-handed rod and a handedness setting for the marks (a Settings row), and gyro look (opt-in).
- Rain on the roof (weather is parked).
- The ink-print beat (M1 §8 question 3).
- A 30 fps cap, and rendering on demand while nothing moves.
- A lower pixel ratio in motion on low, with fixed-size targets and a scaled viewport, if the per-place cost needs it.
- Walking aboard (parked, SPEC §9).
- The stern arc's check in `validate-data --loop` for every later water's mooring, the raft's pose aboard included. This comes automatically, since moorings are data.

## 10. Data and the save

The seed's data block, as built (`src/data.js`; the eyes, looks, fields of view and cones are `src/aboard-layout.js`'s `PLACES`, so they are written once):

```js
LOOP.aboard = {
  near: { place: 0.15, close: 0.1 }, far: 400, roll: 0, shake: 0.2, bob: 0.5,   // roll: render's title roll (off); shake: the trauma shake ×; bob: the barge's roll and pitch × on the eye
  glide: { step: 0.8, door: 1.3, turn: 0.8, rungs: 1.1, close: 0.6, back: 0.5, dip: [0.25, 0.35], settle: 0.04, sillDip: 8 },
  look: { degPerPx: 0.18, touchSweep: 0.6, spring: 0.15, damp: 6, cursor: 0, idleHint: 9, markFade: 4, closeCone: 25 },
  first: { lookAstern: 2, turn: 5 },
  barge: { glint: 0.15, glintT: 0.4, idleHint: 9 },            // the barge target on the view from the water (question 46, §2.1)
  morning: { rise: 150, back: 3, fog: 0.55, warm: 0.4, light: 0.3 },   // the morning on the bench (question 47, §5.2)
  places: {                                                      // each place's behaviour; its pose is aboard-layout.js's PLACES[id]
    deck:    { targets: ['chart', 'journal', 'door', 'rack'], go: { door: 'hearth', turn: 'balcony', right: 'rail', back: 'off' }, lamp: 'rail' },
    hearth:  { targets: ['stove', 'kettle', 'bunk', 'ledger', 'door'], go: { door: 'deck', right: 'wall', back: 'deck' }, mirror: false },
    wall:    { targets: ['wall', 'print:*', 'window'], go: { left: 'hearth', back: 'hearth' }, mirror: false },
    rail:    { targets: ['murk', 'orders', 'print:belled_matriarch', 'rungs'], go: { rungs: 'roof', back: 'deck' } },
    balcony: { targets: ['water'], go: { left: 'bench', turn: 'deck', back: 'deck' }, fade: 'waiting' },
    bench:   { targets: ['rod'], go: { right: 'balcony', back: 'deck' }, fade: 'always', morning: true },
    roof:    { targets: ['moss:1', 'moss:2', 'bell'], go: { back: 'rail' } },
  },
};
LOOP.stern = {
  bites: 3, from: 1, light: 'day', revisit: true,
  arc: { minDist: 6, half: 60, raftPad: 1.0, poleClear: 0.4 },
  raftAboard: { pole: [1.28, 8.80] },                 // the raft's heading aboard: its pole on its starboard beam (§5.1)
  bring: { bearing: 40, dist: 2.6, from: 0.6 },       // the play's last 40%, led round to the port quarter (§5.5)
  spawn: { margin: 15, ahead: 75, clear: 2 },
  present: { hands: 0.45, arms: 0.90, at: 0.45, kneel: 1.10 },   // a person's scale (question 45, §5.6): L in m, the hands' distance, the kneeling eye
  rod: { len: [2.4, 2.55, 2.7], grip: [0.22, -0.5, 0.45] },       // a person's rod by tier, and its grip from the eye (right, up, forward; §5.4)
};
TEXT_LOOP.aboard = { barge: 'Go aboard', back: 'Back', turn: 'Turn', places: { deck: 'The stern deck', hearth: 'The hearth', wall: 'The Long Wall',
  rail: 'The rail', balcony: 'The balcony', bench: 'The bench', roof: 'The roof' } };   // accessible names only, never drawn
```

`back: 'off'` at the Deck is the step off the barge (question 46). The close looks' poses are `aboard-layout.js`'s `CLOSE` (the first six) and I-2's and I-4's for the rest.

**The save.**
- One new field, `meta.loop.stern = {evening, spent, seen, boarded}`.
  - `spent` is the dawn's good bites used. It resets whenever `evening` differs from `meta.loop.evenings`. A bite is added when it opens and saved at once; a reload that finds it open gives it back.
  - `seen` is true once the Balcony has been visited (the Turn mark's glint, §2.6).
  - `boarded` is true once you have been aboard (question 46: until then the barge's windows glint once a visit on the view from the water, §2.1).
  - `freshLoop` and `migrateLoop` seed it as `{evening: 0, spent: 0, seen: false, boarded: false}` for every block, with no schema step (as `meta.loop.finds` was). I-3 seeds it; I-2 sets `seen` and `boarded`.
- Nothing else is saved: Continue lands on the view from the water.

**Words.**
- No new words appear on screen: only the three built tile words, and the card's built **Let go**. The barge target is wordless.
- The accessible names live in `TEXT_LOOP.aboard`. `textAllowed` treats them as it treats the Jetty's wall name today: they are never drawn.

## 11. What this changes elsewhere (applied in this commit)

- **SPEC.md**:
  - §0 row 39, the user's words. Row 38 is the sheet's: the same message's first half (`SHEET.md`, SPEC v8.8).
  - Decisions 111–122. Decisions 105–110 are the sheet's rulings on the same message.
  - §0.15 (v8.9).
  - §3.3: the stern's good bites.
  - §3.4: first light at the stern.
  - §6.1: the stages table, and the home flow's "never casts".
  - §6.2: the rod's rows.
  - §6.3: wing I's walls, and the Long Winter's note.
  - §6.6, new: aboard and the stern line, a summary.
  - §8.2: the stern's card.
  - §8.3: aboard's rows.
  - §9: the save's `stern`.
  - §13: M1 step 5d, with step 5's "left out" amended.
  - §16: question 17 answered; questions 44–47 new. Questions 41–43 are the sheet's.
- **M1.md**, revision 10 (revision 9 is the sheet's):
  - the header;
  - §0, the words;
  - §1, the 5d row;
  - §2.6, the boxes;
  - §2.8, the screens;
  - §2.10, words;
  - §2.11, the save;
  - §2.14, budgets;
  - §4, step 5d;
  - §8 question 5, answered.
- **CONTRACT.md**: §14.20, placed after §14.12 (the barge it extends): the seam whole.
- **OPENING.md**: one line each in §6.2 (the first visit home) and §9 (what a returning player sees): the dip aboard after the first tally, and Continue landing aboard.
- **At the user's answers** (17 November 2026, the seed on `gw-inside`): SPEC §16 questions 44–47 answered, and amended in place to them decisions 111–113 and 117, §0.15, §6.1's stages row, §6.2's rod row, §6.6, §8.3's aboard row, §9's `stern` and §13's step 5d; M1 revision 11 (its header note, §2.6's step 5d boxes, §2.11's save line and §4 step 5d); `CONTRACT.md` §14.20 (the barge target, the person's eye, `world.setMorning`, the seed's files); `OPENING.md` §6.2 and §9 (going aboard by a tap, Continue on the view from the water).
- **Not changed**: `WATERCRAFT.md` (read only: the stern uses its areas and hook table as they are), `SHEET.md` (its §2.3 cites the ledger at "27% across" the Hearth; it is now 39%, for the sheet's owner to update), `LORE.md`, `FINDS.md`, `AQUARIUM.md`, and every `src/` or `tools/` file.

## 12. Questions only the user can answer: answered (17 November 2026)

44. **Fish off the stern: what may they be?**
    - **Answered: "Let go, known fish"**, the default. Only fish you have already landed on a trip bite at the stern. Each catch writes its best, its class seals and its print on the Long Wall, and nothing is paid. A fish's first landing, and the water's list that opens the next water, stay the trip's. Three good bites a dawn, then quiet water's rule (§5.3, §5.7).
    - Not chosen: a stern that discovers too (first landings and list ticks at home, needing the sim re-run with a porch player), or keeping and selling them to Murk over the rail (about +70% clams a visit at first, *est.*).
45. **Whose eye?**
    - **Answered: "A person's"**, about 1.5 m, not the Wick's 0.78 m. Every place's eye and look is re-derived at a person's eye, measured against the cabin's real ceiling and the door's 1.48 m (§3.0–§3.2, Appendix A.2): 1.50 m standing at five places, the Deck 1.38 m under the awning's sag, the Bench seated (1.25 m over its boards), the door's glide stooping to 1.30 m. The barge and its furniture stay people-sized, so it reads cosier and smaller; the gallery's rail and bench are made people-sized; the hands and the rod are drawn at a person's scale (§5.4, §5.6, §6.6). The barge's outside silhouette is unchanged.
    - Not chosen: the Wick's eye, 0.78 m over what it stands on (the stove taller than you, the chart table's top at your eye, crates for steps).
46. **After the tally: aboard at once?**
    - **Answered: "Only when I tap the barge."** The view from the water stays home's view after the tally and on Continue, with its targets; a tap or click on the barge itself (a new wordless target over its lit windows) steps aboard by the ink dip; Back at the Deck and Escape there step off to the view from the water; Sail from inside dips out to the trip as designed (§2).
    - Not chosen: aboard at once by a dip on Sold.
47. **The sky at home.**
    - **Answered: "Morning rises on the bench."** While you sit on the Bench the morning comes up slowly (the mist thinning, the light warming), and it goes back to first light when you get up; no clock moves (§5.2). Built in this step (lane I-1's `world.setMorning`, driven by lane I-2's bench state), no longer later.
    - Not chosen: first light, held.

## 13. Risks

1. **Fishing assumes a trip throughout** (`playing()`, `LOOP()`, `run()`, the cove path in `measure()`). A missed site would cast from the raft, spend a trip's bite or bank Memories at home.
   - Mitigation: I-3's first commit is the audit table of every site, locked by a node test; an explicit fishing mode; `origin()` and `raft()` kept apart; the 300-bite test through the real ledger.
2. **The low tier's 150-call line is tight** (the arrival shot is at 144 on a phone now), and aboard the cost moves to fill.
   - Mitigations: the Wick hidden; the atlas culled outside the cabin; the mirror weight in the cabin; the water and the ink drawn after the timber aboard; each place measured for calls and cpuMs.
   - If it still fails, the knobs in order: the tells off at the stern on low; the candles' glow merged; the atlas only at the Long Wall; a lower pixel ratio in motion on low with fixed-size targets (§9.7).
3. **Portrait first person is narrow.**
   - Mitigations: a portrait look on each hero (and the Hearth's own portrait eye), the cone and the track under one thumb, the marks in the lower third and Turn and Back at the bottom centre.
4. **A people's barge is low at a person's eye** (question 45; revision 2's risk, a Wick's eye seeing table tops edge-on, is gone: you stand over them).
   - The awning caps the Deck at 1.38 m, the door makes its glide stoop, and the cabin's ceiling is 0.29–0.35 m over a standing eye.
   - Mitigations: every eye measured with 0.15 m to every overhead and box, a node test against the built mesh (`aboard-layout.test.mjs`); the stoop eased over the door's depth with the look leading; I-1's look sheets judge the Deck under the canvas. If it reads cramped, the Deck's eye moves forward to (1.30, 1.89, 3.62), 1.47 m, and the door becomes a drag right (§9.1).
5. **The banked fire's story** (`LORE.md` §8): Murk rakes the fire open once, at the end of the road.
   - The stove's pleasure only breathes. A test checks that no aboard path raises the stove's glow above the top of its breath.
6. **The Long Winter's 560 cm print** belongs to wing II (the Rime Sound, reach II), but the starboard wall is only 5.7 m inside.
   - Either it runs the wall's length above the windows, on a print rail under the beams, or wing II moves to the hull's side. This is decided with reach II.
   - SPEC §6.3's "the cabin's 8 m wall" is corrected.
7. **Motion sickness.**
   - Mitigations: no head bob, the barge's roll ×0.5 on the eye, the shake ×0.2, no cursor-follow, and glides with the look leading. Reduced motion uses dips and no roll. The door's glide turns 180° over its last metre (1.3 s): its look sheets and the walk check it, and it falls back to a dip through the door if it reads badly.
8. **Merge conflicts with the sheet's design and lane**, which answer the same message and edit the same files.
   - The sheet took row 38, §0.14, decisions 105–110, questions 41–43 and M1 revision 9 (`gw-design-sheet`, 550c5c5). This design takes row 39, §0.15, decisions 111–122, questions 44–47 and M1 revision 10, so the two documents merge side by side; only the adjacent insertions need a hand merge.
   - The code lanes merge in order (the sheet's first) with every shared file's hunks named (§9.5).
9. **The arrival shot changes**: the gallery, the bench, the open door's interior.
   - The 5b pairs and `frameCheck` are taken again in I-1. The lectern does not move.
10. **The raft turns under the dip.** If its turn reads in the arrival shot after Sail (it turns back under the dip out), the pole's strip stays out of the arc instead, at the built heading; the Balcony's look then moves 10° right. The look sheets decide.
11. **The barge target has no word** (question 46). A new player may not know the barge can be tapped.
   - Mitigations: its windows brighten on hover or touch-down and glint once a visit until the first time aboard (§2.1); the user asked for exactly this way in.

## Appendix A. The measured figures, and how to re-run them

### A.1 Revision 2's figures (the Wick's eye; the mooring, the stern's water, the raft, the arrival frame)

These are scratch probes, run read-only against `/home/user/Study-App/.gw-wt/m1-mvp/gloomwater` at c34557d. They are not committed: they are a design's arithmetic, and I-1's and I-2's node tests and the validator replace them.

**The mooring** (`data.loopMooring('mossmere', …)` with world-layout's docks):
- The hull is at (18.03, 44.46), yaw 2.396, so the stern faces world (0.678, −0.735).
- The raft is at the Jetty (24, 38): local (0, 8.80), 2.80 m off the transom.
- Murk is at local (4.71, −2.02).
- The home camera is 12.8 m from the stern, at 39° to starboard: landscape pos (23.01, 5.5, 27.28), fov 38; portrait pos (29.23, 4.5, 23.49), fov 62.

**The view astern** (bearings from the stern's centre):

| what | distance | bearing |
|---|---|---|
| the Sluice Veil (58, 4) | 50.9 m | 2° |
| the inflow's centre | 48.1 m | — |
| the lily bed (40, 28) | 21.6 m | 13° right |
| Root Isle (34, 20, r 5) | 23.3 m | 12° left |
| the Drowned Gatehouse | 52.1 m | 43° left |
| the Bell Pool | 60.0 m | 68° left |
| the shore | 53 m / 37 m / 27.5 m / 21.5 m | dead astern / 20° right / 40° / 60° |

The port rail is 11.8 m from the shore; the starboard rail 14.6 m.

**The stern's water**: `watercraft.areaAt` over a 0.5 m grid from the Balcony's eye, from 6 m out to the rod's reach, ±60° of astern, with the raft's circle plus 1 m excluded (§5.3's table). Re-run on c34557d: unchanged from b527fae.

**The raft from the Balcony**: 2.88 m at 17.2° left, half-angle 33.8°, far edge 4.48 m. At the built tie-up heading (the dock's yaw 0.563): the pole's foot 6.1° right at 3.27 m, its top 2.9° right, the lantern's hook 4.0° left at 3.00 m. At `LOOP.stern.raftAboard`: the pole 37.8° left at 3.48 m, the lantern 29.1° left at 3.15 m; from the Bench, 14.4° and 4.3° left. The bring point at 40° right, 2.6 m: 1.03 m clear of the raft's circle, 2.31 m of the aft hull circle, 1.92 m of the gallery.

**The arrival shot's targets** (`frameCheck`'s own steps, the sheet's rack added, at all eight validator sizes): with the lectern as built, no raw overlap and the layout passes everywhere. With it moved to (−1.15, 3.35): the Journal overlaps the chart table at all eight and the rack at 358 × 664, 358 × 775, 390 × 844 and 390 × 664. The gallery and bench at 1280 × 720: the gallery 319–543 × 392–504 px, the bench 447–511 × 401–458 px, the chart table's top 389–474 × 356–390 px.

**The places' framing**: `home-targets.js`'s `project` and `rectOf` on §3.1's boxes through §3.2's poses at 1280 × 720 and 1920 × 1080 (fov 52°), 390 × 844 and 358 × 664 (fov 66–68°), then raw overlaps and `layoutTargets` (min 44 px) with the places' targets as its order. Every place passes at all four with no raw overlap.

**The home frame's calls**: `clarity-perf.scenario.mjs --home` on the published preview build (`tools/out/preview/dev.html`, c34557d), its frames written to the scratchpad. First light: desktop 960 × 540, low 144 (the barge 4 main, 0 mirror, 0 shadow; its cpu share 8%), medium 227 (the barge 4 / 2 / 1), high 228; phone, low 144 (the barge 4 / 0 / 0). No PointLight of the barge's; Murk's lamp at 0.

**The Wick's eye**: in `actors-wick.js`, the head is at y 0.5 and the eyes 0.14 above it; `actors.js` draws the Wick × 1.22 on the raft. So the eye is 0.78 m above its feet.

**The code counts** (for I-3's audit): in `fishing.js`, 48 `LOOP()`, 36 `run()` and 10 `playing()` sites; in `progression-loop.js`, 32 `onTrip(` sites.

### A.2 At a person's eye (the user's answer to question 45; re-run on abe394b, 17 November 2026)

**How.** Scratch probes, run read-only against `/home/user/Study-App/.gw-wt/inside/gloomwater` (abe394b with the design merged), then replaced by the committed `tools/tests/aboard-layout.test.mjs`, which re-runs them on every check:
- the barge built in node (`createHome`, every home upgrade and found part owned), its timber mesh's triangles;
- **the overhead**: a ray straight up from each eye through the mesh, the first hit;
- **the clearance**: the closest point on every triangle to the eye (the doorway's dark box and its leaf as built are left out: step 5d removes the one and re-hangs the other, §3.1);
- **the framing**: `aboardFrameCheck` (`project`, `rectOf`, `layoutTargets` through each place's pose at the mooring) at 1280 × 720, 1920 × 1080, 390 × 844 and 358 × 664.

**The cabin's ceiling** (the roof's underside, its camber; the ray up from y 1.0 at every z of the cabin): 2.208 at |x| 1.2, 2.235 at 0.9, 2.253 at 0.6, 2.264 at 0.3, 2.270 amidships. The walls' top plates are at 2.16; the floor is the deck, 0.42.

**The awning's underside** (the ray up, x across): at z 3.0 from 2.09 (amidships) to 2.15 (x ±1.4); z 3.5, 2.00–2.09; z 4.0, 1.94–2.03; z 4.3–4.85, 1.91–2.00; z 5.1–5.45, 1.91–1.94 (its hem). So a 1.5 m eye (y 1.92) fits under it with 0.15 m to spare only forward of z ≈ 3.6, and only off its sagging middle.

**The door**: the lintel's underside 1.890 from z 2.15 to 2.30 (the ray up at x −0.6…0.0); the leaf as built swings in across the doorway, its free edge at (−0.55, 1.82), 0.15 m from the port jamb.

**The places** (`PLACES`; the eye, its floor, the overhead, the margin, the nearest box of §3.1 and the nearest built timber):

| place | eye y | over the floor | overhead (mesh) | margin | nearest box | nearest timber |
|---|---|---|---|---|---|---|
| Deck | 1.80 | 1.38 | 1.959 (the awning) | 0.159 | the starboard awning pole, 0.47 | 0.159 (the canvas) |
| Hearth | 1.92 | 1.50 | 2.264 (the roof) | 0.344 | a beam (z −1.95), 0.26 | 0.344 |
| Hearth, portrait | 1.92 | 1.50 | 2.267 | 0.347 | the fore bulkhead's frames, 0.20 | 0.220 |
| Long Wall (rest) | 1.92 | 1.50 | 2.264 | 0.344 (0.16 under each beam it passes) | the skylight, 0.38 | 0.344 |
| Rail | 1.92 | 1.50 | 2.246 (the roof's mossy lip) | 0.326 | the cabin's starboard wall, 0.19 | 0.190 |
| Balcony | 2.10 | 1.50 (on the gallery) | none | — | the gallery's port rail, 0.82 | 0.583 |
| Bench | 1.85 | 1.25 seated | none | — | the bench's back, 0.52 | 0.255 (the awning's hem) |
| Roof | 3.87 | 1.50 (on the roof, 2.37) | none | — | the pipe, 0.55 | 0.679 |

The close looks: the chart table's eye 0.18 m from the timber under an awning 1.98 overhead; the Journal's 0.21 under 2.07; the rack's 0.27 under 2.12; the ledger's 0.52; the bunk's 0.35; the window's 0.37.

**The Deck's search**: every point of the stern deck at 5 cm, with the eye 1.5 m or the highest that clears the awning by 0.15 m, and every look (yaw at 3°, pitch at 2°): one 52° landscape frame holds the chart table, the rack and the door, 8 px in from every edge, from 16 points only, all aft of z 4.8 on the starboard side, their eyes 1.36–1.39 m. Forward of z 3.6, where 1.5 m fits, the chart table's far corner and the door's starboard jamb are 86° apart. The Deck takes (1.40, 4.85): 1.38 m, 0.16 m under the canvas.

**The door's glide** (`DOOR_GLIDE`, sampled at 400 points): the eye's highest through the door's depth (z 2.13…2.37) is 1.72, 0.17 m under the lintel, the head (0.13 m over the eye) at 1.85; the nearest box anywhere on it is a beam, 0.16 m. The nearest built timber is the leaf as hung (0.02 m), which is why I-1 re-hangs it.

**The barge target** (`TARGET_BOXES.barge`): seven boxes tried through the mooring's camera at the validator's fifteen sizes with the five built targets and their words. The cabin's forward half, its middle and the hull forward each overlapped the lectern's box at 10–15 sizes; the forward roof and **the cabin's starboard windows** (x 1.10…1.45, y 1.05…2.30, z −3.20…0.50) passed at all fifteen, raw and laid out with int-C's word rules. The windows are taken: they are the barge's own light.

**The arrival frame with the people-sized gallery** (the rail's cap 1.36, the bench's back 1.36): at 1280 × 720 the chart table's top spans y 360–381 px and its target 384–481 × 350–439; the bench's back tops out at 389 px, below it; the gallery's forward port post rises at x 385, the table's port end. At 690 × 760: the top 387–394, the bench from 393. At 390 × 844: 419–424, the bench from 424. At a rail of 0.88 m over the boards the bench's back would cross the table's top (379 px at 1280 × 720), so the gallery's rail is 0.76 m.

**The stern's view** (1280 × 720, landscape): from the Balcony the Veil at 51% across and 30% down, Root Isle 35%, the lily bed 61%, the raft's deck at the frame's foot (34%, 96% down), its lantern aboard at 12%; from the Bench the Veil 53% (41% down), Root Isle 39%, the lily bed 64%, the lantern over the rail 37%.

## Appendix B. The reviews of revision 1, and what was done

Two reviews read revision 1: one for the player's pleasure, one for whether the four lanes can build it. Every blocker and major held and is applied; so is every minor but the one noted.

**The design review (the player's pleasure)**

| finding | held? | what was done | where |
|---|---|---|---|
| Major: drag-to-aim fights drag-to-look at the Balcony; `sternActive()` undefined, so the look and marks lock while the float waits | yes | a tap on the water casts, a drag anywhere looks; `sternActive()` is the bite, the play, the present and the card; while the float waits the look and marks work and leaving reels in; a phone-portrait one-thumb check in I-3's walk | §3.3, §5.4, §5.5, §9.3 |
| Major: the rod in hand is a target where the right thumb casts | yes | no `rod` target at the Balcony; the Bench by the left mark; the rod in its holder stays the Bench's way back | §4.2, §5.4 |
| Major: the side bench seats the Wick sideways, has no back, and its bollard target is behind the eye | yes | the Wicks' bench across the gallery's forward edge facing astern, with its own back; measured framing for the Bench; the bollard is dressing (exactly abeam); the arrival shot measured with the bench | §3.2, §5.1, §5.2, Appendix A |
| Major: "the stove is taller than you" was false (0.75 m stove, 0.78 m eye) | yes | the stove is a people's pot-belly of 1.05 m: its door at the Wick's chest, the kettle above the eye; the Hearth re-measured | §3.0, §3.1, §3.2, §12 q45 |
| Major: nothing shows the balcony | yes | the first time aboard looks astern first, then turns to the door; the Turn mark glints first until the Balcony is visited (`meta.loop.stern.seen`) | §2.6, §4.1, §10 |
| Major: stern catches use up first landings and tick the list | yes | revisit only by default (Journal `caught > 0`); bests, seals and prints still write; the list and first landings stay the water's; question 44 names the choices | §5.3, §5.7, §12 q44 |
| Minor: two taps and 3 s more for Murk every visit | yes | the Deck's right-edge lamp glides to the Rail and opens the shelf; closing glides back | §3.3, §4.2 |
| Minor: cursor-follow slides targets under the pointer | yes | no cursor-follow (shipped off) | §3.4 |
| Minor: "its edge brightens" invites a rim | yes | the whole lit side brightens, emissive on the surface; I-1's sheets check it | §4.1, §9.1 |
| Minor: marks always on screen at the view; the bunk timed | yes | marks fade after 4 s at the Bench and the waiting Balcony; the bunk lasts until a tap | §3.3, §4.4 |
| Minor: up to three rods in one frame | yes, in part | the one-rod rule written once: aboard one rod; the holder always empty in third person. The arrival shot keeps 5b's built pair (the Wick's rod on the raft, the owned rod on the rack), which the user has seen and which is not this design's to change | §2.3 |
| Minor: the dozing Wicks missing from the Hearth's measured frames | yes | measured in both; they doze on the bunk's foot (as the brief and the built window flames have them), and the Hearth's portrait eye holds the stove and them together | §3.1, §3.2 |
| Minor: Back at the far corner for a right thumb | yes | Back just right of Turn at the bottom centre | §3.3 |
| Minor: a one-choice button on every stern card | yes | a tap anywhere on the card lets go too; the button stays for clarity and keys | §5.6 |

**The build review (can the lanes build it)**

| finding | held? | what was done | where |
|---|---|---|---|
| Blocker: fishing assumes a trip at 48 + 36 + 10 sites and 32 `onTrip()`; `measure()` with no run takes the cove branch | yes (counted) | I-3's first commit is the audit table, locked by a node test; an explicit fishing mode; a real stern branch in `measure()`; lure and bait from `meta.loop.fitted`; no Memories, `meta.runs` or challenges in the 300-bite test | §5.7, §9.3, §13 |
| Blocker: the catch card cannot open at home (`ui.js`'s queue and HUD), and no lane owns `ui.js` | yes (read at `ui.js` 718–722, 936–941) | `ui.js`, `ui-hud-v3.js`, `ui-measure.js`, `showCatch`'s stern branch and `cardActions({stern})` are I-3's; the queue drains at home while `sternActive()`; `sternLetGo`, not `letGo` | §5.6, §9.3, §9.5 |
| Major: the Jetty's layer eats the pointer; `pressAction` returns early at home; its keys run first | yes (read) | an aboard input layer inside the Jetty's body, owned by `ui-aboard.js`; the Jetty's `onKey` and `onEscape` hand off to the director (I-2's hunk); the strike wins while biting | §3.3, §9.2, §9.5 |
| Major: `ctx.cinematic` cleared every frame in flow `home` | yes (read at `main.js` 1213) | main's exception for `home` while `sternActive()`; a stern test from `fishing:caught` to the card | §5.5, §9.2, §9.3 |
| Major: the sim is not unchanged: stern catches tick the list | yes | the revisit rule makes `listCount` invariant; the invariant in the 300-bite test and the integration gate; the porch sim only for question 44's other way | §5.7, §9.6, §12 q44 |
| Major: the line and the play run under the raft; the ring rule measured from the origin; silhouettes spawn round the camera | yes (measured) | `origin()` and `raft()` apart; the play led round to the port quarter; `ringOk` gains the hull and the gallery; spawn in the arc ahead of the eye. The raft's pole and lantern stand dead astern at the built heading, so the raft lies pole-out aboard and the arc leaves out their strip | §5.1, §5.3, §5.5 |
| Major: the mirror switch recompiles the water's shader | yes (read at `water.js` 184–215) | a uniform weight and a skipped render, no define change; a program-count gate | §8.3, §9.2 |
| Major: a pixel-ratio change in motion reallocates every target | yes (read at `render.js` 226–238) | dropped from the MVP; a no-target-created gate | §8.3, §9.7 |
| Major: the per-place gate counts calls while the cost is fill | yes | the water and the ink after the timber aboard; cpuMs per place against the arrival shot; p95 ≤ 33 ms on the software-GL tier per place | §8.2, §8.3, §9.1 |
| Major: gate ordering (I-2 needs I-4's screens; I-1 needs I-3's hidden Wick) | yes | the seed commit carries `actors.setAboard` and the camera mode; the screens' line is I-4's gate; I-2 opens the Chart through a stand-in | §9.0–§9.4 |
| Major: targets overlap by construction (the basket and the stove, the kettle, the stones and the door) | yes (measured) | the basket on the bunk's foot; the stove's door and the kettle as separate small targets, measured clear; the stones fold into the door's glide; every place re-measured at four sizes | §3.1, §3.2, §4.2 |
| Major: duplicate `data-tile` elements; seven scenarios break | yes | the director places the Jetty's own elements through a projector hook; `debug.aboard.go(place)` and the seven scenarios are I-2's | §2.3, §2.5, §9.2 |
| Major: the moved lectern may break the arrival and tutorial frames | yes (measured: it overlaps the chart table at all eight sizes) | the lectern stays; the Deck frames the Chart and the Journal is a drag right | §2.3, §3.2 |
| Major: the sheet's lane edits five of the same files | yes | a hunks table and the merge order (the sheet's lane first) | §9.0, §9.5 |
| Minor: near 0.08 with far 900 | yes | far 400 aboard; near 0.15 at places, 0.08 at the stern and in close looks | §8.3 |
| Minor: the floor clamp, roll, shake and `getYaw()` | yes | the pose after the clamp; no sway or roll; shake ×0.2; `getYaw()` returns the director's yaw | §9.2 |
| Minor: 20 parts against 16 slots; rod and hands cost 2 calls | yes | 24 slots of one vec4, pivots and axes baked into attributes; rod and hands one mesh and one ink, 2 calls | §6.6, §8.2 |
| Minor: `calls()` is a constant | yes | derived from the meshes; the gate on the measured share | §8.2, §9.1 |
| Minor: the atlas redraw and variant rebuild land in the present | yes | deferred to the present's end or the next Long Wall visit; candles by glint | §8.2, §9.4 |
| Minor: `galleryModel` lacks blank frames; the fallback's wall target; the stern's save timing | yes | `galleryModel({blanks: true})`; the fallback's wall opens the Prints page; the count saved when a bite opens | §2.3, §2.4, §9.4 |
| Minor: the validator ignores the Jetty's chrome; the veil darkens the near water | yes | the chrome reserved at all four sizes; aboard's own lighter veil | §6.1, §8.4 |
| Re-measure on 3cb9539 | yes | every node-measured figure re-run on c34557d (3cb9539 plus the CSP fix): the stern's areas are unchanged; the places, the arrival frame and the raft are new measurements | Appendix A |
