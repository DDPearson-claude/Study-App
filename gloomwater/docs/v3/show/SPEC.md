# The show — the Wick presents its catch (spec for both build lanes)

Status: audit done on `2ee62e7` (branch `gw-show`). LANE A ("the Wick and the fish") and LANE B ("the sequence, the camera,
the card and the sound") build from this document without talking to each other; §6 is the seam between them. Numbers marked
**target** are acceptance; everything in `AUTOFISH.show` marked *start* is a tuning start its owning lane may move while §4
stays green.

The user: *"When a fish is caught, it should be an animation of our character holding the fish and showing it to us. Then
after a pause the fish card opens up."* Earlier, on the same moment: *"When you catch a fish its not really very special I
want it to feel more like a win when you catch one."* and *"The UI is really cluttered, there's too much text on screen."*

Read (the lead's direction, binding): after the fish leaves the water the Wick turns to the **camera** and presents the fish
to the player like an angler's photograph: the fish's flank to the lens, the Wick's face and flame beside it, the camera close
enough that the fish is the subject. Readable in one glance on a phone. Then a still pause with nothing covering the picture,
and only then the catch card. Nothing is written on the screen during the show. The rules (events, saves, the frozen world)
keep their meaning. v3 only; the flag-off game is untouched.

## 1. Diagnosis: what a player sees today

Before set: `tools/out/show/before/` (desktop 960 × 540: small, keeper, prize, trophy, elder, ancient, legend, eel, tiny, ray,
night; phone 390 × 844: small, elder), one strip per catch from the fish breaking the surface (T0) to the card, shot by the
game's clock on a 30 fps stepper; contact sheet **`tools/out/show/before.jpg`**; larger single strips in
`tools/out/show/before/strips/`; every frame's numbers in `before/<set>/notes.json`. Re-shoot:
`tools/tests/show-audit.scenario.mjs` + `tools/show-sheet.mjs` (their headers carry the commands). `tools/out/` is not tracked.

### 1.1 What the sequence is, and how long each part takes (seconds from T0, measured)

| part | what happens | Small | Keeper | Prize | Trophy | Elder | Ancient, legend |
|---|---|---|---|---|---|---|---|
| reveal | the fish comes up beside the raft, the ink floods off it; the play's HUD still up | 0 – 0.36 | 0 – 0.50 | 0 – 0.73 | 0 – 1.00 | 0 – 1.37 | 0 – 1.57 |
| scoop | `ctx.cinematic`; the fish flies to the rod tip; **the ink band slides in over the lower 45 % of the frame**; the trophy camera starts to ease in | – 0.57 | – 0.73 | – 1.17 | – 1.60 | – 2.20 | – 2.43 |
| pose | the measuring pose; the fish comes to the hands (or stays on the rod) | – 0.83 | – 1.00 | – 1.70 | – 2.37 | – 3.33 | – 3.53 |
| cord | the glory opens; the count ticks in the band | – 1.27 | – 1.43 | – 2.60 | – 3.70 | – 5.23 | – 5.43 |
| banners | the stamp (`fish:measured`, `fish:landed`), a record banner across the top | – 1.57 | – 1.73 | – 3.17 | – 4.50 | – 6.37 | – 6.60 |
| **card** | opens at once; there is no pause | **1.60** | **1.77** | **3.20** | **4.53** | **6.40** | **6.63** |

### 1.2 What each strip shows (desktop; from `notes.json`)

| catch | pose today | where the Wick faces | the fish on screen while it is in the pose | what covers it | the lens |
|---|---|---|---|---|---|
| small · Mossback Perch 33 cm | arms: across the chest | the lens (within 3°) | 27 – 60 px long (3 – 6 % of the frame's width), pale against the collar | the band: 27 % of its box at 1.2 s, 84 – 100 % from 1.37 s; then the card, 100 % | 9.3 m at T0, 5.8 m at the pose, still 2.4 m when the card opens |
| keeper · Weeping Carp 61 cm | arms | the lens | 4 – 12 %; 16 % (152 px) at its best, a frame before the card | band 30 – 42 %; card 86 – 100 % | 2.9 m at the card |
| prize · Reedjaw Pike 89 cm | hang: off the rod tip | **57 – 60° away from the lens**, in profile, looking up at the fish | 9 – 12 % wide × 37 – 62 % tall, a rod's length from the Wick: the best-seen fish of the set | the banner crosses its head (13 – 26 %); the band hides the Wick from the chest down; card 45 % | 3.5 m, the fov opening to 72° |
| trophy · Reedjaw Pike 112 cm | hang | 57 – 60° away | 8 – 13 % × 38 – 78 % | band 3 – 11 %; card 58 – 61 % | 3.7 – 4 m |
| elder · Reedjaw Pike 138 cm | hang | 59° away | 5 – 7 % wide, **hanging in front of the lantern post and its pennant**: one upright object | band 8 – 24 %; card 67 – 85 % | pulls back to 5.4 m: the Wick is 71 – 89 px tall (13 – 16 % of the frame) |
| ancient · Reedjaw Pike 166 cm | hang | 59° away | 6 – 9 % wide, on the post again; the Wick bleached by the glory | band 16 – 23 %; card 100 % | 6.2 m; the Wick 69 – 88 px |
| legend · Belled Matriarch 2.65 m | alongside: the Wick kneels at the edge | the lens, but bowed over the fish | 21 – 29 % wide: reads as a fish beside a raft | the band under it; card 100 % | 5.7 – 7.5 m: the Wick 44 – 61 px (8 – 11 %) |
| eel · Gloam Eel 90 cm | hang | 56 – 58° away | 6 % × 34 – 60 %: a stiff bar | banner 10 % | 3.7 m |
| tiny · Quayling 11.5 cm | palm: cupped at the chest, head bowed | the lens | **6 – 28 px long, ≤ 10 px tall: a dot** | band 100 % from 1.03 s; card 100 % | 2.2 m at the card |
| ray · Velvet Ray 73 cm | arms | the lens | 12 – 18 %: a disc at the Wick's hip | band 29 – 54 %; card 100 % | 3.1 m at the card |
| night · Candlefin Koi 50 cm | arms | the lens | as the keeper; the flame and the lantern are the only bright things | band; card | – |

On the phone (390 × 844) the band and the card sit at the foot, so the top of the frame stays open: the Small's last frame before
the card is the nearest thing today to the request (the Wick facing us, 191 – 227 px tall, a perch across its collar), but the
perch is 69 – 84 px (18 – 21 % of the width, 4 – 5 % of the height) with a banner over the Wick's lantern and the band under its
feet; the Elder is a raft with a fish on its lantern post, the lens 6 – 7.6 m away.

Words on screen: 3 – 4 from the HUD through the reveal (plus its glyphs: 13 visible UI elements on the phone), then 9 – 26 from
the overlay (27 – 41 elements): the name, a ticking count, class words, "old ledger", "your best", a banner ("New best: 33 cm
(was 20)", "First Elder Reedjaw Pike"), "click or Space to skip". The HUD dims to 30 %; it does not go.

Draw calls through today's sequence (phone, medium): 123 – 173 per frame, 173 at the ceremony's peak (S8's baseline).

### 1.3 Why it does not read as "our character holding the fish and showing it to us"

1. **The lens is late and far.** It starts in only at the ceremony, on a slow spring: 2.4 – 2.9 m out when a Small or Keeper's
   card opens. The close-up exists, behind the card.
2. **The picture is covered.** The band takes the lower 45 % of a landscape frame, exactly where the hands and the fish are,
   from the first frame of the ceremony; a banner crosses the top; then the card covers the lot.
3. **The fish is small, or it is somewhere else.** A held fish sits against the cloak at chest height and never comes toward
   us: 3 – 16 % of the frame's width. A hung fish (from 0.85 m: every Prize pike) hangs a rod's length away and above, so the
   frame is a fish and, apart from it, a small figure in profile **looking at its fish, not showing it to us**. An Elder hangs
   on the lantern post.
4. **The moment is about measuring.** The fish that reads is the 2D ink sketch in the band, and the action is a number ticking.
   The real fish is never the subject.
5. **There is no pause**, and for the big fish it is long without ever being clear: 6.4 – 6.6 s for an Elder or an Ancient.
6. **A tiny fish is invisible.**

What already works, and stays: the reveal (today's best view of the fish: broadside beside the raft, 23 – 39 % of the frame's
width for an Elder); the Wick already turns with the fish to the camera's side (within 5° of the lens as the reveal ends); the
glory and the chimes; true scale; the card itself.

Two things in the legend's strip are artefacts of the audit jumping her 30 – 60 s play to its last half second: the hook's name
banner and the Matriarch's toll, both still up. The toll, though, is `fx.pulse` at the raft's own position with a 7 m radius
(`fishing.js`, `b.kind === 'toll'`): in normal play it is a ring round the raft. Outside this job; flagged for the lead.

## 2. The show

### 2.1 The clock

T0 is the frame the fish breaks the surface (`fishing.state` becomes `landing`, `fishing:landing`). Phases
(`fishing.view.show.phase`): **reveal** → **lift** → **hold** → **pause** → **card**.

| phase | what the player sees | who |
|---|---|---|
| reveal | as today: the fish comes up beside the raft on the camera's side, broadside, the night ink flooding off it nose to tail under `AUTOFISH.landing`'s slow-motion beat, droplets, the swell rising. New: the HUD is already gone and the show camera is already easing in on the Wick and the fish. Ends on `fishing:caught` (the class chime, the species' voice) | B |
| lift | the rod whips up and the fish swings in on the line (first 40 %), the hands take it (to 62 %), then **the present**: the Wick, turned to the lens, thrusts the fish at us; the lift ends on the overshoot's peak. At that instant: the records are written (`progression.measure`: `fish:measured`, then `fish:landed`), and the landing's climax fires (the glory behind them, the flame's flare, bloom, kick, haptic, the flourish) | A moves, B times |
| hold | the pose alive: the overshoot settles (0.28 s), the fish twitches or flaps in the grip, drips fall, the flame stands tall, a small proud bob; a heavy fish makes the Wick strain and the raft dip. The glory at its height | A |
| pause | **the still**: the pose held, the fish quiet (struggle ≤ 0.12), breath and flame only, the camera at rest, no new effect. At least 0.6 s | A calms, B holds |
| card | the card unfolds from where the fish is held; the pose stays up behind it | B |

Real seconds (`AUTOFISH.show.beats`, `data.showPlan(cls)`; a legend plays the ancient row; validated by `validate-data`):

| class | reveal (today's, kept) | lift | hold | pause | **T0 → card** | S3 says | hurried (tap at T0) | hurried, protected |
|---|---|---|---|---|---|---|---|---|
| small | 0.35 | 0.45 | 0.50 | 0.70 | **2.00** | ≈ 2, ≤ 2.5 | 0.83 | 1.33 |
| keeper | 0.48 | 0.50 | 0.42 | 0.70 | **2.10** | ≈ 2, ≤ 2.5 | 0.98 | 1.48 |
| prize | 0.75 | 0.60 | 0.85 | 0.80 | **3.00** | ≈ 3 | 1.29 | 1.79 |
| trophy | 1.00 | 0.80 | 0.90 | 0.80 | **3.50** | ≈ 3.5 | 1.62 | 2.12 |
| elder | 1.37 | 1.10 | 1.60 | 0.90 | **4.97** | ≈ 5, ≤ 6 | 2.11 | 2.61 |
| ancient, legend | 1.56 | 1.20 | 1.60 | 0.90 | **5.26** | ≈ 5, ≤ 6 | 2.34 | 2.84 |

- The reveal's length is `landing[class].wipe` seconds of game time under its slow-motion beat (`data.showRevealSeconds`). Lane
  B may retune `AUTOFISH.landing` only while the validator's totals hold (about ± 0.3 s, never over the max).
- **Hurry.** A tap (pointer, Space, Enter) at any moment from T0 hurries the show: the reveal is never cut (the species must
  show and `fishing:caught` must fire); the rest of the lift runs at × 2.5; the card opens once the fish has been presented for
  0.3 s, or for **0.8 s when the catch is a first-ever species or a personal best** (`fish:landed.isNew`, a `pb` record: both
  known at the present, which is why the records are written there). A tap during the hold or the pause opens the card at
  once if that floor has passed. No hint is printed; today's "Elder after 0.6 s" rule is gone (the protected floor replaces it).
- **Swarm window.** While `combat.swarmActive` every class plays `show.swarm` after its reveal: lift 0.4, hold 0.2, pause 0.6
  = 1.2 s, exactly today's `BALANCE.ceremony.cinematic.duringSwarm`, so the arena is never hidden for longer than it is today
  and the pause keeps its floor. The pose is the class's own; the camera uses ω 6.
- **Frozen world.** `ctx.cinematic` is set at `fishing:caught` (the end of the reveal) and cleared when the card's turn comes,
  exactly the window the ceremony froze (survival and combat get dt 0; fishing freezes its signs). The reveal runs on the
  game's clock as it does today.
- **Valve.** `show.valve` = 8 s of the real clock from T0: fishing opens the card whatever state the show is in (records
  written first if they were not). Main's cinematic valve stays as the second line (lane B sets it to the show's valve + 4 s).
- **Pause, abort.** A paused game holds the show's clock. A run that ends mid-show, a zone change or a reset: the fish is
  measured if it was not (once), `ctx.cinematic` clears, the camera and the Wick are released, no card.

### 2.2 The pose is chosen by the fish's true length, then by class and shape

The Wick stands ≈ 1.03 m to the top of its wax head on the raft (0.85 × the rig's 1.22), shoulders at 0.52 m, arms 0.21 m
(0.4 m at full stretch). Fish run from 6.7 cm (a Small Cupbearer) to 9.1 m (the Lantern-Swallower). One function decides,
for both lanes: **`data.showPoseFor(lengthM, {sizeClass, ancient, legend, shape})`**.

| pose (`setPose` name) | length | the picture |
|---|---|---|
| **pinch** (`showPinch`) | < 0.40 m | one hand held out to the lens (the fisherman's trick: it looks bigger), the rod planted like a staff in the other |
| **both** (`showBoth`) | 0.40 – 0.90 m | both hands under it, pushed proudly forward at chest height |
| **hug** (`showHug`) | 0.90 – 1.50 m | stood on its tail on the deck, hugged and heaved up against the shoulder, the Wick straining |
| **hang** (`showHang`) | 1.50 – 2.20 m | cannot be lifted: hung head-up from the planted, bowing rod, the Wick standing close beside it |
| **alongside** (`showAlongside`) | ≥ 2.20 m | laid along the raft in the water, its chin on the deck's edge, the Wick standing over it with a hand on its brow |

Three rules on top (`show.poseRules`): a **Trophy or bigger is never a pinch** (it takes both hands, however small the species);
an **Elder or an Ancient that would be hugged hangs instead** (it cannot be lifted), and so does a **long thin fish** (shape
`eel`: it drapes, it cannot be stood up); **every legend lies alongside**. Over the whole roster (53 species × the classes each
can reach, 288 cells): Small 22 pinch / 24 both / 1 hug / 2 hang · Keeper 15 / 29 / 2 / 3 · Prize 12 / 27 / 3 / 6 · Trophy 26
both / 15 hug / 7 hang · Elder 22 both / 22 hang / 3 alongside · Ancient 17 / 27 / 3 · the four legends alongside. So the
ladder reads the way the lead put it for a mid-bodied fish (a Small in one hand, a Keeper or Prize in both, a Trophy hugged,
an Elder presented) and stays honest for the others (an Elder perch is 78 cm: it is held, proudly; a Small sturgeon is 1.08 m:
it is hugged).

By class, for a mid-bodied fish (the audit's set), so the whole ladder can be seen at once:

| class | the audit's fish | pose | the Wick | flame through the hold | lens at rest |
|---|---|---|---|---|---|
| small | Mossback Perch 33 cm | pinch | one hand out to the lens, the rod planted, a bounce | 0.25 | ≈ 1 m: head, hand and fish |
| keeper | Weeping Carp 61 cm | both | both hands pushed forward, chest out | 0.35 | ≈ 1.3 m |
| prize | Reedjaw Pike 89 cm | both | the same at full stretch, leaning back, feet apart | 0.5 | ≈ 1.6 m |
| trophy | Reedjaw Pike 112 cm | hug | hugged upright, its tail on the deck, straining; the raft dips | 0.65 | ≈ 2.1 m: the full figure |
| elder | Reedjaw Pike 138 cm | hang | it cannot be lifted: hung from the planted rod, the Wick close beside it | 0.9 | ≈ 2.8 m, a low lens |
| ancient | Reedjaw Pike 166 cm | hang | the same, the rod bowed deep, the tail lying on the deck | 1.0 | ≈ 3.2 m |
| legend | Belled Matriarch 2.6 m | alongside | standing over it, a hand on its brow | 1.0, at its tallest | ≈ 2.3 m (craned for the 9 m one) |

What every pose shares:
- **The Wick faces the lens** (its body within 12° of the line to the camera by the present; `env.camYaw`, so the raft's
  heading does not matter), chest out, head up and tilted a little toward the fish, eyes in the happy squint of today's
  `catch` pose, glancing at the fish and back at us. In hang and alongside it stands three-quarter (body 30° / 35° toward the
  fish, head to the lens).
- **The fish shows its flank to the lens** (within 15° of square-on; a ray shows its back, see §2.3), belly down, nose toward
  the Wick's left hand (the right of the frame, as the card's ink drawing faces), at its **true size**.
- **Nothing is ever held above the Wick's head**: its flame is there. The fish's back never rises above the Wick's eyes in
  pinch and both (the face must show above it).
- The fish never passes through the cloak, the head, the rod, the lantern post or the deck (§4 S5), and the pose holds for the
  five bodies (§2.4).

The five pictures (lens-left / lens-right are the viewer's):

1. **showPinch.** The right hand plants the rod upright beside the Wick, butt on the deck (lens-left). The left arm comes
   straight out to the lens at shoulder height, palm up, the fish lying on it 0.30 m in front of the face plane. A fish under
   0.15 m is lifted to cheek height beside the face and pushed 0.42 m toward the lens (the head tilts to it, cross-eyed for
   a beat). A small bounce on the present. Reuses `measurePalm`'s cupped hand and the fish-on-palm placement, re-aimed: one
   hand, out to the lens, head up instead of bowed.
2. **showBoth.** The rod goes down on the bow rest during the lift. A hand under the fish 31 % of its length either side of
   its middle (the pair 0.13 – 0.44 m apart), pushed 0.24 m in front of the face plane at chest height, the elbows
   straightening on the present; the body leans back a little as counterweight, feet apart. Reuses `measureArms` (the IK and
   the hands-under placement), re-aimed: forward and up, not against the chest.
3. **showHug.** New. The fish stands on its tail on the deck on the lens-right of the Wick (lens-left if the lantern post or
   the deck's edge is in the way), leaning 70° from the deck against the shoulder, belly to the Wick; the near arm wraps its
   middle from behind, the far arm reaches across under its jaw. Its head tops the Wick's for L > 1.1 m. The Wick leans away
   and back, legs braced wide, a tremor (the `strain` pose's), the raft dips to that side. The tail's last tenth lies bent on
   the planks.
4. **showHang.** The rod's butt is planted on the deck by the Wick's far foot, both hands on it at chest height, the rod
   leaning 20 – 35° toward the fish and bowing under it; the fish hangs head-up from the tip on a short line, its tail brushing
   the deck (resting on it when the fish is longer than the tip is high), **within 0.25 m of the Wick's body** (today's hang
   leaves it a rod's length away in the air). A settling pendulum, turning ≤ 10° either side of square. Reuses `measureHang`
   (the fish off the rod tip, the bend, the pendulum), re-aimed: rod steep and planted, fish close, Wick to the lens.
5. **showAlongside.** The fish lies on its side in the water along the raft's lens-side flank, flank tipped ≥ 30° up toward
   the lens, pitched nose-up so that its chin rests on the deck's edge beside the Wick (≈ the first 12 % of it over the planks)
   and its tail trails under; across the raft's near end when the raft's long axis points at the lens (today's rule, kept).
   The Wick **stands** at the edge behind the head (today it kneels over a cord), the rod planted in the far hand, the near
   hand on the fish's brow, flame at its tallest. Small laps at the tail, no rings. Reuses `measureAlongside` (the side and
   across choice, the flank-up placement, the walk to the edge), re-aimed: standing, hand on the fish, turned to us.

### 2.3 Every species shape (`FishVisual.shape`)

| shape | pinch | both | hug | hang | alongside |
|---|---|---|---|---|---|
| minnow, perch, carp, koi, pike, ghost, angler, sturgeon | on the palm, flank to the lens | as §2.2 | as §2.2 | as §2.2 | as §2.2 |
| **eel** (long, thin) | on the palm, a loose curl | draped over both hands in a shallow S, head up at the left hand | never (→ hang) | hangs straight, its lower third coiled on the deck when longer than the tip is high | as §2.2, a lazy S on the water |
| **ray** (flat) | flat on the upturned palm, tipped 60° to the lens: we see its back | held by its wing edges like a painting, back to the lens, tail hanging | stood on its tail edge like a shield, back to the lens, the Wick peeking round it | hung by the snout, back to the lens | flat on the water, back up (today's rule) |
| **puffer**, **jelly** (round) | sits on the palm (a puffer puffs on each twitch) | cradled from below, hands close; a jelly's arms hang | (not reached) | (not reached) | (not reached) |
| **crayfish** | held from below by the carapace, claws up and waving | both hands under the carapace, claws out | (not reached) | (not reached) | (not reached) |
| **leviathan** | | | | | only: the camera cranes; the hand on its snout |

### 2.4 The five bodies

`CHARACTERS[].look`: the Wick 1.0 · Taper 1.1 × [0.86, 1.12, 0.86] under a 0.9 m stovepipe of wax (its flame sits ≈ 1.8 m up) ·
Stub 0.8 × [1.04, 0.94, 1.04] (0.78 m, a flame bigger than its body) · Tallow 1.15 × [1.12, 0.88, 1.12] (0.44 m across) ·
Ashwick 1.0 × [0.97, 1.03, 0.97]. The pose thresholds stay in metres for every body (the fish does not change size); the
grips are placed from the body's own shoulders and reach (the arms scale with the build), the hug's and the hang's stand-off
from its own radius, and the camera frames whatever head and flame the body has (§2.6), so Taper's frame is taller and
Stub's catch looks bigger beside it, as it should.

### 2.5 Weight and life (`show.life`, lane A's, *start*)

All of it on the rig's existing springs and eases; nothing linear, nothing that stops dead.

| class | overshoot past the hold point | twitch (peak struggle · s between flaps) | drips | strain | raft dip | flame | bob |
|---|---|---|---|---|---|---|---|
| small | 18 % | 0.9 · 0.45 | 3 | 0 | 0 | 0.25 | 2 cm |
| keeper | 15 % | 0.8 · 0.5 | 5 | 0 | 1 cm | 0.35 | 2 cm |
| prize | 12 % | 0.7 · 0.7 | 8 | 0.2 | 2 cm | 0.5 | 1.5 cm |
| trophy | 8 % | 0.55 · 0.9 | 12 | 0.65 | 4.5 cm | 0.65 | 1 cm |
| elder | 5 % | 0.4 · 1.2 | 16 | 0.85 | 6 cm | 0.9 | 0.8 cm |
| ancient | 5 % | 0.35 · 1.3 | 18 | 1 | 7 cm | 1.0 | 0.8 cm |

- **The lift** is an eased swing with anticipation: the body dips as the hands take the weight (squash), then stretches into
  the present; the overshoot settles in 0.28 s. A small fish snaps up; a big one is hauled (the same curve, longer).
- **The fish**: `FishVisual.update({swim, struggle, flop})` pulses (today's `pulse`): the first flap 0.2 s after the present,
  as the overshoot settles, then one every `twitch[1]` s at `twitch[0]`, the hands and the arms giving with each; so every
  class flaps at least once in its hold, an Elder twice. In the pause it only breathes (≤ 0.12).
- **Drips** fall from its belly and tail through the hold (the existing particle emitters; no rings on the water).
- **The flame** stands at `life.flame` through the hold and the pause (the pose's own `flame`), under the one-off burst
  `actors.flareFlame` gives at the present.
- **Strain and dip** (prize up): lean, braced legs, the `strain` pose's tremor scaled by `strain`; the deck's edge on the
  fish's side sinks by `dip` as the weight comes aboard and rides back on the raft's spring.
- A new species or a legend (`special`) adds a second, bigger bob and holds the eyes wide for a beat.

### 2.6 The camera (`show.camera`, lane B's, *start*)

One rig with the play's (no cut, no new pass). It takes over at **T0** and eases on a critically damped spring whose ω is set
per class so that it has arrived (< 5 % of its travel left) **by the present** (validated: ω × (reveal + lift) ≥ 4.75):
6 / 6 / 4.5 / 3.6 / 3 / 3. Its yaw is the play's (plus `BALANCE.cameras.trophy`'s landmark swing when the catch has a place):
the Wick turns, the camera does not orbit.

**It fits points, not a sphere.** `actors.getShowFocus()` returns named world points (`keep`): the fish's snout, tail, back and
belly; four points round the wax head; the flame's core; the hands; the feet; the rod tip. The camera takes the pose's fov
and elevation, and the smallest distance at which every point its row lists sits inside the frame's safe area (margin 8 % of
each edge on a landscape screen, 6 % upright), never nearer than 0.35 m to any of them, never below 0.45 m above the water.
Because the fish is held toward the lens it is nearer than the face and so looks bigger: the fisherman's trick is the fit's
own arithmetic. During the reveal (before `showFish`) it fits the reveal's fish and the Wick's head and flame with the `both`
row. From the lift on, actors returns the **settled** layout (where everything will be at the present), so the camera eases
to a still target and is at rest (< 2 % of its distance per second) through the pause.

The fit, so both lanes mean the same thing (a pure function in `render-camera.js`, unit-tested): with the view's right, up
and forward axes from the yaw and the elevation, each kept point p has x = p·right, y = p·up, z = p·forward. Look at the
middle of the points' x and y extents, at the depth zc of the fish's centre; a point is inside when |x − cx| ≤ (d + z − zc) ·
tan(fovH / 2) · (1 − 2·margin) and the same for y with fovV; take the smallest d that holds for every point, then no less than
0.35 m + the nearest point's (zc − z); re-centre cx, cy on the projected extents and repeat once.

| pose | elev | fov 16:9 | fov upright | kept in frame | what it comes to (the Wick, default body) |
|---|---|---|---|---|---|
| pinch | 8° | 44° (52° under 0.15 m) | 58° | fish, head, flame | lens ≈ 0.9 – 1.2 m from the face, 0.5 – 0.9 m from the fish: a head-and-hand close-up |
| both | 10° | 42° | 60° | fish, head, flame, hands | ≈ 1.2 – 1.6 m: head, chest and the whole fish |
| hug | 10° | 44° | 62° | fish, head, flame, feet | ≈ 2.1 m: the full figure and the fish as tall as it |
| hang | 8° | 46° | 64° | fish, head, flame, feet, rod tip | ≈ 2.8 – 3.6 m, a low lens: the fish towers |
| alongside | 16° (craned to 40° above 4 m) | 48° | 66° | fish, head, flame, feet | as far as the fish is long: ≈ 2.3 m for 2.6 m, ≈ 6.5 m for 9 m |

- **Upright (a phone).** The same fit with `fovPortrait`. An alongside fish longer than 3.2 m is **raked**: the yaw turns 55°
  off broadside toward its head end and the crane goes to 40°, so the head and the Wick are near and the body runs away up
  the frame; never cropped.
- **The Elder's pull-back** (`landing.elder.pull`) stays as a small breath out on the present, inside the fit's margins.
- **Behind the card** the framing holds (today's rule: on a phone the subject is lifted into the open top of the frame).
- **Back to play**: when the card closes the rig eases to the play camera over 0.9 s on the same springs; the Wick's pose
  eases out with it (§2.10).
- The close-up exposure rule stays (`env.closeK`: the wax, the flame and the lantern come down as the lens comes near), and
  the lantern post, its lantern and pennant still step aside when they stand in front of the subject (`stepPoleAside`).
- **Never a ring**: the water's hush stays on from T0 to the card (no ripple ring near the raft), the glory stays the
  camera-facing billboard it is (zero light and zero slope at its edge), nothing is drawn on the water or round the raft.

### 2.7 The payoff crowns the show (`AUTOFISH.landing`, unchanged numbers)

| when | what (by class, as today) |
|---|---|
| T0 | slow-motion beat, droplets, the swell (audio), the line taut then easing; the camera's kick and the push are folded into the show camera's own approach (lane B: no double zoom) |
| through the reveal | the ink floods off behind the band of pale gold, glints shed off the band |
| `fishing:caught` | the class chime, the species' voice; a new species' falling shimmer |
| **the present** | **the climax**: the glory opens behind the Wick and its fish (centred on the show focus, sized to it, embers rising), the head flame flares and throws sparks, the fish's own glow ignites, bloom, a small kick, the haptic; the flourish (§2.8). A new species, a legend or a record adds `landing.special` |
| hold | the glory holds (an Elder's longer and brighter, `gloryHold` / `gloryBright`), embers drift |
| pause | nothing new fires; the glory is fading, the embers thin |
| card | the stamp's small hit moves to the card's stamp press (a card shake, not a camera shake) |

`fx.stampFlash`, the second glory at the stamp and the measuring banner are gone with the stamp beat; a record's extra bloom
joins the climax at the present.

### 2.8 Sound (lane B; all original, synthesised like the rest)

| moment | sound |
|---|---|
| T0 → caught | the swell, then the class chime and the species' voice: as today |
| lift | `show_lift`: a wet haul, water sheeting off, by class; from Trophy a creak of rope and deck |
| the present | `show_present`: the flourish, a short rising figure on the game's bell and pluck by class (today's catch fanfare may be re-timed to be it); `record_chime` with it for a record or a new species |
| each flap | `show_flap`: a wet slap, by the fish's length (lane A emits `show:beat {kind: 'flap'}`) |
| hold | `show_drip`: sparse drips on wood |
| pause | nothing new: the bed and the lake |
| card | the unfold; `cord_tick` rising under the length as it counts up; `seal_stamp` on the stamp's press; the coin ticks (as today) |

`fish:measured` no longer plays the cord or the seal by itself, and `fish:landed`'s fanfare no longer waits for a stamp.

### 2.9 The cord, the overlay and the stamp

- **The knotted cord is cut from the show.** It does not make the picture better: at the show's distances it is a pale thread
  across the flank that fights the fish's own pattern, its unrolling needs time a 2 s show does not have, and without the
  overlay's count it has nothing to say. `actors.showCord` and `actors-measure.js` stay in the code, uncalled by the show.
- **The measuring overlay is retired** on the automatic-fishing path: no ink band, no ruler, no class words, no count, no
  banner, no "tap to skip". `ui.showMeasure` is never called; `fishing.view.measure` stays `null`; `ui-measure.js` keeps one
  duty, holding the card back until `view.show.phase === 'card'`.
- **What moved onto the card** (§2.10): the length **counts up** beside the class stamp, which **presses** after it; your best
  and the Old Ledger are **two knots on the card's ruler line** (marks, no words: oxblood and black); the record is the card's
  kicker, as it already is ("A new personal best", "Old Ledger beaten", "Your first Trophy"); an Elder's name is the card's
  epithet, as it already is. "(was 20 cm)" moves behind "more".
- No toast, tip or banner from any module shows from T0 until the card (they queue as flavour toasts do today behind a modal).
  The HUD is fully hidden from T0 (today it dims to 30 % and only from the ceremony).

### 2.10 The card, and back to play

- **Opens from the fish.** Its ink wash grows from the screen point of the held fish's centre (`fishing:show {phase: 'card',
  origin: {x, y}}` → the modal's transform origin; 0.32 s), the content fading in behind it. On a phone it rises from the foot
  as it does today and the picture stays in the open top of the frame.
- **Content: today's decluttered card**, no new words. The hero length counts 0 → its figure in 0.5 s, the stamp presses at
  0.55 s, the two knots tick onto the ruler; the worth's coin count follows as today.
- **Behind the card** the Wick keeps presenting (breathing, a twitch now and then at a third of the hold's strength).
- **The action closes it**: `fish:action` → `actors.endShow({action})`: keep: the fish drops into the creel; eat / render:
  today's eat and toss poses take it; release: a low toss over the side, a small splash, no ring. ≤ 0.6 s, then fishing
  disposes the model (as today). The Wick's springs carry it back to idle, the rod back in its hand without a pop; the camera
  eases out over 0.9 s.

## 3. What is reused, what is new

| piece | today | the show |
|---|---|---|
| `measurePalm` / `Arms` / `Hang` / `Alongside` (actors-wick) | cupped, bowed, side-on, kneeling: the Wick measures | re-aimed into `showPinch` / `showBoth` / `showHang` / `showAlongside`; **`showHug` is new**. The measure poses stay for `setPose` callers |
| `placeMeasured` (actors) | fish on the hands / off the tip / alongside, flank to the camera | the base of the show's placement; adds the swing-in, the present, the hug, the chin on the deck |
| `beginHandOver` blend | 0.45 s lerp from fishing's spot | replaced by the lift's swing on the line |
| trophy camera (`setTrophyTarget`, `trophyFit`) | a sphere round fish and Wick, distance by length, 1 s late | the fit of named points, from T0, arrived by the present. The trophy maths stays as the scope cut |
| `AUTOFISH.landing` | reveal payoff, climax at the pose, second bloom at the stamp | same rows; climax at the present |
| `ui-measure.js` overlay, `fx.stampFlash`, the cord | the measuring beat | retired from the flow (§2.9) |
| catch card (`ui-screens.showCatch`) | slides in when the overlay ends | unfolds from the fish; count, stamp press, two knots |
| `SIZE_CLASSES[].ceremony`, `BALANCE.ceremony` | the ceremony's timings and poses | read only by legacy paths (the measure poses, `mmBelow`, `wickHeight`, `duringSwarm`); the show reads `AUTOFISH.show` |

## 4. Acceptance (S1 – S8, made specific)

Measured on the 30 fps stepper by `tools/tests/show-audit.scenario.mjs` (the stage's, re-run after the merge into
`tools/out/show/after/`), `tools/tests/show-poses.scenario.mjs` (lane A) and `tools/tests/show-seq.scenario.mjs` (lane B).
"At the pause" = every frame whose `view.show.phase` is `pause`. The default Wick unless said; other bodies ≥ 0.65 × the sizes.

**S1 The picture.** At the pause, every landed fish, at 960 × 540 and 390 × 844:
- the Wick to the lens: `wickOffLens` within ± 15° (pinch, both, hug) or ± 40° with the head within ± 15° (hang, alongside);
- the flank to the lens: `fish.endOn` ≤ 15° (held and hung), ≤ 25° alongside, ≤ 65° under the upright rake;
- the whole fish in frame (`fish.inFrame` = 100, ≥ 4 % clear of every edge), the wax head and the flame's core in frame;
- the fish is the subject (its box, share of the frame):

| pose | 960 × 540 | 390 × 844 |
|---|---|---|
| pinch, L ≥ 0.2 m | width ≥ 14 % | width ≥ 30 % |
| pinch, L < 0.2 m (never a dot) | width ≥ 9 % and ≥ 80 px, height ≥ 16 px | width ≥ 18 % and ≥ 70 px |
| both | width ≥ 28 % | width ≥ 55 % |
| hug | height ≥ 45 % | height ≥ 38 % |
| hang | height ≥ 45 % | height ≥ 38 % |
| alongside | width ≥ 55 % | width ≥ 70 %, or raked: its diagonal ≥ 45 % of the frame's |

- the Wick reads: feet-to-flame ≥ 30 % of the frame's height (alongside: ≥ 14 %);
- in the Mossmere, Sporewood, Glasswater and the Pallid Deep, at calm and at gloomtide (a Still night): the stage looks at one
  catch per lake and phase in the after sheet; the fish and the face are never blown to white or sunk in black.

**S2 The pause and the clean frame.** With no tap: `pause` lasts ≥ 0.6 s (the time from `phase: 'pause'` to the card's
modal); the card opens only after it. From T0 + 0.25 s until the card: `uiVisible` = 0 and `words` = 0 in every frame, and
`cover.*` = 0. The card of an ordinary catch carries no more words than today's (23 on the audit's Small).

**S3 The clock.** T0 → card on the stepper: 2.0 / 2.1 / 3.0 / 3.5 / 4.97 / 5.26 s, each ± 0.15 s, a Small or Keeper never
over 2.5, nothing over 6. A tap at T0 + 0.1 s: the card at `showPlan(cls, {hurried: true}).total` ± 0.15 s; with a new species
or a personal best the time from `fish:measured` to the card is ≥ 0.8 s. A tap in the pause: the card within 0.1 s. In a
swarm window: reveal + 1.2 s ± 0.1. A stuck show (`debug.showRate(0.02)`): the card at ≤ 8.2 s, the records written once.

**S4 The extremes.** Each produces a frame that passes S1: the Cupbearer Small (6.7 cm; in the phase-1 game the Quayling,
11.5 cm, and the Dusk Minnow, 17 cm); the Lantern-Swallower (9.1 m) and the Belled Matriarch: alongside, never cropped, the
hand within 5 cm of the fish; a Gloam Eel in both and in hang; a Velvet Ray in both and in hug; a puffer, a jelly, a crayfish;
the five bodies × the five poses (lane A's viewer, 25 frames); raft headings 0°, 90°, 180°, 270° and the across case; upright.

**S5 No ring, no clipping, no pop.**
- No ring or disc round the raft or the Wick in any frame (the hush on, the glory a billboard); nothing new drawn on the water.
- Lane A's viewer, numerically, at 10 pose times through lift, hold and pause, for every S4 case: no point of the fish's box
  more than 2 cm inside the Wick's cloak capsule or head sphere; none more than 1 cm under the deck inside the deck's outline
  (a resting tail lies within 3 cm of it); the fish and the hands ≥ 5 cm clear of the lantern post; the rod outside the fish's
  box except the hang's line; each holding hand within 3 cm of the fish's surface from the take on.
- Continuity on the stepper from T0 until 1.5 s after the card closes: the lens moves ≤ 0.9 m per frame and its per-frame
  step changes by ≤ 0.35 m; the fov ≤ 1.5° per frame; the fish's centre ≤ 0.45 m per frame; no Wick joint value jumps by more
  than 0.35 per frame; the rod never changes hands inside one frame (it is set down or taken up).

**S6 Weight and life.** Lane A's viewer reports, per class: the present overshoots by `life.overshoot` ± 40 % of the lift's
travel and is within 1 cm of rest 0.28 ± 0.1 s later; ≥ 1 flap in the hold (≥ 2 for an Elder or bigger) and struggle ≤ 0.12
through the pause; ≥ 60 % of `life.drips` spawned; the deck edge sinks `life.dip` ± 50 % at the present and recovers ≥ 60 %
within 1 s; from Trophy the Wick's lean and tremor are visible in the strip. No linear position lerp anywhere in the show.
Three look-and-fix rounds on the strips, at least.

**S7 The rules.** `fishing:landing` → `fishing:caught` → `fishing:show {lift}` → `fish:measured` → `fish:landed` →
`fishing:show {hold}` → `{pause}` → `{card}` → the card, each once per fish, in that order, hurried or not (unit test + seq
scenario). Main saves on `fish:measured`. `ctx.cinematic` true exactly from `fishing:caught` to the card. A hand slam, a
knock or a snap during the show changes nothing. The First Evening's steps keep their order. `node tools/validate-data.mjs`
(default, `--walk`, `--v3`) passes with the flag-off fingerprint untouched (never `--refresh-fingerprint`); `node
tools/check.mjs` green; `node tools/sim/catch-v3.mjs` all PASS (today: the economy normaliser 0.80 / 0.74 / 0.66 / 0.57
against data's 0.78 / 0.72 / 0.64 / 0.56, inside its ± 0.03); `tools/scenario-run.mjs` through `tools/playtest.mjs` prints
"ALL INVARIANTS HOLD" with 0 page, console and ctx errors on the flag-off minified build and on a v3 build;
`tools/tests/run-v3.scenario.mjs`, `p1-smoke.scenario.mjs` and `first-evening.scenario.mjs` pass. The flag-off game is
unchanged (the v1 fishing trace test, the fingerprint).

**S8 Cost.** No new render pass or target. Draw calls at the pause ≤ the same catch's ceremony peak today + 4 (`gl.calls` in
the notes; the cord's mesh goes). After ten catches and their cards: live geometries, textures and programs equal to their
count after the first (± 0), `fishing.view.show` and `actors.showPose` null, `ctx.cinematic` false, no timer or animation
frame left by the card.

## 5. Scope-cut ladder (cut from the top; each cut keeps S1 – S3 and S7)

1. The exit gestures (§2.10): the fish fades from the hands in 0.2 s as today.
2. Per-shape grips beyond: ray back to the lens (exists), round fish cradled, eel hangs. Crayfish and jelly use the plain grip.
3. The card's unfold from the fish: the card fades and scales in from the screen's centre (a phone: from the foot, as today).
4. The two knots on the card's ruler (the kicker already names the record).
5. `showHug`: 0.90 – 1.50 m hangs from the rod (`showHang`, which exists as `measureHang`).
6. The settled focus: `getShowFocus` returns the live layout and the camera's spring smooths the chase.
7. The upright rake: an alongside fish over 3.2 m is craned to 50° and stepped back (today's portrait rule).
8. The fit camera: `setShowTarget` drives today's trophy maths from `getShowFocus().center / radius` with the distance rule
   `clamp(0.9 + 1.1·L, 1.1, 12)` m, from T0, with the class ω.
9. The raft's dip and the drips.
Never cut: the Wick to the lens with the fish's flank to it, the fish the subject at the sizes of S1, the pause, the clean
frame, the clock, the hurry floor, the event order.

## 6. The lane seam

### 6.1 Files

| | owns (only this lane edits) |
|---|---|
| **Lane A** "the Wick and the fish" | `src/actors-wick.js`, `src/actors.js`, `src/actors-measure.js`, `src/actors-raft.js`, `src/actors-fx.js`, `src/models-fish.js`, `src/models-size.js`, `tools/tests/show-poses.scenario.mjs`, `tools/tests/actors-v3.test.mjs` (+ a new `show-poses.test.mjs` for pure helpers) |
| **Lane B** "the sequence, the camera, the card and the sound" | `src/fishing.js`, `src/fishing-fx.js`, `src/render.js`, `src/render-camera.js`, `src/ui-measure.js`, `src/ui-af.js`, `src/ui-screens.js`, `src/ui.css`, `src/audio-v3.js`, `src/audio-af.js`, `tools/sim/catch-v3.mjs`, every other unit test, `tools/tests/show-seq.scenario.mjs`; and, for the named edits only: `src/ui.js` and `src/ui-hud-v3.js` (hide the HUD and hold toasts, tips and banners while `view.show` is up; pass the card its origin), `src/audio.js` and `src/audio-sfx.js` (the show's sounds, the re-timed stamp and fanfare), `src/main.js` (the cinematic valve from `AUTOFISH.show.valve`; Space / Enter to `fishing.hurryShow`) |
| both, own keys only | `src/data.js` (`AUTOFISH.show`: §6.6) and its rules in `tools/validate-data.mjs` |
| the stage only | `DESIGN.md`, `CONTRACT.md`, this file, `tools/tests/show-audit.scenario.mjs`, `tools/show-sheet.mjs`, `index.html` |

### 6.2 What lane A provides and lane B calls (`ctx.actors`; stubs are in `src/actors.js` on `gw-show`)

```js
showFish(fishVisual, {
  cls,                       // 'small' … 'ancient': data.showClassOf({sizeClass, ancient, legend}) → show.life / show.beats row
  pose,                      // optional pose id; default data.showPoseFor(fishVisual.length, {sizeClass, ancient, legend, shape})
  sizeClass, ancient, legend,
  beats: { lift, hold, pause },   // seconds of pose time: data.showPlan(cls, {swarm}) (lane B passes the swarm row in a window)
  special,                   // a new species or a legend
}) -> { pose: 'showPinch' | 'showBoth' | 'showHug' | 'showHang' | 'showAlongside', id: 'pinch' | …, hands: 1 | 2, side: -1 | 1 } | null
       // called once, at fishing:caught. Pose time 0 = the start of the lift. Actors takes the fish from where fishing left it
       // (world space, true size) and owns its transform until endShow; fishing still owns and disposes the FishVisual.
setShowTime(t)               // pose time in seconds since showFish; lane B calls it every frame of the show (× hurry.liftRate
                             // when hurried). Never runs back. A frame without a call advances by actors' own dt.
getShowFocus(out?) -> null | {
  pose, id, t, lift,         // lift: 0..1 progress of the lift
  fish:  { center, axis /* tail → snout, unit */, up, length, depth },
  head:  { center, radius, flame /* the flame's core, ≈ 60 % up it */ },
  feet, hands: [right, left], rodTip /* null when the rod is stowed */,
  keep:  { fish: [snout, tail, back, belly], head: [4 points], flame: [core], hands: [..], feet: [feet], rodTip: [tip] | [] },
  center, radius,            // the sphere round every keep point (getMeasureFocus's contract)
}                            // world space, THREE.Vector3. From the lift's first frame: the SETTLED layout (where each point will
                             // be at the present), steady to 6 cm through lift, hold and pause.
endShow({ action })          // 'keep' | 'eat' | 'render' | 'release' | undefined: the fish leaves the hands (≤ 0.6 s), the Wick
                             // returns to play. showCatch(null) means the same.
showPose                     // getter: the setPose name while a show is up, else null
```
Kept and unchanged: `flareFlame(k)` (lane B calls it at the present), `getHeadPos`, `getWickPos`, `getRodTip`, `showCatch`,
`setPose` (the five show names are also valid `setPose` bases for the viewer), `getMeasureFocus` (while a show pose is up it
returns the show focus's `center / radius`), `showCord`, `measurePoseFor`.
Lane A also emits, for sound: `show:beat {kind: 'take' | 'present' | 'flap' | 'settle' | 'drip', strength 0..1, cls}`.
Debug (only when `core.debugEnabled()`): `ctx.debug.showPose({speciesId, z, lengthCm?, cls?, pose?, character?, heading?, t})`
builds a fish, calls `showFish` and holds pose time `t`; `ctx.debug.showPoseInfo()` returns the S5 / S6 numbers.

### 6.3 What lane B provides (`ctx.fishing`, `ctx.render`, the bus)

```js
fishing.view.show = null | {            // set at T0, null again when the card has closed
  phase: 'reveal' | 'lift' | 'hold' | 'pause' | 'card',
  cls, pose /* id, from 'lift' on */, t /* real s since T0 */, poseT, dur: { reveal, lift, hold, pause, total },
  hurried, protected, swarm,
  sizeClass, ancient, legendary, speciesId /* from 'lift' on: after fishing:caught */, length /* cm, from 'lift' on */, uid,
}
fishing.view.measure                    // stays null on this path (the overlay is retired)
fishing.startShow(fish, opts) -> Promise    // startCeremony is its alias; resolves with measure's result at the card's turn
fishing.hurryShow() -> bool                 // skipCeremony is its alias
fishing.inShow                              // inCeremony is its alias
render.setShowTarget({ cls, pose?, length, landmark?, position?, place? } | null)   // at T0; null at the card (the framing holds behind it)
```
Events (bus), each once per fish, in this order:
`fishing:landing {sizeClass, ancient, legend, dur}` (T0, as today) → `fishing:caught {…}` (as today) →
`fishing:show {phase: 'lift', cls, pose, dur: {lift, hold, pause}, sizeClass, ancient, legendary, speciesId, length}` →
`fish:measured` → `fish:landed {measured: true}` (both from `progression.measure`, at the present) →
`fishing:show {phase: 'hold', isNew, records}` → `fishing:show {phase: 'pause'}` →
`fishing:show {phase: 'card', origin: {x, y} /* CSS px of the fish's centre */}` → the card.
Debug: `ctx.debug.show()` (the state), `ctx.debug.showRate(k)` (the show's clock; `cerRate` is its alias),
`ctx.debug.ceremony()` keeps answering `{active, t, …}` for the old scenarios.

### 6.4 What the Wick reads (`env`, inside lane A: `actors.js` → `actors-wick.js`)

- `env.camYaw` (exists): the world yaw from the Wick to the lens, from `ctx.render.camera`'s position, every frame; `null`
  without a camera. A show pose faces `wrapPi(env.camYaw − env.heading)` (+ the three-quarter offset toward the fish).
- `env.show` (new): `null | {pose, t, lift, hold, pause, cls, life /* the class row */, lenB, depthB /* the fish in body
  units */, shape, special, side}`.
- `env.closeK` (exists): the close-up exposure applies to show poses as it does to measure poses.
Lane B reads none of them.

### 6.5 Who starts and who stops what

| moment | lane B does | lane A does |
|---|---|---|
| T0 (`startRevealAF`) | sets `view.show {phase: 'reveal'}`; `render.setShowTarget({cls, length: the class length})`; the HUD hides; the reveal as today | nothing new (the Wick is in `reel`, turning with the fish) |
| `fishing:caught` | `ctx.cinematic = true`; `actors.showFish(fv, …)`; `view.show.phase = 'lift'`; `fishing:show {lift}`; `show_lift`; the line off (`setLine(false)`) | takes the fish; draws its own line through the swing-in; the lift |
| every frame | `actors.setShowTime(poseT)`; the camera fits `actors.getShowFocus()` | the pose, the fish, `show:beat` |
| the present (poseT ≥ lift) | `progression.measure(fish)`; the climax (`fx.glory` on the focus, `render.pulse` / `kick`, `actors.flareFlame`, haptic, `show_present`); `phase = 'hold'`; `fishing:show {hold}` | the overshoot and its settle |
| poseT ≥ lift + hold | `phase = 'pause'`; `fishing:show {pause}`; fires nothing else | calms (reads its own pose time) |
| the end of the pause, a hurry past its floor, or the valve | `ctx.cinematic = false`; `render.setShowTarget(null)`; `phase = 'card'`; `fishing:show {card, origin}`; ui opens the card | keeps the pose behind the card |
| `fish:action` / the card closes | `actors.endShow({action})`; 0.6 s later disposes the model; `view.show = null`; the camera eases out | the exit gesture; back to idle |
| abort (run over, reset, zone change) | measure if not yet; `cinematic` off; `setShowTarget(null)`; `actors.endShow({})`; `view.show = null` | releases at once |

Alone, each lane still runs: lane B against the stubs (the measuring poses stand in; without `actors.showFish` it falls back
to `setPose` + `showCatch` + `getMeasureFocus`); lane A through its viewer and `ctx.debug.showPose` (no fishing involved), on
today's trophy camera (`render.setTrophyTarget`, which frames `getMeasureFocus`) or a camera the scenario places itself.

### 6.6 `AUTOFISH.show`: who may retune what

| keys | owner |
|---|---|
| `phases`, `beats`, `about`, `tolerance`, `max`, `minPause`, `swarm`, `hurry`, `valve`, `at`, `poseRules`, `poseNames`; `data.showPlan`, `showPoseFor`, `showClassOf`, `showRevealSeconds` | **the seam: frozen.** A lane that needs one changed says so in its commit message; the stage decides |
| `poses[].below` (each within ± 0.1 m), `grip`, `facing`, `life` | lane A |
| `camera`, `card`, `sound`, `hud`; `AUTOFISH.landing` (within the validator's totals); `AUTOFISH.time`, `AUTOFISH.player.tapTo` (with the sim) | lane B |

### 6.7 Each lane's proof

- **Lane A**: `tools/tests/show-poses.scenario.mjs --cls= --species= --z= --body= --heading= --cam= --t=`: any class, species,
  body, heading and camera at any pose time; a matrix mode that shoots S4's cases and writes S5's and S6's numbers; strips of
  the lift at 30 fps for small, prize, trophy, elder and a legend. Three look-and-fix rounds, on desktop and upright.
- **Lane B**: `tools/tests/show-seq.scenario.mjs`: S2, S3 and S7 on the stepper for every class (the order, the clock, the
  clean frame, the hurry and its floor, the swarm row, the valve, the abort), the camera's S1 numbers against the stubs' poses,
  S8's counts; unit tests for the order and the clock in node. Three look-and-fix rounds on the card's opening and the framing.
- **The stage** merges A then B (no file is shared but `data.js` and `validate-data.mjs`, by key), removes nothing but the
  stubs lane A replaced, re-shoots `tools/out/show/after/` with the audit scenario, checks §4 and rebuilds `index.html` last.
