# The opening under the loop: New Descent to the first cast

*Binding design for the first minute of the Full Hold (`docs/loop/SPEC.md`, slice 1a). It covers the title, the New Descent
screen, Start, the cut scene "One Warm Light" (`docs/v3/intro/SPEC.md`, built), the hand-off to home, the tutorial at the
Jetty, the Chart and Sail, the glide out and the first trip's two hints. The build plan is `docs/loop/slice-1a/PLAN.md`
(§1.1 P12–P17, T59–T72, §5.5, PLAN CHOICEs 29–41, §7.3). Everything here is behind `LOOP_ENABLED`; the flag-off and
v3-without-loop builds keep their opening exactly as built (§10).*

## 0. The user's words (14 November 2026), verbatim

> "When you press new descent, make sure there aren't any other options to choose from other than different characters, we
> should only have one game mode which we've outlined in the new loop."

> "After youve pressed start, it should immediately go into the cut scene, then you move into the tutorial at the home base.
> Which ends with being shown how to head out to the lake"

Earlier words still in force: "Make sure the game starts with a very short tutorial and in a place thay makes sense for this
game to start in based on our lore. I do the want it to be that you're just in the game somewhere and you just start off
your own back." · "The UI is really cluttered, there's too much text on screen." · automatic fishing, odds only in the logs ·
creature attacks parked · no way to fail · every catch a win · never a ring or disc round the raft or the Wick · original work
only.

**The lead's reading (binding).** One game mode, the loop. New Descent shows only the choice of Wick and **Start**. Start goes
straight into the film. The film hands off to home (the Jetty), not to the lake. The tutorial is at home, very short, one line
at a time, and ends by showing how to head out: the Chart, the Mossmere, **Sail**, the glide out. Fishing is taught on the
first trip by the built light hints. Nothing traps the player, and a returning player never sees the tutorial again.

**The lead's default on the Wicks (the user may overrule).** All five Wicks are free from the first New Descent: each a look
and one small fishing trait (SPEC §10.1). The "joins you when" conditions are dropped, and the choice moves from "at home,
slice 9" to the New Descent screen in slice 1a. Their combat stats stay parked.
*The alternative, if the user wants Wicks to join over time:* the New Descent screen shows the one free Wick (the Wick) and
Start, with the four others as dark portraits with no words (or hidden). `LOOP.wicks[id].joins` holds §10.1's old conditions
(12 species in the Journal, the Sporewood map, 5 Trophies landed, a giant landed), read by a pure `wickJoined(meta, id)` in
`progression-loop.js`. Those conditions can only be met after the first New Descent, so changing Wick moves back home (a row on
the Journal's first page until the Landing's hearth exists), and only the Sporewood and giant joins wait on later slices.
Nothing else in this file changes.

## 1. The flow in one table

| # | step | on screen | words | advances on | time |
|---|---|---|---|---|---|
| 1 | the title, a fresh save | the logotype over the live lake | **New Descent** · **Settings** | New Descent | the player |
| 2 | New Descent | five Wicks in a row, one lit | the five names, the lit Wick's one trait line, **Back**, **Start** | Start (or Back) | the player |
| 3 | the film | "One Warm Light", as built | the film's four lines, **Skip** | the film's end, or Skip | 18 s (≈ 1 s skipped) |
| 4 | arrive | the raft glides from the film's last place to the first dock; the sky pales to dawn | none | the glide's end, or a tap | 3 s |
| 5 | wake | the Jetty; the **Chart** tile breathes; Murk and Journal dimmed | Murk: "Awake, little Wick? Good. Fish sell. Clams buy. That's the whole of it." | a tap on **Chart**; or the Chart opens by itself 3 s after the line | ≤ 9 s |
| 6 | the Chart | the Mossmere, chosen; three empty slots ink in; **Sail** breathes | Murk: "Three slots in that hold. Fill them and come home." | **Sail** (the player presses it) | ≈ 3 s |
| 7 | the glide out | the raft leaves the dock for open water | none | the glide's end, or a tap | 3 s |
| 8 | the first trip | the water; the hold; the Home pill | "Hold on the water. Let go to cast." once, then "Now. Tap." / "Now. Click." at the first bite | the player fishes | — |

From Start to the first cast: about 18 s of film (≈ 1 s skipped), then **≈ 17 s** of home with no taps, or **≈ 5 s** tapping
through. The home part is always under the 45 s aim and can never pass 60 s without the player choosing to wait on Sail.

## 2. The title

| save | the words | notes |
|---|---|---|
| **fresh** (the loop has not begun: no trip saved, no `meta.loop.wick`, no `meta.loop.tutorial`, no evening sold) | **New Descent** (primary, focused) · **Settings** (quiet) | no tagline, no premise paragraph, no counts, no Begin, Journal, Shrine or Trials. The film's stage prebuilds in idle time under this title (`prewarmIntro`, built), so Start costs nothing |
| **a trip out** | **Continue** (primary; no "Day N" sub-line) · **Settings** (quiet) · the quiet **Prologue** word in the lower line | Continue resumes the trip (built `continueRun`) |
| **at home** (the loop has begun, no trip out) | **Continue** · **Settings** · **Prologue** | Continue goes to the Jetty (`game.toHome()`); a tutorial not yet done resumes there |

- "Fresh" is a pure rule, `loopFreshSave(meta, hasSavedTrip)` (`loop-rules.js`). It does not read `meta.runs` or
  `meta.intro`: an old v3 save that never played the loop is fresh to the loop, gets the Wick choice and sees the film
  (skippable) and the tutorial once. Nothing is lost by beginning: the Journal and records are shared (SPEC §9).
- **No New Descent on a save with progress** (PLAN CHOICE 33). There is one mode, so there is nothing to choose again, and
  beginning again would cost clams and gear. Starting over is Settings' built **Forget everything** (two in-page confirms,
  never a browser dialog, then a fresh title with New Descent). Under the loop its words name what is lost: "Clams, gear,
  the Journal. There is no undo." and, in the first confirm, "Every clam, every piece of gear and every name in the Journal
  will be lost." The second confirm stays as built ("Truly?" · "The water will not remember you.").
- **Prologue** (built, `INTRO.trigger.replay.word`) replays the film and ends back at the title, writing nothing. It appears
  only on the Continue title, when `introReplayOffered()` (the film has been seen, or the save is an old v3 one).
- Settings is reachable everywhere (the lead's ruling 12): this title, the pause on the water, and Escape at home
  (**Resume** · **Settings**).

## 3. New Descent: only the Wick

The panel is `newdescent` (the built id) drawn by a loop-only render (`openLoopDescent`). It has **no heading and no
sub-line**, no night modes (no First Outing, Still, Lantern or Gloomtide cards), no waystone or start-water row, no trials or
locks, no start boon, kit, quirk, Shells, lore or tackle rating. All five Wicks are free (the lead's default).

**A card** (`button.gw-char[data-wick=<id>]`): the Wick's ink portrait (`wickPortrait(look)`, built) and its name, nothing
else. The lit card is raised, its flame lit and its ink full; the others are a shade dimmer. **Under the row, one line**: the lit
Wick's trait (SPEC §10.1 in a few words). One line at a time: moving the selection changes the line.

| Wick (`CHARACTERS[].name`) | the line (`TEXT_LOOP.wicks[id]`) | the trait (`LOOP.wicks[id]`, fishing only) |
|---|---|---|
| The Wick | Balanced. | none |
| Taper | Casts farther. More time to strike. | cast +4 m; strike window +10% |
| Stub | Sails faster. A wider light. | raft speed +1; light radius as the built Stub (+1.5 m) |
| Tallow | Sails slower. Holds big fish better. | raft speed −0.8; +2 Hold on a Trophy or bigger |
| Ashwick | Holds the first fish after dark better. | +3 Hold on the first fish hooked after dark each evening |

No trait touches the hold, the sale or the good bites. The built Wicks' other effects (Embers, oil, armour, the aura, rarity,
creel size), their quirks, boons and kits never apply on a trip.

**The foot:** **Back** (closes the panel, back to the title) and **Start** (primary, the flame glyph, focused).
**Keys:** ← → (and A D) move the selection; 1–5 pick a Wick; Enter presses Start; Escape is Back.
**Selection:** opens on the Wick (a fresh save has no other memory of a choice).

**Desktop 960×540** (the title's lake behind the panel's veil):

```
+------------------------------------------------------------------------------+
|                           G L O O M W A T E R  (logotype, under the veil)    |
|                                                                              |
|     +----------+  +==========+  +----------+  +----------+  +----------+     |
|     |          |  ||  lit   ||  |          |  |          |  |          |     |
|     | portrait |  || portrait|  | portrait |  | portrait |  | portrait |     |
|     |          |  ||        ||  |          |  |          |  |          |     |
|     | The Wick |  ||  Taper ||  |   Stub   |  |  Tallow  |  | Ashwick  |     |
|     +----------+  +==========+  +----------+  +----------+  +----------+     |
|                    Casts farther. More time to strike.                       |
|                                                                              |
|      Back                                                  [ (flame) Start ] |
+------------------------------------------------------------------------------+
  cards 128 x 164, gap 16, the row centred (704 px); the line 16 px under it; the foot in the lower 72 px
```

**Phone 390×844** (the lower half, in thumb reach; 16 px gutter; the foot above `--sab`):

```
+--------------------------------------+
|        G L O O M W A T E R           |
|        (the lake under the veil)     |
|                                      |
|                                      |
|                                      |
| +-----+ +=====+ +-----+ +-----+ +-----+
| |port.| ||lit|| |port.| |port.| |port.|   5 x 62 px, gap 7 (344 px)
| |The  | ||Tapr|| |Stub | |Tallw| |Ashwk|
| |Wick | |+===+| +-----+ +-----+ +-----+
|                                      |
|  Casts farther. More time to strike. |
|                                      |
|  [ Back ]   [     (flame) Start    ] |   both >= 56 px tall
+--------------------------------------+
```

The words on this screen are exactly: the five names, one trait line, **Back**, **Start**.

## 4. Start: straight into the film

**Start** (`ctx.game.beginIntro({character: id})`) in one press, with no loading screen:

1. The Wick is set: `meta.loop.wick = id` (in memory) and `actors.setCharacter(id)`, so the film shows the chosen Wick
   (the film uses the real player Wick: `getHeadPos`, `getRodTip`, `setIntroKindle`).
2. The title's picture **and the New Descent panel** are held for the opening ink (ui-intro's `takeTitle` holds both), so the
   panel never pops off before the ink closes over it.
3. `startIntro({replay: false})` (built): flow `intro`, the Mossmere under the ink, the film plays. **Skip** works as built
   (a veil skip in the first three beats, a 0.5 s finish in the last two).
4. Nothing is saved while the film plays (built). A tab closed during the film leaves a fresh save: the next visit shows New
   Descent again.

**No film** (a debug build without the intro opt-in, no `INTRO` data, or a film that cannot start): Start goes straight to
home (`enterHome('new')`: the raft at the first dock) and the tutorial begins at the wake. `meta.intro` is not touched, so the
film is still "not seen".

## 5. The hand-off: the glide to the Jetty

At `intro:done` the built hand-off marks the film seen and calls `startNewRun({__intro: true})`, which under the loop is
`enterHome('intro')`. No run is created.

- Flow `home`. The camera stays in the play camera's `'sail'` framing from the film's last frame (the film's last take already
  crane-fades into it), so nothing pops.
- Murk's barge is moored at the next dock as the glide starts (it is home before the raft is). The first save is written here
  (`meta.intro.seen`, `meta.loop.wick`, `meta.loop.tutorial = {done: false, step: 'arrive'}`).
- **The glide**: 3 s along the straight line from where the film left the raft (the Mossmere's spawn, x 0 z 46) to the first
  dock (x 24 z 38): 25.3 m, 7 m clear of the nearest statue. The sky eases from the lake's night toward home's dawn look.
  A tap (or a skip key) ends it at the dock (`player.teleport` to the dock).
- After a veil skip the ink opens on the first frame of this glide; after a finish skip the glide follows the fast finish.

## 6. The tutorial at home: the Jetty and the Chart

**Where, in the lore.** The Jetty is the last water's first dock at dawn, Murk's barge moored, your raft tied up (SPEC §6.1):
the dock where the last Wicks came ashore and where Murk keeps the only shop left. The Wick wakes here; Murk is the first voice.

**The rules.** One line at a time, Murk's own lines from the spec. No Skip word: every beat ends on its own tap or a short
wait. No pointer, arrow, ring or disc anywhere in the world; a cue is a soft ink "breathe" inside a tile's or a button's own
bounds (a static gold edge under reduced motion). The goal line is not drawn while the tutorial runs. The purse shows 0. The
tutorial clock (`loop-tutorial.js`, pure) runs on real time and only while the Jetty or the Chart is the top screen.

| beat | on screen | the one line | advances on | budget |
|---|---|---|---|---|
| **arrive** | the glide (§5) | none | its end, or a tap | 3 s |
| **wake** | the Jetty: **Murk** · **Chart** · **Journal**; the Chart tile breathes; Murk and Journal are dimmed but live; the purse, top-right | "Awake, little Wick? Good. Fish sell. Clams buy. That's the whole of it." (§11; held 5.95 s, Murk's grumble) | a tap on **Chart** at any moment. A tap elsewhere ends the line early. 3 s after the line ends, the Chart opens by itself | ≤ 9 s |
| **chart** | the Chart: one row, **The Mossmere**, already chosen; under it the hold's three empty slots ink in one by one (0.25 s apart) as the line appears; **Sail** breathes and is live from the first frame | "Three slots in that hold. Fill them and come home." (§8.6, said once) | **Sail**, pressed by the player (never for them). Escape goes back to the Jetty, where the Chart tile still breathes | the player; ≈ 3 s |
| **out** | the screens close; the glide out (§7) | none | its end, or a tap | 3 s |

- The Murk and Journal tiles stay live: a curious player may open the shelf or the Journal and come back; the cue waits.
- Escape at the Jetty opens **Resume** · **Settings** (ruling 12); the tutorial clock waits under it.
- **Done** is written the moment Sail is pressed, before anything moves: `meta.loop.tutorial = {done: true, step: null}`
  and a save. A reload after that never sees the tutorial.
- **A reload mid-tutorial** (arrive, wake or chart): the title shows **Continue** → the Jetty → the tutorial resumes at the
  wake (the line once more; no glide).
- Fishing is not taught at home.

**The Jetty, desktop 960×540, the wake:**

```
+------------------------------------------------------------------------------+
|                                                                  (clam) 0    |
|        (the first dock at dawn, the raft tied up, Murk's barge moored)       |
|                                                                              |
|                                                                              |
|   Awake, little Wick? Good. Fish sell. Clams buy. That's the whole of it.    |
|                                                                              |
|      [  Murk  ]  (dim)        [  Chart  ]  (breathes)    [ Journal ]  (dim)  |
+------------------------------------------------------------------------------+
```

**The Chart, desktop 960×540:**

```
+------------------------------------------------------------------------------+
|                                                                              |
|          Three slots in that hold. Fill them and come home.                  |
|                                                                              |
|          +------------------------------------------------------+            |
|          |  The Mossmere                                  (on)  |            |
|          |  [   ]  [   ]  [   ]     the hold, inked in one by one|            |
|          +------------------------------------------------------+            |
|                                                      [  Sail  ]  (breathes)  |
+------------------------------------------------------------------------------+
```

**Phone 390×844:** the Jetty's tiles in a column in the lower half (each ≥ 56 px, 16 px gutter), Murk's line above them, the
purse under the safe-area top. The Chart is one card in the lower half with the line above it and **Sail** full width
(≥ 56 px) at the bottom.

## 7. The glide out (every Sail)

Sail → `ctx.game.sail({water: 'mossmere'})`: the screens close, then a **3 s glide** in flow `home` from the dock 15 m toward
the lake's centre (the Mossmere: x 24 z 38 → x 16 z 25.3, 12 m clear of the statue), the camera in `'sail'`. At its end (or a
tap: the raft jumps to the end) the trip starts in place: flow `playing`, `zone:change {sail: true}`, `run:start`, the raft
keeps its place (no jump back to the lake's spawn). This happens on every Sail, not only the first, so leaving home always
looks the same: this is "being shown how to head out to the lake". The path is data (`LOOP.tutorial.outPath[lake]`, checked
for clearance by `validate-data --loop`).

## 8. The first trip: the built light hints

Fishing is taught on the water, on evening 1 only (the loop's counters read the evening, PLAN T55):

- **the key glyphs** (`.gw-hints`, built) and **the strike ring** on the float (built; the float's own timing mark, never round
  the raft or the Wick);
- **two words**, each once per save (`meta.seenTips`): "Hold on the water. Let go to cast." (`FIRST_EVENING.tips.fe_cast`),
  1.5 s after the trip starts while the line is idle, gone at the first cast; and "Now. Tap." / "Now. Click."
  (`fe_strike`), in the first bite's strike window, gone at the strike or the miss. These are the only tips the loop shows
  (PLAN CHOICE 39, amending CHOICE 8).
- No other word: no banner, no lore toast at the Sail, no Murk line on the first trip until the card (§8.6's lines as planned).

## 9. What a returning player sees

| the save | the title | after Continue |
|---|---|---|
| a trip out | Continue · Settings · Prologue | the trip, as saved |
| at home, tutorial done | Continue · Settings · Prologue | the Jetty (the tally first if one is unseen), the goal line, no cue |
| at home, tutorial not done (closed mid-tutorial) | Continue · Settings (· Prologue if the film was seen) | the Jetty, the tutorial from the wake |
| a wiped save | New Descent · Settings | the whole opening again |

## 10. The save fields

New keys in `meta.loop` (lane A; `freshLoop` sets both to `null`; `migrateLoop` gives a block with `evenings > 0` and no
tutorial `{done: true, step: null}` and `wick: 'wick'`):

```json
{
  "loop": { "v": 3, "clams": 0, "evenings": 0, "holdSlots": 3, "wick": "taper",
            "tutorial": { "done": false, "step": "wake" }, "said": {}, "...": "the rest of SPEC §9's block" },
  "intro": { "seen": true, "skipped": true },
  "seenTips": { "fe_cast": true }
}
```

- `meta.loop.wick`: the Wick chosen at New Descent (`'wick' | 'taper' | 'stub' | 'tallow' | 'ashwick'`); every trip is created
  with it (`run.character`); the title and home show it. It stays until a start-over.
- `meta.loop.tutorial`: `null` before the opening, `{done: false, step}` during it (`step` is a readout; a resume always
  starts at the wake), `{done: true, step: null}` from Sail on.
- `meta.intro` is the film's own record (built, `markIntroSeen`). `meta.seenTips` is the built tip record.
- Never written under the loop, as before: `meta.runs`, `meta.lastCharacter` (PLAN CHOICE 3), `meta.firstEvening`.

## 11. What the flag-off and v3-without-loop builds keep

Exactly what they have today: the title with Begin on a fresh v3 save (film → First Outing), New Descent with its Wick detail,
night-mode step, waystones and locked Wicks, the premise and the counts, Journal, Shrine and Trials on the title, the Wicks'
built effects and trial unlocks, and every tip. Every change above is behind `LOOP_ENABLED` and reads `meta.loop`, which only
a loop build writes.
