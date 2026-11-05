> **Superseded draft (2026-11-05).** Reconciled into DESIGN §25.4.8 (the First Evening), §25.2.2 and §25.14.2b, CONTRACT §13.12, and `src/data.js` `FIRST_EVENING`. Its open questions are answered yes: the FE slice ships right after automatic fishing, ahead of P2; cold candles; the departure glide as optional FE-O1; the Quayling counts for First Light; the class estimate on the first two Small / Keeper plays. Kept as the design record.

# The opening: the First Evening

*GLOOMWATER v3 · narrative and onboarding design for the first minute of a new game, under automatic fishing · branch `gw-autofish` (from `gw-p1v-base`) · 2026-11-05*

**What this document owns:** where a new game starts and why the lore puts it there, the opening framing, the tutorial that teaches the new automatic fishing, every line spoken or shown in that minute, and the smallest build of it that can ship right after automatic fishing, with its path to the full Landing of P3. **What it does not own:** how a strike, a play, a reveal or a loss look and feel (`EXPERIENCE.md` §2–§8), and the land-chance numbers (the catch model, `tools/sim/catch-v3.mjs`, draft `CATCH_V3`). Odds quoted here come from that draft at T0 and are marked *(odds model)*.

**Relation to `EXPERIENCE.md` §1.** EXPERIENCE §1 sketched the First Evening in 60 seconds. This document is its full spec and supersedes §1's detail. It keeps §1's place, its teacher and most of its lines; §6 below lists every change and why.

**Binding sources:** DESIGN §1 (premise and tone), §18.1 (today's run 1, the cold start this replaces), §21.5 (tips: one at a time, ≤ 90 characters), §21.6 (Drowned Filigree: no boxes, words on night ink), §24 (walking: not built on this branch), §25.1 (pillars), §25.2.2 (the first session), §25.3.2 (the First Outing), §25.4 (the Landing: fiction, layout, stations, growth, palette, cameras, reuse table, phone budget, Landing v0), §25.14 (phase plan); CONTRACT §13.0–§13.4; `src/data.js` `COVE`, `BALANCE.cameras`, `TEXT_V3`, `TIPS_V3`, the `quayling` species. With `V3_ENABLED` off nothing here applies, and v1 stays bit-identical (validate-data's flag-off fingerprint).

**Vocabulary (kept from EXPERIENCE):** the **First Evening** (this opening; "evening" because it is the hour candles are lit), the **strike**, the **play**, the **reveal**, the **got-away note**. **Added here:** the **Lantern Line** (the opening camera move), the **cold candles** (unlit Wicks by the hearth), **first oil** (the lantern Murk fills at Set Out), the **departure glide**.

---

## 0. The request and the four promises of the opening

The user, verbatim: *"Make sure the game starts with a very short tutorial and in a place thay makes sense for this game to start in based on our lore. I do the want it to be that you're just in the game somewhere and you just start off your own back."*

Today's v3 build does exactly what the user does not want. A fresh save shows the title with the whole premise paragraph, then New Descent, and run 1 spawns the raft in the Mossmere's south cove facing north (DESIGN §18.1, 0:00) with a toast that says "Sail". Nobody tells the player who they are, why they fish or where they are.

The opening keeps four promises. When anything below seems to conflict, these win, in this order:

1. **Never a cold start.** No new game begins in a lake. The first thing a new player controls is a Wick at the Landing, after it has been shown who it is and why it fishes.
2. **Very short, one line at a time.** From *Begin* to the Mossmere takes about 50 s for a typical player and never more than 90 s. At most one instruction is on screen at a time, every line fits on one line (≤ 90 characters), there are no panels of text, and every step can be skipped.
3. **Honest odds, even here.** The first fish is likely but never certain (≈ 90% *(odds model)*). Losing it is part of the lesson, not a failure state, and no code path forces a landing.
4. **Lore-true, and bookended.** Every beat follows from DESIGN §1 and §25.4. The opening shows the great lantern's last ember far down in the dark, and the end of the game brings it home (§2.3).

---

## 1. Where the game starts, and why

### 1.1 The Landing, at the hearth

The game opens **at the Landing**, the old ferry landing under the kingdom's outer wall (DESIGN §25.4), with the player's Wick **waking among the cold candles by the hearth**.

The lore puts it there, and nowhere else fits as well:

- **The premise ends here.** The great lantern fell and the kingdom followed it into the water; the Wicks are what is left of its candles (§1). The Landing is *where the last Wicks landed* (§25.4). The opening line "Its last candles came ashore here" is literally true of the place on screen.
- **The hearth is where a candle waits.** §25.4: "The Wicks who are not out on the water doze by the hearth." A new Wick is a candle that has not been lit yet. Waking by the hearth turns "you are a candle" into an image instead of a sentence: one small flame catches among cold ones.
- **It answers "why do I fish?" in the first ten seconds.** The Wick wakes guttering. Murk says what keeps a candle lit: fish make oil, oil makes light. Fishing is survival before it is a hobby, exactly as §1 says ("fishing so they stay lit").
- **It shows the way out.** The sea-gate arch with the lit Mossmere Waystone is the only exit, and the camera looks straight at it (the cove is authored for a north-looking camera, §25.4.1). The player sees where they will go before they go.
- **It is home.** Every expedition starts and ends here from P3 on (§25.3). Starting here means the first place the player learns is the place they will come back to, and the bare harbour wall ("It is bare now", `COVE.description`) is the first promise of the collection.
- **The teacher lives here.** Old Murk keeps his barge at the Landing between expeditions (§25.4), 8.5 m up-screen of the jetty head, in view of every cast.

### 1.2 Candidates considered

| candidate | lore fit | teaches the loop | cost | verdict |
|---|---|---|---|---|
| **The Landing, at the hearth** (§1.1) | where the last Wicks landed; the hearth is where candles wait; Murk's home; the sea-gate is the way to every lake | wake → fish → odds → plan → set out; the same loop every later expedition uses | the cove has to be built (P3 in §25.14), but a raft-mode slice reuses its data and Landing v0's rules (§5) | **chosen** |
| The Mossmere's drowned ferry harbour, at Murk's day-1 dock (§25.8: "the ferries never left") | strong (a drowned harbour), but it is inside a lake: the player starts "in the game somewhere" | the fishing, but not home, the Map Table or setting out | low: no new zone | **fallback F0 only** (§5.2), never the target |
| A prologue at the fall of the great lantern (the kingdom above the water) | the most dramatic | none: a cutscene with nothing to do, and a lit kingdom contradicts "the one warm light in a cold world" (§19) | very high: a new set, new art, new tone | rejected |
| On the raft in the sea-gate channel, already setting out | good image | skips home and the Map Table; "why do I fish?" goes unanswered | medium | rejected |

### 1.3 What the player knows when the Mossmere loads (about 0:50)

| the player now knows | taught by |
|---|---|
| I am a Wick, one of the kingdom's last candles; Wicks fish to stay lit | the Lantern Line, the wake, Murk's first line |
| fish make oil, oil makes light; Murk gives the first oil, after that I fish for it | Murk (wake, Set Out) |
| how to cast | doing it (one tip) |
| a nibble is not a bite; tap when the float goes under; early or late costs a little | doing it (two tips, the strike word) |
| after the strike the line does the rest | watching the play (one tip) |
| I can see how big it is, not what it is, until it is in | the class estimate and the reveal |
| every fish is measured, and I keep the record | the measuring moment and the card |
| the odds are in my log, never on the water, and never certain | Murk, the log, and possibly a real loss |
| how to sail | sailing to the Map Table (slice only; in P3 the lake's first tip) |
| the Landing is home; the sea-gate is the way out; the Map Table plans an outing | the place itself, Murk, the glide |

---

## 2. The opening beat

### 2.1 The Lantern Line: one camera move, three lines (9 s, skippable)

The title overlay already orbits the cove (render `title`, `BALANCE.cameras.title.orbit`: a southern arc, 24 m radius, around (−4, −6)). On *Begin* the overlay fades and the camera leaves the orbit in **one continuous move with no cuts**, looking north as everywhere in the cove. Each line appears in pale ink on a feathered night-ink pool in the lower third (Alegreya italic, 19 / 18 px desktop / phone), holds 2.6 s and fades over 0.4 s.

| t | camera (render keyframe; focus · elev · dist · fov) | on screen | line |
|---|---|---|---|
| 0.0–3.0 s | the sea-gate arch (6, 0, −18) · 14° · 34 m · 46°, `aimY` 5 so the crown (9.5 m) and the four Waystones are in frame | black water beyond the arch; far down the channel **a single warm point pulses once and is gone** (the ember, §2.3); the Mossmere Waystone glows rust and moon-silver, the other three are dark | **"The great lantern fell, and the kingdom followed it into the lake."** |
| 3.0–6.2 s | drifts west and down along the quay to (−4, 0.6, −4) · 18° · 18 m · 46° | Murk's barge and its warm-white lamp, the bare harbour wall, the Map Table, the raft at the jetty | **"Its last candles came ashore here. They fish to stay lit."** |
| 6.2–9.0 s | settles on the hearth (−18, 0.6, −4.5) · 16° · 6.5 m · 42° | the hearth fire; around it **a ring of cold candles**, Wick-shaped ink silhouettes with no flame | **"You are one of them."** |

- **Skip:** a tap anywhere hurries the current line (it fades now and the next begins). A **Skip** word sits top-right (Marcellus SC, ≥ 44 px target); one tap jumps straight to the wake. Esc and Enter do the same.
- **Reduced motion:** three still frames at the keyframes, cross-faded, the same lines and timings.
- **Sound:** the cove bed (hearth crackle, lapping water, one far bell) rises under the first line; the ember pulse has a low, warm swell; nothing else.

### 2.2 The wake at the hearth (3 s, then Murk)

| t | what happens | sound |
|---|---|---|
| 0.0 | One of the cold candles, nearest the camera, shows a spark at its wick. | a tiny tick |
| 0.5 | The flame catches, gutters, catches again. The silhouette fills in: **the Wick**, in its own colours. | a soft breath of flame |
| 1.3 | It stands, lifts its lantern to the hearth and lights it. The lantern burns **low**: about 70% of its normal light radius, with a flicker. | the lantern's glass clinks; a small whoomp |
| 2.2 | It turns toward the water. | — |
| 2.6 | **Murk**, from his barge (a speech line beside his lantern, §3.3): **"Awake, little Wick? You're guttering. Fish make oil, oil makes light. Water's that way."** | Murk's grumble |
| 3.0 | *Slice (Landing v0):* a 0.8 s ink wipe, and the Wick is on the raft at the jetty mooring (6, 2), lantern still low. *P3 (on foot):* the jetty end glows; the Wick walks (tap the glow to walk there). | the wipe is silent |

**The cold candles** (a small lore refinement of §25.4.4, proposed): at the start every *locked* Wick stands by the hearth as a cold, unlit silhouette. Unlocking one later is shown the same way the player woke: its flame catches, and from then on it dozes there lit. §25.4.4's growth row "Wicks unlocked: they doze around the hearth" becomes "a cold candle by the hearth catches, and dozes". Four cold candles at the start (Taper, Stub, Tallow, Ashwick), five with §24's Wayfarer.

### 2.3 The bookend

The warm point in the channel is **the great lantern's last ember**, which the Lantern-Swallower carries in its belly (§1, renamed in §25.0.4). It shows once, for 1.2 s, far beyond the arch, and is never explained. The end of the campaign already pays it off: when the Lantern-Swallower is landed, "a warm shaft opens through the cove ceiling ... every lamp burns gold, and the title card changes" (§25.4.4). From then on the Lantern Line shows no ember in the channel; the warm light is home.

---

## 3. Who teaches

### 3.1 The choice

| teacher | for | against | verdict |
|---|---|---|---|
| **Old Murk, from his barge** | an established voice (wry, a little morbid, kind underneath; `MERCHANT_LINES`); he already sells the gear that sets the odds, tells rumours and keeps the Ledger, so "the odds are in your log, gear improves them" is his to say; he is moored in view of every jetty cast | he is 8.5 m from the jetty head: his lines must be anchored to his lantern on screen, not put in a panel | **teaches the why** |
| an old Wick by the hearth | tender, lore-true | a new named character and voice for one minute; the hearth is ≈ 23 m from the jetty head, so it cannot comment on a cast; at the start the hearth Wicks are cold (§2.2) | no |
| the Wick's own thoughts | intimate, needs no placement | the Wick has never spoken in any text so far; an inner voice would change the voice of the whole game | no |
| **impersonal tips** (the quill toasts of §21.5) | short, already the game's way of naming controls; easy to localise and to suppress for returning players | no character | **teach the how** |

### 3.2 The rule

**Murk talks in the pauses; tips talk during actions.** A tip names one control while the player needs it (cast, wait, tap, sail). Murk speaks only when no input is expected (after the wake, after the card, before the glide), so nobody has to read and act at once. Murk never names a key or a gesture; a tip never explains the fiction. At most one tip and one Murk line exist at any moment, never in the same screen region, and never during the strike window.

### 3.3 How Murk speaks

- A single line in pale stone ink (Alegreya italic, 19 / 17 px) with a small "MURK" kicker in Marcellus SC, anchored just under his lantern on screen and clamped inside the safe area (on a 390 px phone it sits in the top third, clear of the float). No box, no portrait, no name plate (§21.6).
- Each line holds 2.4 s plus 0.05 s per character (≈ 4–6 s), fades on a tap, and never waits for one.
- His voice is a short pitched grumble per line (audio), never speech.

**Voice examples** (each line is in §4.7): "Awake, little Wick? You're guttering." · "Too keen. It felt you. Again." · "Happens to all of us. Again." · "Lives in my front yard. I don't buy those." · "First oil's on me. The rest you fish for."

---

## 4. The tutorial

### 4.1 Timeline for a typical player (the slice; P3 alongside)

| clock | step | the player does / sees | P3 (on foot) |
|---|---|---|---|
| 0:00 | title | *Begin* | same |
| 0:00–0:09 | `framing` | the Lantern Line (§2.1); skippable | same |
| 0:09–0:15 | `wake` | the flame catches; Murk's first line; the ink wipe to the raft | walk ≈ 23 m to the jetty (≈ 5 s, or tap its glow), tip `fe_walk` |
| 0:15–0:18 | `cast` | tip "Hold on the water. Let go to cast."; casts from the raft into the cove | casts from the jetty |
| 0:19 | `wait` | a nibble; tip "Not yet. Wait for it to go under." | same |
| 0:21 | `strike` | the Small tell (double pop), the "!", the strike ring; tip "Now. Tap."; the tap; the strike word (Clean / Struck / Early / Late) | same |
| 0:21–0:24 | `play` | the automatic reel-in (2–3 s); tip "The line does the rest. You'll know what it is when it's in."; the skitter stamps "by the look of it: **Small**" | same |
| 0:24–0:29 | `measure` | the reveal (ink lifts to colour: a Quayling), the palm pose, the cord ticks to ≈ 13 cm, the seal-less card: *Release* | same |
| 0:29–0:35 | `odds` | Murk: "Lives in my front yard. I don't buy those." then the odds line; the log glyph glows (optional visit: +5 s) | same |
| 0:35–0:43 | `gate` | Murk: "The real water's through the gate. Chart's on the table."; the Map Table's post lantern brightens; tip "Sail with WASD or the left stick."; sails ≈ 15 m | walks ≈ 12 m from the jetty to the Map Table (≈ 3 s) |
| 0:43–0:47 | `plan` | pill *Plan* → the **First Outing** card → *Set Out* | *Set Out now* auto-walks to the raft and boards (≈ 4 s) |
| 0:47–0:51 | `setout` | the departure glide under the arch past the lit Waystone (3 s); Murk: "First oil's on me. The rest you fish for."; the lantern flares to full; zone flash | same |
| ≈ 0:51 | — | the Mossmere: day 1, the First Outing (all still); Murk follows and moors at 0:20 | ≈ 0:58 |

**Budget:** about 51 s for the reference player; about 42 s with the framing skipped; about 60 s with a log visit; about 80 s for a slow reader who loses the first fish once. The validator holds the sum of the step targets for the reference player at ≤ 75 s and the slow-reader bound under 90 s (§5.4).

### 4.2 Step list

Triggers are bus events (CONTRACT §13.5 and EXPERIENCE §9 seams). "Skip" is the Skip word (§4.5), which jumps from any step to `plan` in one confirmed tap.

| id | trigger | on screen (tip / Murk) | completes when | if it goes wrong |
|---|---|---|---|---|
| `framing` | *Begin* on a save without `meta.firstEvening.done` | the three lines (§2.1) | the last line fades, or Skip / tap-through | — |
| `wake` | `framing` done | Murk: `murkWake` (§2.2) | the line has held its time and the wipe ends (slice) or the Wick reaches the jetty (P3) | P3: no movement for 8 s → the jetty glow pulses (no new text) |
| `cast` | `wake` done | tip `fe_cast` | `fishing:cast` lands in the cove | idle 10 s → a faint target ring pulses on open water in reach (no new text) |
| `wait` | `fishing:cast` | the float settles; on the first nibble the tip becomes `fe_wait` | `fishing:bite` | a tap during the nibble **spooks** it (as today, `fishing:miss {reason: 'early'}`): Murk `murkSpooked`; back to `cast`, and the next tutorial bite has no nibble |
| `strike` | `fishing:bite` | the "!" and the strike ring (forced on, §4.6); tip `fe_strike` | `fishing:strike {grade}` → `play`; or `fishing:miss {reason: 'passed'}` | no tap → the fish lets go (bait refunded, as let-it-pass): Murk `murkPassed`; back to `cast` with the short retry wait |
| `play` | `fishing:strike` | tip `fe_play`; the class estimate stamp at the skitter (§4.6) | `fishing:caught` → `measure`; `fish:got-away` → loss handling (§4.3) | — |
| `measure` | `fishing:caught` | the reveal, the ceremony (≈ 1.2 s, tap to skip), the card with *Release* only and its "Strike: …" line (EXPERIENCE §5.1) | the card closes | — |
| `odds` | the card closes | Murk `murkFrontYard`, then `murkOdds`; the log glyph glows | the log is opened and closed, or 5 s pass without a tap (the glyph keeps a soft glow until the first expedition starts) | — |
| `gate` | `odds` done | Murk `murkGate`; the Map Table post brightens; tip `fe_sail` (slice) / the Map Table glows (P3) | the raft is within the post's 5 m interact range (slice) or the Wick reaches the table (P3): pill *Plan* | sailing toward the sea-gate meets the sill's soft wall (§5.3, FE-S1) |
| `plan` | the *Plan* pill | the First Outing card (§4.7) | *Set Out* | closing the card returns to `gate` (the post stays lit) |
| `setout` | *Set Out* | Murk `murkFirstOil` over the glide | the raft crosses `COVE.archLineZ` (−18): `meta.firstEvening.done = true`, then `game.startNewRun(...)` (slice) or `game.setOut(plan)` (P3) | the glide is not skippable in the First Evening (3 s); later departure glides are (§5.3, FE-O1) |

### 4.3 The first catch: guaranteed, never certain

- **The fish.** The cove's only species is the **Quayling** (`COVE.fishing`, maxClass Keeper, never sold, Memories for its first catch only). Its size is rolled honestly at μ 0; most tutorial fish are Small (≈ 13 cm, the palm pose).
- **The odds** *(odds model, T0, `CATCH_V3`)*: Small **90%** with a Clean or on-time strike, **86%** Early or Late; Keeper 87–88% on time, 83% Early or Late. A miss of all three tries is ≈ 0.1%.
- **What is forced and what is not.** The tutorial shortens the waits (the first nibble at 1.2–1.8 s, the bite at 2.5–3.5 s; a retry bite at 1.5–2.5 s with no nibble) and turns the strike ring on. It never passes an outcome, a class or a land chance to fishing. The roll is the normal one, at the strike, from the seeded rng (EXPERIENCE §4.1).
- **Losses** (the got-away toast is the normal one for a Small or Keeper, EXPERIENCE §5.3: "A Quayling spat the hook."):

| loss | Murk | then |
|---|---|---|
| 1st | "Happens to all of us. Again." | back to `cast` with the retry wait |
| 2nd | "Twice. The water keeps score. Once more." | back to `cast` with the retry wait |
| 3rd | "Some nights. Come on, the chart won't read itself." | straight to `gate`. The measuring and odds lessons are **deferred**: the first lake landing plays `measure` with the catch-choice tip, and Murk's first in-lake visit says the odds line. |

A loss in the first minute is not a bug to hide: it teaches promise 1 of EXPERIENCE ("never certain") with no lecture, and the next bite comes within 2.5 s.

### 4.4 What the First Evening deliberately does not teach

Each of these is taught later by one just-in-time line at the moment it first matters. During the First Evening every other tip is suppressed and stays unseen, so it still shows later.

| not taught here | taught when | line (existing id, or new) |
|---|---|---|
| the catch choices (Eat / Render / Keep) | the first lake landing | `catch_choice` (kept) |
| the float's favour notches | the first cast in a lake | `v3_favour` (kept; suppressed in the cove) |
| signs and reading water | the first sign in reach | the sign tips (P1, kept) |
| bait and the tray | the first time Murk moors in the lake | Murk's arrival line + the shop |
| the oil gauge and rendering | the first `resource:low:oil` | `low_oil` (kept) |
| let it pass, on purpose | the first lapsed bite in a lake, or the first Prize tell | new `af_letpass`: "Let a bite go by and the bait comes back. Big ones are worth waiting for." |
| night, Still mode | the first dusk | `v3` Last Light line (kept) |
| a fumbled tutorial strike | the first lake bite, once | `af_strikeReminder`: "Tap when it goes under." |
| walking (P3) | — | taught in the `wake` step in P3 |
| sailing (P3) | the lake's run start | `sail_basics` (kept; already seen in slice builds) |

Tips the First Evening teaches are marked seen when their step completes: `cast_basics`, `nibble_wait`, `miss_early`, `miss_late` and, in slice builds, `sail_basics`. v1's reel tips (`reel_band`, `surge_release`, `escaped_*`) never show in v3.

### 4.5 Skips, resumes, returning players, replay

| case | behaviour |
|---|---|
| **Skip** | the Skip word is visible top-right in every step. The first tap turns it into "Skip the first evening?" for 2.5 s; a second tap jumps to `plan` (the First Outing card) and sets `meta.firstEvening.skipped = true`. Nothing is granted for a skipped step (no Quayling page, no Memories). |
| **Hurry** | a tap hurries any line or the wake; the ceremony is tap-to-skip as always (§25.6.8). |
| **Quit mid-way** (tab closed) | `meta.firstEvening.step` is saved at each checkpoint (main saves on `fish:measured` and on each step change in the hub). On the next *Begin*: before the catch, resume at `cast` (Murk's wake line once more, no framing); after the catch, resume at `gate`; after *Set Out*, the run exists and `done` is true. The framing never replays on a resume. |
| **Returning players** (a v1 or v2 save, a P1-era v3 save, or any save with `meta.runs > 0` or a journal entry) | `meta.firstEvening = {done: true, legacy: true}` on migration (Pg0 now, and Pg3's legacy rule in P3). No prologue. At their first v3 bite, one line: `af_changed` "Tap when it goes under. The line does the rest now; your odds are in the log." |
| **Replay** | Settings → **Replay the first evening** runs `framing` → `gate` from the title in a sandbox: no saved run is touched, nothing is granted (no Memories, challenges or journal changes), and at the Map Table Murk says `murkReplay` and the game returns to the title (slice) or stays at the Landing (P3). |
| **A second boot** | a save with `done` never shows the First Evening. *Begin* / *New Descent* go to the normal flow (§5.3). |

### 4.6 Phone, desktop and accessibility

| item | phone (390 px portrait) | desktop |
|---|---|---|
| strike input | a tap anywhere in the world view (EXPERIENCE §8); the Skip word and pills take pointer priority | left click anywhere, Space or Enter |
| strike ring | on for the First Evening and the first expedition, whatever the setting (EXPERIENCE §3.3) | same |
| class estimate | the tutorial play and the first lake play show "by the look of it: Small / Keeper" (a teaching exception; afterwards only Prize+ show it, EXPERIENCE §4.5) | same |
| tip line | bottom-centre above the oil arc, 17 px, one line | 19 px |
| Murk line | top third, under his lantern, 17 px; clamped 16 px from the edges | under his lantern, 19 px |
| lore lines | lower third, 18 px, max 358 px wide (two lines allowed for line 1 only) | 19 px, one line |
| Skip | top-right, ≥ 44 px, 13.5 px label | 14.5 px |
| tap targets | ≥ 44 px (pills ≥ 56 px, §25.4.2) | — |

- **Sound off:** every cue is visual (the tells, the "!", the strike word, the reveal, the loss toast, Murk's lines).
- **Reduced motion:** the Lantern Line as three stills; no camera sway; the ink wipe becomes a cross-fade; the lantern flare at Set Out is a fade.
- **Readers:** lines never auto-advance faster than 2.4 s + 0.05 s per character; nothing requires reading to proceed, because every step completes on an action or on a time-out.
- **Screen readers:** each lore line, Murk line and tip is announced once through an `aria-live="polite"` region; the strike window is announced as "Bite" (no species, EXPERIENCE §6 row 22).

### 4.7 Every string of the First Evening

All new strings go in `TEXT_V3.firstEvening` and `TIPS_V3` (`phase` as the slice's, §5.4). Each is ≤ 90 characters, present tense for instructions, with no exclamation marks and no percentages in anything spoken.

| key | text |
|---|---|
| `firstEvening.lore[0]` | The great lantern fell, and the kingdom followed it into the lake. |
| `firstEvening.lore[1]` | Its last candles came ashore here. They fish to stay lit. |
| `firstEvening.lore[2]` | You are one of them. |
| `firstEvening.murkWake` | Awake, little Wick? You're guttering. Fish make oil, oil makes light. Water's that way. |
| `firstEvening.murkSpooked` | Too keen. It felt you. Again. |
| `firstEvening.murkPassed` | It let go. Bait's still on. Again. |
| `firstEvening.murkLost[0..2]` | Happens to all of us. Again. · Twice. The water keeps score. Once more. · Some nights. Come on, the chart won't read itself. |
| `firstEvening.murkFrontYard` | Lives in my front yard. I don't buy those. |
| `firstEvening.murkOdds` | What holds and what doesn't is in your log. Better tackle, better odds. Never certain. |
| `firstEvening.murkGate` | The real water's through the gate. Chart's on the table. |
| `firstEvening.murkFirstOil` | First oil's on me. The rest you fish for. |
| `firstEvening.murkReplay` | Same as it ever was. The gate's where you left it. |
| `firstEvening.outingLines` | Every night of your first outing is still. · The dark is patient with new flames. |
| `firstEvening.skip` / `skipConfirm` | Skip · Skip the first evening? |
| `firstEvening.replay` (Settings) | Replay the first evening |
| `firstEvening.estimate` | by the look of it: {class} |
| tip `fe_walk` (P3) | Walk with WASD or the left stick. Tap a glow to walk there. |
| tip `fe_cast` | Hold on the water. Let go to cast. |
| tip `fe_wait` | Not yet. Wait for it to go under. |
| tip `fe_strike` | Now. Tap. (desktop: Now. Click.) |
| tip `fe_play` | The line does the rest. You'll know what it is when it's in. |
| tip `fe_sail` | Sail with WASD or the left stick. (touch: Sail with the left stick.) |
| tip `af_strikeReminder` | Tap when it goes under. |
| tip `af_letpass` | Let a bite go by and the bait comes back. Big ones are worth waiting for. |
| tip `af_changed` | Tap when it goes under. The line does the rest now; your odds are in the log. |
| log glyph label (aria / hover) | Odds are in the log |

`TEXT_V3.murkFrontYard` (today: "Lives in my front yard. I don't buy those. The real water's through the gate.") is split into `murkFrontYard` and `murkGate`, so the odds line can sit between them. Murk's in-lake arrival line on day 1 is the existing "Murk's here. Murk's always here, eventually.", a callback to his promise at the glide.

---

## 5. Build cost and phasing

### 5.1 What exists on this branch

| piece | state on `gw-autofish` (from `gw-p1v-base`) |
|---|---|
| `COVE` (arena, walk shapes, stations, glide paths, test buoy, v0 posts, palette, grade, budget) | **in data.js** (P3 data, D2 done) |
| the Quayling | in data.js with `phase: 3` (absent from P1–P2 builds) |
| `BALANCE.cameras` `title.orbit`, `cove`, `gate`, `setout` | in data.js; render does not read the cove ones yet |
| `walkGridFor` | in data.js |
| world: the cove theme, the extrusion builder (`world-cove.js`), `shoreNotch`, the sea-gate arch, the Waystones | **none**. `world-layout.themeOf` clamps index −1 to the Mossmere (`world-layout.js:25`), so `setZone('cove')` today would build Mossmere islands |
| §24's foot controller and walk camera | **none**: `player.js` is the raft controller only; no walking code exists anywhere in `src/` |
| flow `hub` | named in CONTRACT §13.1; main saves on `fish:measured` in `hub` but never enters it, and runs the loop only in `playing` (`main.js:467`) |
| render | modes title / sail / fish / reel / night / shop / death; the title orbits the current focus; no cove, prologue or setout mode |
| `player.glide` | none |
| `merchant.arrive(dock, y, {instant: true})` | exists (`actors-merchant.js:195`); `freeze()` does not |
| `progression.measure` without a run (a cove catch: journal and records only) | exists |
| `fishing.view.cove` | a field only |
| `TIPS_V3` `v3_walk`, `v3_cast_cove`; `TEXT_V3.murkFrontYard`, `snuffedWake`, `premise` | in data (the tips are phase 3) |
| `meta.tutorialDone` | in `core.defaultMeta()`, never read |
| a fresh save today | the title prints the whole premise paragraph; run 1 spawns in the Mossmere's south cove: the cold start this replaces |

So nothing of the Landing's world, walking or hub flow is built. The data is.

### 5.2 Options, smallest first

| option | what the player gets | effort (one implementer) | verdict |
|---|---|---|---|
| **F0: in-lake fallback** | the first run opens at Murk's day-1 dock in the Mossmere's drowned harbour, Murk already moored; the three lore lines over a slow move across the harbour; the same tips and Murk lines (the gate line becomes "The real water's further out."); no hearth, no Set Out | ≈ 1 week | **only if FE slips.** It is still "in the game somewhere", which the user ruled out. |
| **FE: the First Evening slice (recommended)** | the Landing as a raft-mode cove with everything the first minute looks at: hearth and cold candles, the jetty, Murk's barge, the bare harbour wall, the sea-gate arch with four Waystones (one lit), the Map Table post; the whole tutorial; the departure glide | ≈ 6–7 person-weeks; ≈ 2 weeks wall time across modules | **ship right after automatic fishing.** This is the smallest version that is lore-true: every element the lines and the camera name is on screen. |
| P3: the full Landing | walking, every station, the walls' frames and mounts, the pond, growth, Homecoming | §25.14.4 (≈ 4–5 weeks + S0 / R0) | builds on FE without rework (§5.6) |

**What FE leaves out of P3's Landing** (none of it is seen or named in the first minute): the foot controller (Landing v0's rule: the Wick stays on the raft), `shoreNotch` (a dark channel-mouth card on the cliff behind the arch stands in for it; the glide ends at z −24 inside the 42 m arena, under the zone flash), the frame atlas and mount batch (the wall is bare, which is the lore), the keep-pond and its pond pass, the hung legends, every station but the Map Table, the test buoy, Murk's freeze, Homecoming and growth states.

### 5.3 FE work list

Effort: S ≤ 2 days, M 3–6 days. "AF" is the automatic-fishing build that FE follows. Everything not marked AF can start now, in parallel with AF.

| id | module | item | effort | depends on | reuse | acceptance test |
|---|---|---|---|---|---|---|
| FE-D1 | data.js | `FIRST_EVENING` (§5.4); the Quayling from phase 1 in v3 builds (cove-only: excluded from every lake pool); `TEXT_V3.firstEvening`, the new `TIPS_V3` entries; the `murkFrontYard` split; all inside `V3_ENABLED` | S | — | `COVE`, `TIPS_V3` | validate-data passes 1–2 unchanged (flag-off fingerprint); the Quayling is in `SPECIES` for P1+ v3 builds and in no lake's pool |
| FE-T1 | tools | validate-data FE rules: step targets ≤ 75 s for the reference player and < 90 s for the slow reader; every string ≤ 90 characters with no "%" in spoken lines; the departure glide (from any water point within 5 m of the Map Table post, via `joinAt`, then `COVE.setOutPath` from (11, 1)) clears the jetty, Murk's barge, the Waystones and the arch legs by the raft radius + 0.3 m; the post is within 5 m of raft water | S | FE-D1 | §25.4's cove checks | a seeded bad case (a 95-character line, a join point that clips the jetty) fails |
| FE-W1 | world | `setZone('cove')` resolves `COVE` with no `ZONES[0]` fallback; `themeOf` returns `'cove'` for theme `cove` (no islands, landmarks, lamp-posts, lily pads or dock buoys); the arena (R 42 cliff ring, parallax rings 3 / 2, stalactites, 2 shafts, mist) from world-art's builders; **`world-cove.js`**: the extrusion builder for every `COVE.walk` shape (boxes, ribbons, ramp wedges; the stair in its silted state only) plus the two walls as bare slabs with buttresses and the chimney breast | M | — | world-art builders; models-kit | a cove screenshot shows no Mossmere set-piece; the quay, jetty, galleries and walls sit at their §25.4.1 positions; build ≤ 150 ms desktop / ≤ 600 ms phone |
| FE-W2 | world | the sea-gate arch (`taperTube` + the ink material, legs (−3, −18) and (15, −18), crown 9.5); the four Waystones on the sill with the glide gap and a per-stone emissive (only the Mossmere's lit); the channel-mouth card; the ember sprite (one pulse on cue, hidden after the Lantern-Swallower is landed) | M | FE-W1 | `taperTube`, the gate stones' recipe | the arch and the lit stone are on screen from the quay at 960×540 and in portrait; ≤ 4 calls |
| FE-W3 | world | the hearth (the raft brazier at 2×, a flame sprite, the existing embers; world accent light 1), two bollard lanterns, the Map Table and lectern boxes, the Map Table's v0 post (the other posts hidden), the cold candles' placement | S | FE-W1 | brazier, dock lantern posts, models-kit | ≤ 8 calls for all of it; one PointLight (the hearth) |
| FE-Wa1 | water | `applyZonePalette(COVE.palette)` on `zone:change {hub: true}` (Wa6) | S | — | — | the cove's water uses fog #1d2230 and water #1a1f2c; no Mossmere colour leaks |
| FE-R1 | render | `COVE.grade` on the hub zone; the title orbit on the cove (`BALANCE.cameras.title.orbit`); the **`prologue`** mode (keyframes from `FIRST_EVENING.shot`, eased, reduced-motion stills); `setout` for the glide; the raft's sail / fish modes in the cove | S | FE-W1 | `MODES`, the spring | the three keyframes match §2.1 (± 0.5 m, ± 2°); the arch crown is in frame at keyframe 1 in portrait; casting in the cove uses the fish framing |
| FE-A1 | actors | Murk at home: `merchant.arrive(COVE dock, yaw, {instant: true})` after the hub zone change (the leave-on-zone-change branch skips when `hub`); the raft at the mooring; the Wick's lantern intensity driven by `firstEvening.lantern` (0.7 → 1.0 over 0.8 s at Set Out) | S | FE-W1 | merchant, raft | Murk is moored at (4, −6.5) in every cove shot; the lantern radius reads 70% until Set Out |
| FE-A2 | actors / models | the hearth Wicks (A7 pulled forward): the locked Wicks as one merged cold silhouette mesh; the wake beat (a spark, the flame catching, the Wick standing and lighting its lantern) on one silhouette and then hidden | S | FE-W3 | `setCharacter` looks, the flame sprite | 2 calls for the candles; the wake plays in 2.6 s and is skippable |
| FE-S1 | player | cove raft mode (Landing v0: `getMode()` `'raft'`, no drains); the v0 post as an interact target (`interact:change {id: 'map_table', label: 'Plan'}`); **a soft wall along the Waystone sill (z −15) except during a glide**; `player.glide(path, {duration, onCross})` (the S4 glide, pulled forward) with input locked | S | FE-W1 | the raft controller | the raft cannot pass the sill without a glide; the glide from the post reaches the arch line in 3 s ± 0.2 and fires `onCross` once |
| FE-F1 | fishing | **(AF)** cove mode: pool `COVE.fishing.species`, sales refused, the card offers *Release* only (F12's Quayling half); `fishing.setTutorial({nibbleAt, biteAt, retry, strikeRing: true, estimate: true})`, which changes waits and presentation only | S | AF | AF's strike, play, reveal and got-away note | 2,000 seeded tutorial strikes land 90% ± 2 (on time, Small, T0); the tutorial API accepts no outcome, class or chance field |
| FE-Pg1 | progression | `meta.firstEvening {done, step, skipped, legacy}` added lazily in v3 (core's `defaultMeta` untouched); the legacy rule in Pg0 now and in Pg3 later; the Quayling's first-catch Memories (+3) through the run-less `measure`; **First Light counts the cove catch** (recommended) | S | FE-D1 | `measure`, `migrateSave` | a fresh v3 save has `done: false`; a v1 save loads with `done: true, legacy: true`; landing a Quayling banks +3 Memories once |
| FE-M1 | main | boot builds the cove under the title (`zone:change {zone: 'cove', hub: true, from: 'boot'}`); a minimal flow `hub` (§13.1: the loop runs in `hub`, survival and combat return early, no 30 s autosave, saves on step changes); *Begin* on a fresh save starts the First Evening; the glide's arch crossing calls `startNewRun({character: 'wick', nightMode: 'still'})` (the First Outing by `meta.runs === 0`) | S | FE-W1, FE-S1 | today's `startNewRun` | a fresh boot reaches the Mossmere only through the glide; survival's clock does not move in the hub |
| FE-N1 | new `src/first-evening.js` | **the director** (`ctx.firstEvening`): the step machine of §4.2 on bus events, timings from `FIRST_EVENING`, the loss and resume rules, tip suppression (`allowsTip(id)`), `start({replay})`, `skip()`, `isActive()`; emits `firstEvening:step {id}` and `firstEvening:done {skipped, replay}`; pure enough to unit-test on a fake bus | M | FE-D1 (fishing steps: AF) | — | a headless run with a scripted bus visits every step in order; three forced losses jump to `gate` with the deferred lessons set |
| FE-U1 | ui | the fresh-save title (*Begin* and Settings, no premise paragraph); the lore-line layer and Skip; Murk's anchored line; one-tip-at-a-time tips with suppression; the log glyph's glow and `openLog({speciesId, section: 'odds'})` **(AF)**; the First Outing card from the post (U17's card with §4.7's lines); Settings → Replay | M | FE-N1, AF's log | `K.openModal`, the tip toast, U17 | the DOM scan finds ≤ 1 tip and ≤ 1 Murk line at any time and no "%" outside the log; phone shots pass §4.6 |
| FE-Au1 | audio | the cove bed (hearth, water, far bell; Au2's subset), the ember swell, the flame catch, Murk's grumble per line, the `setout` sting instead of `descend` | S | — | audio-sfx, audio-music | each sound fires on its cue; entering the Mossmere from the glide plays `setout`, never `descend` |
| FE-T2 | tools | browser scenario `first-evening` (desktop and 390 px portrait; reference, skip, three-loss, resume, returning and replay paths); `tools/perf.mjs --scenario first-evening`; the hue report on cove shots including Murk | M | all | scenario-run, perf, hue report | §5.7 |

**Optional, cheap once FE exists:**

| id | item | effort | why |
|---|---|---|---|
| FE-O1 | **departure glide** for every later P1–P2 run: *New Descent* → the raft at the jetty → the 3 s glide under the arch (tap to skip) → the run | S | every outing starts at the Landing, as in P3, so the fiction never lapses |
| FE-O2 | **the snuff wake**: in P1–P2, a snuff cuts to the hearth for 3 s ("Murk found your raft drifting.", `TEXT_V3.snuffedWake`) before the Snuffed summary | S | the Landing is home from the first evening on |
| FE-O3 | **arrival coast** in the lake: the raft spawns 6 m south of `arena.spawn` moving north at 3 m/s, input open at once | S | arriving by water reads as coming from the sea-gate |

### 5.4 Data sketch (`FIRST_EVENING`, v3, always exported, read only inside `V3_ENABLED`)

```js
export const FIRST_EVENING = {
  phase: 1,                                      // lands with the slice; the Quayling moves to phase 1 in v3 builds
  budget: { reference: 51, targetMax: 75, slowReaderMax: 90 },   // s (validated)
  shot: [                                        // render 'prologue' keyframes (render convention; yaw 0 = north)
    { t: 0.0, focus: [6, 0, -18],      elev: 14, dist: 34,  aimY: 5,   fov: 46 },
    { t: 3.0, focus: [-4, 0.6, -4],    elev: 18, dist: 18,  aimY: 2,   fov: 46 },
    { t: 6.2, focus: [-18, 0.6, -4.5], elev: 16, dist: 6.5, aimY: 1,   fov: 42 },
  ],
  lines: { hold: 2.6, fade: 0.4, murkHold: 2.4, murkPerChar: 0.05 },
  ember: { x: 6.75, z: -40, y: -1.5, at: 0.8, pulse: 1.2, hideWhen: 'swallowerHome' },
  wake: { candle: { x: -18.6, z: -2.4 }, seconds: 2.6, lanternStart: 0.7, wipe: 0.8, raftAt: 'cove_jetty' },
  bite: { nibbleAt: [1.2, 1.8], biteAt: [2.5, 3.5], retryBiteAt: [1.5, 2.5], retryNibbles: 0, maxLosses: 3 },
  strikeRing: 'firstExpedition', estimate: { plays: 2, classes: ['small', 'keeper'] },
  odds: { glow: 5, opens: { section: 'odds' } },
  gate: { post: 'map_table', joinAt: [8, 7] },   // the glide: raft position → joinAt → COVE.setOutPath from (11, 1)
  setOut: { glide: 3, lanternTo: 1.0, lanternOver: 0.8, character: 'wick', nightMode: 'still' },
  resume: { beforeCatch: 'cast', afterCatch: 'gate' },
  marksSeen: ['cast_basics', 'nibble_wait', 'miss_early', 'miss_late', 'sail_basics'],
  steps: ['framing', 'wake', 'cast', 'wait', 'strike', 'play', 'measure', 'odds', 'gate', 'plan', 'setout'],
};
```

### 5.5 Order and schedule

1. **Now, in parallel with AF:** FE-D1, FE-T1, FE-W1–W3, FE-Wa1, FE-R1, FE-A1–A2, FE-S1, FE-M1, FE-Au1 and FE-N1's non-fishing steps. None of them needs automatic fishing.
2. **Right after AF lands:** FE-F1, the fishing steps of FE-N1, FE-U1's log hook, FE-T2. Then FE ships, so the first build with automatic fishing that players see also opens at the Landing.
3. **P2** goes on as planned inside today's run structure; with FE-O1 every run sets out from the Landing.
4. **P3** turns the slice into the full Landing (§5.6).

### 5.6 The path to the full P3 Landing

Everything FE builds is P3's own part in P3's form, so P3 extends it instead of replacing it.

| FE builds | P3 adds (§25.14.4) |
|---|---|
| `world-cove.js` extrusion of every walk shape, bare walls | the frame atlas and mount batch on the walls (W2, A4), the stair's two states and walk-grid re-bake, the pond rim and pond pass (Wa5), growth states (W3), `shoreNotch` in place of the channel-mouth card |
| the arch, the Waystones, the ember | hung legends under the arch; lit stones from `meta.waystones` |
| the hearth and cold candles | the respawn point and the *Rest* pill; candles lit per unlocked Wick |
| Landing v0 on the raft, the Map Table post | S0 / R0 put the Wick on foot: `getMode()` returns `'foot'`, the posts hide (CONTRACT §13.0), every station becomes a walked station |
| `player.glide` for Set Out | Homecoming's glide-in (`homeInPath`), `planSetOut` / `setOut` in two steps (§13.4) |
| flow `hub` (minimal) | the hub HUD, station pills, tap-to-walk, the full hub saves (§13.6) |
| the First Outing card from the post | U6's Set Out screen in its First Outing state |
| `first-evening.js` | unchanged machine. The `wake` and `gate` steps branch on `world.getMode()`: `'raft'` keeps the slice script, `'foot'` uses the walk script (§4.1's P3 column); `setout` calls `game.setOut(plan)` instead of `startNewRun` |
| FE-O1's departure glide | becomes every expedition's Set Out |

### 5.7 Acceptance tests (FE)

1. **Never a cold start:** on a fresh v3 save, the first lake `zone:change` is preceded by `firstEvening:step` for every step from `framing` (or the Skip path to `plan`) to `setout`, and the raft enters the lake only through the glide. No `run:start` happens on a fresh save before `firstEvening:done`.
2. **Short:** the scripted reference player (strikes on time, sails straight to the post) reaches the First Outing card in ≤ 50 s and the Mossmere in ≤ 60 s; with the framing skipped, ≤ 50 s to the Mossmere; the slow-reader script (lines held to their maximum, one loss) arrives in < 90 s.
3. **One line at a time:** sampling the DOM every 100 ms finds ≤ 1 tip and ≤ 1 Murk line, never a Murk line during the strike window, and never both in one screen third on a 390 px phone.
4. **Honest odds:** 2,000 seeded tutorial strikes land at the log's figure ± 2 points (90% on time, Small, T0) with losses present; `fishing.setTutorial` rejects any outcome, class or chance field.
5. **Losses:** forced losses show "A Quayling spat the hook." and Murk's line, the next bite comes within 1.5–2.5 s with no nibble, and the third loss jumps to `gate` with the measuring and odds lessons deferred to the first lake landing and Murk's first in-lake visit.
6. **Grades:** taps at each timing show Early / Clean / Struck / Late; no tap gives `passed` with the bait refunded and `murkPassed`; a nibble tap spooks with `murkSpooked`, and the next tutorial bite has no nibble.
7. **Hidden species:** during the cove play no element shows a species name, colour or odds (EXPERIENCE §10.5's scan), the estimate says "Small" or "Keeper", and the species first appears at the reveal.
8. **The odds lesson:** after the card, the log glyph glows; opening it lands on the Quayling's odds by class; across every First Evening screen, a "%" appears only inside the log.
9. **Skip and resume:** two taps on Skip reach the First Outing card within 1 s at every step, granting nothing; reloading before the catch resumes at `cast` and after it at `gate`, never replaying the framing.
10. **Returning and replay:** a v1 save, a v2 save and a P1-era v3 save boot with no First Evening and show `af_changed` once at their first bite; Replay runs to the Map Table and returns to the title without touching the saved run, Memories, challenges or the journal.
11. **Geometry:** the raft cannot cross the Waystone sill outside a glide; the glide from any point within 5 m of the post clears every block by the raft radius + 0.3 m and crosses z −18 between the arch legs.
12. **Perf:** `tools/perf.mjs --scenario first-evening` at the hearth shot, the cove cast and the glide: ≤ 110 draw calls on high and ≤ 85 on low (inside §25.4.7's 140 / 100), ≤ 4 PointLights, the cove built in ≤ 150 ms desktop / ≤ 600 ms phone.
13. **Look:** the hue report on cove shots that include Murk's barge shows ≤ 2% green-teal chroma; 390 px portrait shots of the Lantern Line, the wake, the strike, the card, the log, the Map Table and the glide meet §4.6 (text ≥ 17 px, targets ≥ 44 px, the arch and the lit Waystone visible in the glide).
14. **Flag off:** validate-data's v1 fingerprint is unchanged, the v1 scenario-run passes, and no First Evening code runs without `V3_ENABLED`.
15. **Text:** every First Evening string is ≤ 90 characters with no exclamation mark, and no spoken line contains a percentage (FE-T1).

---

## 6. Reconciliation with `EXPERIENCE.md` §1

| topic | EXPERIENCE §1 | this document | why |
|---|---|---|---|
| lore line 2 | "Its last candles still burn. They fish to stay lit." | "Its last candles came ashore here. They fish to stay lit." | the line names the place on screen, which is the user's ask: a start that makes sense in the lore |
| hearth | "a row of dozing Wicks" | cold candles (the locked Wicks, unlit); your flame catches first; each later unlock catches the same way (§2.2) | fresh saves have no other unlocked Wick to doze (§25.4.4); it makes every unlock a lore beat |
| Murk's wake line | "Awake? You're guttering. Fish make oil, oil makes light. Off the jetty with you." | "Awake, little Wick? You're guttering. Fish make oil, oil makes light. Water's that way." | names the player a Wick; works from the raft (slice) and the jetty (P3) |
| first oil | — | Murk fills the lantern at Set Out ("First oil's on me. The rest you fish for."); the lantern runs at 70% until then | resolves "you're guttering" and teaches that oil comes from fish |
| play tip | "The line does the rest. Your gear decides how often it holds." | "The line does the rest. You'll know what it is when it's in." | one idea per line: the tip teaches "species hidden"; the gear idea is Murk's odds line |
| no-tap line | tip "It let go. Cast again, it'll come back." | Murk "It let go. Bait's still on. Again." | teaches that a lapsed bite refunds the bait (let it pass); Murk speaks in the pause after the miss |
| the Map Table | "a pill post at the jetty root" | `COVE.v0.posts` `map_table` at (−9, 7.6), reached by sailing ≈ 15 m (slice) | uses the validated v0 post, and the first outing needs sailing, so the cove teaches it |
| losses | retry forever | a third loss moves on to the gate and defers two lessons | never stuck, never faked |
| class estimate | Small and Keeper show their class only on the card | shown on the tutorial play and the first lake play | teaches "size shows" on a Small fish, which has no glimpse |
| title (fresh save) | — | *Begin* and Settings; the premise paragraph moves into the three lines | no wall of text before play |
| the save flag | `meta.flags.firstEvening` | `meta.firstEvening {done, step, skipped, legacy}` | no `meta.flags` object exists; the step is needed to resume |
| strings | `tips.castJetty`, `tips.wait`, `tips.strike`, `tips.passed`, `tips.play` | `fe_cast`, `fe_wait`, `fe_strike`, `murkPassed`, `fe_play` (§4.7) | one key space for the First Evening; `af_*` for the lines that outlive it |

Everything else in EXPERIENCE §1 stands: the Landing, Murk as the teacher, one tip at a time, honest odds, Replay in Settings, the returning-player line, and F0 as the minimum fallback.

---

## 7. Open questions for the lead

1. **Approve the FE pull-forward** (§5.2): the cove slice ships right after automatic fishing, ahead of P2. Recommended: yes; its world half can start now.
2. **The cold candles** (§2.2): change §25.4.4's "Wicks unlocked" row so locked Wicks stand cold by the hearth and catch when unlocked. Recommended: yes.
3. **FE-O1, the departure glide** for every P1–P2 run (+3 s, tap to skip). Recommended: yes, so every outing sets out from the Landing.
4. **First Light counts the Quayling** (+5 Memories in the first half-minute, as §18.1 intended for minute one). Recommended: yes.
5. **The class estimate on Small / Keeper plays** for the first two plays only (a teaching exception to EXPERIENCE §4.5). Recommended: yes.
