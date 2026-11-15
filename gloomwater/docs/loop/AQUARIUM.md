# The aquarium: the Well under the Slow Hearth

*Design for the aquarium the user asked for (revision 1, 15 November 2026). **Written now, built after M1** (SPEC v8.1 §13's
after-M1 list, `M1.md` §5): nothing here is in M1, and M1's budgets, shelf and pacing do not count on it. Binding with
`SPEC.md` v8.1 (§0 row 20, decision 58, §6.3, §10, §13, §16 questions 22–23), `FINDS.md` (its upgrades and looks are finds),
`LORE.md` v2.2 and `WATERS.md`. Design only: no `src/` or `tools/` file changed with this document. Every number is a
starting number for the build to measure.*

---

## 0. The user's words, and the lead's defaults

> "We also need to have an aquarium feature that we can dive into as a 3d world. The character doesn't need to be in it,
> just a camera that can swim around the 3d aquarium world. This is attached to our barge and we can fish items to upgrade it
> and cosmetics from each location. This doesn't need to be built properly yet but it could do with he written about."
> (15 November 2026)

**The lead's defaults** (this design improves their details, never their direction): written now as this file, built after
M1; entered from the Slow Hearth (a hatch or a glass floor); a free-swimming camera with no Wick through a 3D underwater
scene; how fish get into it keeps "you sell what you keep" honest; its upgrades and cosmetics are finds, each water its own
themed set (the Mossmere's drowned stone, Glasswater's crystal, the reef's coral); controls on desktop and phone; an art and
performance budget with a low tier; its sound; what it needs from the fish models.

---

## 1. In one breath

Amidships the Slow Hearth has an old **wet well**, the flooded hold the barge road's families kept their catch fresh in,
with a round glass hatch in the deck. At home, tap the hatch and the view sinks through the glass into the water under the
barge: you are a slow swimming eye under the Slow Hearth's keel, its windows' light falling through the hatch above you. An
underwater road runs on from there, room by room, one room for each water the barge has moored at, each built from that
water's drowned works and dressed with what you have fished up there. **Every fish you have ever landed swims in its own
water's room**, at the size of your best one, the giants and legends too, once you have landed them. Swim among them, follow
one, and swim back up into the light.

---

## 2. When

- **After M1**, as its own job (size **L**, §13); M1 is "the Mossmere and the home barge, complete" without it, and its
  done-list, shelf, sim and budgets stand alone.
- It needs M1's barge (the hatch and the home flow), M1's fish on their plans, and `FINDS.md`'s finds (its fittings and
  dressings are finds). It opens with the rooms of the waters shipped by then (the Mossmere's, at least) and grows a room
  with each water after.
- Where it sits in QUEUE's order after M1 is SPEC §16 question 23 (default: the first job after M1's polish pass).

---

## 3. What it is, in the world (and why it needs no magic)

- **The wet well is real** (`LORE.md` §6's barge family): barge-houses of the barge road had a flooded well amidships, its
  sides slatted so the water flowed through and fish kept fresh; the Slow Hearth's is old and empty of nets. A lamp over the
  glass draws fish, as any lamp does (`LORE.md` §7.5). That is all the world needs to say, and no word on screen says it.
- **The rooms are a picture, the way the Chart is a drawing and the Long Wall is prints**: the game shows you, under your
  own barge, the waters you know and the fish you have met. Nothing in the world claims the rooms are a real place under the
  hull, and nothing claims a fish you sold lives there; like the Chart (nothing unowned is drawn) it shows exactly what you
  have earned. So the only wonders stay `LORE.md` §2.13's four.
- **It is not a tank of kept fish.** Nothing is taken out of the hold, nothing is kept back from Murk, and no fish is ever
  "in" it in a way that could be lost, sold or forgotten.

---

## 4. Getting in and out

| | |
|---|---|
| **the hatch** | a round glass hatch in the deck amidships, between the cabin and the bow, rimmed in brass, lit faintly from below by the water's own glow. At home it is a **fifth target** among the barge's places (`SPEC.md` §6.1), with no word under it (its accessible name is "the Well"; selector `[data-tile=well]`). It is there from the aquarium's build, free (the well is the barge's own); only its fittings and dressings are finds |
| **in** | tap the hatch: the home camera eases down onto the glass (0.8 s); one ink dip (0.6 s, held until the Well's first frame is drawn, which hides the scene's build, ≤ 0.6 s on a mid phone); you are under the hull in the home pool, looking up at the keel and the light through the hatch, the raft's small hull at the stern. The first time, the hatch breathes once at home (as the chart table's target did), no words |
| **out** | **Back** (top left, inside the safe area, ≥ 44 px; the built word), Escape, or swim up into the hatch's light: one ink dip back to the home camera at the hatch |
| **never** | during a trip (nothing on the barges can be tapped on the water, `SPEC.md` §6.1); during the opening or the tutorial; while a card or the tally is open. Time stands still at home, so the Well has no clock and no evening; it is always the light of home |
| **the flow** | a new flow `well` beside `home`: the water scene is kept but not drawn (no rebuild on the way back), the Well's scene is built on entry and disposed on exit; input goes to the swim controls; nothing casts, and `fishing.onPointerDown` is never reached |

---

## 5. The world

- **The home pool**: about 20 m across under the Slow Hearth, its keel and the hatch's light overhead, the moored water's
  floor below (the Mossmere's at the Jetty: soft silt and a few fallen stones). The road starts here.
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

## 6. What lives in it, and why

**The rule (the default): every species you have landed lives there, drawn from the Journal.**

- Each species with a landing in the Journal (kept or let go: the record is written at the measure either way, `SPEC.md`
  §3.2) swims in its own water's room, **one fish at the weight of your best print** (`SPEC.md` §6.4), at its haunt's depth
  and in its play's manner (a sulker on the floor, a darter quick and high).
- **Commons swim as a small school** (3–5, sizes round your best Keeper of it), because a school of one minnow is no school.
- **Giants** once landed swim in their place's corner of the room (the Thousandcast Pike under the room's fallen arch, the
  Hullkiss Lamprey by its buoy-light stones), slower and alone. **Legends** once landed keep their room's deep end, at most
  one in view at a time. **Curiosities** once landed too.
- **Not drawn**: a species never landed (no outline, no silhouette: the Journal's giants' page is where outlines live); a fish
  only glimpsed or got away.
- A new best print grows that fish in the Well the next time you dive.

**Why this rule, and not one fish placed per species:**

1. **No sale is given up.** The Well draws from the Journal, so nothing is kept back from the hold and "you sell what you
   keep" stays whole; kept stays kept, and a kept fish is still sold at the tally.
2. **Letting go stays a real choice.** A fish let go joins the Well as surely as one sold, the ink print's own rule, so the
   aquarium never pushes a player to keep a fish they would rather let go.
3. **It cannot be lost or emptied.** It needs no new fish state in the save (the Journal is the save), so a reload, a
   migration or a start-over behave exactly as the Journal does.
4. **Placing one per species would cost a sale per species** (164 fish and 32 built, each a slot's clams, about 1–2% of the
   economy and a decision at every first catch), need a placing screen and words, and make the aquarium a second hold to
   manage. The user asked for a world to swim through, not a tank to stock.

The other way is SPEC §16 question 22.

---

## 7. The camera: a swimming eye, no Wick

| | |
|---|---|
| **movement** | first person, with gentle inertia: cruise 1.6 m/s, held 3.2 m/s, eased in and out (about 2 m/s²); turns eased; no roll; the pitch held within ±70°; a slow bob when still (off with reduced motion) |
| **swim where you look** | forward moves along the view, so looking down and swimming takes you down; no separate up and down needed on a phone |
| **collision** | a 0.6 m sphere against each room's colliders (the floor, the walls, its rocks as circles); it slides along, never stops dead, never passes through anything; the surface is a ceiling except at the hatch's light, which takes you home |
| **the fish around you** | they part around the camera (2 m), as a school parts round a diver; nothing ever bumps it |
| **follow** | tap a fish to follow it: the camera trails about 2.5 m behind and a little above, matching its turns gently; its name and your best weight show small at the bottom ("Reedjaw Pike · 4 lb 6 oz", the Journal's words and `data.fmtWeight`); tap again, drag or swim to stop. A followed giant or legend shows its ★ |
| **reduced motion** | slower turns, no bob, follow by cuts between still views instead of a trailing glide, the dips held at once |

---

## 8. Controls

| | desktop | phone (one thumb) |
|---|---|---|
| look | drag with the mouse held; or the arrow keys | drag anywhere |
| swim forward | W or ↑ (held) | **press and hold** (0.25 s without moving) to swim forward where you look; moving the held thumb steers; release to coast to a stop |
| swim back, sideways | S, A, D | — (turn and swim) |
| up, down | Space, C | — (look up or down and swim) |
| follow a fish | click it | tap it |
| leave | **Back**, Escape, or swim into the hatch's light | **Back** (top left), or swim into the hatch's light |

Every target ≥ 44 px; the Back word ≥ 16 px; nothing else on screen but the followed fish's line. Keyboard alone can do
everything (arrows to look, W/S to swim, Enter on a focused fish to follow, Escape to leave). A gamepad is not planned.

---

## 9. Its upgrades and looks: finds, each water its own set

The Well's base (the hatch, the home pool, the road and each water's plain room) comes free with the barge. What grows it
is **found**: from its build, each water's finds table (`FINDS.md` §3.4) gains **four well pieces**, drawn like barge parts
and looks (kept, never sold, a slot each, never repeated). Two are **fittings**, which grow that water's room; two are
**dressings**, which dress it.

| a fitting | what it does in the room |
|---|---|
| **light** | the room's own lamps or glow light up: farther seeing, the room's colours fuller |
| **space** | a second chamber of the room opens (rubble clears from an arch, a door swings open) |
| **life** | its commons' schools grow (+2 each) and its weed and roots sway fuller |
| **sound** | the room's own sound wakes (a bell tolling far down, a chime of crystal, a lock gate's groan) |

**The Mossmere's set (drowned stone)**: the **Fallen Arch-Stone** (fitting, space: the arch's rubble clears and the room's
inner court opens, where the Thousandcast Pike cruises), the **Gate Lamp-Stones** (fitting, light: the room's slit-stones glow
amber), a **Moat Lily Bed** (dressing: pale lilies on long stems up toward the light), a **Bridge-Chain Swag** (dressing: old
chain hung across the room, never the worn last link, which stays on the bridge).

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

Each dressing has its authored place in its room (no placing screen: the room is designed with it). The sim re-runs the
full pacing with the well pieces in the draw when the Well ships (`FINDS.md` §11).

---

## 10. Art and performance budget

The Well is a separate, small scene built on entry; the lake is not drawn while you are in it. It must hold the game's phone
line (p95 ≤ 33 ms on the real phones of `M1.md` §2.12) with room to spare.

| | high | medium | **low** |
|---|---|---|---|
| draw calls, the whole frame | ≤ 120 | ≤ 80 | ≤ 50 |
| fish drawn at once (individuals) | 24 | 16 | 8 |
| schools drawn at once (instanced, one call each) | 8 | 6 | 4 (at most 3 fish each) |
| triangles, the whole frame | ≤ 250k | ≤ 160k | ≤ 80k |
| rooms live | the current one and its two neighbours | the current one and one neighbour | the current one |
| caustics on the floor (one texture in the floor's material) | on | on | off |
| light shafts from the hatch (one additive mesh) | on | on | off |
| motes and bubbles (one points call each) | on | on | motes only |
| render scale | 1.0 | 1.0 | 0.75 |
| shadows, mirror pass | none | none | none |
| PointLights | none (emissive and the hemisphere light only) | none | none |

- **Fish**: each ≤ 2 calls (the body and its fin cards); only the nearest fish up to the tier's count are drawn, the rest of
  the room's fish swim in as you near them (a fade, never a pop); each room holds all its water's landed species (the
  Mossmere's at most 17), so a tier's count is about one room's worth.
- **Rooms**: each merged by material, ≤ 10 calls, kit pieces from the lake kits (`world-art.js`) and the finds' props
  (`models-finds.js`), culled by room.
- **CPU**: the fish's steering (wander, avoid the camera, keep the band, a school's simple flocking) ≤ 1.5 ms a frame for 40
  fish on a mid phone; the camera's collision ≤ 0.2 ms.
- **Memory and loading**: the scene built ≤ 0.6 s on a mid phone (under the dip) and disposed on exit; the heap, geometries
  and textures flat within 10% over 20 dives (`--mobile`).
- **Measured by** `clarity-perf --well` (a new mode: the home pool, the Mossmere room full, and a late room at its tier's
  counts), never by a wall-clock frame time on the shared software-GL machines.

---

## 11. Sound

An underwater bed: home's bed low-passed (the stove's crackle and Murk's hand bell far above through the hull, the water
against the keel), a soft deep hum, bubbles rising, the hull's slow creak. Each room its water's motif, muffled and slow (the
Mossmere's far bell, Glasswater's crystal ring, the Fen's reed whisper, the Inkwood's frog chorus heard as through a wall);
a **sound** fitting wakes it fully. Fish are silent but for a soft swish when one passes close; a legend's own breath (the
Banked Fire's slow warm pulse) when she is near. In: a muffled plunge; out: a breath at the surface and home's bed coming
back. Inside the −1.0 dBFS master; `audio-render --set=well` renders the bed and one room for its gate.

---

## 12. What it needs from the fish models

The built plans (`models-fish.js`, the plans `models-fish` adds with each slice) swim there. They were made to be seen from
above on the water and from the side in the show; the Well sees them from everywhere, so the fish lane owes it:

1. **A free-swim mode** outside fishing: cruise, turn, hover, a short burst, driven by the Well's steering through the
   existing bend shader's uniforms (`uSwim`, its phase), with no line, hook, struggle or flop and no dependence on the
   fishing actor.
2. **Honest scale** from `createFish({z})` (built, A1), so the Well's fish are exactly the size of the prints.
3. **Every side holds up**: the belly, the underside of the fins, the mouth seen head-on and the tail from behind, at the
   camera's closest (about 1 m); a check frame per plan from six sides.
4. **Instancing for schools**: an instanced variant of the bend material with a per-instance phase and size attribute, so a
   school of five is one call.
5. **A cheap far version**: beyond about 15 m the fin cards fold into the body (one call) and the bend runs on fewer
   segments.
6. **Swim data per species**, derived by the roster converter (`src/roster-species.js`): `swim: {band, speed, school}` from
   its `haunt` (its depth band), its `play` (a sulker slow and low, a darter quick, a steady fish steady) and its rarity (a
   common schools); legends and giants keep their authored models and get a slow cruise.
7. **Turning without clipping**: at the free-swim mode's tightest turn no plan's fins or barbels pass through its body (a
   pose test per plan, the way the show's poses are tested).
8. **Clean disposal**: every geometry, material and texture a Well fish makes is freed on exit (the memory line, §10).
9. **The plans that come after M1** (catfish's later fish, bream, disc, tuna, snakehead, gar, cod, flatfish, jack, shark,
   billfish, dogtooth, sawfish and the curiosities' squid, softshell and salamander) each pass 3 and 7 before their fish
   swim in the Well; until then a species on a plan that has not passed swims only once it does (`SPEC.md` §13's rule 2,
   applied to the Well).

---

## 13. The build (after M1)

| | |
|---|---|
| **size** | L (a new scene, its controls, the fish's free swim and instancing, the rooms of the waters shipped, the finds' well pieces) |
| **needs** | M1 done; the waters it opens with shipped (their fish on their plans); `FINDS.md`'s step 5c (the finds engine) |
| **modules** | `src/aquarium.js` (new: the scene, the rooms, the road, the fish's steering) · `src/aquarium-swim.js` (new: the camera and its controls) · `models-fish.js` (free swim, instancing, the far version) · `models-finds.js` (the well pieces) · `actors-home.js` (the hatch) · `main.js` (the flow `well`, in and out) · `render.js` (the scene switch, the underwater grade) · `audio.js` (§11) · `ui-loop.js` (the hatch's target, **Back**, the follow line) · `data.js` (`LOOP.well`: rooms per water, budgets per tier, the well pieces in `LOOP.finds`) · `src/roster-species.js` (the swim data) · `tools/validate-data.mjs` (every water's room and its four pieces; every room fits its largest fish ×6) · `tests/clarity-perf.scenario.mjs` (`--well`) · `tests/well.scenario.mjs` (new) |
| **tests** | the hatch is a target only at home, never on a trip, in the opening or under a card · in and out through one dip each, no frozen frame · the Well's species are exactly the Journal's landed species (a fixture with 5 landed: 5 drawn; landing a sixth adds it on the next dive; none unlanded drawn) · each fish at its best print's weight · no fish taken from or added to the hold, no clam moved, no save field but the finds · the camera never leaves a room's shell and never stops dead on a wall · the phone hold-to-swim, drag-to-look and tap-to-follow; keyboard alone · each fitting changes its room (a before-and-after pair each) · §10's budgets per tier by `clarity-perf --well` · memory flat over 20 dives · reduced motion · the flag-off build and the v3 scenarios unchanged |
| **the user's look** | a dive from the hatch into the Mossmere room and out, on desktop and a phone, before the merge |

---

## 14. Risks, and the knobs

| risk | guard, and the knob |
|---|---|
| **Phones cannot hold a free 3D scene beside the game** | its own small scene, the lake not drawn, tiers with a low line of 50 calls and 8 fish; knobs in order: the fish count per tier, the schools' size, the caustics and shafts, the render scale |
| **The camera makes people seasick** | no roll, eased turns, a pitch limit, swim-where-you-look, reduced motion's cuts; knob: the turn and speed eases |
| **It feels empty early** (the Mossmere's 17 species at most) | commons school, the room's own life, the fittings that grow it, and the road visibly going on to waters to come (the dark past the last room) |
| **It reads as a second hold, and the sale feels like a loss** | it draws only from the Journal: no fish is placed, kept or taken; SPEC §16 question 22 |
| **The fish models break up close** | §12's checks 3 and 7 per plan before a species swims there |
| **Words creep in** | none but **Back**, a room's name once, and the followed fish's name and weight |

---

## 15. Questions for the user

SPEC §16 questions 22 (every landed species, or one you choose to keep back per species) and 23 (when it is built), each
with the default this design builds.
