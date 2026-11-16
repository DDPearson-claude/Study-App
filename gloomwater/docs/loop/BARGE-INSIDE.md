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

## 0. The user's words, and what each becomes

> "Also I want to be able to be inside my barge. We dont need to be able to physically move around inside it, but I want
> atleast interiors of our barge where we can see our home, Interact with aspects of it and move to different sections of
> our barge. There should also be a balcony area or viewing area at the rear where we can stand and fish and also just look
> out at the scenery if we want. All of this should be from a first person perspective." (16 November 2026)

| the user | what it becomes | where |
|---|---|---|
| "be inside my barge" | **Aboard.** After the tally, one ink dip takes you aboard the Slow Hearth in first person, and you stay aboard until you Sail | §2 |
| "We dont need to be able to physically move around inside it" | **Seven places and no walking.** The eye glides between fixed viewpoints, and you drag to look within each one. The walked barge stays parked | §3 |
| "interiors of our barge where we can see our home" | **The cabin, built inside**: the stove with Murk's banked fire, taller than you; the Wick's bunk with the four other Wicks dozing in a basket at its foot; the desk and its ledger; the Long Wall's prints at true size on the port wall; the beams; windows that look out | §3.1, §6 |
| "Interact with aspects of it" | **Things you touch.** Each built screen opens from its object: the Chart, the Journal, Murk's shelf and catalogue, and the sheet. You can lean in to each print. Small pleasures change nothing: the stove door, the kettle, a Wick stirring, lying on the bunk, the window, the moss, the bell | §4 |
| "move to different sections of our barge" | **Tap a doorway or a mark**: the door, the rungs to the roof, an edge mark with its place's glyph, Turn and Back. Keys work too | §3.3 |
| "a balcony area or viewing area at the rear" | **The stern gallery, new**: a railed porch over the rudder, with a low bench across its forward edge facing the lake and a holder for the rod | §5.1 |
| "where we can stand and fish" | **The stern line.** At the gallery's rail, tap the water to cast; drag anywhere to look. Fish with the rod you own, in first person. Let go only, three good bites a dawn | §5.3–§5.7 |
| "and also just look out at the scenery" | **The Bench.** Sit facing astern and look round freely: the Sluice Veil's falls dead ahead, Root Isle and the lily bed either side, your raft and its lantern below, the awning's edge overhead. The marks fade away while you sit | §5.2 |
| "All of this should be from a first person perspective" | **The Wick's own eye everywhere aboard**, including the cast, the play and the catch (the fish is shown in the Wick's hands). Third person stays on the water, and under the tally as the arrival shot | §2.3, §5.6 |
| (the same message) "a master character sheet or stats page" | The sheet's screen is `SHEET.md`'s. Its home aboard is the ledger on the Wick's desk, and the rod rack by the cabin door opens it at Tackle (`SHEET.md` §2.3's seam) | §4.3 |

**Rulings this reverses** (each amended in place, §11):
- M1 §8 question 5 and SPEC §16 question 17. Their default was "no cast at home"; the user's words reverse it.
- M1 §2.6's box "No cast at home".
- `loop-5a.scenario.mjs`'s "no cast at home" check.
- SPEC §6.1's "a press anywhere else at home does nothing, and never casts".

## 1. The design on one page

- **Aboard is the home flow's inside.**
  - The flow stays `home` and the scene is the same water scene, so nothing loads.
  - The sail home, its glide and the tally over the mooring's framing are as built.
  - On **Sold**, a 0.6 s ink dip puts you aboard on the stern deck, in the Wick's eye.
  - Sail dips you back out to the mooring's framing, and the glide out runs as built.
- **A Wick's eye in a people's barge.**
  - A Wick stands knee-high to the people who built the barge (`LORE.md` §2: "a Wick stands about knee-high to them").
  - So the eye is the Wick's: 0.78 m above whatever it stands on.
  - The stove (1.05 m) is taller than you, its door at your chest and its kettle above your eye. The chart table's top is at your eye. Each place stands the Wick on the floor or on something the Wicks put there: a crate at the rail, the chair's cushions, a bench of a plank on crates.
- **Seven places**:
  - the Deck, the hub under the awning;
  - the Hearth and the Long Wall, in the cabin;
  - the Rail, with Murk alongside;
  - the Balcony, fishing at the gallery's rail;
  - the Bench, sitting and looking;
  - the Roof, with the Bait Bed.

  Glides between them take 0.8–1.3 s with the look leading; under reduced motion each is an ink dip. Within a place you drag to look inside a cone, and at the Long Wall the eye slides along the wall.
- **Things you touch** are DOM buttons over their objects, as the Jetty's are: the Jetty's own tile elements, moved by the director, plus new wordless ones.
  - Each is at least 44 px, and no two overlap at any of four screen sizes (*measured*).
  - Murk, Chart and Journal keep their built ids and words.
  - They are signalled by light, lift and flicker, never a ring, an outline or a rim.
  - A tap leans the eye in (a close look) and then opens the built screen over it.
- **The stern line.** At the Balcony you tap the water to cast; a drag anywhere looks.
  - The float, the bite, the strike tap and the automatic play are fishing's own, from a new origin, in an explicit fishing mode `'stern'`.
  - The catch is shown in the Wick's hands or on the boards. Its card's one button is **Let go**, and a tap anywhere on it lets go too.
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

### 2.1 Coming home from a trip

| beat | what you see | camera | time |
|---|---|---|---|
| the sail home | As built: the 2 s glide to the stern. The raft ties at the Jetty, off the transom | `'sail'`, then `'home'` (the mooring's framing, a 1.2 s ease) | 2 s |
| the tally | As built, over the mooring's framing at first light. This is **the arrival shot**: home seen from the water, with every light and look you have bought | `'home'` | the tally's own |
| **Sold** | One ink dip: 0.25 s to the violet ink, then the swap, held until the first frame aboard is drawn, then 0.35 s back. You are aboard at **the Deck**, by the gallery's step, looking forward across the chart table to the open door with the stove's glow inside | `'aboard'` | 0.6 s |

- Under the dip the Wick's own model, its rod and its flame hide, and stay hidden while aboard (you are the Wick).
- Under the dip the raft turns on its rope to lie with its pole on its far side (§5.1), and it turns back under the dip out.
- The raft stays tied below the stern with its lantern lit, the one warm light on the water, as built.
- With an empty hold: the tally's Murk line and **Sold**, then the same dip.
- A tap during the dip is held and does nothing. The dip never strands you: a reload during it lands aboard (§2.4).

### 2.2 Leaving: Sail

- Sail is pressed on the Chart, which you open from the chart table (§4.2).
- The Chart closes. **The dip out** (0.6 s) puts the camera back on the mooring's framing, with the Wick on the raft.
- The glide out then runs as built: the home pose eases out over the glide's first 0.6 s (`render.js`).
- A tow (a new water's first Sail, after M1) and the way back by the lamps start from that same framing, as they do today.
- No way out of the home flow leaves the Wick hidden: `aboard:leave` shows it again on every exit (Sail, the title, a tow).

### 2.3 Today's third-person home view: what stays

- **It stays as the arrival shot** under the tally (§2.1).
  - The 5b before-and-after pairs of every purchase are still taken there.
  - The new stern gallery and its low bench join that frame (*measured* at 1280 × 720: the gallery 224 × 112 px, the bench 64 × 57 px, below the chart table's top, so the tutorial's chart target is not covered).
  - **The lectern stays where it is built** (1.25, 3.00), on the deck's starboard side. *Measured*: moved to the port side, its target box overlaps the chart table's at all eight validator sizes and the sheet's rack at the four phone sizes, so `frameCheck` would fail. Instead the Deck's look is chosen for the Chart (§3.2).
- **It stays for the tutorial.** The opening's glide in and the chart beat over the moored barge run exactly as built, before the first Sail. They keep the chart table's target (`[data-tile=chart]`) and its breathe. The first time aboard is the first dawn home (§2.6).
- **Its DOM targets are the aboard targets.** Aboard, the director takes the Jetty's own tile elements (`[data-tile=murk|chart|journal|wall]`, and the sheet's `rack`) and places each over its object at its own place, through a projector hook in `placeTargets` (§9.5). No element is duplicated, so every selector still matches one element.
- **The fallback.** When the aboard view cannot start (no mooring, or the director refuses), the Jetty keeps the third-person targets as they are today, with a reported error and never a stranded screen. Its wall target then opens the Journal's Prints page, since the 2D gallery leaves home (§4.2).
- **The one rod.**
  - In third person (the arrival shot, the tutorial, the fallback) the Wick holds its rod on the raft and the rack shows the rod you own, as 5b built them. The gallery's holder is always empty in third person.
  - Aboard the Wick is hidden and the rod is drawn once: on the rack's top peg, in your hands at the Balcony, or in its holder at the Bench. The rack's top peg is empty while the rod is in your hands or in the holder.

### 2.4 Continue and reload

| at the close | Continue lands |
|---|---|
| home, the tutorial done, nothing open | aboard at the Deck, in its authored look (a cut; no dip from the title) |
| home with the tally unseen | the tally over the arrival shot, then **Sold** and the dip aboard |
| home mid-dip, mid-glide or in a close look | aboard at the Deck |
| home with a screen open (the Chart, the shelf, the Journal, the sheet) | aboard at the Deck, with the screen closed (as the Jetty does today) |
| home at the stern with the float waiting | aboard at the Balcony, with the line in |
| home at the stern with a bite open or the play running | aboard at the Balcony, with the line in. The open bite goes back to the dawn's count, as a trip refunds one |
| home with the stern's card open | aboard at the Balcony, with the fish let go (its records were written at the measure) |
| home before the first Sail (the tutorial) | as built: the chart beat over the barge, in third person |
| on a trip | as built |

- **The count is saved at once.** A good bite is counted when it opens and saved then, and given back only if a reload finds it open. So a reload never refunds a bite that closed (`meta.loop.stern`, §10). There is no autosave at home without a run, so the stern line saves for itself.
- Where you were aboard is not saved: home always opens at the Deck. A remembered last place is not worth a save field.

### 2.5 The tutorial

Nothing in the tutorial changes.
- **When its beats play**: all of them (the wake at the Landing, the tow, the glide in, the chart beat over the barge, and out) happen before the first Sail, in the views they use today.
- **Its clock** still runs only while the top screen is the Jetty or the Chart (`TUTORIAL_TOPS`).
- **It never sees the aboard view**: aboard is never shown while `tutorial.done` is false. So no cue moves, no selector changes, and T65–T72's timings stand.
- **The aboard view is the `jetty` screen's content** once the tutorial is done, and its modal id stays `jetty`. So `LOOP_MODALS`, the Chart's and the shelf's Escape back to it, and the tests that read `top() === 'jetty'` all keep working.
- **The scenarios that tap a home tile straight after Sold** (seven: `loop-1a`, `loop-4`, `loop-4-look`, `loop-5a`, `loop-5b`, `loop-time`, `watercraft-face`) first go to the tile's place with `debug.aboard.go(place)` (lane I-2, §9.2). Murk is then at the Rail, the Chart and the Journal at the Deck, and the wall at the Long Wall.

### 2.6 The first time aboard

The first Sold after the first evening is the player's first step aboard. It has no words:
1. The dip lands at the Deck **looking astern**, over the gallery: the Wicks' bench and the bollard just ahead, your raft below with its lantern lit, the gallery's rail, the lake and the Sluice Veil's white falls under the dawn.
2. After 2 s the look turns slowly (5 s) round to the Deck's own look: the chart table, and the door's warm gap with the stove's glow inside. Then it settles.
3. The stove breathes, and Murk's barge's lamp shows past the cabin's corner.
4. After 9 s with no input, the nearest thing you can touch lifts and glints once (§4.1).
5. **Until you have been to the Balcony once**, the Turn mark is what glints first, once a visit (`meta.loop.stern.seen`, §10).

That is all the teaching it gets. The porch is the first thing you see aboard, and the way to it is the first thing that glints.

## 3. The places aboard (B)

### 3.0 The scale rule: a Wick's eye in a people's barge

**The barge is people-sized.** The Slow Hearth is a people's barge-house ("a barge family's floating home", `LORE.md` §6), built to their size:
- its windows' centres are 1.02 m above the deck;
- its chart table is 0.78 m high, and its lectern's desk 1.0 m;
- its door is 0.8 × 1.48 m;
- **its stove is a people's pot-belly, 1.05 m tall**: the firebox door 0.40–0.74 m above the floor and the kettle on top at 1.05–1.27 m.

**The Wick is knee-high to them.** It is 1.04 m tall at the scale it is drawn on the raft, with its eyes 0.78 m above its feet (*measured*: in the Wick's frame the head is at 0.5 m and the eyes 0.14 m above it, drawn × 1.22).

**So the first person is the Wick's, not a person's.**
- The eye is 0.78 m above whatever the Wick stands on, and the furniture stays people-sized.
- That gives the interior its whole character, and the numbers draw it: the stove is taller than you, its door at your chest, the kettle above your eye and the fire's glow falling down on you; the chart table's top is at your eye; the windows' sills are just above it.
- The Wicks have made the people's house theirs, with crates for steps, cushions piled on the chair, a low bench of a plank on crates and rungs up the wall.
- Each place stands the Wick where it can see (the eye heights in §3.2).

A person's eye at 1.5 m is the other way, §12 question 45.

### 3.1 The layout

Coordinates are barge-local: the bow at −z, the stern at +z, starboard at +x, y up from the waterline, the deck at y 0.42. Looking aft, starboard is on your left.

```
              bow (−z)                         the plan from above, the bow up, starboard on the right (not to scale)
   z −6.0     ╭───────────╮  the bell post (the Rust Buoy-Bell, found)
              │  fore deck │
   z −3.5  ┌──┴───────────┴──┐ fore bulkhead: its window; wing I's port half · the dresser (stbd)
           │W│   H (eye)     │
           │I│    [hatch]    │ the wet well's hatch, amidships (the Well's glass, after M1)
     port  │N│               │ starboard ──→ Murk's barge alongside (centre x +4.7, z −2.0)
    (shore)│G│  L (track)  [b│   side deck · the Order Board · RAIL (x 1.5, z 0.6) · rungs up → ROOF
           │ │             [u│
   z +1.2  │▓│stove        [n│ the four Wicks' basket on the bunk's foot (under the starboard aft window)
   z +2.25 └─┴──[door]─(desk)┘ the sill's stones at the door's foot; the rod rack port of it
           │ chart          J│  the lectern with the Journal (as built), under the awning
           │ table    DECK   │  the tiller, lashed along the starboard rail
   z +5.3  ├─step──┬[bench]bol┤  the gallery's step (port half) · the Wicks' bench · the bollard
           │ BALCONY         │  the rod's holder on the aft rail's post (x 0.70)
   z +6.6  └─────────────────┘
                 the raft, tied at the Jetty (z +8.8), its lantern
             astern: Root Isle 23 m, the lily bed 22 m, the Sluice Veil's falls 51 m
```

| thing | where (x, z; y) | size | notes |
|---|---|---|---|
| **the stove** | aft-port corner (−1.00, 1.84), on the hearthstone | 0.44 × 0.44 m, **1.05 m tall** | A people's iron pot-belly on four feet, its firebox door facing forward into the cabin at the Wick's chest (y 0.82–1.16). Its pipe rises, bends under the beams and leaves through the roof at the built collar (−0.40, 1.70), so the outside does not change |
| the kettle | on the stove top (y 1.47–1.69) | 0.2 m | a people's kettle, above the Wick's eye |
| the hearthstone | x −1.27…−0.60, z 1.20…2.22 | — | pale stone, ash at the stove's foot |
| the bait shelf | port wall over the wood stack (x −1.27…−1.07, z 1.20…1.60; y 1.25…1.75) | — | the save's bait for this water, drawn as tins and jars (§6.5) |
| the wood stack | under the aft port window (z 0.75…1.20) | up to 0.75 m | split wood |
| **the bunk** | starboard, x 0.50…1.27, z −0.55…0.95 (mattress y 0.87) | 1.5 m | The people's box-bed, now the Wick's own, its pillow at the forward end and two crates at its side for a step |
| **the dozing Wicks** | a moss-lined basket on the bunk's foot (x 0.75…1.15, z 0.58…0.92) | 0.4 × 0.35 m | The four Wicks not chosen at New Descent, each by its look (flame, cloak), sleeping with their flames low at first light, in the stove's warm pool (`LORE.md` §5.1). Under the starboard aft window, where the arrival shot already sees their flames (`actors-home.js` 5b), so the outside does not change |
| **the desk** | aft-starboard, under the aft window (x 0.25…1.25, z 1.75…2.20; top y 1.16) | — | A people's writing desk. On it are **the ledger** (0.75, 1.17, 1.97), a candle in a dish and an inkpot. The chair before it (0.75, 1.42) has a crate and cushions on its seat |
| the hatch | amidships floor, x −0.35…0.35, z −1.00…−0.40 | — | In M1, the wet well's wooden hatch with an iron ring. After M1, the Well's glass hatch (`AQUARIUM.md`) |
| the dresser | starboard fore corner, x 0.60…1.27, z −3.45…−2.75 | up to 1.5 m | the people's painted cups, a basket, and a tin candle mould of four cups, one dented |
| **the Long Wall, wing I** | the port wall (z −3.40…0.60) and the port half of the fore bulkhead (x −1.27…0) | two rows | §6.5 |
| the beams | across at z −2.95, −1.95, −1.60, −0.40, 0.05, 1.00, 1.90; y 2.02…2.12 | — | The skylight's frame beams are at −1.60 and −0.40. From the hooks hang a candle lantern over the middle (−0.45), dried herbs over the stove, and a line of the Wicks' tiny cloaks drying |
| the windows | as built: three a side, one fore, one aft by the door | 0.44 m | now openings (§8.1), with inner frames and sills added |
| the door | as built (x −0.70…0.10, 1.48 m) | — | Its inner jamb carries a Wick's notches, one per evening, in fives (§6.2). The barge family's house-mark is painted over it inside (a glyph, never a word) |
| the sill's stones | as built, at the door's foot outside | — | Seen as you pass through the door (§3.3), and drawn on the chart table's sheet (5b's chart top) |
| **the lectern** | **as built** (1.25, 3.00), the deck's starboard side | as built | the Journal open on it |
| the chart table | as built (−1.00, 4.60), its stool at (−0.85, 3.98) | — | |
| the rod rack | as built: the aft wall outside, port of the door (−1.00, 2.32) | — | The rod you own hangs on its top peg, in its tier's colour; the rods it replaced hang on pegs below it (§2.3's one rod) |
| the tiller | **unshipped and lashed** along the starboard rail (x 1.45, z 3.6…4.8) | — | out of every view aft (the barge is towed; it never steers itself) |
| the rungs | iron rungs up the cabin's starboard wall by the side deck (z 0.25, between two windows) | to the roof | the way up to the Roof from the Rail |
| **the stern gallery** | new: z 5.30…6.60, x −1.25…1.25, floor at y 0.60 | §5.1 | its step on the port half, the Wicks' bench on the starboard half of its forward edge |

### 3.2 The seven places

- **Each place is one authored pose** in barge-local metres. The Hearth also has its own portrait eye, 0.9 m further forward, so a phone held upright holds the stove and the dozing Wicks together.
- **It rides the barge.** Each frame the pose is turned to the world through the barge's own `bob` group, so the eye rides the swell: the barge's roll and pitch of ±0.02–0.025 rad, scaled ×0.5 on the eye, and none under reduced motion.
- **Field of view.** Landscape is 52° vertical. Portrait is 66–70°.
- **The cone belongs to the place**, the same in both orientations: portrait only starts at a different look inside it.
- **What is *measured*:** where each place's targets fall at 1280 × 720, 1920 × 1080, 390 × 844 and 358 × 664, through `home-targets.js`'s `project`, `rectOf` and `layoutTargets` (Appendix A). No two target boxes overlap at any of the four, and the laid-out buttons pass at all four.

| place | where the Wick stands | eye (x, y, z) | looks at | cone (yaw · pitch) |
|---|---|---|---|---|
| **Deck** (the hub) | on the deck at the gallery's step, starboard | (0.95, 1.20, 4.85) | (−1.20, 1.00, 3.45), forward-port; portrait (−1.25, 1.00, 4.25), fov 68 | −60…+75° · −25…+20° |
| **Hearth** | on the cabin floor, forward of the hatch, facing aft | (−0.30, 1.20, −2.20); portrait (−0.10, 1.20, −3.10) | (0.00, 1.05, 2.00), aft; portrait (0.05, 1.05, 2.00), fov 68 | ±55° · −30…+30° |
| **Long Wall** | on the floor, facing the port wall | (0.65, 1.20, z), on a track along z −2.90…0.30, resting at −1.10 | the wall (−1.27, y, z) | the track · ±30° (±40° portrait) · −20…+30° |
| **Rail** | on a crate on the starboard side deck | (1.52, 1.45, 0.60) | (4.20, 1.95, −4.40), forward-starboard; portrait at Murk (4.71, 2.20, −2.02) | ±60° · −20…+30° |
| **Balcony** (fishing) | at the gallery's port rail, aft | (−0.85, 1.38, 6.05) | dead astern, pitch −7° | ±70° · −30…+15° |
| **Bench** (looking) | seated on the Wicks' bench, facing astern | (0.43, 1.33, 5.50) | dead astern, pitch −3° | ±80° · −25…+25° |
| **Roof** | on the cabin roof, aft | (0.25, 3.10, 2.05) | (0.10, 2.55, −1.20), forward | ±150° · −45…+25° |

Each frame reads in three values: a warm pool, a working surface, and a cool exit (§6.1).

| place | the frame (warm · surface · cool exit) | what you can touch | ways on |
|---|---|---|---|
| **Deck** | the stove's glow in the door (right) · the chart table (left) · the dawn past the port rail; a drag right finds the Journal on its lectern | Chart, Journal, the door, the rod rack | the door → Hearth · Turn → Balcony · the right edge's lamp → Rail, opening Murk's shelf |
| **Hearth** | the stove and its kettle (right, 65%) · the desk and its ledger (39%), the bunk's foot with the four Wicks dozing (27%) · the door's dawn (centre, 54%) | the stove, the kettle, the bunk, the ledger, the door | right mark → Long Wall · Back or the door → Deck |
| **Long Wall** | the prints' candles in a row · the prints' pale paper and their rulers · the port windows' lavender between them | the wall, each print, the port window | left mark → Hearth · Back → Hearth |
| **Rail** | Murk's green lamp · the Order Board (left) · the open water past his barge | Murk, the Order Board, the eave's print (once the Matriarch is home), the rungs | the rungs → Roof · Back → Deck |
| **Balcony** | the raft's lantern below-left · the water: Root Isle (left) and the lily bed (right of centre) · the dawn over the Sluice Veil (centre) | the water (cast) | left mark → Bench · Turn → Deck · Back → Deck |
| **Bench** | the raft's lantern below, a little right · the lake, Root Isle left and the lily bed right · the Veil dead ahead under the awning's edge | the rod in its holder | right mark → Balcony · Back → Deck |
| **Roof** | the pipe's ember and smoke · the Bait Bed's moss (green, living) · the whole lake | the moss, the bell (once found) | Back → Rail |

*Measured framing* (centres as a share of the screen across and down; landscape 1280 × 720, portrait 390 × 844):

| place | in frame, landscape | in frame, portrait |
|---|---|---|
| Deck | the chart table's top (23%), the rack's upper half (70%), the door (87%). The Journal is 66° right of the look, a drag of 30° | the chart table (32%). The door and the Journal are drags right |
| Hearth | the stove's door (65%, 53% down) with the kettle above it (64%, 37% down), the door (54%), the ledger (39%), the bunk's foot and the basket (27–32%) | from its own eye: the stove (86%), the door (61%), the ledger (27%), the basket of dozing Wicks (11%) |
| Rail | Murk (centre), the board | Murk |
| Balcony | the Sluice Veil (47%, 32% down), Root Isle (32%), the lily bed (64%), the raft at the lower left | the Veil (41%); Root Isle and the lily bed at the edges |
| Bench | the Veil (48%, 39% down), Root Isle (36%), the lily bed (68%), the raft below (65%), the rod in its holder (35%) rising out of the frame | the Veil (45%), the holder at the left edge, the raft at the right |
| Roof | both moss beds and the bell's post | the same; the bell's post is 46 × 99 px on a phone |

Every target box measured at least 44 px on a phone once `layoutTargets` grows the smallest (the kettle, 24 × 24 px raw at 358 × 664), with no raw overlap and no overlap after layout.

### 3.3 Moving between them

- **The doorway is the target.** Tap the door (Deck ↔ Hearth) or the rungs (Rail → Roof). This is the main way to move, and it needs no new UI.
- **Marks.** A mark is a small filigree arrow carrying a glyph of where it goes: a stove door, a wave over a rail, Murk's lamp, a frame, a bench, a tuft of moss.
  - Edge marks sit at the screen's left or right edge in the lower third: thumb height on a phone, never at the top. Each is ≥ 44 px, drawn at 60% ink, with at most two per edge. A mark is spatial: a place to your right is on the right edge.
  - **Turn** is a curved arrow at the bottom centre, and **Back** a hooked arrow just to its right, ≥ 56 px: both in the thumb's reach. Back always goes one place toward the Deck.
  - **The Deck's right-edge mark carries Murk's lamp.** One tap glides to the Rail (the glide is the close look) and opens his shelf. Closing the shelf glides back to the Deck, where the Chart is. Sell, buy, Sail is then three taps, as at the Jetty.
  - Marks have no words. Each mark's accessible name is its place's (§10).
- **Glide times:**
  - 0.8 s within the deck and the cabin;
  - **1.3 s through the door**: through it facing in, up the cabin, and turning on the last metre to face the hearth (and the same back out). The path passes the door's centre, with the eye at 1.20 m under its 1.90 m head, and the look dips 8° to the sill's stones as it crosses;
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
  - Escape or Backspace goes back. At the Deck, Escape opens the home pause, as the Jetty's did.
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

| close look | where the eye goes | what it sees | then |
|---|---|---|---|
| the chart table | kneeling on the stool (−0.88, 1.60, 4.00), looking down 34° | the drawn sheet on the table (its built top) with the road's four stones on it, the weight, the rolled sheet | the Chart |
| the Journal | on a crate beside the lectern (1.20, 1.70, 3.45), looking down 30° | the open book | the Journal |
| the ledger | on the chair's crate (0.75, 1.62, 1.45), looking down 41° | the ledger open under the aft window's light | the sheet (`SHEET.md`) |
| the rod rack | (−1.00, 1.30, 3.10), looking up 10° | the rod you own and the rods it replaced | the sheet, at Tackle |
| a print | 0.6 m from the wall, square to the print, at its height | the print at true size on its ruler, and its candle | the print's card (§4.2) |
| the port window | on the wood stack, 0.35 m from the glass | the shore 12 m off, its reeds, the dawn mist, a heron if one stands there, and the Night-Lily boxes if worn | — |
| **the bunk** | standing at the bunk's side in the aisle (0.00, 1.20, 0.17), looking across it | the four Wicks dozing in their basket at its foot (right), the pillow at its head (left), the starboard window above | two things to touch: **the basket** (a Wick stirs) and **the pillow** (lie back: the beams, the lantern's slow swing, the skylight's sky paling, until your next tap) |
| Murk | from the Rail, the eye tilting up to his face | — | his shelf, as the catalogue (`gw-mvp-catalogue`) |
| the Order Board | from the Rail, 0.9 m away | the chalked orders | the shelf, opened at its orders |
| the eave's print | from the Rail, looking up 20° | the Matriarch's print in its gold frame along the starboard eave | her print's card |
| the moss | on the Roof, over a planter, looking down 60° | the moss parting; a Mire Worm curls and goes back | — |

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
| `wall` (`[data-tile=wall]`) | Long Wall | the wall as a whole (its built accessible name, "The Long Wall") | brings the eye to the wall's resting point | — |
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

**The 2D gallery leaves home.** Its screen (`ui-prints.js` `createGalleryView`) leaves the home flow, because the Long Wall is now the place you look at. The Journal's Prints page stays the 2D record of every print, and the fallback's wall target opens it (§2.3).

### 4.3 The sheet's home: the ledger and the rod rack

`SHEET.md` (written beside this, on `gw-design-sheet`) designs the gear and character sheet as a screen: gear quality, what is fitted as upgrades, how each changes the catch, and the Wick's stats and buffs. This design gives the sheet two things to open it from.

- **The ledger** on the Wick's desk, in the cabin's aft-starboard corner under the aft window.
  - It is a people's account book that the Wick keeps: its cover is the barge road's faded rose, with a ribbon and the candle in its dish beside it.
  - Tap it: a close look at the desk, then the sheet at its first page.
  - It sits in the Hearth's frame (39% across, with the window's cool light on it). Its candle is the desk's living light.
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
  - The embers under their ash breathe redder for a few seconds. The room's warm pool brightens 25%, the glow falls down on you from the open door at your chest, and the dozing Wicks' flames lean toward it. Then the door closes.
  - The fire is never stirred, raked, fed or made to blaze: Murk rakes it open once, at the end of the road (`LORE.md` §8). Tapping it again only opens the door again.
- **The kettle** above your eye sings thinly after 2 s, with a curl of steam from the shared smoke pool.
- **A dozing Wick stirs** (the basket, in the bunk's close look). One of the four lifts its flame, opens its amber eyes a crack, and settles again.
  - They take turns, and the one you play is never among them.
  - They never speak (`CHARACTERS.md` §3, who talks).
- **The bunk** (the pillow, in the bunk's close look). Lie back and look up at the beams, the lantern's slow swing and the skylight's sky, **for as long as you like**: your next tap sits you up.
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
- **The rail** runs on its three open sides. Its cap is at y 1.08 (0.48 m above its floor), with a rope at half height.
- **The Wicks' bench** runs across the forward edge's starboard half (x 0.05…0.80, z 5.34…5.66), **facing astern**: a plank on two crates, its seat at y 0.85 and a back of crate boards to y 1.15, under the awning's aft edge (z 5.43, y 1.92). Sitting and looking agree: the Wick sits facing the lake, its back to the deck, with the quarter lanterns either side.
- **The rod's holder** is an iron ring on the aft rail's post at x 0.70 (y 1.30). It holds the rod upright while you sit on the Bench, 35% across the Bench's frame.
- **The bollard** stays as built at the starboard fore corner (0.95, 5.50), at the bench's end, with the raft's rope running down from it.
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
  - Seated on the Bench (centre, forward): the Veil dead ahead, Root Isle left, the lily bed right, the raft and its lantern below, the rod in its holder at the left, the gallery's boards and rail in front, the awning's edge overhead and a quarter lantern at each side. The cone is the widest aboard (±80°).
- **The sky** is home's: first light, held, because the clock stands still at home (SPEC §3.4). The dawn mist lies on the far shore (`world.js`'s dawn air). Whether the morning should come up slowly while you sit is §12 question 47.
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

- **The rod** is in the Wick's right hand at the Balcony, entering from the lower right.
  - The grip is 0.3 m from the eye and the tip about 2 m out and 0.6 m up, so the tip sits about 62% across and 30% down the frame.
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

The show's beats and timings are kept: the rise, the hold, the pause, the measure, the card. The subject is the fish in the Wick's hands, seen from the Wick's eye. How it is held depends on the fish's length L (the Wick is about 1.04 m tall):

| L | the present | the eye |
|---|---|---|
| ≤ 30 cm | **In the hands**: lifted over the rail in two small wax hands, side-on, 0.32 m from the eye, with the cloak's cuffs at the bottom of the frame | level; the field of view as it is |
| 30–60 cm | **In the arms**: held across the chest, the hands under its head and belly, its tail flexing past the edge of the frame | the field of view eased to 60° |
| > 60 cm | **On the boards**: laid on the gallery's wet boards, with the Wick kneeling over it and its hands at the gills and the tail. The whole fish is in frame | looking down 55°, the eye at 1.05 m, the field of view 58° |

**The present.**
- A slow 15–20° turn shows both flanks. On the boards, a hand lifts the head instead.
- The scene lights it: the raft's lantern from below and aft, and the dawn.
- The Wick's own flame is just above the eye: a warm wash at the top edge of the frame (6% amber), and on the tops of the hands (§6.6).
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
- **If the user chooses the other way** in §12 question 44 (a stern that discovers), first landings and list ticks happen at home, and the sim must be re-run with a porch player (§12).

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
- The long fish hang low at the Wick's eye (centres 0.55 m above the floor). The small fish hang above the windows (1.48 m) and between them.
- Each frame is at true size on its painted ruler, with a candle on a ledge under it, lit once its print is hung. The giants' frames are gold.
- Before wing I: bare boards, nails and the people's paint.
- Once bought, all 16 frames hang at once, with blank paper and unlit candles. Each fills as its species is printed (`galleryModel` gains the blank frames, §9.4).
- *Est.* capacity: 15 m of print, against wing I's 16 best prints of about 11 m with their margins.

Everything else:

| what | outside (as built, or as amended) | inside, or seen from aboard |
|---|---|---|
| **the Matriarch's print** (a legend landed) | along the starboard eave, gold-framed (as built) | seen from the Rail, looking up 20°. A target: her print's card |
| **Bait Bed I–II** | the roof's moss planters (as built) | The Roof's beds: living green, and the moss parts. Inside, the bait shelf's moss-lined crate of Mire Worms, topped up to the Bed's floor at dawn |
| **Barge lights I** | the rail lanterns (as built) | the two quarter lanterns either side of the Wicks' bench, fading as the sky pales, with their light on the gallery's boards |
| **Murk's Order Board I–II** | on the starboard rail (as built) | **Turned to face the side deck**, so the Wick reads it from the Rail (Murk leans across to chalk it) |
| **tackle: Rod, Line, Reel T0–T2** | the rod on the rack (as built) | **The rod in the Wick's hand** at the Balcony and in its holder at the Bench, by tier (§6.6), with its reel and line. The rod you own hangs on the rack's top peg otherwise, with the rods it replaced below |
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

**The rod, by tier.** It is one small merged mesh, vertex-coloured toon, in the tier's look (as `actors-home.js`'s rack already colours it):
- **Willow Switch** (T0): a pale green-brown switch with a cord-wrapped grip, the line on a wooden winder.
- **Ashwood** (T1): honey-coloured wood, a cork grip, a small wooden reel.
- **Whalebone** (T2): pale bone with brass ferrules and a brass reel.

The Line's tier tints the line (undyed, amber, lavender). The Reel's tier sets the reel's look. The found tassel hangs from the rod's butt.

**The hands.**
- Two small wax hands (the Wick's `wax` colour) and the cloak's cuffs, in its cloak colour (slate if the Slate Cloak Dye is worn).
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
| **each place's frame** | **≤ 150 calls on low**: the home frame's line. The arrival shot at first light measured **144 on low (139 on a phone)** at b527fae; re-measured on the current preview in Appendix A.<br>On medium and high, no worse than the arrival shot's (226–227, over 200 and reported, not failed) | measured per place (`clarity-perf --aboard`) |
| **each place's cost** | **cpuMs no worse than the arrival shot's** at the phone size on low, and **p95 ≤ 33 ms on the software-GL tier** at every place, at the stern during a play | `clarity-perf --aboard`, its cpuMs per place against the arrival shot's (§8.3: aboard the cost is fill, not calls) |
| the Wick aboard | hidden | Its meshes, outlines and flame are not drawn aboard (*est.* 6–10 calls saved) |

### 8.3 What each place costs

- **The cabin's places** (the Hearth, the Long Wall and their close looks) look at walls with small windows.
  - The world in front of them is still in the frustum and still drawn, since there is no occlusion culling.
  - **On medium and high, the water's mirror is skipped in the cabin, with no recompile.** The water keeps its `GW_REFL` define and its reflection target; a uniform weight (`uReflW`) eases to the analytic water over 0.3 s and the reflection render is skipped while it is 0. The window's close look eases it back. Each place's data carries `mirror: false` or `true`. I-2's gate checks that the renderer's program count does not change across 20 door glides. The saving is measured, not promised (*est.* tens of calls on medium and high).
  - **Fill, not calls, is the cost aboard.** In the cabin the timber covers the whole screen; the water (render order −10, drawn first) would shade the half hidden under the floor, and the barge's ink (drawn before the timber) every pixel of the shell. So **aboard, the water and the barge's ink draw after the timber**, and depth rejects what the walls hide. Off aboard both keep their built order.
- **The deck** faces the cabin and the shore.
- **The balcony and the bench** face the open lake like the arrival shot, plus the tells' one call and the rod and hands' two, with the Wick hidden.
- **No pixel-ratio change in motion.** Revision 1 lowered the pixel ratio during glides; a change of pixel ratio reallocates the composer's targets, the bloom's mips and the reflection target each time, so it is dropped.
- **The lens.** Aboard, the far plane is 400 m (the dawn fog at 0.0055 is near opaque by then; I-2 checks the sky vault's radius first). The near plane is 0.15 m at the places and 0.08 m at the Balcony (the rod and hands) and in close looks.
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
- **One seed commit first, alone** (I-2 writes it, with I-1's numbers): `aboard-layout.js` (every box and eye of §3.1–§3.2), `LOOP.aboard` and `LOOP.stern` in `data.js`, `actors.setAboard(on)` (the Wick, its rod and its flame hidden), the `'aboard'` camera mode in `render.js`, `render.afterCamera(fn)`, `debug.aboard` (`go(place)`, `close(id)`, `pose()`), and the validator's aboard frame check on that layout at the four sizes, with the arrival and tutorial frames unchanged. It merges into the integration branch before the lanes branch, so every lane builds on it.
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
- `tools/tests/aboard-scene.test.mjs` (new).
- `tools/tests/clarity-perf-home.mjs` (`--aboard`).
- `tools/tests/loop-aboard-look.scenario.mjs` (new).

`home-targets.js` needs no change from I-1 now that the lectern stays (§2.3).

**Builds:**
- §3.1's furniture and §5.1's gallery.
- §6's art whole, and §6.5's inside column.
- The print atlas's mesh: 16 quads with UVs into one canvas that I-4 draws.
- The parts mechanism, `actors.home.parts.set(id, {lift, angle, glint})`.

**MVP gate.**
- Node tests:
  - every interior box is inside the cabin's walls and clear of the door's path;
  - every place's eye is ≥ 0.15 m from every box and inside its room;
  - the gallery is clear of the raft's circle by ≥ 0.5 m and inside the aft hull circle;
  - the shell's holes match the door and the windows;
  - no PointLight in the barge's tree;
  - the indoor term is 1 at every interior vertex and 0 on the hull's outside;
  - the parts' uniform array is ≤ 24 vec4.
- Look sheets of every place, desktop and phone, taken through the seed's `'aboard'` camera and `debug.aboard`, so the lane needs no director. At least three look-and-fix rounds. Each sheet checks that no lift or glint reads as an outline.
- The arrival shot before and after (the gallery, the bench, the door's interior), and every upgrade's and part's before-and-after pair inside.
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
- `src/loop-home.js`: the dip aboard on Sold, the dip out on Sail, Continue aboard, and `aboard:leave` on every exit.
- `src/main.js`:
  - at home a press goes to the aboard layer, and while `biting()` it and Space or Enter go to the strike before the Jetty's keys;
  - `ctx.cinematic` is kept in flow `home` while `fishing.sternActive()` (the exception beside `playing`, `hub` and `intro`).
- `src/ui-loop.js`, two hunks only:
  - a projector hook in `placeTargets`, so the director places the Jetty's own tile elements at their places (no duplicate elements);
  - the Jetty's `onKey` and `onEscape` hand the key to `ctx.game.aboard.key(code)` first, and fall back to `jettyKeys` and `openHomePause` when it returns false.
- `src/actors.js`, one hunk: `setAboard(on)` (in the seed).
- `src/data.js`: `LOOP.aboard`, `LOOP.stern`, `TEXT_LOOP.aboard` (§10).
- `tools/validate-data.mjs`: the aboard checks, with the Jetty's chrome as reserved rects.
- The seven scenarios of §2.5, moved to `debug.aboard.go(place)`.
- `tools/tests/aboard.test.mjs` (new), `tools/tests/loop-aboard.scenario.mjs` (new).

**MVP gate.**
- Node tests:
  - local-to-world with the bob, and the pose applied after the floor clamp;
  - the cone's clamp and spring;
  - every glide's path is clear of the layout's boxes by ≥ 0.1 m and goes through the door's opening;
  - the graph is connected, and Back always reaches the Deck;
  - focus order starts with Murk's mark, Chart, Journal;
  - the flow: Sold goes aboard, Sail goes out, Continue lands at the Deck, and the tutorial is never aboard;
  - the input: a press while a bite is open strikes, at every place.
- `validate-data --loop`:
  - every place's targets are ≥ 44 px and never overlap (raw or laid out) at 358 × 664, 390 × 844, 1280 × 720 and 1920 × 1080, in their look or within their cone, clear of the Jetty's chrome;
  - each portrait look holds its hero.
- The renderer's program count is unchanged across 20 door glides, and no render target is created during a glide.
- **The browser walk** (`loop-aboard.scenario.mjs`), from a save with wing I, Bait Bed I and Barge lights I owned:
  - come home;
  - every place, every mark, Back and Turn, and the Deck's lamp to Murk and back;
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
| the seed → everyone | `aboard-layout.js` (the boxes and eyes), `LOOP.aboard`, `LOOP.stern`, `actors.setAboard(on)`, render's `'aboard'` mode, `render.afterCamera(fn)`, `debug.aboard` |
| I-1 → I-2, I-4, the validator | `actors.home.toWorld(x, y, z, out)`, `actors.home.bob`, `actors.home.parts.set(id, {lift, angle, glint})`, `actors.home.atlas(canvas, rects)`, `actors.home.calls()` (derived) |
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
6. Then the user's look: a short film of coming home, going aboard (the first time, looking astern first), each place, a cast and a catch at the stern, and the bench at first light, on desktop and phone.

### 9.7 What stays for later

- The Well's glass hatch, with the aquarium.
- The five's beats aboard (after M1, `CHARACTERS.md` §3.5), played at the Deck or the Rail.
- The bow as an eighth place, when the bow gets its looks.
- Wings II–IV inside, and the Long Winter's 560 cm print (§13 risk 6).
- A left-handed rod and a handedness setting for the marks (a Settings row), and gyro look (opt-in).
- The morning coming up on the bench (§12 question 47's other way).
- Rain on the roof (weather is parked).
- The ink-print beat (M1 §8 question 3).
- A 30 fps cap, and rendering on demand while nothing moves.
- A lower pixel ratio in motion on low, with fixed-size targets and a scaled viewport, if the per-place cost needs it.
- Walking aboard (parked, SPEC §9).
- The stern arc's check in `validate-data --loop` for every later water's mooring, the raft's pose aboard included. This comes automatically, since moorings are data.

## 10. Data and the save

A sketch for the seed's data block, with its numbers from §3–§5:

```js
LOOP.aboard = {
  near: { place: 0.15, close: 0.08 }, far: 400, roll: 0, shake: 0.2, bob: 0.5,   // roll: render's title roll (off); shake: the trauma shake ×; bob: the barge's roll and pitch × on the eye
  glide: { step: 0.8, door: 1.3, turn: 0.8, rungs: 1.1, close: 0.6, back: 0.5, dip: [0.25, 0.35], settle: 0.04, sillDip: 8 },
  look: { degPerPx: 0.18, touchSweep: 0.6, spring: 0.15, damp: 6, cursor: 0, idleHint: 9, markFade: 4, closeCone: 25 },
  first: { lookAstern: 2, turn: 5 },
  places: {
    deck:    { eye: [0.95, 1.20, 4.85], look: [-1.20, 1.00, 3.45], fov: 52, portrait: { look: [-1.25, 1.00, 4.25], fov: 68 }, cone: [-60, 75, -25, 20],
               targets: ['chart', 'journal', 'door', 'rack'], go: { door: 'hearth', turn: 'balcony', right: 'rail' }, lamp: 'rail' },
    hearth:  { eye: [-0.30, 1.20, -2.20], look: [0.00, 1.05, 2.00], fov: 52, portrait: { eye: [-0.10, 1.20, -3.10], look: [0.05, 1.05, 2.00], fov: 68 },
               cone: [-55, 55, -30, 30], mirror: false, targets: ['stove', 'kettle', 'bunk', 'ledger', 'door'], go: { door: 'deck', right: 'wall', back: 'deck' } },
    wall:    { eye: [0.65, 1.20, -1.10], track: [-2.90, 0.30], face: [-1, 0, 0], fov: 52, cone: [-30, 30, -20, 30], mirror: false,
               targets: ['wall', 'print:*', 'window'], go: { left: 'hearth', back: 'hearth' } },
    rail:    { eye: [1.52, 1.45, 0.60], look: [4.20, 1.95, -4.40], fov: 52, portrait: { look: [4.71, 2.20, -2.02], fov: 70 }, cone: [-60, 60, -20, 30],
               targets: ['murk', 'orders', 'print:belled_matriarch', 'rungs'], go: { rungs: 'roof', back: 'deck' } },
    balcony: { eye: [-0.85, 1.38, 6.05], yaw: 0, pitch: -7, fov: 52, portrait: { fov: 66 }, cone: [-70, 70, -30, 15], fade: 'waiting',
               targets: ['water'], go: { left: 'bench', turn: 'deck', back: 'deck' } },
    bench:   { eye: [0.43, 1.33, 5.50], yaw: 0, pitch: -3, fov: 52, portrait: { fov: 66 }, cone: [-80, 80, -25, 25], fade: 'always',
               targets: ['rod'], go: { right: 'balcony', back: 'deck' } },
    roof:    { eye: [0.25, 3.10, 2.05], look: [0.10, 2.55, -1.20], fov: 52, cone: [-150, 150, -45, 25], targets: ['moss:1', 'moss:2', 'bell'], go: { back: 'rail' } },
  },
  close: { chart: { eye: [-0.88, 1.60, 4.00], look: [-1.00, 1.20, 4.60] }, journal: { eye: [1.20, 1.70, 3.45], look: [1.25, 1.42, 3.00] },
           ledger: { /* … §3.5 */ }, rack: { /* … */ }, bunk: { eye: [0.00, 1.20, 0.17], look: [1.27, 1.00, 0.17], targets: ['wicks', 'pillow'] },
           print: { dist: 0.6 }, window: { dist: 0.35 }, moss: { /* … */ } },
};
LOOP.stern = {
  bites: 3, from: 1, light: 'day', revisit: true,
  arc: { minDist: 6, half: 60, raftPad: 1.0, poleClear: 0.4 },
  raftAboard: { pole: [1.28, 8.80] },                 // the raft's heading aboard: its pole on its starboard beam (§5.1)
  bring: { bearing: 40, dist: 2.6, from: 0.6 },       // the play's last 40%, led round to the port quarter (§5.5)
  spawn: { margin: 15, ahead: 75, clear: 2 },
  present: { hands: 0.30, arms: 0.60 },
};
TEXT_LOOP.aboard = { /* accessible names only, never drawn: each place's and each wordless target's (the built tile words stay TEXT_LOOP.jetty's) */ };
```

**The save.**
- One new field, `meta.loop.stern = {evening, spent, seen}`.
  - `spent` is the dawn's good bites used. It resets whenever `evening` differs from `meta.loop.evenings`. A bite is added when it opens and saved at once; a reload that finds it open gives it back.
  - `seen` is true once the Balcony has been visited (the Turn mark's glint, §2.6).
  - `freshLoop` and `migrateLoop` seed it as `{evening: 0, spent: 0, seen: false}` for every block, with no schema step (as `meta.loop.finds` was).
- Nothing else is saved: home always opens at the Deck.

**Words.**
- No new words appear on screen: only the three built tile words, and the card's built **Let go**.
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
- **Not changed**: `WATERCRAFT.md` (read only: the stern uses its areas and hook table as they are), `SHEET.md` (its §2.3 cites the ledger at "27% across" the Hearth; it is now 39%, for the sheet's owner to update), `LORE.md`, `FINDS.md`, `AQUARIUM.md`, and every `src/` or `tools/` file.

## 12. Questions only the user can answer (each with the default this design builds)

44. **Fish off the stern: what may they be?**
    - **Default: let go only, and revisit only.** Only fish you have already landed on a trip bite at the stern. Each catch writes its best, its class seals and its print on the Long Wall, and nothing is paid. A fish's first landing, and the water's list that opens the next water, stay the trip's. Three good bites a dawn, then quiet water's rule.
    - **Another way: the stern discovers too.** Any fish of its water could bite, so a fish's first landing and its tick on the list could happen at home, behind the stern's one-button card instead of the trip's catch show. This needs the sim re-run with a porch player before it ships: it must show that the next water still opens by its map and gear, not by the list; that the pull's evening counts still behave; and M1's hours reported per trip.
    - **A third way: keep and sell them** to Murk over the rail. That adds about +70% clams a visit at first and +18% at the hour mark (*est.*). It would let a player skip the hold's ladder, need the sim re-run and move M1's pacing.
45. **Whose eye?**
    - **Default: the Wick's**, 0.78 m above what it stands on, in a people-sized barge: the stove (1.05 m) taller than you, its door at your chest and the kettle above your eye; the chart table's top at your eye; crates for steps.
    - **The other way:** a person's eye at about 1.5 m. The barge looks cosier and smaller, and the hands and rod are drawn at a person's scale.
46. **After the tally: aboard at once?**
    - **Default: yes**, by an ink dip on Sold. The arrival shot stays under the tally.
    - **The other way:** stay on the view from the water with its targets, and go aboard only when you tap the barge.
47. **The sky at home.**
    - **Default: first light, held**, since the clock stands still at home, as now.
    - **The other way:** while you sit on the bench, the morning comes up slowly (the mist thinning, the light warming), and it goes back to first light when you get up.

## 13. Risks

1. **Fishing assumes a trip throughout** (`playing()`, `LOOP()`, `run()`, the cove path in `measure()`). A missed site would cast from the raft, spend a trip's bite or bank Memories at home.
   - Mitigation: I-3's first commit is the audit table of every site, locked by a node test; an explicit fishing mode; `origin()` and `raft()` kept apart; the 300-bite test through the real ledger.
2. **The low tier's 150-call line is tight**, and aboard the cost moves to fill.
   - Mitigations: the Wick hidden; the atlas culled outside the cabin; the mirror weight in the cabin; the water and the ink drawn after the timber aboard; each place measured for calls and cpuMs.
   - If it still fails, the knobs in order: the tells off at the stern on low; the candles' glow merged; the atlas only at the Long Wall; a lower pixel ratio in motion on low with fixed-size targets (§9.7).
3. **Portrait first person is narrow.**
   - Mitigations: a portrait look on each hero (and the Hearth's own portrait eye), the cone and the track under one thumb, the marks in the lower third and Turn and Back at the bottom centre.
4. **A Wick's eye sees table tops edge-on.**
   - Mitigations: the close looks lift the eye to the surface (kneeling on the stool, the crate on the chair), and the places stand the Wick where it can see (§3.0).
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

## Appendix A. The measured figures, and how to re-run them

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

**The home frame's calls**: `clarity-perf.scenario.mjs --home` on the published preview build (`tools/out/preview/dev.html`), desktop 960 × 540 and phone, its `perf-home.json` written to the scratchpad.

**The Wick's eye**: in `actors-wick.js`, the head is at y 0.5 and the eyes 0.14 above it; `actors.js` draws the Wick × 1.22 on the raft. So the eye is 0.78 m above its feet.

**The code counts** (for I-3's audit): in `fishing.js`, 48 `LOOP()`, 36 `run()` and 10 `playing()` sites; in `progression-loop.js`, 32 `onTrip(` sites.

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
