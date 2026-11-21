> **Superseded draft (2026-11-05).** Reconciled into DESIGN §25.6 (the strike, the play, leaps, the got-away note, hidden information, the logs), §25.4.8 (its §1, via OPENING.md) and CONTRACT §13.7a; data in `src/data.js` `AUTOFISH`. Where they differ, the spec wins: the leap table is tuned (Mirror Pike .30, Glassgill .12, Rainglass .25, Plumgill .10, Sporebelly .12, Velvet Ray .25, Shroud Ray .45, Wraithfin .15, Wax-Bearer .45) and the ambiguity rule allows 80% when a chosen bait or lure tilts the pool; fouled losses also land at ≥ 0.5 of the play; drag presets are cut; Gloomtide's hand slam parts the line; the got-away event is `fish:escaped`; the open questions are answered yes (hurry from the 2nd expedition, the "Odds in your log" link, the First Evening slice). Kept as the design record.

# Automatic fishing: the experience

*GLOOMWATER v3 · experience design for the automatic reel, hidden information and the opening tutorial · branch `gw-autofish` (from `gw-p1v-base`) · 2026-11-05*

**What this document owns:** what the player sees, hears and does from the first second of a new game to the catch card or the loss, under the user's new direction (automatic fishing on a land chance that is never 100%). **What it does not own:** the numbers of the land chance itself (base % per species, the size-class penalty, the gear and bait/lure terms, the cap). Those belong to the catch-chance model (`docs/v3/autofish/MODEL.md`, draft table `CATCH_V3` in `tools/sim/catch-v3.mjs`) and the fishing / gear log. Where this document needs an odds number for feel, it quotes that draft or gives a **proposal**, marked *(odds model)*. §4.13 lists where this document and the draft disagree, and which one should give way.

**Binding sources it builds on:** DESIGN §1 (premise and tone), §21.6 (Drowned Filigree UI, the ink-wash catch card), §25.1 (pillars), §25.2.2 (first session), §25.4 (the Landing), §25.5 (night modes), §25.6 (fishing craft), §25.7 (size model), CONTRACT §13. With `V3_ENABLED` off nothing here applies: v1's hold-to-reel game stays bit-identical (validate-data's flag-off fingerprint).

**Vocabulary added here:** the **strike** (the one tap after the bite), the **play** (the automatic reel-in, from "playing a fish"), the **night-ink proxy** (the generic dark fish shape shown during a play), the **reveal** (the moment at the scoop when the species first shows), the **got-away note**, a **Glimpsed** Journal page, the **First Evening** (the opening and its tutorial).

---

## 0. What the user asked for, and the five promises

| # | the user, verbatim | where it lands |
|---|---|---|
| A | "an automatic experience based on percentage chance of reeling in. It must never be 100% … the gear you buy increases chance some items are global and some are fish specific chance such as lures and bait … The percentage chance is only displayed in your fishing log/gear log and not on display whilst you're actually fishing because I dont want you to be able to tell what type of fish could be on your line." | §3, §4, §6 |
| B | "Strike, then automatic" | §3 |
| C | "Bigger is harder" (Trophy / Elder / Ancient get a penalty; the log shows % per size class) | §4.1 (odds model) |
| D | "Hint size, hide species" | §4.5, §6 |
| E | "Yes, after it's gone" (a short note names the species and rough size) | §5.3 |
| F | "Some fish species would jump out the water so keep that for certain fish" | §4.6 |
| G | "Make sure the game starts with a very short tutorial and in a place thay makes sense for this game to start in based on our lore. I do the want it to be that you're just in the game somewhere and you just start off your own back." | §1 |

**The five promises** (when anything below seems to conflict, these win, in this order):

1. **Never certain.** Every hooked fish has a land chance below 1, the tutorial's first fish included. A forced catch is never used to make a moment work.
2. **The odds live in the log.** No percentage, odds word, bar or colour that encodes the land chance appears anywhere while a line is in the water.
3. **Size shows; species hides.** From the bite to the scoop the player can read *how big* (the bite tell, the pull, the shadow, a leap) and never *what*. The species first shows at the reveal (a landing) or in the got-away note (a loss).
4. **Decided once, played honestly.** The outcome is rolled once, at the strike, and the play is a performance of that result. The first part of every play is identical whether the fish will land or be lost, so nothing in it hints at the result early.
5. **Nothing during the play changes the odds.** The strike is the last input that does. After it the player watches, can look around, and can only forfeit (cut the line).

---

## 1. The First Evening: where the game starts, and a 60-second tutorial

### 1.1 Where, and why it is the right place

The game opens **at the Landing** (DESIGN §25.4), not in a lake. In the lore the Lamplit Kingdom's great lantern fell and the kingdom followed it into the water; the Wicks are what is left of its candles, and the Landing is the old ferry landing under the kingdom's outer wall **where the last Wicks landed**. Old Murk keeps his barge there, and the Wicks who are not out on the water **doze by the hearth**. So the player starts as one of those dozing candles: a flame that catches, wakes, and goes to the water because a Wick has to fish to stay lit. The first fish comes off the Landing's own jetty (the Quayling, DESIGN §25.4.2), Murk gives the reason to leave, and the sea-gate arch is the way out to the Mossmere. The player is never just put down somewhere in a lake and left to work it out.

### 1.2 Beat sheet (a new save; about 60 s, of which the teaching takes about 30 s)

| clock | where | what the player sees and does | teaches |
|---|---|---|---|
| 0:00 | title | The boot overlay over the slow orbit of the cove (render `title`). *Begin.* | — |
| 0:02 | black → hearth | Three short lines in pale ink on night ink, one at a time, about 2 s each (tap to hurry, tap again to skip all): **"The great lantern fell, and the kingdom followed it into the lake."** · **"Its last candles still burn. They fish to stay lit."** · **"You are one of them."** Fade up on the hearth: a row of dozing Wicks as ink silhouettes; one small flame gutters, catches, stands up. That is you. | the premise in 6 s |
| 0:09 | hearth → jetty | Murk, from his barge (a speech line beside his lantern, not a panel): **"Awake? You're guttering. Fish make oil, oil makes light. Off the jetty with you."** The jetty end glows. (P3: you walk there, ≈ 4 s. Before P3: a 2 s scripted glide to the jetty head, §1.5.) | why you fish |
| 0:15 | jetty | One tip: **"Hold on the water. Let go to cast."** The cast meter as today. Any release lands in the cove, which is all water within reach. | cast |
| 0:19 | jetty | The float settles. A nibble comes; the tip changes to **"Not yet. Wait for it to go under."** | waiting |
| 0:23 | jetty | The Small tell (a quick double pop), then the **"!"**. The **strike ring** (§3.3) closes around the float. The tip becomes **"Now. Tap."** | the strike |
| 0:24 | jetty | Strike feedback (Clean / Early / Late, §3.3). If there is no tap, the fish lets go: **"It let go. Cast again, it'll come back."** and the tutorial waits for the next cast. | timing matters a little |
| 0:25 | jetty | **The play**, 2.5 s (Small): the line comes tight, the reel ticks, the fish skitters in. One tip, which stays until the play ends: **"The line does the rest. Your gear decides how often it holds."** | the reel is automatic; gear sets the odds |
| 0:28 | jetty | **The reveal and the measuring moment** (unchanged, DESIGN §25.6.8): palm pose, the cord ticks to 13 cm, "Quayling · Small". The card offers Release only (a cove catch). First Journal page. | the reveal; size is honest |
| 0:36 | jetty | Murk: **"Lives in my front yard. I don't buy those."** Then: **"What holds and what doesn't is written in your log. Better tackle, better odds. Never certain. Nothing out there is."** The Log button glows once (tap: it opens at the Quayling's page, showing its odds by class; or ignore it). | where the odds live |
| 0:44 | jetty | Murk: **"The real water's through the gate."** The Map Table glyph glows (before P3, a pill post at the jetty root). | the next step |
| 0:48 | Map Table | The **First Outing** card (fixed, as DESIGN §25.3.2): the Mossmere · the Wick · "Every night of your first outing is still." *Set Out.* | — |
| 0:52 | arch | The raft glides under the sea-gate arch past the lit Mossmere Waystone (3 s, `setout` camera). Zone flash, and the Mossmere's spawn. Murk follows and moors at 0:20 of day 1. | where the lakes are |
| ≈ 1:30 | Mossmere | The first lake bite. If the player missed or fumbled the tutorial strike, one reminder: **"Tap when it goes under."** After that, no more fishing tips unless asked for. | — |

### 1.3 Rules of the First Evening

- **Very short.** At most **one tip** on screen at a time, and each tip is a single line. There is no modal panel before the First Outing card and no glossary. All the teaching is done by the time the first fish is measured.
- **Honest odds, even here.** The Quayling's land chance on starter tackle is high but not 1 (≈ 90% for a Small Quayling on T0 in the catch model's draft, *(odds model)*). If it is lost, the player sees the got-away line (**"A Quayling spat the hook."**) and Murk says **"Happens to all of us. Again."** The next cast is a fresh roll. This teaches promise 1 in the first minute without any lecture.
- **Bites come quickly.** The jetty's tutorial casts use a short wait (2.5–3.5 s, one nibble) so the lesson never stalls; the Quayling's tells and its strike window are the normal Small ones (§3).
- **Skippable, never repeated.** The three lore lines can be skipped with a tap. The First Evening runs once per save (`meta.flags.firstEvening`). Afterwards *Continue* goes straight to where you were, and *Begin* on a save that has finished it goes to the Landing (P3) or the New Descent screen (P1–P2). Settings has **"Replay the first evening"**.
- **Returning players** (an existing save from before automatic fishing): no prologue. Instead, a one-time line at their first v3 bite: **"Tap when it goes under. The line does the rest now; your odds are in the log."**
- **Text is the game's voice** (DESIGN §1 tone): short, concrete, present tense, tender and a little wry. New strings go in `TEXT_V3.firstEvening` and `TIPS_V3` (phase-gated like today's).

### 1.4 Murk's lines and every new string of the First Evening

| key (proposal) | text |
|---|---|
| `firstEvening.lore[0..2]` | "The great lantern fell, and the kingdom followed it into the lake." · "Its last candles still burn. They fish to stay lit." · "You are one of them." |
| `firstEvening.murkWake` | "Awake? You're guttering. Fish make oil, oil makes light. Off the jetty with you." |
| `tips.castJetty` | "Hold on the water. Let go to cast." (replaces `v3_cast_cove`) |
| `tips.wait` | "Not yet. Wait for it to go under." |
| `tips.strike` | "Now. Tap." |
| `tips.passed` | "It let go. Cast again, it'll come back." |
| `tips.play` | "The line does the rest. Your gear decides how often it holds." |
| `murkFrontYard` | "Lives in my front yard. I don't buy those." (kept, split from the gate line) |
| `firstEvening.murkOdds` | "What holds and what doesn't is written in your log. Better tackle, better odds. Never certain. Nothing out there is." |
| `firstEvening.murkGate` | "The real water's through the gate." |
| `firstEvening.murkLost` | "Happens to all of us. Again." |
| `tips.strikeReminder` | "Tap when it goes under." |
| `tips.autoChanged` | "Tap when it goes under. The line does the rest now; your odds are in the log." |

### 1.5 Building it before P3: the First Evening slice

The Landing is scheduled for P3 (§25.14), but the user wants the opening now. **Recommendation: pull a small "First Evening" slice forward**, made of parts §25.4.6 already plans to build cheaply, and leave all the Landing's growth for P3:

| in the slice | taken from | left for P3 |
|---|---|---|
| the cove arena, the quay, the jetty, the sea-gate arch, the four Waystones (only the Mossmere's lit), the hearth with its dozing-Wick silhouettes, Murk's barge (frozen), the bare harbour wall | `COVE` data; world-cove's own extrusion builder; the arch from `taperTube`; `merchant.freeze()`; the Waystone builder | frames and the mount batch, the keep-pond and its pond pass, the Long Wall's growth, the Gear Bench, the Shrine alcove, the Trials Board |
| the Wick **on the moored raft** at the jetty (Landing v0's rule), so no foot controller is needed; the wake is a cinematic (the hearth close-up, then a 1 s fade to the raft at the jetty head) | §25.4.7's Landing v0 | walking the quay (S0 / R0) |
| the Quayling and jetty fishing | `COVE.fishing`, species `quayling` (P3 data, pulled forward in the slice's phase) | the test buoy (§7) |
| the Map Table as one **pill post** at the jetty root, opening today's New Descent screen in its First Outing state | U17's First Outing card | the Map Table chart |
| the Set Out glide under the arch into the Mossmere | `COVE.setOutPath`, `player.glide` | Homecoming |

**Flow in P1–P2 builds:** first boot (`meta.runs === 0` and no `firstEvening` flag) → the First Evening → the First Outing card → Set Out → the run. Later runs keep today's title → New Descent flow until P3's hub replaces it. Optional and cheap: a snuff (P1–P2) could end at the hearth ("Murk found your raft drifting.") before the death summary, so the Landing is home from the first evening on.

**Fallback if even the slice slips** (the minimum the user's request allows, not a target): the first run opens at Murk's moorings by the Mossmere's south-east dock (the drowned ferry harbour, DESIGN §25.8), with Murk already moored, the three lore lines, the same Murk lines (the gate line becomes "The real water's further out.") and the same four tips. It must never be a cold start in open water.

---

## 2. The loop, moment to moment

| step | the player | sees and hears | hidden | changed from today's v3 build |
|---|---|---|---|---|
| **read** | sails or walks to water worth fishing | signs (§25.6.1), places, the float's favour notches once the bobber settles | the species pool's odds (they are in the log) | signs and residents show only size, never a species' colour (§6) |
| **choose** | picks the bait or lure from the tray; picks the depth with the cast | the bait's attract words and the float's favour words on a long press | — | the log tells which bait or lure raises which species' land chance (odds model) |
| **cast** | hold, aim, release (as today) | the ping-pong meter, the depth reticle, the Clean Cast ping | — | unchanged |
| **wait** | waits; nibbles are tests (an early tap during nibbles spooks the fish, as today) | nibbles, feints, the gold double-dip before a real bite | which species is circling | feints come from any rarity (§6 row 14) |
| **bite** | reads the class tell (or lets it pass) | the class bite tell, then the "!" | the species | unchanged (class only) |
| **strike** | taps once | the strike word and a ring burst (§3.3) | the land chance and the outcome | new: the strike grade adjusts the odds a little; it replaces the hook and the whole reel game |
| **play** | watches, looks around, can cut the line | the automatic reel-in, scaled by size class (§4) | the species and the outcome | new: replaces hold-to-reel, the tension line, pips and the Elder fight UI |
| **end** | — | the reveal at the scoop, then the measuring ceremony and the card; or the loss and then the got-away note | — | the reveal (§5.1) and the got-away note (§5.3) are new; the ceremony and the card are unchanged |
| **decide** | Keep / Eat / Render / Release / Mark for home | the card | — | the card adds one line: the strike grade |

Timing per cast at the median: a 5.5 s wait, a 0.3 s strike, a play of 2–12 s for nearly every fish, a ceremony of 1.2–3.5 s and the card. That is **shorter per common fish than today's 5–10 s fights**, so casts per hour should rise (an estimate: ≈ 65 → ≈ 75–80). The pacing sim (T5) re-checks §25.7.2's pacing targets with play lengths taken from §4.2.

---

## 3. The bite and the strike

### 3.1 The bite tells stay exactly as they are (class only)

Small *double pop* · Keeper *plunge* · Prize *drag-under* · Trophy *flat slide* · Elder *dome* (DESIGN §25.6.4; `SIZE_CLASSES[].bite`). They hint size and nothing else. Prize+ still hold the bait 10% longer. The P1b tell pictogram beside the float stays.

### 3.2 The strike window (by class, never by species)

Today the hook window comes from the species' `difficulty.window`, which would make the timing a hidden species signature. In automatic fishing it comes from the **class** (then the Rod's hook-window multiplier and Feather Touch widen it):

| class | window after the "!" | Clean part (the first 40%, at least 0.25 s) |
|---|---|---|
| Small | 0.60 s | 0.25 s |
| Keeper | 0.70 s | 0.28 s |
| Prize | 0.80 s (with the 10% hold) | 0.32 s |
| Trophy | 0.85 s | 0.34 s |
| Elder, Ancient | 0.90 s | 0.36 s |
| legendary | 1.00 s | 0.40 s |

| when the tap comes | grade (player word) | catch-model term *(odds model, `CATCH_V3.strike`)* | effect |
|---|---|---|---|
| during the nibbles, before any tell | **spooked** (as today) | — | the cast ends; no fish |
| during the class tell, or within 0.3 s before the "!" when the tell is shorter than that (the Keeper's plunge has none) | **Early** | `mistimed` −3 marks | hooked, a bit lower |
| inside the Clean part | **Clean** | `perfect` +4 marks | hooked, a small bonus |
| inside the rest of the window | **Struck** | `onTime` +2 marks (the log's reference strike) | hooked, as the log says |
| up to 0.3 s after the window | **Late** | `mistimed` −3 marks | hooked, a bit lower |
| no tap by then | **passed** (let it pass, unchanged) | — | the bait is refunded; favour +0.15 for the next cast in the same water (cap +0.3) |

*Feel check:* at the draft's scale (0.1 logit per mark), a fish the log rates at 80% for an on-time strike lands ≈ 82% after a Clean strike and ≈ 73% after an Early or Late one (with a Prize's 0.93 cap), which matches the user's "a small bonus … a bit lower". The class cap (every cap < 1) applies after the strike term, so no strike can make a fish certain. The log shows the on-time figure, which is the honest reference. The Clean streak (today's perfect-hook streak) keeps its value bonus.

### 3.3 Strike feedback (≤ 0.6 s; readable with the sound off)

| grade | on the water | word under the float | sound | phone haptic |
|---|---|---|---|---|
| Clean | the float vanishes in a bright bone-white ring and a spray of pale-gold glints; the rod loads hard | **Clean** (Marcellus SC, lavender glow; the hook curls draw in) | a crisp *tock* with a rising chime | 2 × 12 ms |
| Struck | a bone-white ring; the rod loads | none (after the first 20 strikes); "Struck" before that | *tock* | 15 ms |
| Early | the float jerks sideways before it goes under | **Early** (dim lavender) | a dull *tk* | 8 ms |
| Late | the float is already gone; the line comes tight with a slump | **Late** (dim lavender) | a slower *thunk* | 8 ms |

The **strike ring** is a thin ink ring that closes on the float over the strike window, with the Clean part drawn brighter. It is on during the First Evening and the first expedition, then off by default (Settings: *Strike ring: always / first expedition / never*). It shows timing only, never odds.

---

## 4. The play: the automatic reel-in

### 4.1 One roll, at the strike

At the strike fishing already holds the species (rolled at the cast landing, as today) and the size score z (rolled at the tell, F1). It now draws, **once**, from the seeded rng (`S.rng`, so tests can replay it):

1. **The outcome:** land if `u < landChance(species, class, loadout, bait or lure, strike grade)` *(odds model; always < 1)*. Legendaries use their own odds row.
2. **The loss cause** (only when lost), chosen from weights: the catch model's cause weights by the fish's style (`CATCH_V3.reel.cause`, which follow the slot each style tests: leapers the Rod → thrown, runners the Reel → spooled, thrashers, sinkers and sulkers the Line → snapped), a leap's loss always being a thrown hook, the strike grade (Early / Late tilt toward spat or thrown), the place (foul water → fouled) and the class (only Elder / Ancient can be spooled; Small and Keeper losses are spat or thrown). The style weights are safe to use because the cause never shows until the fish is gone.
3. **The loss moment** `tLoss`, a fraction of the planned play (§5.2 table by cause).
4. **The play plan**: its length and beats (§4.2–§4.3) from **class and z only**, plus a seed.

**Outcome-blind plan.** The plan is generated *before* the outcome is applied, from its own rng stream. A loss only overwrites the plan from `tLoss` onward. Given the same seed, a landed play and a lost play are frame-for-frame identical up to `tLoss` (an acceptance test, §10). Because `tLoss` is always past half of the play, the first half of every play says nothing about the result.

**Reloading.** The result is held in memory, and nothing during a play is saved (the save comes on `fish:measured`, as today). Closing the tab during a play loses that fish with no record, and the bait is already spent, so a reload gains nothing.

### 4.2 Length and shape by size class

Length within a class grows with z: `dur = lerp(min, max, u) × U(0.92, 1.08)`, where `u` is z's position inside the class's band. Everything in this table depends on class and z, **never on species**.

| class | play | runs (line peels off) | surges | glimpses (§4.5) | leap kind (only if the species leaps, §4.6) | last stand | raft towed | rod bend max | camera shake per surge | music |
|---|---|---|---|---|---|---|---|---|---|---|
| **Small** | 2–3 s | 0 | 0 | none; it skitters at the surface during the lift | — | — | 0 | 0.25 | 0 | the calm bed; reel ticks only |
| **Keeper** | 3–5 s | 1 short (0.6 s) | 0–1 | 1: a swirl and a dark back near the raft at 70–85% | **skip**: a low arc, 0.35 s | — | 0 | 0.45 | 0.04 | the calm bed with a soft pulse |
| **Prize** | 5–8 s | 1–2 | 1–2 | 1–2: the first is a roll at 35–50%, which shows the class estimate | **leap**: the first one slows to 0.35× for 0.25 s (today's leap reveal) | — | 0.2 m | 0.65 | 0.08 | `reel` mood, low |
| **Trophy** | 8–12 s | 2 | 2–3 | 2–3: a roll, then a tail slap that throws spray | **leap** | — | 0.6 m | 0.8 | 0.12 | `reel`, mid |
| **Elder** | 12–20 s | 3, one of them long (4–8 m of line) | 3–5 | 3+, including **the pass**: the shadow slides under the raft and the camera dips | **breach**: a heavy half-out roll, 0.35 s at 0.35× | 1, at 55–70% | 1.5 m | 0.95 (to the cork) | 0.18 | `reel`, full, with a low drone |
| **Ancient** | 20–30 s | 4 | 4–6 | 4+, including a pass with a shadow **longer than the raft** | **breach** | 2 (55–65% and 80–88%), with **the still** between them | 2.5 m | 1.0 | 0.22 | full, with the drone and a heartbeat; 1.5 s of silence for the still |
| **legendary** | 30–60 s, authored | its named phases (today's legend phases, now staged) | phases | its real model (the identity is known, §4.11) | its own | its phases | its own | 1.0 | authored | the boss mood |

### 4.3 Beat vocabulary (what a play is made of)

| beat | length | looks like | sounds like |
|---|---|---|---|
| **take** | 0.3–0.8 s | the line snaps tight, the rod loads, spray where the float was | the line's tick, a hollow pop |
| **gain** | 0.5–2 s | the reel turns, the line shortens, the shadow comes closer | reel ratchet (faster for small fish, slower and heavier for big ones) |
| **run** | 0.6–4 s | line peels off, the line angle swings wide, the shadow moves 1–8 m away; Trophy+ tow the raft | the drag's hiss, rising |
| **hold** | 0.5–2 s | a stalemate: the rod deep and still, the line humming, nothing moves | one low sustained note (lower for bigger fish) |
| **surge** | 0.3–0.8 s | a burst of spray at the line end, the rod jerks, the lantern swings | a heavy splash; the strain whine |
| **glimpse** | 0.6–1.5 s | the night-ink proxy rolls at the surface or slides past (§4.5); rings scaled to its length | a wet roll, pitched by length |
| **leap** | 0.35–1.2 s | a backlit silhouette clears the water (§4.6) | spray, then a slap pitched by length |
| **last stand** (Elder, Ancient) | 2–4 s | the big turn: the longest run, the rod to the cork, the camera drops toward the water, the Wick leans back with its feet sliding and its own flame streaming sideways | the drag screams; the drone swells |
| **the still** (Ancient) | 1.5 s | the line seems to go slack, everything stops, the lantern steadies; then it thunders off | silence (music and bed cut), then a crash |
| **lift** | 0.6–1.2 s | the fish is drawn to the raft; spray at true scale; the scoop | the last reel turns |
| **loss** | 0.4–1 s | the outcome's ending (§5.2) | by cause |

**Grammar:** a play is `take`, then alternating `gain` and (`run` | `hold` | `surge`) at the counts in §4.2, with glimpses, leaps and last stands placed in their windows, ending in `lift`, or in `loss` at `tLoss`. A hidden presentation progress (the fish's distance from the raft) rises with gains and falls on runs; it is the same function for every species of a class. **The still and the last stand happen in landed and lost plays alike**, so neither is a tell.

### 4.4 Two worked plays

**A Trophy, landed (10.4 s).** 0.0 take · 0.6 gain · 1.8 run (line peels about 3 m, the raft yaws) · 3.4 hold (the rod stays deep) · 4.2 **glimpse**: a long dark back rolls 9 m out, and the class estimate stamps in, "by the look of it: **Trophy**" · 5.0 gain · 6.1 surge (spray, shake 0.12) · 6.6 gain · 7.4 tail slap (glimpse) · 8.2 run, short · 9.0 gain · 9.6 **lift**: the proxy breaks the surface at the raft, and as it clears the water the ink lifts off it and the species is **revealed** in colour (a Candlefin Koi, its fins lit with heatless flame), then the measuring ceremony.

**An Elder, lost (planned 16 s, `tLoss` 0.68).** 0.0 the dome bursts at the strike · take · gain · 1.9 run, long (6 m; the raft is towed) · 4.0 hold · 5.2 **the pass**: a shadow about the raft's length slides under the deck and the camera dips · 6.5 gain · 7.6 surge · 8.4 gain · 9.6 **last stand**: the turn, the scream, the rod to the cork, the Wick's flame streaming · at 10.9 s (0.68 × 16) the line parts with a crack, the rod springs straight and the line curls back on the wind. One beat of silence. Then the **got-away card**: "**Reedjaw Pike** · *Old Ninefin* · An Elder, near 1.6 m. It parted the line on its last run. Heavier line holds the long runs." (§5.3).

### 4.5 The glimpse: the night-ink proxy

During a play the player never sees the species' model. Fishing shows **one generic proxy**, the same for every species, built once:

- **Shape:** a plain fusiform fish body with a forked tail and one soft dorsal hump. There are no barbels, eyes, photophores, fins in detail, rays, bells or claws. Its length-to-depth ratio is a **fixed 4.2 : 1 for every species**.
- **Length:** the fish's **true length** (DESIGN §25.7.5, honest scale, no 1.45× boost). This is how size reads: a 22 cm minnow is a flicker, a 1.6 m Elder is a shadow nearly as long as the raft is wide.
- **Material:** night ink (`#04050a`), unlit, with a thin rim term in the colour of the scene's key light: lantern amber at night, the cavern's moon-silver crack light by day. No colour, no pattern, no glow, no species tint. The Starlit sky and the water's star reflection behind it do the rest.
- **Under water:** the existing shadow decal (`fishing-fx.setShadow`), sized by length, alpha by depth, wiggling with a class-generic tail beat.
- **On screen:** at least 24 px long at 390 px portrait for a Keeper at 8 m of line. When a fish is smaller than that, its glimpse adds a ring sized to its true length so the size still reads.

| class | what a glimpse looks like |
|---|---|
| Small | no glimpse; a quick skitter of spray during the lift |
| Keeper | a swirl and a short dark back near the raft |
| Prize | a back that rolls once, the tail showing |
| Trophy | a long back that rolls, then a tail slap that throws spray |
| Elder | the water bulges and a long dark flank slides past or under the raft |
| Ancient | a shadow longer than the raft passes under it; the raft lifts slightly as it goes |

Crayfish, rays and jellies show as the same generic fish shape. That is deliberate. What breaks the surface is a dark shape and spray, and the reveal at the scoop ("a crayfish!") becomes part of the fun.

**The class estimate** ("by the look of it: Trophy", the P1b seal and word) **stays**, now as the payoff of the first glimpse of a Prize+ play. It is size only, it confirms the tell, and it gives players who cannot read shadows the same information. Small and Keeper show their class on the card, as today.

### 4.6 Leaps: kept for the species that leap

**Data, per species** (`SPECIES[].leap`, a v3 field; validated):

```
leap: { chance, max, when }    chance: per play, Keeper+ only (Small fish skitter, a generic beat)
                               max: leaps in one play (1–3)
                               when: 'early' (15–50% of the play) | 'mid' (30–75%) | 'any' (15–85%)
```

The **signature leapers** keep leaping often. The others that leap at all are species whose real-world kin do it now and then (pike, gar, carp, koi, sturgeon, salmon, rays), with a low chance, so that **a leap never pins one species**. Proposed values:

| lake | signature leapers (often) | occasional leapers | never |
|---|---|---|---|
| the Mossmere | Gloam Eel .60 ×3 any | Reedjaw Pike .30 mid · Bridgechain Sturgeon .35 ×1 mid · Lampsipper .30 early · Candlefin Koi .25 · Dusk Minnow .15 · Weeping Carp .15 · Mossback Perch .08 | Gutter Crayfish, Old Portcullis, Cupbearer |
| Sporewood Pools | the Remembered Sun .60 ×2 | Velvet Ray .30 · Nightbloom Carp .20 · Hushcap Koi .20 · Harpstring Eel .15 · Threadling Eel .10 · Plumgill Perch .08 · Sporebelly Puffer .08 · Mildew Angler .05 | Capshell Crayfish, Sleepspore Jelly |
| Glasswater Vault | — | Vesper Gar .40 ×2 · Mirror Pike .35 · Rainglass Darter .30 · Shardspine Eel .20 · the Unreflected .20 · Prism Minnow .15 · the Sexton .10 · Glassgill Perch .08 · Glassblown Puffer .08 | Chime Jelly, Blind Scrivener, the Footnote |
| the Pallid Deep | Shroud Ray .55 ×2 · the Wax-Bearer .50 ×3 | Candlewake Sturgeon .35 ×1 · Gilt-Eyed Eel .15 · Ossuary Fry .15 · the Clapper .15 · the Namesake .15 · Pallid Wraithfin .10 · Funeral Veil .10 · the Unpaid Fare .05 | Bonecrook Crayfish, Lampwarden Angler |
| Wanderers | Pilgrim Salmon .50 ×3 · Hearthfish .45 ×2 | — | Quayling (it skitters) |

**The leap ambiguity rule** (a new `validate-data` v3 rule, run per `V3_PHASE`): for every lake × hour (calm, dusk, night) × depth band × bait, over the species that can bite there (open water, and each kept place with its kept species at weight × 8), weighting each by its roll weight × `leap.chance`: **the number of species that can leap is 0 or at least 2, and no single species makes up more than 70% of the expected leaps.** With the values above, over the 120 open-water cells of the 53-species roster, the worst cell is the Mossmere's calm shallows (Dusk Minnow 65%, Mossback Perch 35%). Mossmere night deep water with Lumen Moss splits as Mossback Perch 29%, Gloam Eel 28%, Weeping Carp 19%, Hearthfish 14%, Reedjaw Pike 9%; the Bier Barge with the Wax-Bearer at × 8 comes out ≈ 50%. (Computed from `RARITY_WEIGHTS` and each species' time, depth and bait; the validator recomputes it with the real pool code and every phase's roster.)

**How a leap looks.** The proxy (§4.5) clears the water as a **black cut-out, backlit**: rim light from the brightest thing behind it as the camera sees it (the lantern-lit spray at night, the Starlit sky and the cavern shafts by day), and spray in bone-white and lantern amber. Nothing in a leap carries a species' colour, pattern or glow. Today's `leapSplash` bursts the species' own glow colour, and that goes. Its height, arc and slap scale with length and class (skip, leap, breach, §4.2), never with species. A player can think "that one jumps", but several species in every water can jump, so a leap never says which.

**Leaps and losses.** When a leaper's play is lost, its cause is usually **thrown on the leap** (weight 0.6 for signature leapers, 0.3 for occasional ones). The hook flies back at the leap's apex with a glint, the line falls slack, and the silhouette drops back into the water. This is the most readable loss in the game, and it is still decided at the strike.

### 4.7 Camera

- **Framing never zooms by class** (R1, kept): the reel camera follows line distance and fight state only, so an Elder looks bigger on screen than a Keeper at the same line length.
- **Class scales the camera's behaviour:** shake per surge (§4.2), how long a leap is held in slow motion (Prize+ only), the drop toward water level that only last stands produce (Elder / Ancient), the dip for the pass, and the slow lean back as the fish comes in. The beats belong to big plays, so the camera rule stays testable as "same state, same framing".
- **Portrait** keeps render's portrait presets. The proxy and the raft stay inside the middle 60% of the frame, clear of the HUD.

### 4.8 Sound and music

| layer | scaled by |
|---|---|
| reel ratchet | class: fast and light for Small, slow and heavy for Elder |
| drag hiss on runs | run length; pitch falls with class |
| line hum during holds | pitch falls with true length |
| splashes, the leap slap, the glimpse roll | true length (existing `splash` sizes) |
| strain whine | the presentation tension of the beat (class-scaled), not species power |
| music | Small and Keeper keep the calm bed; `reel` mood from Prize up, with intensity by class; Elder adds a drone; Ancient adds a heartbeat and the silence of the still |
| species "voices" (the Harpstring's hum, the Vesper Gar's ringing fins, the Sexton's toll, the Clapper's bell, the Glassblown Puffer's wineglass, the Chime Jelly's chime) | **silent during the play**; each plays once **at the reveal**, as the fish clears the water |

### 4.9 Staying engaged when nothing is asked of you

A play is short for ordinary fish and long only when the fish is big, so suspense has to come from the presentation:

- **The Wick acts.** Small: a one-handed flick. Keeper: two hands, cranking. Prize: braced feet. Trophy: a knee on the raft's edge, the rod butt against its belly. Elder and Ancient: leaning back with its whole body, feet sliding, the raft tilting, **its own flame streaming sideways on every surge and guttering on the last stand** (the Wick is a candle; its effort shows in its flame).
- **The light breathes.** The lantern swings on surges, so the pool of light on the water sways. At night the spray catches amber, the wake sparkles (Glowtide, in a neutral colour), and moths scatter off the lantern.
- **The world reacts.** Trophy+ tow the raft, so the scenery moves. Fry skitter away from the line. Ripples cross the starlit reflection.
- **The size story builds.** Tell, take, the first glimpse, the class estimate, the pass, the last stand: each reveals a bit more of *how big*, and the species is held back for the scoop.
- **Silence is used.** The hold and the still let a long play breathe instead of filling it.

### 4.10 What the player can still do during a play

| input | does | changes the odds? |
|---|---|---|
| drag (finger or mouse) | orbits the camera ±20° in yaw; it springs back when released | no |
| hold anywhere, **Small or Keeper plays only**, from the second expedition | hurries the play (× 2.5) | no (the result was rolled at the strike) |
| hold movement for 0.6 s | **cuts the line** ("You cut it loose."): the only forfeit, kept for Gloomtide escapes and for anyone who wants it | it ends the play as a loss |
| Flare, Burn, zap (combat modes) | work as usual | no |
| any other tap on the water | nothing (no fake reeling) | — |

There is deliberately **no tap that seems to help**, because that would invite players to believe in false agency.

### 4.11 Legendaries

A legend bites only at its legend pool on its legend bait, so its identity is known and there is nothing to hide. Its play shows **its real model** and its named phases as authored stages (30–60 s), with today's banners and phase toasts. Its odds come from its own row in the log *(odds model)*; the cap below 1 applies, and the wounded rule becomes a better land chance on the rematch.

### 4.12 Night modes and combat during a play

- **Still and Lantern:** combat never costs a hooked fish (standing decision). The swarm can drain oil and take an *unmarked* creel fish when no fish is hooked, as §25.5.1 says, but nothing touches the play.
- **Gloomtide** (the old stakes): a hand slam or a hit that lands during a play **parts the line** (an external loss, outside the roll). Its got-away line says "The line parted when you staggered."
- Legend snags (the Lantern-Swallower's Grasping Dark) become staged beats of that legend's play.

### 4.13 Reconciliation with the catch model's draft (`tools/sim/catch-v3.mjs`)

The draft already holds a presentation block (`CATCH_V3.reel`, `CATCH_V3.leaps`) for its time and economy model. Where it and this document differ:

| topic | the draft | this document | resolution |
|---|---|---|---|
| strike | `perfect` +4 / `onTime` +2 / `mistimed` −3 marks, 0.3 s grace either side | Clean / Struck / Early / Late on those terms (§3.2) | **adopt the draft's numbers**; this document supplies the player words, the class windows and the feedback |
| play length | `reel.seconds` 3 / 4 / 6 / 8 / 11 / 13 / 18 × a lake multiplier (0.8–1.45) | 2–3 / 3–5 / 5–8 / 8–12 / 12–20 / 20–30 / 30–60 s by class and z (§4.2), the task's bands | **this document's bands**; the time model uses their midpoints (2.5 / 4 / 6.5 / 10 / 16 / 25 / 45). A lake multiplier is acceptable (the lake is known), clamped inside the class band |
| where a loss lands | the hazard split over beats by weight (beat 1, leap 2, old trick 2, chain 1.5) | `tLoss` ≥ 0.5 of the play (§4.1, §5.2) | **keep the draft's weights, but only over beats in the second half**, so the first half stays outcome-blind and losses read as "near the end" |
| leaps | `leaps[id] = [chance, count, fixed progress points]`; the signature leapers at chance 1; 22 entries | §4.6's table; signature leapers at 0.5–0.6; 38 species that can leap; random placement inside an `early` / `mid` / `any` window | **this document's table or the ambiguity rule, whichever is stricter.** Over the same open-water cells, the draft's table leaves a single possible leaper in many of them (a calm leap in the Mossmere's deep water can only be a Reedjaw Pike; a calm leap in Sporewood's mid water only a Velvet Ray): **49 of 115 cells fail** the rule, against 0 of 120 for §4.6. A chance of 1 also means "it didn't leap" rules a species out entirely, and a fixed progress point (e.g. the Reedjaw always at 60%) becomes a timing signature |
| loss causes | by style (`reel.cause`) | by style, with strike, place and class tilts (§4.1) | compatible: adopt the draft's style weights |

---

## 5. Outcomes

### 5.1 Landed: the reveal, then the ceremony

The **reveal** is the new moment between the lift and the measuring ceremony. As the fish clears the water at the scoop (DESIGN §25.6.8, 0.0–0.6 s), the night-ink proxy's ink lifts off it in a short brush wipe (0.35 s, ink to colour), the real model appears, and the species' voice plays if it has one. A Marked Fish shows **the old hook still in its jaw** right here, never during the play. From the pose onward everything is unchanged: the pose by length, the knotted cord, the class chimes, the seal, the records written at the stamp, the banners, the card. **The card adds one line, "Strike: Clean / Struck / Early / Late"**, beside the favours that applied. Catch quality (Fine, Shimmering) can no longer come from reel skill; it now comes from the strike grade, a live sign and bait or relic shimmer *(odds model)*.

### 5.2 Lost: how each cause looks

| cause | when (fraction of the planned play) | looks like | sounds like |
|---|---|---|---|
| **snapped** | during a run, surge or last stand, 0.55–0.85 | the rod springs straight, the line whips and curls back on the wind | a crack, then a ringing |
| **thrown** | at a leap's apex (leapers) or during a head-shake at the surface, 0.50–0.90 | the hook flies back with a glint, the line falls slack, the shape drops back | a tick, a splash |
| **spat** | at the lift, 0.88–0.95 (the closest heartbreak) | the fish turns at the raft, the line goes slack, a swirl | a soft splash, then quiet |
| **spooled** (Elder, Ancient) | on the long run or the last stand, 0.50–0.80 | the reel spins empty and the last of the line drains away | a rising scream, then nothing |
| **fouled** (foul places only: the Gatehouse Door, the Chain Garden) | 0.40–0.80 | the line goes dead on the chains, then parts | a clank, a creak, a crack |
| **staggered** (Gloomtide only) | whenever a hit lands | the Wick staggers and the line parts | the hit, then the crack |
| **cut** | when the player holds movement for 0.6 s | the line is cut at the rod tip | a snip |

After any loss there is a **beat of 0.6 s with no UI at all**: the water settling and the line drifting. Then the note appears.

### 5.3 The one that got away

Shown only **after the fish is gone**. It names the species and a rough size, never the odds.

**Small and Keeper** (rare: commons land almost every time): a one-line ink toast for 2.5 s, e.g. **"A Dusk Minnow spat the hook."** · **"A Candlefin Koi threw the hook."**

**Prize and bigger:** the ink card (the P1b near-miss card's shell, `gw-nearmiss`, restyled), non-blocking, gone after 7.5 s, on a tap or at the next cast:

```
THE ONE THAT GOT AWAY                       (kicker, spaced capitals)
Reedjaw Pike                                (IM Fell English SC; an Elder adds its generated name in italics: Old Ninefin)
An Elder, near 1.6 m. It parted the line on its last run.
It's still out there, under the Span.       (Trophy+ that become Marked Fish, P2)
Heavier line holds the long runs.           (the gear hint for this cause)
                                   Odds in your log  ›   (a quiet link to that species at that class)
```

- **Size words:** the class with its article ("a Prize", "a Trophy", "an Elder", "an Ancient") and the length **estimated within ±8%** (§25.7.4's rule), rounded: under 20 cm to 1 cm ("near 9 cm"), under 1 m to 5 cm ("near 45 cm"), above that to 0.1 m ("near 1.6 m"). The word is "near", never an exact figure.
- **Cause lines** (`TEXT_V3.gotAway.cause`): snapped: "It parted the line." / "It parted the line on its last run." · thrown: "It threw the hook." / "It threw the hook mid-leap." · spat: "It spat the hook at the raft." · spooled: "It took every turn of line on the reel." · fouled: "It wrapped the line on the chains." · staggered: "The line parted when you staggered." · cut: "You cut it loose."
- **Gear hints** (one line, matched to the cause, so a loss teaches which upgrade helps): snapped: "Heavier line holds the long runs." · thrown: "A stiffer rod sets the hook deeper." · spooled: "A bigger reel carries more line." · spat (after an Early or Late strike): "A clean strike holds better." · fouled: "Here, the chains take their share." Each matches the odds model's per-slot terms, so the hint is true.
- **Tone:** quiet and a little wry, never scolding. It is about the fish, not the player's failure. There is no "% landed", no progress number, and none of the old tension tips ("Let go on the hiss" goes with hold-to-reel).
- **Expedition summary:** its near-miss lines become got-away lines ("A Trophy Reedjaw, near 1.1 m, threw the hook under the Span, day 3").

### 5.4 Where a lost fish lands in the Journal

| case | what is written |
|---|---|
| the species was not yet named | a **Glimpsed** page: the species' name and its ink silhouette, a line such as "Got away: a Trophy, near 1.1 m, under the Span, night 2", and its odds by class appear in the log. The species counts as known, not caught. The naming Memories, the field note and the Long Wall frame's silhouette still wait for the first landing, so losses give no reward to farm. |
| any species | its page gains a **Got away** list (the last 5: class, ~length, place, day, cause) and keeps **the one that got away** record (the biggest escape, ±8%, §25.7.4) |
| Trophy+ (P2) | a **Marked Fish**, as §25.6.7 (keeps its z, lives at that place, has a hook-glint on its shows), now announced by the note's "still out there" line |
| an Elder | it is given its generated name at the loss (the same `elderName` rule), and the Elder Log gets a **Still out there** list beside the landed Elders |

---

## 6. Hidden-information audit

Every place the species could leak between the bite and the reveal, and the rule for each. "Exempt" means legendaries only, whose identity is known by design (§4.11).

| # | leak | where it is today | rule |
|---|---|---|---|
| 1 | the reel bar prints the species' name ("MOSSBACK PERCH") | `ui-hud.js` `.gw-reel-name` from `view.speciesId` (≈ l. 79, 451–452) | **removed** with the whole reel bar (§7) |
| 2 | the reel bar is tinted by rarity | `ui-hud.js` `--rc` from `view.rarity` (≈ l. 453) | removed |
| 3 | `fishing.view.speciesId` / `rarity` are set at the hook | `fishing.js` `hook()` (≈ l. 930) | they stay **null until the reveal**; `view.legendary` is true only for legends (exempt) |
| 4 | event payloads name the species mid-fight | `fishing:bite {speciesId}`, `fishing:tell {speciesId}`, `fishing:hook {speciesId, name, epithet}`, `fishing:oldTrick {speciesId, style}` | species fields are **null** on every event from the cast to the reveal (except legends); progression's legend-bait spend reads `legendary`. The species returns on `fishing:caught`, `fishing:escaped` and `fish:got-away` |
| 5 | the hooked fish is the species' real model (colours, fins, shape, glow, the 1.45× boost) | `fishing.js` `spawnHooked()` → `createFish(sp.id)` | the **night-ink proxy** (§4.5); the real model only from the reveal |
| 6 | glow colours | `leapSplash()` bursts `species.model.glow`; glowing skins on the hooked model | neutral spray (bone-white, lantern amber); the proxy has no glow; legends exempt |
| 7 | the fight style drives the motion | darter dash × 1.6 (`onSurgeVisual`), pull / leap / dive surges by behaviour, sway from `difficulty.erratic`, tension from species power and stamina (`updateHooked`, `fishing-reel.js`) | every presentation parameter comes from **class and z**; style shows only through the leap table (§4.6) |
| 8 | the Elder's old trick kind per species (`oldTrick`: doubleRun / sulk / secondLeap / bore) | `fishing-reel.js` v3 options; `SPECIES_V3[].oldTrick` | it becomes the class-generic **last stand**; a second leap happens only through `leap.max` |
| 9 | the leap | `onSurgeVisual('leap')`, the leap reveal | kept, as a **backlit silhouette**, with the ambiguity rule (§4.6) enforced by the validator |
| 10 | species voices (the Harpstring's hum, the Vesper Gar's fins, the Sexton's toll, the Clapper's bell, the Glassblown Puffer's ring, the Chime Jelly's chime) | look and lore lines; any SFX added for them | silent until the reveal (§4.8); the Matriarch's bell and the Sovereign's ping are exempt |
| 11 | toasts and banners | the legend banner on the hook (`ui.js` ≈ l. 627); legend phase and enrage toasts (`fishing.js` ≈ l. 979, 991) | legends only (exempt). No toast, bounty tick or challenge pop names a species before the reveal: those wait for `fishing:caught` |
| 12 | tips | v1 `reel_band`, `surge_release` (`data.js` ≈ l. 1355) | never shown in v3; any v3 tip on a fishing event is species-free |
| 13 | the strike window | the species' `difficulty.window` | **by class** (§3.2) |
| 14 | feints come only from rares in deep lakes | `rollBite()` (`feintZoneMin`) | feints come from any rarity, at the same rate |
| 15 | the bite tell | `beginTell()` / `tellPose()` | class only (kept); its pulse colours are class colours; legends use the dome (exempt) |
| 16 | signs | `fishing-fx` (rise ring, boil, glow trail) | they scale with size only; **glow trails use one moon-silver for every species**, never the species' glow colour; a pre-rolled fish's sign shows its class, never its species |
| 17 | fish seen before the cast (`sight` places, Moonfall, Glasswater's clear water, residents surfacing) | §25.6.1 "visible shadows", §25.8 | drawn as **night-ink proxies** at true length (size readable, no colour); a resident's name comes only from rumours and the Map Table; the Matriarch circling in the Bell Pool is exempt |
| 18 | a Marked Fish's hook-glint, a resident's identity | §25.6.7, §25.8.1 | the glint is only on its *shows* before the cast; it never appears in a play; the old hook shows at the reveal |
| 19 | Glowtide sparkle and Night Eyes | Wa1; Night Eyes' longer glow-trail range | neutral colour; scaled by class |
| 20 | the float's favour | `view.favour` (cleared at the hook, F13) | kept: species-independent during the wait (the maximum over the eligible pool); hidden from the strike on |
| 21 | audio driven by species | the reel ratchet and strain from tension (species power); `fishing:oldTrick` → `surge_warn` | driven by the play's beats (class-scaled) |
| 22 | screen readers and menus | aria labels on reel elements; the Journal / log | no aria text names the hooked species; no menu, log or Journal view highlights it; the log shows odds only for named or Glimpsed species |
| 23 | debug | `ctx.debug.fishing()`, `fishReel()`, scenario logs | dev-only (behind the debug flag); nothing in the release HUD |
| 24 | catch quality from reel skill | `computeQuality()` → `reel.qualityScore` | from the strike grade, a sign, bait or relic shimmer (§5.1); computed at the landing |
| 25 | play length from species stamina | `scaleDifficultyV3` stamina | **class and z only** (§4.2) |
| 26 | haptics | `navigator.vibrate` on surge warnings | class only (§8) |
| 27 | the Wick's pose and the rod bend from species tension | `actors` `strain`, `bendRod(tension)` | from the beat's class-scaled presentation tension |
| 28 | the bait-gated pool (the Gloam Eel needs Lumen Moss) | `speciesPool()` | allowed: knowing the pool is reading the water, not knowing what is on the line; the leap rule counts it |

---

## 7. What goes, what stays

| today's v3 build (P1 / P1b) | in automatic fishing |
|---|---|
| hold-to-reel, release-to-ease (`fishing.js` reeling input) | **removed** in v3 (v1 keeps it, flag off) |
| the tension model on the v3 path (`fishing-reel.js` `createReel` with v3 options: sweet band, easing by load, fatigue, drag absorb and slip, Spooled as a skill failure, Rod shock, slack grace) | **removed** from v3 play; replaced by a pure **play planner** (`planPlay(cls, z, seed, outcome)`, a new pure module beside `fishing-reel.js`). Spooled survives only as a staged loss cause |
| the reel line UI: the safe and sweet bands, the needle, the danger flare, the "Ease" surge glyph, the medal's progress ring, the species name, the rarity tint, "Hold to reel · release to ease" | **removed**. During a play the rod and the line *are* the HUD; on screen there is only the class estimate after a glimpse |
| hook-hold pips (logic, the medal ring, `fishing:pip`) | **removed** |
| old tricks as player-read events (the short warning, the 50/50 pull or leap read) | become the presentational **last stand** (§4.3) |
| the Elder fight UI (the old-trick glyph; the snag "ease" glyph outside legends) | **removed**; legend snags are staged beats |
| the class estimate after the breach | **kept**, now after the first glimpse (§4.5) |
| drag presets (Light / Set / Firm) | kept as a tackle choice that changes the land chance (`CATCH_V3.drag`: Light helps runners, Firm helps the rest), with its effect shown in the log; there is no in-play effect |
| the near-miss card ("Snapped at 84%", the skill tips) | **becomes the got-away note** (§5.3) |
| the test buoy (a tension-band practice fight, P3) | becomes a **practice float**: a bite every ≈ 3 s to practise strike timing, with the grade shown, and a sample play of any class on request; no fish, no reward, no odds |
| Angler boons and quirks that touched the fight (Patient Line, Steady Reel, Lucky Knot, Ashwick's "first surge telegraphed longer") | re-spec as land-chance or strike-window terms *(odds model, boons owner)*; Feather Touch keeps widening the strike window |
| reel-sim targets (novice / skilled / expert land rates, §25.6.9) | replaced by the odds tables in the log *(odds model)* |
| **kept unchanged:** signs, places, the float's favour and its notches, casting and the Clean Cast, nibbles and feints, the class bite tells, let it pass, true scale, the measuring ceremony, the catch card, records, Marked Fish, residents, Mark for home, night modes | |

---

## 8. Phone and desktop

| item | phone (390 px portrait) | desktop |
|---|---|---|
| **strike input** | a tap **anywhere in the world view** (not on a HUD control); the target is the whole screen, never the small float | left click anywhere in the world, or Space / Enter |
| the "!" over the float | 28 px ink glyph, plus the P1b tell pictogram beside it | 34 px |
| strike ring | 2 px ink ring starting at a 64 px radius around the float, closing over the window | the same, starting at 80 px |
| strike word | 17 px Marcellus SC under the float, 0.8 s | 19 px |
| class estimate | seal 30 px + word 17 px, centred just above the oil arc, stamps in and fades after 2.5 s | seal 36 px + word 19 px |
| got-away card | one column, 358 px wide (16 px gutters), in the top third (the raft sits ≈ 62% down); species name 22 px, body 17 px | two lines wide, max 560 px, top centre |
| got-away toast (Small / Keeper) | one line, 17 px, top third | 19 px |
| camera pan | one-finger drag | mouse drag |
| hurry (Small / Keeper) | hold anywhere | hold the mouse button or Space |
| cut the line | hold the joystick for 0.6 s | hold WASD for 0.6 s |
| haptics | bite "!": Small 10 ms · Keeper 15 · Prize 20 · Trophy 2 × 20 · Elder 2 × 35; strike grades as §3.3; one 40 ms buzz on a loss | — |

- **Readability with the sound off:** every tell, the "!", the strike grade, every beat and every loss cause reads visually (as §25.6.4 requires today).
- **Reduced motion:** no shake, no slow motion. A leap becomes a 0.4 s still of the silhouette at its apex; the brush-wipe reveal becomes a quick cross-fade.
- **Nothing overlaps the float** during the bite: HUD elements keep 60 px clear around it (the P1b rule for the favour notches).
- **Tap targets** stay ≥ 44 px (§21.6). The strike needs no target at all, so precision is never an issue on a phone.
- **Performance:** the proxy is one mesh, shared by every play, costing 1 draw call plus its outline; leaps reuse it; no new lights. The real model is created only at the reveal.

---

## 9. Proposed seams (for the CONTRACT §13 owner)

- **States:** `bite` → `reeling` (kept as the code name; players call it the play) → `landing` | `lost`. There is no input in `reeling` except hurry, cut and camera pan.
- **`fishing.view` during a play:** `play {t, dur, beat, k (presentation progress 0–1), line (presentation tension 0–1), bend, glimpse: bool, leap: bool}`, `sizeClass` (null until the first glimpse for Prize+, or the lift), `speciesId: null`, `rarity: null`, `strike: 'clean'|'struck'|'early'|'late'`. No odds field exists on the view at any time.
- **Events (new):** `fishing:strike {grade, sizeClass}` · `fishing:beat {beat, sizeClass, strength}` (audio, render and actors listen; it replaces `fishing:surge`, `fishing:oldTrick` and `fishing:pip` on v3) · `fishing:leap {sizeClass, length}` · `fish:got-away {speciesId, z, sizeClass, estLength, cause, name?, place, markedFish, strike}` for every class (it supersedes `fish:escaped-big`, whose listeners move over).
- **Events (changed):** `fishing:bite`, `fishing:tell` and `fishing:hook` carry no species (except legends); `fishing:hook` adds `{grade}` and keeps `perfect = grade === 'clean'` for the streak; `fishing:escaped` reasons gain `'spat'`, `'staggered'` and `'cut'`, and it fires after the loss beat.
- **Data (v3, behind the flag):** the strike terms stay in `CATCH_V3.strike` (the catch model); this document adds `SPECIES[].leap {chance, max, when}` (or the same values in `CATCH_V3.leaps`, reshaped) and `BALANCE.autofish {strike: {windows by class, cleanFrac, earlyGrace 0.3, lateGrace 0.3}, play: {per class: dur, runs, surges, glimpses, leapKind, lastStand, tow, bend, shake}, loss: {per cause: window}, proxy: {aspect: 4.2, minPx: 24}}`; `TEXT_V3.firstEvening`, `TEXT_V3.gotAway`; `TIPS_V3` entries from §1.4. Validator: the leap ambiguity rule (§4.6) and "no strike multiplier or term can lift the land chance to 1".

---

## 10. Acceptance checks (what QA scenarios verify)

1. **Species-blind play:** a forced Keeper Mossback Perch and a forced Keeper Reedjaw Pike with the same z, seed and outcome produce **identical** `fishing.view` traces and event streams from the strike to the reveal, with no species field anywhere.
2. **Outcome-blind first part:** the same seed forced to land and forced to lose gives identical traces up to `tLoss`, and `tLoss ≥ 0.5 × dur` for every cause.
3. **Never 1:** over 100,000 seeded strikes on full tackle with every favour and a Clean strike, no land chance is ≥ the cap, and some fish are lost.
4. **Durations:** plays fall inside §4.2's band per class (Small 2–3 s … Ancient 20–30 s), and length rises with z inside a class.
5. **No reel bar:** no element shows a species name, rarity tint or odds while `fishing.state` is `bite` or `reeling` (DOM text and aria scan), at 960×540 and 390 px portrait.
6. **The proxy:** while `reeling`, the scene holds the proxy mesh and no `createFish` model of the species; the proxy's length equals the species' true length (± 3%); the real model appears only during `landing`.
7. **Leaps:** a species with `leap.chance` 0 never leaps over 1,000 plays; the validator's leap ambiguity rule passes for every phase's roster, and fails a seeded bad case (a lake with one sole leaper).
8. **Strike grades:** taps at each timing give Early / Clean / Struck / Late with the §3.2 windows by class; no tap gives `passed` with the bait refunded.
9. **Got-away note:** every loss fires `fish:got-away` after the loss beat; Prize+ show the card with the species, class, a length within ±8% and a cause line; Small and Keeper show the one-line toast; no card or toast shows a percentage.
10. **First Evening:** a new save reaches the First Outing card in ≤ 75 s with a player who strikes on time; there is never more than one tip on screen; a forced Quayling loss shows its line and Murk's "Again." and the tutorial goes on; a second boot skips it.
11. **Flag off:** `validate-data`'s v1 fingerprint is unchanged and the v1 scenario-run passes with hold-to-reel exactly as today.

---

## 11. Open questions for the lead

1. **Hurry for small fish** (§4.10): on by default from the second expedition, or behind a setting? (Recommended: on, since commons land almost every time and short plays keep the loop brisk.)
2. **"Odds in your log" link on the got-away card** (§5.3): it respects "only in the log", because the player has to open the log, but it does point there right after a loss. Keep it, or show only the gear hint? (Recommended: keep. It is the moment the player most wants to know.)
3. **The First Evening slice** (§1.5) pulls a small piece of P3 (the cove's land, arch, hearth, barge, the Quayling, a pill post) into the next phase. Approve the pull-forward, or accept the in-lake fallback until P3?
