# The Slow Hearth inside: aboard in first person, and the stern line (binding design, revision 1)

*Written 16 November 2026 for after tonight's MVP merge, from the user's words after an hour's play-test of the published
preview. Binding with `SPEC.md` v8.7 (amended here to v8.9: §0 row 39, §0.15, decisions 111–122, §3.3, §3.4, §6.1–§6.3,
§6.6 new, §8.2, §8.3, §9, §13 step 5d, §16 questions 17 and 44–47), `M1.md` revision 8 (revision 10 here, revision 9 being the sheet's: the header, §0, §1,
§2.6, §2.8, §2.10, §2.11, §2.14, §4 step 5d, §8 question 5), `WATERCRAFT.md` revision 2 (read, not changed), `OPENING.md`
revision 5 (§6.2 and §9, one line each) and `CONTRACT.md` (§14.20, new). Its sibling is `SHEET.md`, the gear and character
sheet asked for in the same message, designed beside this on `gw-design-sheet`. That design owns the sheet's screen; this
one gives it a home aboard: the ledger on the Wick's desk (§4.3). Design only: no `src/` or `tools/` file is changed. The
base is `gw-m1-mvp` at b527fae (WC-1 merged). Figures marked *measured* come from scratch probes run read-only against that
tree: the world's layout, `data.loopMooring`, `watercraft.areaAt` and a pinhole projection of the poses below (Appendix A).
*est.* marks a hand estimate.*

## 0. The user's words, and what each becomes

> "Also I want to be able to be inside my barge. We dont need to be able to physically move around inside it, but I want
> atleast interiors of our barge where we can see our home, Interact with aspects of it and move to different sections of
> our barge. There should also be a balcony area or viewing area at the rear where we can stand and fish and also just look
> out at the scenery if we want. All of this should be from a first person perspective." (16 November 2026)

| the user | what it becomes | where |
|---|---|---|
| "be inside my barge" | **Aboard.** After the tally, one ink dip takes you aboard the Slow Hearth in first person, and you stay aboard until you Sail | §2 |
| "We dont need to be able to physically move around inside it" | **Seven places and no walking.** The eye glides between fixed viewpoints, and you drag to look within each one. The walked barge stays parked | §3 |
| "interiors of our barge where we can see our home" | **The cabin, built inside**: the stove with Murk's banked fire, the dozing Wicks in their basket beside it, the Wick's bunk and desk, the Long Wall's prints at true size on the port wall, the beams, and windows that look out | §3.1, §6 |
| "Interact with aspects of it" | **Things you touch.** Each built screen opens from its object: the Chart, the Journal, Murk's shelf and catalogue, and the sheet. You can lean in to each print. Small pleasures change nothing: the stove door, the kettle, a Wick stirring, the window, the sill's stones, the moss | §4 |
| "move to different sections of our barge" | **Tap a doorway or a mark**: the door, the gallery's step, the side deck, the rungs to the roof. Marks sit at the screen's edges, and keys work too | §3.3 |
| "a balcony area or viewing area at the rear" | **The stern gallery, new**: a railed porch over the rudder with a bench and a holder for the rod | §5.1 |
| "where we can stand and fish" | **The stern line.** Fish the water off the stern in first person, at the rail, with the rod you own. Let go only, three good bites a dawn | §5.3–§5.7 |
| "and also just look out at the scenery" | **The bench.** Sit and look round freely over the lake at first light: the Sluice Veil's falls dead astern, Root Isle, the lily bed, your raft below | §5.2 |
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
  - The stove looms over you and the table top is at your eye. Each place stands the Wick on something the Wicks put there: a crate at the rail, the chair's cushions, the gallery's step.
- **Seven places**:
  - the Deck, the hub under the awning;
  - the Hearth and the Long Wall, in the cabin;
  - the Rail, with Murk alongside;
  - the Balcony, fishing at the gallery's rail;
  - the Bench, sitting and looking;
  - the Roof, with the Bait Bed.

  Glides between them take 0.8–1.1 s with the look leading; under reduced motion each is an ink dip. Within a place you drag to look inside a cone, and at the Long Wall the eye slides along the wall.
- **Things you touch** are DOM buttons over their objects, as the Jetty's are.
  - Each is at least 44 px. Murk, Chart and Journal keep their built ids and words.
  - They are signalled by light, lift and flicker, never a ring or an outline.
  - A tap leans the eye in (a close look) and then opens the built screen over it.
- **The stern line.** At the Balcony you tap the water to cast.
  - The float, the bite, the strike tap and the automatic play are fishing's own, from a new origin.
  - The catch is shown in the Wick's hands or on the boards. Its card has one button, **Let go**.
  - It writes every record: the Journal, the best, the seals, the list and the print on the Long Wall.
  - It pays nothing: no clam, no slot, no hold, no evening.
  - Three good bites a dawn, then quiet water's rule.
- **One barge, inside and out.**
  - The interior is merged into the barge's own three meshes; nothing swaps in.
  - Its light is baked into the vertices, with no PointLight.
  - The barge stays at ≤ 6 main-pass, 2 mirror and 2 shadow calls. Each place's frame is ≤ 150 calls on the low tier.
  - The Wick's own model is hidden aboard.
- **It is built as M1 step 5d**, after tonight's merge and before the polish pass, in four lanes (§9): the scene; the eye; the stern line; what you touch.

## 2. The way in and the way out (A)

### 2.1 Coming home from a trip

| beat | what you see | camera | time |
|---|---|---|---|
| the sail home | As built: the 2 s glide to the stern. The raft ties at the Jetty, off the transom | `'sail'`, then `'home'` (the mooring's framing, a 1.2 s ease) | 2 s |
| the tally | As built, over the mooring's framing at first light. This is **the arrival shot**: home seen from the water, with every light and look you have bought | `'home'` | the tally's own |
| **Sold** | One ink dip: 0.25 s to the violet ink, then the swap, held until the first frame aboard is drawn, then 0.35 s back. You are aboard on the stern deck, at **the Deck**, looking forward across the chart table, the Journal and the open door with the stove's glow inside | `'aboard'` | 0.6 s |

- The Wick's own model, its rod and its flame hide under the dip and stay hidden while aboard (you are the Wick).
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

- **It stays as the arrival shot** under the tally (§2.1), unchanged.
  - The 5b before-and-after pairs of every purchase are still taken there.
  - The barge's new stern gallery (§5.1) joins that frame.
- **It stays for the tutorial.** The opening's glide in and the chart beat over the moored barge run exactly as built, before the first Sail.
  - They keep the chart table's target (`[data-tile=chart]`) and its breathe.
  - The first time aboard is the first dawn home (§2.5).
- **Its DOM targets retire after the tutorial**: the four built ones, and the sheet's `rack` (`SHEET.md` §2.3). Aboard, Murk, the Chart, the Journal and the Long Wall are each reached at their own place (§4.2), with their ids and words kept.
  - `homeTargetIds` and `placeTargets()` stay for the tutorial's view.
  - They are also the fallback when the aboard view cannot start (no mooring, or the director refuses): a reported error, never a stranded screen.

### 2.4 Continue and reload

| at the close | Continue lands |
|---|---|
| home, the tutorial done, nothing open | aboard at the Deck, in its authored look (a cut; no dip from the title) |
| home with the tally unseen | the tally over the arrival shot, then **Sold** and the dip aboard |
| home mid-dip, mid-glide or in a close look | aboard at the Deck |
| home with a screen open (the Chart, the shelf, the Journal, the sheet) | aboard at the Deck, with the screen closed (as the Jetty does today) |
| home at the stern with a line out, a bite open or the play running | aboard at the Balcony, with the line in. An open bite goes back to the dawn's count, as a trip refunds one |
| home with the stern's card open | aboard at the Balcony, with the fish let go (its records were written at the measure) |
| home before the first Sail (the tutorial) | as built: the chart beat over the barge, in third person |
| on a trip | as built |

Where you were aboard is not saved: home always opens at the Deck. A remembered last place is not worth a save field.

### 2.5 The tutorial

Nothing in the tutorial changes.
- **When its beats play**: all of them (the wake at the Landing, the tow, the glide in, the chart beat over the barge, and out) happen before the first Sail, in the views they use today.
- **Its clock** still runs only while the top screen is the Jetty or the Chart (`TUTORIAL_TOPS`).
- **It never sees the aboard view**: aboard is never shown while `tutorial.done` is false. So no cue moves, no selector changes, and T65–T72's timings stand.
- **The aboard view is the `jetty` screen's content** once the tutorial is done, and its modal id stays `jetty`. So `LOOP_MODALS`, the Chart's and the shelf's Escape back to it, and the tests that read `top() === 'jetty'` all keep working.

### 2.6 The first time aboard

The first Sold after the first evening is the player's first step aboard. It has no words:
1. The dip.
2. The Deck's look drifts once, slowly (3 s), from the door's warm gap to the chart table, and settles.
3. The stove breathes, and Murk's barge's lamp shows past the cabin's corner.
4. After 9 s with no input, the nearest thing you can touch lifts and glints once (§4.1).

That is all the teaching it gets.

## 3. The places aboard (B)

### 3.0 The scale rule: a Wick's eye in a people's barge

**The barge is people-sized.** The Slow Hearth is a people's barge-house ("a barge family's floating home", `LORE.md` §6), built to their size:
- its windows' centres are 1.02 m above the deck;
- its chart table is 0.78 m high, and its lectern's desk 1.0 m;
- its door is 0.8 × 1.48 m.

**The Wick is knee-high to them.** It is 1.04 m tall at the scale it is drawn on the raft, with its eyes 0.78 m above its feet (*measured*: in the Wick's frame the head is at 0.5 m and the eyes 0.14 m above it, drawn × 1.22).

**So the first person is the Wick's, not a person's.**
- The eye is 0.78 m above whatever the Wick stands on, and the furniture stays people-sized.
- That gives the interior its whole character: the stove is taller than you, the table top is at your eye, and the windows are just above it.
- The Wicks have made the people's house theirs, with crates for steps, cushions piled on the chair and rungs up the wall.
- Each place stands the Wick where it can see (the eye heights in §3.2).

A person's eye at 1.5 m is the other way, §12 question 45.

### 3.1 The layout

Coordinates are barge-local: the bow at −z, the stern at +z, starboard at +x, y up from the waterline, the deck at y 0.42.

```
              bow (−z)                         the plan from above, the bow up, starboard on the right (not to scale)
   z −6.0     ╭───────────╮  the bell post (the Rust Buoy-Bell, found)
              │  fore deck │
   z −3.5  ┌──┴───────────┴──┐ fore bulkhead: its window; wing I's port half · the dresser (stbd)
           │W│               │
           │I│    [hatch]    │ the wet well's hatch, amidships (the Well's glass, after M1)
     port  │N│       L       │ starboard ──→ Murk's barge alongside (centre x +4.7, z −2.0)
    (shore)│G│               │   side deck · the Order Board · RAIL (x 1.5, z 0.6) · rungs up → ROOF
           │ │       H       │[bunk]
   z +1.2  │▓│stove   (desk) │
   z +2.25 └─┴──[door]───────┘ the sill's stones at the door's foot; the rod rack port of it
           │ lectern   DECK  │  (the awning over all of this)
           │ chart table     │  the tiller, lashed along the starboard rail
   z +5.3  ├─────────────────┤  the gallery's step (+0.18 m)
           │ BALCONY   bench │  the rod's holder on the port aft post · the bollard (stbd fore)
   z +6.6  └─────────────────┘
                 the raft, tied at the Jetty (z +8.8), its lantern
             astern: Root Isle 23 m, the lily bed 22 m, the Sluice Veil's falls 51 m
```

| thing | where (x, z; y) | size | notes |
|---|---|---|---|
| **the stove** | aft-port corner (−1.00, 1.85), on the hearthstone | 0.5 × 0.5 m, 0.75 m tall | An iron pot-belly on four feet, its door facing forward into the cabin. Its pipe rises, bends under the beams and leaves through the roof at the built collar (−0.40, 1.70), so the outside does not change |
| the hearthstone | x −1.27…−0.60, z 1.20…2.22 | — | pale stone, ash at the stove's foot |
| **the dozing Wicks** | a moss-lined bread basket on the hearthstone (−0.95, 1.35) | 0.5 × 0.35 m | The four Wicks not chosen at New Descent, each by its look (flame, cloak). They sleep with their flames low at first light, "laid by the fire" (`LORE.md` §5.1) |
| the kettle | on the stove top | 0.2 m | a people's kettle |
| the bait shelf | port wall over the wood stack (x −1.27…−1.07, z 1.20…1.60; y 1.25…1.75) | — | the save's bait for this water, drawn as tins and jars (§6.5) |
| the wood stack | under the aft port window (z 0.75…1.20) | up to 0.75 m | split wood |
| **the desk** | aft-starboard, under the aft window (x 0.25…1.25, z 1.75…2.20; top y 1.16) | — | A people's writing desk. On it are **the ledger** (0.75, 1.17, 1.97), a candle in a dish and an inkpot. The chair before it (0.75, 1.42) has a crate and cushions on its seat |
| **the bunk** | starboard, x 0.50…1.27, z −0.35…1.15 (mattress y 0.87) | 1.5 m | the people's box-bed, now the Wick's own, with two crates at its foot for a step |
| the hatch | amidships floor, x −0.35…0.35, z −1.00…−0.40 | — | In M1, the wet well's wooden hatch with an iron ring. After M1, the Well's glass hatch (`AQUARIUM.md`) |
| the dresser | starboard fore corner, x 0.60…1.27, z −3.45…−2.75 | up to 1.5 m | the people's painted cups, a basket, and a tin candle mould of four cups, one dented |
| **the Long Wall, wing I** | the port wall (z −3.40…0.60) and the port half of the fore bulkhead (x −1.27…0) | two rows | §6.5 |
| the beams | across at z −2.95, −1.95, −1.60, −0.40, 0.05, 1.00, 1.90; y 2.02…2.12 | — | The skylight's frame beams are at −1.60 and −0.40. From the hooks hang a candle lantern over the middle (−0.45), dried herbs over the stove, and a line of the Wicks' tiny cloaks drying |
| the windows | as built: three a side, one fore, one aft by the door | 0.44 m | now openings (§8.1), with inner frames and sills added |
| the door | as built (x −0.70…0.10, 1.48 m) | — | Its inner jamb carries a Wick's notches, one per evening, in fives (§6.2). The barge family's house-mark is painted over it inside (a glyph, never a word) |
| **the lectern** | **moved** from (1.25, 3.00) to the deck's port side (−1.15, 3.35) | as built | so that the Deck frames the Chart and the Journal together (§3.2) |
| the chart table | as built (−1.00, 4.60), its stool at (−0.85, 3.98) | — | |
| the rod rack | as built: the aft wall outside, port of the door (−1.00, 2.32) | — | The rod you own hangs on it, in its tier's colour, as built; the rods it replaced hang on pegs below it. At the Balcony the rod is in your hand; at the Bench it rests in the gallery's holder (§5.1) |
| the tiller | **unshipped and lashed** along the starboard rail (x 1.45, z 3.6…4.8) | — | out of every view aft (the barge is towed; it never steers itself) |
| the rungs | iron rungs up the cabin's starboard wall by the side deck (z 0.25, between two windows) | to the roof | the way up to the Roof from the Rail |
| **the stern gallery** | new: z 5.30…6.60, x −1.25…1.25, floor at y 0.60 | §5.1 | |

### 3.2 The seven places

- **Each place is one authored pose** in barge-local metres.
- **It rides the barge.** Each frame the pose is turned to the world through the barge's own `bob` group, so the eye rides the swell: the barge's roll and pitch of ±0.02–0.025 rad, scaled ×0.5 on the eye, and none under reduced motion.
- **Field of view.** Landscape is 52° vertical. Portrait is 66–70°, with its own look where the frame needs it, as the mooring's `cam` has a `portrait`.
- **What is *measured*:** where each place's targets fall at 1280 × 720 and 390 × 844 (Appendix A).

| place | where the Wick stands | eye (x, y, z) | looks at | cone (yaw · pitch) |
|---|---|---|---|---|
| **Deck** (the hub) | on the deck at the gallery's step, starboard | (0.95, 1.20, 4.85) | (−1.20, 1.00, 3.45), forward-port; portrait (−1.15, 1.05, 3.85) | ±60° · −25…+20° |
| **Hearth** | on the cabin floor, mid-cabin | (−0.05, 1.20, −1.15) | (−0.45, 1.00, 2.00), aft | ±55° · −30…+25° |
| **Long Wall** | on the floor, facing the port wall | (0.65, 1.20, z), on a track along z −2.90…0.30, resting at −1.10 | the wall (−1.27, y, z) | the track · ±30° (±40° portrait) · −20…+30° |
| **Rail** | on a crate on the starboard side deck | (1.52, 1.45, 0.60) | (4.20, 1.95, −4.40), forward-starboard; portrait at Murk (4.71, 2.20, −2.02) | ±60° · −20…+30° |
| **Balcony** (fishing) | at the gallery's port rail | (−0.85, 1.38, 6.05) | dead astern, pitch −7° | ±70° · −30…+15° |
| **Bench** (looking) | seated on the gallery's bench, starboard | (1.05, 1.60, 6.05) | dead astern, pitch −3° | ±80° · −25…+25° |
| **Roof** | on the cabin roof, aft | (0.25, 3.10, 2.05) | (0.10, 2.55, −1.20), forward | ±150° · −45…+25° |

Each frame reads in three values: a warm pool, a working surface, and a cool exit (§6.1).

| place | the frame (warm · surface · cool exit) | what you can touch | ways on |
|---|---|---|---|
| **Deck** | the stove's glow in the door (right) · the chart table (left third, 22% across) and the Journal on its lectern (centre, 52%) · the dawn past the port rail | Chart, Journal, the door, the rod rack, the sill's stones | the door → Hearth · turn → Balcony · along the side → Rail |
| **Hearth** | the stove (60% across) · the desk and its ledger (27%), the bunk at the left edge · the door's dawn (centre, 47%) | the stove, the kettle, the dozing Wicks, the bunk, the ledger, the door | right mark → Long Wall · back or the door → Deck |
| **Long Wall** | the prints' candles in a row · the prints' pale paper and their rulers · the port windows' lavender between them | each print, the port window | left mark → Hearth · back → Hearth |
| **Rail** | Murk's green lamp · the Order Board (left) · the open water past his barge | Murk, the Order Board, the eave's print (once the Matriarch is home) | up → Roof · back → Deck |
| **Balcony** | the raft's lantern below-left · the water: the lily bed (right of centre) and Root Isle (left) · the dawn over the Sluice Veil (centre) | the water (cast), the rod | left mark → Bench · turn → Deck · back → Deck |
| **Bench** | the raft's lantern below-right · the lake · the sky | the rod in its holder, the bollard's moss | right mark → Balcony · back → Deck |
| **Roof** | the pipe's ember and smoke · the Bait Bed's moss (green, living) · the whole lake | the moss, the bell (once found) | back → Rail |

*Measured framing:*

| place | in frame, landscape | in frame, portrait |
|---|---|---|
| Deck | the chart table, the Journal, the rack, the door, the stones | the Journal. The chart table and the door are 26° and 31° off, a short drag |
| Hearth | the stove, the kettle, the door, the ledger, the bait shelf | the stove, the door, the shelf |
| Rail | Murk (centre), the board | Murk |
| Balcony | the raft; the lily bed, 11° right; Root Isle, 14° left; the Sluice Veil, 3° left | all of these but the raft |
| Roof | both moss beds and the bell's post | the same; the bell's post is 46 × 99 px on a phone |

Every target box measured at least 44 px on a phone wherever it is in frame.

### 3.3 Moving between them

- **The doorway is the target.** Tap the door (Deck ↔ Hearth), the gallery's step (Deck → Balcony) or the rungs (Rail → Roof). This is the main way to move, and it needs no new UI.
- **Marks.** A mark is a small filigree arrow carrying a glyph of where it goes: a stove door, a wave over a rail, Murk's lamp, a frame, a bench, a tuft of moss.
  - Edge marks sit at the screen's left or right edge in the lower third: thumb height on a phone, never at the top. Each is ≥ 44 px, drawn at 60% ink until hovered or touched, with at most two per edge.
  - **Turn** is a curved arrow at the bottom centre.
  - **Back** is a hooked arrow at the bottom left, ≥ 56 px. It always goes one place toward the Deck.
  - A mark is spatial where it can be: a place to your right goes on the right edge.
  - Marks have no words. Each mark's accessible name is its place's (§10).
- **Glide times:**
  - 0.8 s within the deck and the cabin;
  - 0.9 s through the door (the path passes the door's centre, with the eye at 1.20 m, under its 1.90 m head);
  - 0.8 s for the turn (a 0.35 m step back and 180°);
  - 1.1 s up or down the rungs.
- **How a glide moves.** Position and the look point move together on one smoothstep, with the look leading (a slight ease-in on the yaw). A 4 cm dip at mid-glide gives a step's settle; there is never a bob.
- **Reduced motion:** every move is an ink dip (0.25 + 0.35 s).
- **Taps during a glide:** one is queued; any more are dropped.
- **Hidden while busy.** Marks and doorway taps hide while a bite, the play, the present or a card is up, and while a screen is open.
- **Keys:**
  - Tab and the arrow keys move focus through the place's targets and marks: the built tiles' ids first (Murk, Chart, Journal), then the place's own objects, then the marks. The look turns to frame the focused one.
  - Enter or Space activates.
  - Escape or Backspace goes back. At the Deck, Escape opens the home pause, as the Jetty's did.
  - Q and E turn the look 20° within the cone.

### 3.4 Looking within a place

- **Drag to look**, with one finger or the mouse.
  - On a desktop, the look turns 0.18° per pixel dragged.
  - On touch, the cone's full width maps onto 60% of the screen's width, so one thumb sweep covers it.
  - The outer 15% of the cone is a soft spring, never a hard stop. On release the look damps to rest (λ 6).
  - It never recentres itself. Arriving at a place resets it to the place's look.
- **The Long Wall's track.**
  - A horizontal drag slides the eye along the wall (z −2.90…0.30) instead of turning it. The look stays square to the wall, with a small yaw cone for a glance.
  - On release the eye settles on the nearest print.
  - At the fore end the track turns 45° to face the bulkhead's prints.
  - On a phone in portrait, about 1.4 m of wall is in view, so this is how the wall is seen.
- **Desktop.**
  - With no button pressed, the look follows the cursor by 15% of the cone. This is off under reduced motion and for touch.
  - A drag takes the whole cone. There is no pointer lock.
- **Gyro** is not built (§9.7).

### 3.5 Close looks

- **What a close look is.** Tapping a thing leans the eye in to a close look: a short glide (0.6 s) to a pose authored at that thing.
- **Then the screen.** The thing's screen opens over it. The scene is dimmed under the screen but not blurred, since a blur would cost a render pass.
- **Coming back.** Closing the screen glides back (0.5 s). A close look without a screen (a window, the stones, the bunk) returns on a tap anywhere, or on back.
- **The promise kept.** Close looks are the "camera moves inside" that SPEC §6.1 promised for the gallery, made general.

| close look | where the eye goes | what it sees | then |
|---|---|---|---|
| the chart table | kneeling on the stool (−0.88, 1.60, 4.00), looking down 34° | the drawn sheet on the table (its built top), the weight, the rolled sheet | the Chart |
| the Journal | on a crate at the lectern (−1.15, 1.65, 3.85), looking down 17° | the open book | the Journal |
| the ledger | on the chair's crate (0.75, 1.62, 1.45), looking down 41° | the ledger open under the aft window's light | the sheet (`SHEET.md`) |
| the rod rack | (−1.00, 1.30, 3.10), looking up 10° | the rod you own and the rods it replaced | the sheet, at Tackle |
| a print | 0.6 m from the wall, square to the print, at its height | the print at true size on its ruler, and its candle | the print's card (§4.2) |
| the port window | on the wood stack, 0.35 m from the glass | the shore 12 m off, its reeds, the dawn mist, and the Night-Lily boxes if worn | — |
| the sill's stones | (−0.30, 1.05, 2.90), looking down 56° | the four stones: the Mossmere's is inked (gilded once the Matriarch is landed) | — (a soft chime) |
| the bunk | lying on the mattress, looking up | the beams, the hanging lantern's slow swing, the skylight's sky paling | — (3 s, then up) |
| Murk | from the Rail, the eye tilting up to his face | — | his shelf, as the catalogue (`gw-mvp-catalogue`) |
| the Order Board | from the Rail, 0.9 m away | the chalked orders | the shelf, opened at its orders |
| the eave's print | from the Rail, looking up 20° | the Matriarch's print in its gold frame along the starboard eave | her print's card |
| the moss | on the Roof, over a planter, looking down 60° | the moss parting; a Mire Worm curls and goes back | — |

## 4. What you can touch (B)

### 4.1 Signalled without rings or outlines

Never a ring, disc, glowing outline or radial highlight round anything. The signals work together:

- **Composition.** What you can touch is where the light falls: the stove's pool, the candles under the prints, the aft window's cool light on the ledger, the lantern's light on the chart table. Set dressing sits in the dim. This is the strongest signal, and it costs nothing.
- **Lift and glint.** On hover (desktop) or touch-down (phone), the thing rises 1–2 cm and tilts 2–4° toward the eye, and its edge brightens 15% for 0.4 s.
  - The ledger's cover opens a crack, the kettle's lid lifts, a print's candle leans.
  - This is built as per-part uniforms on the merged mesh (§8.2), so it costs no draw call.
- **Living light.** What you can use has a little living light near it, slow and irregular (two summed sines at 0.7 and 1.9 Hz, plus a little noise).
  - It shows in the stove's banked breath, the ledger's candle, the prints' candles and the raft's lantern below the balcony.
  - Idle things are still.
- **The idle hint.** After 9 s with no input at a place, the nearest thing you can touch lifts and glints once. It happens once per visit to that place, and not again until you leave and come back.
- **The cursor** on a desktop becomes a small filigree hand over a target.
- **Focus** (from keys) uses the built Jetty targets' focus style (the word brightens and gains its filigree underline), plus the thing's lift. No box is drawn.
- **Words.** The three built tile words, **Murk**, **Chart** and **Journal**, sit under their things while in view (16 px and up, Drowned Filigree), as at the Jetty. Every other target has no words, only an accessible name (§10).

### 4.2 Every target

| id | at | the thing | what it does | opener (built unless marked) |
|---|---|---|---|---|
| `chart` (`[data-tile=chart]`) | Deck | the chart table | a close look, then **the Chart**, then Sail | `openChart()` |
| `journal` (`[data-tile=journal]`) | Deck | the lectern's open book | a close look, then **the Journal** (its Prints page and catalogue as built) | `openJournal({from: 'jetty'})` |
| `door` | Deck, Hearth | the cabin door | go through | — |
| `rack` | Deck | the rod rack | a close look, then **the sheet at Tackle** | `screens.openSheet({from: 'rack', section: 'tackle'})` (`SHEET.md` §2.3) |
| `stones` | Deck | the sill's four stones | a close look, and a chime | — |
| `stove` | Hearth | the stove's door | opens on the banked fire, which breathes brighter, then closes (§4.4) | — |
| `kettle` | Hearth | the kettle | sings after 2 s, with a curl of steam | — |
| `wicks` | Hearth | the dozing Wicks' basket | one Wick stirs (§4.4) | — |
| `bunk` | Hearth | the Wick's bunk | a close look: lie down for 3 s | — |
| `ledger` | Hearth | the ledger on the desk | a close look, then **the sheet**, at its head | `screens.openSheet({from: 'ledger'})` (`SHEET.md`) |
| `wall` (`[data-tile=wall]`) | Long Wall | the wall as a whole (its built accessible name, "The Long Wall") | brings the eye to the wall's resting point | — |
| `print:<speciesId>` | Long Wall; Rail (the eave) | a hung print | a close look, then **its print card** (below) | new view in `ui-prints.js` |
| `window` | Long Wall | the port window | a close look | — |
| `murk` (`[data-tile=murk]`) | Rail | Murk on his barge | **Murk's shelf**, as the catalogue (`gw-mvp-catalogue`) | `openShelf()` |
| `orders` | Rail | the Order Board | the shelf, at its orders | `openShelf({focus: 'orders'})` |
| `water` | Balcony | the water astern | casts there (§5.4) | `fishing` |
| `rod` | Balcony, Bench | the rod in hand, or in its holder | At the Balcony it rests the rod and moves you to the Bench. At the Bench it takes the rod up and moves you to the Balcony | — |
| `bollard` | Bench | the Moat Bollard's mossy crown (once found) | a Mire Worm curls in the moss | — |
| `moss:1`, `moss:2` | Roof | the Bait Bed's planters (I, II) | a close look; the moss parts | — |
| `bell` | Roof | the Rust Buoy-Bell on the bow post (once found) | it rings once | — |

**A print's card** draws the print large, using `ui-prints.js`'s drawing. It shows the fish's name, its weight and small cm line, where it was caught and which evening. This is the Journal's Prints page entry, so it needs no new word.

**The 2D gallery leaves home.** Its screen (`ui-prints.js` `createGalleryView`) leaves the home flow, because the Long Wall is now the place you look at. The Journal's Prints page stays the 2D record of every print.

### 4.3 The sheet's home: the ledger and the rod rack

`SHEET.md` (written beside this, on `gw-design-sheet`) designs the gear and character sheet as a screen: gear quality, what is fitted as upgrades, how each changes the catch, and the Wick's stats and buffs. This design gives the sheet two things to open it from.

- **The ledger** on the Wick's desk, in the cabin's aft-starboard corner under the aft window.
  - It is a people's account book that the Wick keeps: its cover is the barge road's faded rose, with a ribbon and the candle in its dish beside it.
  - Tap it: a close look at the desk, then the sheet at its first page.
  - It sits in the Hearth's frame (27% across, with the window's cool light on it). Its candle is the desk's living light.
- **The rod rack** by the door on the stern deck: `SHEET.md`'s object (its §2.3), the Wick's kit wall.
  - The rod you own hangs on it in its tier's colour, as built. Below it, on pegs, hang the rods it replaced (T0's Willow Switch once you own Ashwood, and so on), with the reel and line you had.
  - A could, either lane's (`SHEET.md` §2.3): the fitted lure on its own peg below the rod, and the tin on a shelf under it.
  - The rod you fish with is in your hand at the Balcony, or in its holder (§5.1).
  - Tap the rack: the sheet, at **Tackle**.

**The seam (§9.5).** The sheet is the Journal's first tab, its flyleaf (`SHEET.md` §2.1), opened by `SHEET.md`'s one opener:
- the rack calls `screens.openSheet({from: 'rack', section: 'tackle'})`, and its id is `rack`, as `SHEET.md` §2.3 fixes;
- the ledger calls `screens.openSheet({from: 'ledger'})`, the sheet at its head (the Wick and its passive).

The Journal's lectern keeps opening the Journal on its water's tab, one tab from the sheet. Whichever lane lands second wires the calls.

The sheet's own third-person `rack` target (`SHEET.md` §2.3, a fifth DOM target over the arrival framing) stays with the third-person targets: the tutorial's view and the fallback (§2.3). Closing the sheet returns to the close look, which glides back. The rod in the Wick's hand at the Balcony is the gear seen in the world: its tier's wood, reel and line (§6.6).

### 4.4 Small pleasures

Each pleasure changes nothing, and each has its sound (§7).

- **The stove door** opens on **Murk's banked fire**.
  - The embers under their ash breathe redder for a few seconds. The room's warm pool brightens 25%, and the dozing Wicks' flames lean toward it. Then the door closes.
  - The fire is never stirred, raked, fed or made to blaze: Murk rakes it open once, at the end of the road (`LORE.md` §8). Tapping it again only opens the door again.
- **The kettle** sings thinly after 2 s, with a curl of steam from the shared smoke pool.
- **A dozing Wick stirs.** One of the four lifts its flame, opens its amber eyes a crack, and settles again.
  - They take turns, and the one you play is never among them.
  - They never speak (`CHARACTERS.md` §3, who talks).
- **The bunk.** Lie down and look up at the beams, the lantern's slow swing and the skylight's sky, for 3 s.
  - A window candle lives from dusk to first light (`LORE.md` §2), so first light is the Wick's bedtime.
  - No time passes.
- **The port window.** Lean in and look out at the shore: the reeds 12 m off, the dawn mist, a heron if one is there.
- **The sill's stones** show the journey so far, with a soft chime.
- **The moss** on the roof parts under the Wick's hand, and a Mire Worm curls and goes back (the Bait Bed's free tins, seen).
- **The bell**, once found, rings once.
- **The bollard's moss**, once found, shows a worm.
- **The hanging lantern** swings slowly with the barge. It is not tapped; it is life.

## 5. The stern gallery and the stern line (C)

### 5.1 The stern gallery (new on the hull)

The gallery is a railed porch over the rudder, the barge-house's own:
- **The floor** is at y 0.60 (one 0.18 m Wick-step up from the deck). It runs from z 5.30 to 6.60 and x −1.25 to 1.25, overhanging the transom (z 6.0) by 0.6 m on two curved knees.
- **The rail** runs on its three open sides. Its cap is at y 1.08 (0.48 m above its floor), with a rope at half height.
- **The bench** runs along its starboard side (x 0.85…1.22, z 5.70…6.50), with its seat at y 1.05 and the rail as its back.
- **The rod's holder** is an iron ring on the port aft post at y 1.30. It holds the rod you own upright while you sit on the Bench. The rest of the time the rod hangs on the rack by the door, as built; the rack cannot be seen from the gallery, so the rod is never drawn in two places at once.
- **The bollard** stays as built at the starboard fore corner (0.95, 5.50), with the raft's rope running down from it.
- **The rail lanterns** of Barge lights I stand just forward of the gallery on the quarters (z 5.2, as built).
- **The tiller** is unshipped and lashed along the starboard rail.

**Clearances (*measured*).**
- The raft's circle (centre z 8.80, r 1.6) is 0.60 m clear of the gallery's aft rail.
- The gallery lies inside the aft hull circle's reach (z 4.8 + 1.8 = 6.6). So the obstacles, the raft's tie-up at the Jetty and the glide in and out do not change.
- The half-beam at the transom is 1.44 m, so the gallery sits inside the hull's width.

**Outside, it changes the arrival shot.**
- The mooring's camera sits aft-starboard, 12.8 m off the stern at 39° (*measured*). So the gallery, its bench and the rod in its holder are in that frame: the barge gains a porch.
- The 5b before-and-after pairs and `frameCheck` are taken again.

### 5.2 Standing and looking

*Measured* from the poses of §3.2. Angles are from dead astern; "left" and "right" are as you look out.

- **Dead astern, 51 m**: the Sluice Veil's water-curtain on the east cliff (`WATERS.md`), with its inflow's seam and gravel fan at 48 m. It is the brightest part of the frame at first light: white water under the dawn.
- **Root Isle**, 23 m away at 12–14° left (radius 5 m), with its drowned roots.
- **The lily bed** at (40, 28), 22 m away at 11–13° right (radius 5 m): pads, with the near shore closing in beyond it on the right (27 m at 40°, 21 m at 60°).
- **The open lake** on the left: the Drowned Gatehouse (52 m, 43°); the pylons (46–65 m, 36–55°); the Bell Pool (60 m, 68°) at the cone's edge; and the Toppled Bridge's piers beyond it (54–76 m, 92–97°, seen only from the Bench).
- **Below**: your raft at the Jetty, 2.8 m off the transom, with its lantern lit, the creel or chest you own on its deck, and its pennant and lantern glass if worn. The Jetty's two posts are there too.
- **The two poses frame it differently.**
  - Standing at the Balcony (the port rail): the raft lower-left, Root Isle left, the Veil centre, the lily bed right.
  - Seated on the Bench (starboard): the Veil centre, Root Isle a little left, the lily bed and the raft right, with the wider cone (±80°).
- **The sky** is home's: first light, held, because the clock stands still at home (SPEC §3.4). The dawn mist lies on the far shore (`world.js`'s dawn air). Whether the morning should come up slowly while you sit is §12 question 47.

### 5.3 The water it fishes

**Where it is.** The stern fishes the Mossmere's open water at its mooring.
- The nearest place is the Bell Pool, 60 m off. The arc never reaches a place, a mist bank, the inflow or the outflow.
- So the stern fishes **open water's pool** (WATERCRAFT §2.4), by the area the float lands in. That area comes from `watercraft.areaAt` with the world's probe, docks and hull circles, as for a trip's cast.

**The arc.**
- It runs from the Balcony's eye, from 6 m (past the raft) out to the rod's reach: castMax is 16 m for the Willow Switch, 17.5 m for Ashwood, 19 m for Whalebone.
- It spans ±60° of astern.
- It never falls inside the raft's circle plus 1 m, or inside a hull circle. A tap outside the arc slides to the nearest legal point.

**What is in it (*measured*).** Shares come from a 1 m grid by area. Numbers in brackets are polar shares (sampled by angle and distance, which weights the near water); the stones' three-way split is polar too.

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

**The tells and the shapes** (WC-2) play at the stern as on a trip, within the arc and a 15 m margin round it.
- Each follows its own rules: a rise where its fish are, the water's answer when the tell is obeyed, and none on quiet water.
- Silhouettes show where the water is shallow enough (near Root Isle), up to three on low.
- They cost one instanced call while in view, as built.

### 5.4 The cast, the float and the line, from the eye

- **The rod** is in the Wick's right hand at the Balcony, entering from the lower right.
  - The grip is 0.3 m from the eye and the tip about 2 m out and 0.6 m up, so the tip sits about 62% across and 30% down the frame.
  - The line therefore always has its origin in view. The rod looks like the one you own (§6.6).
- **Aiming on a phone.** Tap the water where you want the float.
  - A press on the water shows the built arc dots from the rod tip to the landing point. These are the trip's own aid under the loop: no ring, no reticle, no disc on the water.
  - A drag moves the point, and release casts.
  - A press above the horizon (the sky, the far shore) looks instead.
- **Aiming on a desktop.** The cursor over the water shows the arc dots, and a click casts there. Space or Enter casts to the water at the centre of the view (where you are looking).
- **The cast.**
  - A 0.25 s wind-up: the rod tip lifts out of the top of the frame, then whips down.
  - The float's flight is as built: 0.45 s, plus 0.03 s per metre.
  - The eye drifts 10% toward the landing and settles. The eye never chases the float.
- **The line** is the built ribbon (`actors.js` `makeLine`), drawn from the first-person rod's tip.
  - The built line has a fixed width in world units, so it thins with distance. Here its width grows with distance so it is never narrower than 1.5 px on screen.
- **The float** is as built. Its size reads well at 16–19 m, the trip's own range.
- **Recasting.** A tap on the water while the float waits recasts there; the line comes in first, as on the raft.

### 5.5 The bite and the automatic play

The bite is as built: the float's nibbles and its strike, the strike tap anywhere (or Space), then the automatic play (CONTRACT §13.7a). In first person:
- **The rod** bends in your hand (the built bend, `ROD_PARS`'s `uBend`, on the first-person rod).
- **The line** tightens and swings with the fish's runs.
- **The eye** leans 1–2° toward the fish and eases 15% toward it.
- **A soft vignette** deepens with the line's tension.
- **No meter, no class stamp, no word** (SPEC §8.1).
- **A fish that gets away is named nowhere** (WATERCRAFT §7): the line goes slack, the float pops up, and there is a splash and a wake.

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

**The card** is the built catch card: the name, the class stamp, the weight as the hero, the small cm line and the record kicker. On a first landing of a listed fish it also shows the list's seal and count.
- It has **one button: Let go** (key 2; ≥ 56 px).
- There is no knife, so no Cut Strip at home.
- There is no Aquarium either. After M1 the Well takes fish only from a trip's card (§5.7).

**Let go.**
1. The hands lower the fish over the rail, the eye tilting down 20°.
2. It drops: a splash, ripples spreading, and a wake by its size.
3. The eye comes back up.

The Wick's third-person show (`actors-show.js`) is not used aboard. A reload during the present lands at the Balcony with the fish let go (§2.4).

### 5.7 The economy guard: fishing at home never breaks the trip loop

Checked rule by rule against SPEC §3.1–§3.6, §4.10, `WICKS.md` §2 and the sim:

| rule | on a trip | at the stern |
|---|---|---|
| **clams** (§4) | a kept fish sells at the tally | **None.** A stern fish is never sold, never kept and never on the tally. Nothing at home pays |
| **the hold** (§3.1) | a kept fish takes a slot | **Untouched.** There is no hold at home (`run` is null), and the stern never creates one |
| **keep or let go** (§3.2) | Keep · value, or Let go | **Let go only.** A let go gives back no bite and adds no favour, since every stern fish is let go |
| **good bites** (§3.3) | open water: slots + 1 (4–9) | **Three a dawn** (`LOOP.stern.bites` 3), at open water's favour of 0.<br>Every bite struck, passed or spooked spends one, landed or lost.<br>After that, **quiet water's rule as written**: favour −0.15 a bite down to −1.2, waits ×1.3 a bite up to ×2.2. Nothing ever stops biting.<br>The float's dots show the three (built). The count belongs to the dawn: it comes back when the next evening is sold |
| **the evening** (§3.4) | late day, then dusk, then night | **First light, held.** The clock stands still at home and the stern does not move it.<br>The bite roll reads the light as day (`watercraft.lightOf`), so only fish whose hour is day or any can bite, with no phase favour. Night fish never bite here.<br>No evening is counted |
| **the hook** (WATERCRAFT §3) | the fitted lure and bait | **The same.** The line carries what is fitted (the lure, and the bait slot's tin), so the 1% rule holds: a worm never brings a pike.<br>**No bait is spent at home**, since the bag belongs to the evening |
| **places, giants, legends, Elders** (§3.5) | at their places | **Never.** No place is in reach, so no giant bites (each bites only at its own place), no legend (she bites only in her pool), no Elder (old water only) and no Marked Fish |
| **finds** (§4.10) | 1 bite in 20 is a snag | **Never at the stern.** A find needs the hold or a fitting, so the snag roll is off |
| **the Wicks' passives** (`WICKS.md` §2) | each works from the first evening | **Only Stub's quick waits** (×0.78), because they belong to the bite.<br>These do not act at the stern: Tallow's good bites (the hold's), Taper's first non-common bite (an evening's), Ashwick's comeback (an evening's), and the found bite part (part of open water's evening count).<br>**A stern catch does not write the Wick's firsts ledger** (`meta.loop.firsts`), so its first-sale bonus waits for the first such fish kept on a trip |
| **the pull** (§5.5 (d)) | listed fish are pulled by evenings, with the ninth evening's guarantee | **Not applied** at the stern, since it belongs to the evening |
| **records** (§6.4) | written at the measure | **Written as for any catch**: the Journal page, the best, the class seal, and the list's tick. The tick reads the shared Journal's `caught > 0`, and it is honest: the fish was caught at the current water.<br>**The ink print** too, so the Long Wall fills from the porch as well.<br>The print's "where" is the Mossmere: `printWhere` reads the stern's key as its water's name, so no new word |
| **orders** (§6.3) | a fish that fills one sells double | **Never filled**, since nothing is sold |
| **odds** (§3.7) | hidden except in the logs | **Hidden.** No area name, rate or size shows before the card. The gear log's Who bites is unchanged |
| **no way to fail** (§3.6) | | Nothing is spent or lost at the stern.<br>The stern line opens from the first dawn home (`evenings ≥ 1`, the tutorial done), never on the opening's chart beat |

**The sim is unchanged by construction.**
- A stern catch pays 0 clams. It touches no field the sim models: `clams`, the hold, `run.bites`, `evenings`, the shelf.
- So these all stand: `clams.mjs`'s natural rule, the anti-grind proof (sim section 2), M1's pacing and T104. M1's pacing (WATERCRAFT §8.3) is the first purchase on trip 3–5 and the empty shelf in 4.5–7.5 h.
- Lane I-3's node test proves it (§9.3): 300 seeded stern bites over 100 dawns change `meta.loop` only in `stern`, `prints` and the shared records.

**The other way** (§12 question 44): keep stern fish and sell them to Murk over the rail.
- *Est.*: three stern fish would add about +30 clams a visit on the first trips and about +45 at the hour mark. Against a first trip's 43 clams from 4 bites (SPEC §3.3) and 245 a trip at the hour mark, that is +70% and +18%.
- It would let a player skip the hold's ladder, need the sim re-run, and move M1's pacing.
- It is not the default.

### 5.8 What this reverses

- **M1 §8 question 5 and SPEC §16 question 17** (fishing at home; the default was "no cast"): **answered by the user's words** of 16 November 2026. The answer is the stern line, let go only.
- **M1 §2.6's box "No cast at home"** becomes "**The stern line**". A press at home reaches `fishing` only at the Balcony with the rod in hand, and its catch never fills a slot, pays or counts an evening (a test).
- **SPEC §6.1's** "a press anywhere else at home does nothing, and never casts" gains "…and never casts, except the stern line at the Balcony (§6.6)".
- **`tools/tests/loop-5a.scenario.mjs`'s "no cast at home" check** (line 131) is reversed to "a cast at home only from the Balcony, and it never pays, fills or counts an evening".
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
  - **Green only on living things**: the Bait Bed's moss, the moss pot by the door, the Night-Lily window boxes, the faint glow of the Lumen Moss jars on the bait shelf, the moss on the bollard's crown.
  - Dried herbs are straw and lavender, never green.
- **The UI** over it is Drowned Filigree, as built: the marks, the words under Murk, Chart and Journal, and the cards.

### 6.2 The drowned kingdom's timber, and the clutter that tells the story

- **The people's house.**
  - Wide planks gone silver-brown.
  - The barge road's faded lavender band and the rose door's paint, as outside.
  - Carved beam ends and iron hooks.
  - The family's house-mark over the door, the painted cups on the dresser, a basket.
  - The tin candle mould with its dented cup: where window candles came from.
  - The people are shown only by what they made and left (`LORE.md` §2).
- **The Wicks' adaptations.**
  - Crates for steps, cushions piled on the people's chair, a crate at the rail, rungs up the wall.
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
- the stove's pool, 2.6 m from its mouth across the floor, the walls and the underside of the beams, with a soot fan up the wall behind it;
- each print's candle (0.35 m);
- the desk's candle and the hanging lantern's stub.

The bake breathes slowly, with a 0.2 Hz swell under the built flicker: "the way a banked fire breathes" (`LORE.md` §6's Banked Fire).

**The cool spill.**
- Each window's and the skylight's lavender pool on the sill, the floor and the opposite wall, and the door's rectangle on the floor.
- These are baked into the vertex colours and do not change, since home is always first light.
- Contact shadows are a darker band of vertex colour under each piece of furniture.

**Outside sees inside.**
- The dark box and the glow quads in the doorway go. Through the open door, the arrival shot now sees the real interior, with its floor and far wall lit warm by the bake.
- The windows keep their warm glow quads on the outside. The quads are single-sided, so from inside you look through them.

### 6.4 Ink up close

- **The barge's ink** (the inverted-hull outline) gains the interior's big shapes: the stove, the desk, the chair, the bunk, the beams, the gallery's rail and bench, the dresser.
- **Up close**, its depth evening already thins lines and never fattens them.
- **The trap is closed.** The closed `cabinShell` box in the ink is rebuilt with openings for the door and the windows, so seen from inside no solid ink fills a doorway or a window (§8.1).

### 6.5 Every M1 home upgrade and found part, inside and out

**The Long Wall, wing I** (250 clams). Outside it is the cabin's warm doorway, as built. Inside it hangs on the port wall and the port half of the fore bulkhead, in two rows:
- The long fish hang low at the Wick's eye (centres 0.55 m above the floor). The small fish hang above the windows (1.48 m) and between them.
- Each frame is at true size on its painted ruler, with a candle on a ledge under it, lit once its print is hung. The giants' frames are gold.
- Before wing I: bare boards, nails and the people's paint.
- Once bought, all 16 frames hang at once, with blank paper and unlit candles. Each fills as its species is printed.
- *Est.* capacity: 15 m of print, against wing I's 16 best prints of about 11 m with their margins.

Everything else:

| what | outside (as built, or as amended) | inside, or seen from aboard |
|---|---|---|
| **the Matriarch's print** (a legend landed) | along the starboard eave, gold-framed (as built) | seen from the Rail, looking up 20°. A target: her print's card |
| **Bait Bed I–II** | the roof's moss planters (as built) | The Roof's beds: living green, and the moss parts. Inside, the bait shelf's moss-lined crate of Mire Worms, topped up to the Bed's floor at dawn |
| **Barge lights I** | the rail lanterns (as built) | the two quarter lanterns at the gallery's forward corners, fading as the sky pales, with their light on the gallery's boards |
| **Murk's Order Board I–II** | on the starboard rail (as built) | **Turned to face the side deck**, so the Wick reads it from the Rail (Murk leans across to chalk it) |
| **tackle: Rod, Line, Reel T0–T2** | the rod on the rack (as built) | **The rod in the Wick's hand** at the Balcony, by tier (§6.6), with its reel and line. The rod you own hangs on the rack by the door, as built, with the rods it replaced below it |
| **the raft: Hold, Oars, Keel, Lantern** | on the raft (as built) | seen below the gallery: the creel or the chest on its deck, the oars shipped, the lantern |
| **Slate Cloak Dye** | on the Wick | **The first-person cuffs** at the bottom of the frame are slate, on the hands and at the present |
| **Oxblood Pennant, Amber Lantern Glass** | on the raft | below the gallery |
| **the sill's stones** (arc I) | at the door (as built) | the Deck's close look |
| **the Rust Buoy-Bell** (found) | on the bow post (as built); it rings at the tie-up | the Roof's view forward. A target: it rings |
| **the Gate Lamp-Glass** (found) | the windows warmer and seen farther (as built) | inside, the window glass's edges are amber and the windows' light warmer |
| **the Moat Bollard** (found) | on the stern deck; the raft ties to it | at the gallery's starboard fore corner, by the bench. Its moss crown is a target (a worm) |
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

**The rod, by tier.** It is one small merged mesh, vertex-coloured toon with its own ink, in the tier's look (as `actors-home.js`'s rack already colours it):
- **Willow Switch** (T0): a pale green-brown switch with a cord-wrapped grip, the line on a wooden winder.
- **Ashwood** (T1): honey-coloured wood, a cork grip, a small wooden reel.
- **Whalebone** (T2): pale bone with brass ferrules and a brass reel.

The Line's tier tints the line (undyed, amber, lavender). The Reel's tier sets the reel's look. The found tassel hangs from the rod's butt.

**The hands.**
- Two small wax hands (the Wick's `wax` colour) and the cloak's cuffs, in its cloak colour (slate if the Slate Cloak Dye is worn).
- About 400 triangles, toon with ink.
- They are seen only holding the rod and at the present.

**The flame above the eye.**
- A 6% amber wash at the top edge of the frame, breathing with the Wick's flame. It is a screen-space gradient in the grade, not a light.
- A warm top-light term on the hands and the presented fish.
- You are a candle: you can see your own light at the edge of sight.

**Never** a crosshair, a reticle, a body, feet or a head bob.

### 6.7 Originality

- Point-and-look navigation between fixed viewpoints is a general technique.
- The rooms, their props and their names come from the Slow Hearth's own fiction (`LORE.md`): the people's barge-house, Murk's banked fire, the window candles, the Long Wall, the Bait Bed, the sill's stones.
- No other game's interiors, names or art are copied, and no TV series or presenter is named.

## 7. Sound

`audio-home.js`'s home bed is kept and placed by where you are: the stove, water against the hulls, a far bell, and Murk's hand bell.

| where | what you hear |
|---|---|
| **inside** | the outdoor bed low-passed (the cabin is dry and close); the stove's slow breath and tick and the dozing Wicks' faint purr, rising at the Hearth |
| **on the deck** | the awning's canvas, and the water against the hull |
| **at the stern** | open water, the Sluice Veil's far rush, birds at first light, the raft knocking at its rope |
| **on the roof** | the wind and the whole lake |

- **Moving.** A glide is one board creak: the door's latch going through the door, and the rungs' iron going up.
- **Each pleasure has one sound**: the stove door's iron, the embers' hush, the kettle's thin song, a sleepy hum, the glass, a stone's chime, the moss's rustle, the bell.
- **The stern line** reuses fishing's and the show's cues: the cast's swish, the float's plip, the strike, the line's hiss, the present, the splash of the release.
- **All of it** stays inside the −1.0 dBFS master. `audio-render.mjs --set=home` gains the aboard beds.

## 8. Performance (E)

### 8.1 One barge, inside and out (shared meshes, no swap)

**How it is built.** The interior is merged into the barge's own three meshes (timber, glow, ink), and `setVariants` rebuilds them as today.

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
| the barge's main-pass calls | **≤ 6** (today 4: timber, glow, ink, the chart table's top) | Adds the Long Wall's print atlas (1, frustum-culled: drawn only when a cabin place can see it), and the first-person rod or the present's hands (1, only at the stern) |
| mirror · shadow | **≤ 2 · ≤ 2** (today 2 · 1) | The interior goes inside timber and glow. The rod, the hands and the atlas are kept out of both (`noReflect`, `noCast`) |
| PointLights | **none added** | The raft's lantern stays the one warm light, and Murk's stays held at 0 |
| triangles | The interior and the gallery ≤ 8k (*est.* 5–6k).<br>*Est.* by part: the stove ~600, the desk and chair ~300, the bunk ~300, the Wicks' basket ~600, beams and hooks ~400, wing I's 16 frames and candles ~700, the gallery ~600, the rungs ~150, clutter ~1k.<br>The rod ≤ 600; the hands ≤ 400 | spent on silhouettes near the eye: the stove's belly, the desk's edge, the door frame, the gallery's rail |
| textures | **One new**: the print atlas, one 1024 × 1024 canvas (4 MB, 5.3 MB with mips), drawn from `galleryModel`'s frames only when a print changes.<br>The chart top stays as built. The hands, the rod and the interior are vertex-coloured, so nothing else | 512 px a metre, so a 0.5 m print is about 256 px across at the Long Wall's 1.9 m. Its close look opens the print card's own drawing for detail |
| per-part motion | 0 calls | One float attribute, `gwPart`, on the timber (as the glow has), and a uniform array of up to 16 parts. Each part has a lift (y), a hinge angle about a per-part pivot and axis, and a glint (emissive). The parts are the stove door, the kettle's lid, the ledger's cover, the prints' candles and the hanging lantern |
| a rebuild | ≤ 15 ms on the low desktop (*est.*) | `setVariants` and `bakeWarm` grow with the vertices, and run only when what you own changes |
| **each place's frame** | **≤ 150 calls on low**: the home frame's line. Low first light measured 144 today, and 139 on a phone.<br>On medium and high, no worse than the arrival shot's: 226–227 today, already over 200 and reported, not failed | measured per place (`clarity-perf --aboard`) |
| the Wick aboard | hidden | Its meshes, outlines and flame are not drawn aboard (*est.* 6–10 calls saved) |

### 8.3 What each place costs, and the cabin's mirror switch

- **The cabin's places** (the Hearth, the Long Wall and their close looks) look at walls with small windows.
  - The world in front of them is still in the frustum and still drawn, since there is no occlusion culling.
  - But the water's mirror pass is barely seen through a window. So **on medium and high, the cabin's places switch the water's mirror off**, giving the low tier's water look through the windows. The window's close look switches it back on.
  - Each place's data carries `mirror: false` or `true`. The saving is measured, not promised (*est.* tens of calls on medium and high).
- **The deck** faces the cabin and the shore.
- **The balcony and the bench** face the open lake like the arrival shot, plus the tells' one call and the rod: *est.* 145–148 calls on low with the Wick hidden.
- **Glides and drags** render at 0.75 of the pixel ratio, since motion hides it, and go back to the tier's own at rest.
- **Memory**: the 20 round trips of M1 §2.14 (home to the evening and back) stay flat within 10%, now through the dip aboard and out.

### 8.4 Phones

- **Portrait sees one subject at a time.** Its horizontal field is about 33° at 66° vertical.
  - Each place has a portrait look on its hero: the Journal at the Deck, the stove at the Hearth, Murk at the Rail.
  - The cone and the Long Wall's track carry the rest under one thumb.
  - The marks sit in the lower third.
- **M1 §2.12's sizes hold.**
  - Every target is ≥ 44 px wherever it is in frame.
  - Every primary button is ≥ 56 px.
  - Text is ≥ 16 px.
  - The safe areas are kept.
- **On real phones** (M1 §2.12's two), p95 is ≤ 33 ms aboard, and at the stern during a play.

## 9. Build plan (F): M1 step 5d, after tonight's merge (LARGE)

### 9.0 Where it sits

- **M1 step 5d** (QUEUE job 13, after tonight's MVP merge), before step 6's polish pass, so the polish pass and the playthrough cover it. "The home barge, complete" includes being inside it.
- **Base**: the MVP integration branch after tonight's merges: 5B, 5C, WC-1–3, the catalogue on `gw-mvp-catalogue`, and the sheet's lane if it is built first. The sheet's screen is not needed to start.
- **Four lanes.** I-1 and I-2 start together.
  - I-2's first commit unblocks I-3's browser work and I-4. It is the data block, the director with its poses, the `'aboard'` camera, and the post-camera hook.
  - I-1's first commit (`aboard-layout.js` and the parts API) unblocks I-4.
- **Merge order**: I-1, I-2, I-4, I-3, with the whole gate and one browser walk after each.
- **Sizes**: I-1 L, I-2 M–L, I-3 L, I-4 M; about two weeks of wall time with four lanes.

### 9.1 Lane I-1: the interior's art and scene (`gw-inside-scene`, L)

**Owns:**
- `src/actors-home.js`:
  - the gallery, the lectern's move and the tiller;
  - the shell's holes, the windows' openings, and the doorway's box and glow quads removed;
  - the indoor term, `bakeWarm`'s pools and the parts uniforms;
  - `calls()`, plus `toWorld` and `bob` on the API.
- `src/actors-home-inside.js` (new): the cabin's geometry and its variants.
- `src/aboard-layout.js` (new, pure): every interior box and anchor of §3.1, and the places' eyes of §3.2. I-2, I-4 and the validator share it.
- `src/home-targets.js`: `BARGE_LOCAL.lectern` moved, and `TARGET_BOXES.journal` with it.
- `src/actors-finds.js`: the found parts' places inside and on the gallery.
- `tools/tests/aboard-scene.test.mjs` (new).
- `tools/tests/clarity-perf-home.mjs` (`--aboard`).
- `tools/tests/loop-aboard-look.scenario.mjs` (new).

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
  - `calls()` is ≤ 6 / 2 / 2, and there is no PointLight in the barge's tree;
  - the indoor term is 1 at every interior vertex and 0 on the hull's outside.
- Look sheets of every place, desktop and phone, taken through `render.setIntroCamera` at w 1, so the lane needs no director. At least three look-and-fix rounds.
- The arrival shot before and after (the gallery, the door's interior), and every upgrade's and part's before-and-after pair inside.
- `clarity-perf --aboard` per place: ≤ 150 on low; on medium and high, no worse than the arrival shot.

### 9.2 Lane I-2: the eye: camera, look, places, the way in and out (`gw-inside-eye`, M–L)

**Owns:**
- `src/aboard.js` (new): the director.
  - the places, with their poses turned from local to world through the barge's `bob`;
  - the cone and its spring, and the Long Wall's track;
  - glides, dips and close looks, the queue, and focus;
  - the `aboard:*` events, and `ctx.game.aboard`.
- `src/ui-aboard.js` (new):
  - the DOM targets per place, over their projected boxes;
  - the marks, back and turn, the three words, focus and keys;
  - a CSS class that hides the Jetty's targets while aboard (no `ui-loop.js` edit).
- `src/render.js`:
  - camera mode `'aboard'`: the director's pose applied last and exactly, with no sway and the barge's roll ×0.5;
  - near plane 0.08 aboard and 0.25 off it;
  - the post-camera hook, `render.afterCamera(fn)`;
  - the 0.75 pixel ratio in motion, and the cabin's mirror switch.
- `src/loop-home.js`: the dip aboard on Sold, the dip out on Sail, Continue aboard, and `aboard:leave` on every exit.
- `src/main.js`: presses at home go to the director; at the Balcony with the rod in hand, they go to `fishing.sternPress`.
- `src/data.js`: `LOOP.aboard`, `LOOP.stern`, `TEXT_LOOP.aboard` (§10).
- `tools/validate-data.mjs`: the aboard checks.
- `tools/tests/aboard.test.mjs` (new).
- `tools/tests/loop-aboard.scenario.mjs` (new).

**MVP gate.**
- Node tests:
  - local-to-world with the bob;
  - the cone's clamp and spring;
  - every glide's path is clear of the layout's boxes by ≥ 0.1 m and goes through the door's opening;
  - the graph is connected, and back always reaches the Deck;
  - focus order starts with Murk, Chart, Journal;
  - the flow: Sold goes aboard, Sail goes out, Continue lands at the Deck, and the tutorial is never aboard.
- `validate-data --loop`:
  - every place's targets are ≥ 44 px and never overlap at 358 × 664, 390 × 844, 1280 × 720 and 1920 × 1080, in their look or within their cone;
  - each portrait look holds its hero.
- **The browser walk** (`loop-aboard.scenario.mjs`), from a save with wing I, Bait Bed I and Barge lights I owned:
  - come home;
  - every place, every mark, back and turn;
  - each built screen opened and closed from its thing;
  - keys only, then touch only;
  - desktop, and a phone in portrait;
  - reduced motion's dips.

  It passes with no console error, no stuck screen, and the Wick shown again after Sail.

### 9.3 Lane I-3: balcony fishing in first person, the stern line (`gw-inside-stern`, L)

**Owns:**
- `src/fishing.js`:
  - one `origin()` accessor in place of `raftPos()`, used for the aim, the target ray, the charge preview, the line's break distance and the play;
  - the stern's gate beside `playing()`;
  - the stern's key (`stern:<water>`), its light, its arc and its pool;
  - no hold, no snag, no pull and no evening passives at the stern;
  - `fishing.setOrigin(o | null)`, `fishing.sternPress(e)` and `fishing.sternActive()`.
- `src/progression-loop.js`:
  - `meta.loop.stern = {evening, spent}`, seeded by `migrateLoop` with no schema step;
  - `sternBitesLeft()`, with each bite noted under `stern`;
  - the dawn's refresh on a new evening, and an open bite refunded on Continue.
- `src/progression.js`: `measure(fish, {stern: true})` writes the records and the print, but never the firsts ledger and never the hold.
- `src/actors.js`: the Wick hidden aboard, and the rod source for `getRodTip()`, the line's start and its bend.
- `src/actors-rod-fp.js` (new): the first-person rod by tier and the hands, placed through `render.afterCamera`.
- `src/aboard-present.js` (new): the first-person present and the release.
- `src/fishing-fx.js`: the arc dots from the first-person tip, and the line's 1.5 px floor.
- `tools/tests/stern-line.test.mjs` (new).
- `tools/tests/loop-5a.scenario.mjs`: line 131 reversed.
- `tools/tests/loop-stern.scenario.mjs` (new).

**Asks** I-4 for `cardActions({stern: true})` (Let go only) in `ui-loop.js`, and I-2 for the Balcony's press routing and the look follow (`aboard.follow(point, k)`).

**MVP gate.**
- Node tests, taking §5.7's economy guard row by row:
  - 300 seeded stern bites over 100 dawns leave `clams`, the hold, `run`, `evenings`, `run.bites`, `firsts` and the pull unchanged;
  - and they write the Journal, the best, the seals, the list's tick and the print;
  - three good bites a dawn, refreshed only by a new evening;
  - a let go refunds nothing;
  - no snag, giant, legend or Elder at the stern;
  - the light is day, and no night fish bites;
  - the 1% rule holds on the stern's casts (WC-1's `castOdds` with the stern's area);
  - no read of `ctx.player.position` is left in the cast path while the stern is on.
- The browser walk:
  - 20 casts from the Balcony on desktop and on a phone;
  - a strike and the play;
  - the present for a Small, a 45 cm fish and a pike in portrait, then Let go;
  - quiet water after three bites;
  - a reload mid-bite, and with the card open.
- `clarity-perf --aboard` at the Balcony during a play: ≤ 150 on low.

### 9.4 Lane I-4: what you touch: the screens from inside, the sheet's object, the pleasures, the sound (`gw-inside-touch`, M)

**Owns:**
- `src/aboard-touch.js` (new): each target's behaviour, the close looks' screens and the pleasures, driving `actors.home.parts` and the glow levels.
- `src/home-prints-atlas.js` (new): draws wing I's prints into the atlas canvas from `galleryModel` and the fish art, and packs their rects for I-1's quads.
- `src/ui-prints.js`: the print card; the 2D gallery taken out of the home flow.
- `src/ui-loop.js`: the openers exported for the aboard targets, `cardActions({stern})`, and the Jetty's Escape stepping back aboard.
- `src/ui-screens.js`: the Journal opened at a species from a print.
- `src/audio-home.js`: §7.
- `tools/tests/aboard-touch.test.mjs` (new).
- `tools/tests/loop-aboard-screens.scenario.mjs` (new).

**The sheet's seam.** The ledger and the rack call `screens.openSheet` (`SHEET.md` §2.3, §9). Until the sheet's screen is merged, they open the built gear log (`ui-gear.js`), the nearest built screen, so the lane never waits.

**MVP gate.**
- Node tests:
  - each target opens its built screen through the built opener, and returns to its place;
  - the print card reads `meta.loop.prints`;
  - the atlas packs the 16 best prints at true size into 1024 × 1024;
  - no pleasure changes `meta`.
- The browser walk:
  - every close look and screen from inside, desktop and phone;
  - every pleasure;
  - the stove's fire is never brighter than the top of its breath.
- `audio-render.mjs --set=home` with the aboard beds: peaks ≤ −1.0 dBFS.

### 9.5 Seams

| from → to | what |
|---|---|
| I-1 → I-2, I-4, the validator | `aboard-layout.js` (the boxes and eyes; its first commit carries §3.1–§3.2's numbers), `actors.home.toWorld(x, y, z, out)`, `actors.home.bob`, `actors.home.parts.set(id, {lift, angle, glint})`, `actors.home.atlas(canvas, rects)`, `actors.home.calls()` |
| I-2 → I-3, I-4 | `ctx.game.aboard = {place(), go(id), close(id, {onArrive, onBack}), back(), active(), eye(), look(), follow(point, k), lock(on)}`; events `aboard:enter {place}`, `aboard:place {place, prev}`, `aboard:close {id}`, `aboard:leave`; `render.afterCamera(fn)`; `LOOP.aboard`, `LOOP.stern` |
| I-3 → I-2 | `fishing.sternPress(e)` and `fishing.sternActive()`; the director hides the marks and locks the look while `sternActive()` is true |
| I-3 → I-4 | `cardActions({stern: true})` |
| I-4 ↔ `SHEET.md`'s lane (`gw-mvp-sheet`) | `screens.openSheet({from: 'rack', section: 'tackle'})` on the `rack` object and `screens.openSheet({from: 'ledger'})` on the ledger (`SHEET.md` §2.3, §9); whichever lane lands second wires the calls |
| everyone | the built ids `[data-tile=murk\|chart\|journal\|wall]` are kept; the new ones are `[data-aboard=<id>]` and `[data-go=<place>]` |

### 9.6 The integration gate

1. The whole node gate (`node tools/check.mjs`) and `validate-data --loop`.
2. The v3 scenarios and the flag-off run, unchanged: none of this is built off the loop.
3. The four lanes' browser walks once more on the merged tree, on desktop and on a phone in portrait.
4. `clarity-perf --home` and `--aboard`, and the 20 round trips' memory.
5. `clams.mjs --shipped=mossmere --step=5`, unchanged: a check that the stern did not move it.
6. Then the user's look: a short film of coming home, going aboard, each place, a cast and a catch at the stern, and the bench at first light, on desktop and phone.

### 9.7 What stays for later

- The Well's glass hatch, with the aquarium.
- The five's beats aboard (after M1, `CHARACTERS.md` §3.5), played at the Deck or the Rail.
- The bow as an eighth place, when the bow gets its looks.
- Wings II–IV inside, and the Long Winter's 560 cm print (§13 risk 6).
- A left-handed rod (a Settings row), and gyro look (opt-in).
- The morning coming up on the bench (§12 question 47's other way).
- Rain on the roof (weather is parked).
- The ink-print beat (M1 §8 question 3).
- A 30 fps cap, and rendering on demand while nothing moves.
- Walking aboard (parked, SPEC §9).
- The stern arc's check in `validate-data --loop` for every later water's mooring. This comes automatically, since moorings are data.

## 10. Data and the save

A sketch for I-2's data block, with its numbers from §3–§5:

```js
LOOP.aboard = {
  near: 0.08, roll: 0.5, glide: { step: 0.8, door: 0.9, turn: 0.8, rungs: 1.1, close: 0.6, back: 0.5, dip: [0.25, 0.35], settle: 0.04 },
  look: { degPerPx: 0.18, touchSweep: 0.6, spring: 0.15, damp: 6, cursor: 0.15, idleHint: 9 },
  places: {
    deck:    { eye: [0.95, 1.20, 4.85], look: [-1.20, 1.00, 3.45], fov: 52, portrait: { look: [-1.15, 1.05, 3.85], fov: 68 }, cone: [60, -25, 20],
               targets: ['chart', 'journal', 'door', 'rack', 'stones'], go: { door: 'hearth', turn: 'balcony', right: 'rail' } },
    hearth:  { eye: [-0.05, 1.20, -1.15], look: [-0.45, 1.00, 2.00], fov: 52, portrait: { fov: 66 }, cone: [55, -30, 25], mirror: false,
               targets: ['stove', 'kettle', 'wicks', 'bunk', 'ledger', 'door'], go: { door: 'deck', right: 'wall', back: 'deck' } },
    wall:    { eye: [0.65, 1.20, -1.10], track: [-2.90, 0.30], face: [-1, 0, 0], fov: 52, cone: [30, -20, 30], mirror: false,
               targets: ['wall', 'print:*', 'window'], go: { left: 'hearth', back: 'hearth' } },
    rail:    { eye: [1.52, 1.45, 0.60], look: [4.20, 1.95, -4.40], fov: 52, portrait: { look: [4.71, 2.20, -2.02], fov: 70 }, cone: [60, -20, 30],
               targets: ['murk', 'orders', 'print:belled_matriarch'], go: { up: 'roof', back: 'deck' } },
    balcony: { eye: [-0.85, 1.38, 6.05], yaw: 0, pitch: -7, fov: 52, portrait: { fov: 66 }, cone: [70, -30, 15],
               targets: ['water', 'rod'], go: { left: 'bench', turn: 'deck', back: 'deck' } },
    bench:   { eye: [1.05, 1.60, 6.05], yaw: 0, pitch: -3, fov: 52, cone: [80, -25, 25], targets: ['rod', 'bollard'], go: { right: 'balcony', back: 'deck' } },
    roof:    { eye: [0.25, 3.10, 2.05], look: [0.10, 2.55, -1.20], fov: 52, cone: [150, -45, 25], targets: ['moss:1', 'moss:2', 'bell'], go: { back: 'rail' } },
  },
  close: { chart: { eye: [-0.88, 1.60, 4.00], look: [-1.00, 1.20, 4.60] }, journal: { /* … §3.5 */ }, ledger: { /* … */ }, rack: { /* … */ },
           stones: { /* … */ }, print: { dist: 0.6 }, window: { dist: 0.35 }, bunk: { /* … */ }, moss: { /* … */ } },
};
LOOP.stern = { bites: 3, from: 1, minDist: 6, half: 60, raftPad: 1.0, light: 'calm', present: { hands: 0.30, arms: 0.60 } };
TEXT_LOOP.aboard = { /* accessible names only, never drawn: each place's and each wordless target's (the built tile words stay TEXT_LOOP.jetty's) */ };
```

**The save.**
- One new field, `meta.loop.stern = {evening, spent}`: the dawn's count.
  - `spent` resets whenever `evening` differs from `meta.loop.evenings`.
  - `freshLoop` and `migrateLoop` seed it as `{evening: 0, spent: 0}` for every block, with no schema step (as `meta.loop.finds` was).
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
- **Not changed**: `WATERCRAFT.md` (read only: the stern uses its areas and hook table as they are), `LORE.md`, `FINDS.md`, `AQUARIUM.md`, and every `src/` or `tools/` file.

## 12. Questions only the user can answer (each with the default this design builds)

44. **Fish off the stern: let go only, or kept and sold?**
    - **Default: let go only.** Every record is written (the Journal, the best, the seals, the list, the print on the Long Wall), and nothing is paid. Three good bites a dawn, then quiet water's rule.
    - **The other way:** keep them and sell them to Murk over the rail. That adds about +70% clams a visit at first and +18% at the hour mark (*est.*). It would need the sim re-run and would move M1's pacing.
45. **Whose eye?**
    - **Default: the Wick's**, 0.78 m above what it stands on, in a people-sized barge: the stove taller than you, the table at your eye, crates for steps.
    - **The other way:** a person's eye at about 1.5 m. The barge looks cosier and smaller, and the hands and rod are drawn at a person's scale.
46. **After the tally: aboard at once?**
    - **Default: yes**, by an ink dip on Sold. The arrival shot stays under the tally.
    - **The other way:** stay on the view from the water with its targets, and go aboard only when you tap the barge.
47. **The sky at home.**
    - **Default: first light, held**, since the clock stands still at home, as now.
    - **The other way:** while you sit on the bench, the morning comes up slowly (the mist thinning, the light warming), and it goes back to first light when you get up.

## 13. Risks

1. **Fishing's raft origin is spread** across the aim, the ray, the preview, the break, the play, the rod tip and the default yaw. A missed site would cast from the raft.
   - Mitigation: one `origin()` accessor, and a node test that no `ctx.player.position` read remains in the cast path while the stern is on.
2. **The low tier's 150-call line is tight** (144 today).
   - Mitigations: the Wick hidden; the atlas culled outside the cabin; the cabin's mirror switch on medium and high; each place measured.
   - If it still fails, the knobs in order: the tells off at the stern on low; the candles' glow merged; the atlas only at the Long Wall.
3. **Portrait first person is narrow.**
   - Mitigations: portrait looks on each hero, the cone and the track under one thumb, and the marks in the lower third.
4. **A Wick's eye sees table tops edge-on.**
   - Mitigations: the close looks lift the eye to the surface (kneeling on the stool, the crate on the chair), and the places stand the Wick where it can see (§3.0).
5. **The banked fire's story** (`LORE.md` §8): Murk rakes the fire open once, at the end of the road.
   - The stove's pleasure only breathes. A test checks that no aboard path raises the stove's glow above the top of its breath.
6. **The Long Winter's 560 cm print** belongs to wing II (the Rime Sound, reach II), but the starboard wall is only 5.7 m inside.
   - Either it runs the wall's length above the windows, on a print rail under the beams, or wing II moves to the hull's side. This is decided with reach II.
   - SPEC §6.3's "the cabin's 8 m wall" is corrected.
7. **Motion sickness.**
   - Mitigations: no head bob, the barge's roll ×0.5 on the eye, and 0.8 s glides with the look leading. Reduced motion uses dips and no roll.
8. **Merge conflicts with the sheet's design**, which answers the same message and edits the same SPEC sections.
   - The sheet took row 38, §0.14, decisions 105–110, questions 41–43 and M1 revision 9 (`gw-design-sheet`, 698ebc2). This design takes row 39, §0.15, decisions 111–122, questions 44–47 and M1 revision 10, so the two merge side by side; only the adjacent insertions need a hand merge.
9. **The arrival shot changes**: the gallery, the open door's interior, the lectern moved.
   - The 5b pairs and `frameCheck` are taken again in I-1.

## Appendix A. The measured figures, and how to re-run them

These are scratch probes, run read-only against `/home/user/Study-App/.gw-wt/m1-mvp/gloomwater` at b527fae. They are not committed: they are a design's arithmetic, and I-1's and I-2's node tests and the validator replace them.

**The mooring** (`data.loopMooring('mossmere', …)` with world-layout's docks):
- The hull is at (18.03, 44.46), yaw 2.396, so the stern faces world (0.678, −0.735).
- The raft is at the Jetty (24, 38): local (0, 8.80), 2.80 m off the transom.
- Murk is at local (4.71, −2.02).
- The home camera is 12.8 m from the stern, at 39° to starboard.

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

**The stern's water**: `watercraft.areaAt` over a 0.5 m grid from the Balcony's eye, from 6 m out to the rod's reach, ±60° of astern, with the raft's circle plus 1 m excluded (§5.3's table).

**The places' framing**: a pinhole projection, in `home-targets.js`'s `project` convention, of §3.1's boxes through §3.2's poses, at 1280 × 720 (fov 52°) and 390 × 844 (fov 66°).

**The Wick's eye**: in `actors-wick.js`, the head is at y 0.5 and the eyes 0.14 above it; `actors.js` draws the Wick × 1.22 on the raft. So the eye is 0.78 m above its feet.
