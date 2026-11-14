# The opening under the loop: New Descent to the first cast

*Binding design for the first minute of the Full Hold (`docs/loop/SPEC.md`, slice 1a). It covers the title, the New Descent
screen, Start, the cut scene "One Warm Light" (`docs/v3/intro/SPEC.md`, built), the hand-off to home, the tutorial at the
Jetty, the Chart and Sail, the glide out and the first trip's two hints. The build plan is `docs/loop/slice-1a/PLAN.md`
(§1.1 P12–P17, T59–T75, §5.5, PLAN CHOICEs 29–46, §7.1, §7.3). Everything here is behind `LOOP_ENABLED`; the flag-off and
v3-without-loop builds keep their opening exactly as built (§11). Revision 2 of this file applies the critics' review (the
review log is at the end).*

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

*The alternative, if the user wants Wicks to join over time.* The New Descent screen shows **only the Wick** and **Start**:
the four others are **hidden** (not dark cards: a dark card is a lock, and the panel shows none). `LOOP.wicks[id].joins` holds
§10.1's old conditions (12 species in the Journal for Taper, the Sporewood map bought for Stub, 5 Trophies landed for
Tallow, a giant landed for Ashwick), read by a pure `wickJoined(meta, id)` in `progression-loop.js`. Those conditions can
only be met after the first New Descent, so the choice of a joined Wick moves home (a Wick row on the Journal's first page
until the Landing's hearth exists). In 1a only Tallow's join is reachable: the phase-1 Mossmere has 8 species, of which the
Gloam Eel needs bait and the Matriarch cannot bite, so Taper's 12 species wait on slice 1b, Stub's map on 1b and Ashwick's
giant on slice 2. What this alternative amends: here §1 row 2, §3 (one card and the Start button; no trait line, as the Wick
has none) and §10; in PLAN, T59 (one `[data-wick]`), T60, CHOICE 30 and §2.3 item 5's `openLoopDescent`, plus a Journal row
for lane C; in SPEC, §8.5's New Descent row and §10.1.

## 1. The flow in one table

| # | step | on screen | words | advances on | time |
|---|---|---|---|---|---|
| 1 | the title, a fresh save | the logotype over the live lake | **New Descent** · **Settings** | New Descent | the player |
| 2 | New Descent | five Wicks (a row on desktop, 3 + 2 on a phone), one lit | the five names, the lit Wick's one trait line, **Back**, **Start** | Start (or Back) | the player |
| 3 | the film | "One Warm Light", as built | the film's four lines, **Skip** | the film's end, or Skip | 18 s (≈ 1 s skipped) |
| 4 | arrive | the raft glides from the film's last place to the Jetty's dock; the sky pales to dawn | none | the glide's end, or a tap | 3 s |
| 5 | wake | the Jetty; the **Chart** tile breathes; Murk and Journal dimmed | Murk: "Awake, little Wick? Good. Fish sell. Clams buy. That's the whole of it." | a tap on **Chart**; or the Chart opens by itself 3 s after the line (once) | ≤ 9 s |
| 6 | the Chart | the Mossmere, chosen; three empty slots ink in; **Sail** breathes | Murk: "Three slots in that hold. Fill them and come home." | **Sail** (the player presses it) | ≈ 3 s |
| 7 | the glide out | the raft leaves the dock for open water | none | the glide's end, or a tap | 3 s |
| 8 | the first trip | the water; the hold; the Home pill | "Hold on the water. Let go to cast." once, then "Now. Tap." / "Now. Click." at the first bite | the player fishes | — |

From Start to the first cast: about 18 s of film (≈ 1 s skipped), then **≈ 17.5 s** of home with no taps, or **≈ 5 s**
tapping through. The home part is always under the 45 s aim and can never pass 60 s without the player choosing to wait on
Sail.

## 2. The title

| save | the words | notes |
|---|---|---|
| **fresh** (the loop has not begun: no trip saved, no `meta.loop.wick`, no `meta.loop.tutorial`, no evening sold) | **New Descent** (primary, focused) · **Settings** (quiet) | no tagline, no premise paragraph, no counts, no Begin, Journal, Shrine or Trials. The film's stage prebuilds in idle time under this title (`prewarmIntro`, built), so Start costs nothing |
| **a trip out** | **Continue** (primary; no "Day N" sub-line) · **Settings** (quiet) · the quiet **Prologue** word in the lower line | Continue resumes the trip (built `continueRun`) |
| **at home** (the loop has begun, no trip out) | **Continue** · **Settings** · **Prologue** | Continue goes to the Jetty (`game.toHome()`); a tutorial not yet done resumes there |

- "Fresh" is a pure rule, `loopFreshSave(meta, hasSavedTrip)` (`loop-rules.js`). It does not read `meta.runs` or
  `meta.intro`: an old v3 save that never played the loop is fresh to the loop, gets the Wick choice and sees the film
  (skippable) and the tutorial once. Nothing is lost by beginning: the Journal and records are shared (SPEC §9).
- **No New Descent on a save with progress, at home included** (PLAN CHOICE 33, the lead asked for this to be decided).
  There is one mode, so there is nothing to choose again, and beginning again would cost clams and gear. Starting over is
  Settings' built **Forget everything** (two in-page confirms, never a browser dialog, then a fresh title with New Descent).
  Under the loop its words name what is lost. **Proposed** (new words, for the lead's sign-off, PLAN §7.1): the row's small
  line "Clams, gear, the Journal. There is no undo." and the first confirm's line "Every clam, every piece of gear and every
  name in the Journal will be lost." (the built lines name Memories, relics and trials, which the loop parks). The second
  confirm stays as built ("Truly?" · "The water will not remember you.").
- **Settings under the loop** (PLAN CHOICE 43): Settings is now one of the two words on a fresh title, so it is the first
  panel a new player may open. Under the loop it hides the parked rows (**Damage numbers**, and the "Softer flares and hit
  flashes" line under Reduced flashing), and the strike-ring option and the hurry line say *evening*, not *outing* ("First
  evening"; "From your second evening, hold anywhere to hurry a small fish in. It never changes the outcome"). Everything
  else in Settings is as built.
- **Prologue** (built, `INTRO.trigger.replay.word`) replays the film and ends back at the title, writing nothing. It appears
  only on the Continue title, when `introReplayOffered()` (the film has been seen, or the save is an old v3 one).
- Settings is reachable everywhere (the lead's ruling 12): this title, the pause on the water, and at home (§6: Escape, or
  the quiet pause glyph in the Jetty's corner on a phone, opens **Resume** · **Settings**).

## 3. New Descent: only the Wick

The panel is `newdescent` (the built id) drawn by a loop-only render (`openLoopDescent`). It has **no heading and no
sub-line and no ✕** (the built panel's close button is off: Back and Escape close it), no night modes (no First Outing,
Still, Lantern or Gloomtide cards), no waystone or start-water row, no trials or locks, no start boon, kit, quirk, Shells,
lore or tackle rating. All five Wicks are free (the lead's default).

**A card** (`button.gw-char[data-wick=<id>]`): the Wick's ink portrait (`wickPortrait(look)`, built) and its name. The lit
card is raised, its flame lit and its ink full; the others are a shade dimmer. **Under the cards, one line**: the lit Wick's
trait (SPEC §10.1 in a few words). This amends the lead's reading, which put the trait on each card: five trait lines at
once would be five lines of text on one screen, against "too much text on screen", so only the lit Wick's line shows and
moving the selection changes it (PLAN CHOICE 42). Names wrap onto a second line when they must; they are never truncated
or shrunk below the panel's body size.

| Wick (`CHARACTERS[].name`) | the line (`TEXT_LOOP.wicks[id]`; **proposed**, for the lead's sign-off) | the trait (`LOOP.wicks[id]`, fishing only) |
|---|---|---|
| The Wick | Balanced. | none |
| Taper | Casts farther. More time to strike. | cast +4 m; strike window +10% |
| Stub | Sails faster. A wider light. | raft speed +1; light radius as the built Stub (+1.5 m) |
| Tallow | Sails slower. Holds big fish better. | raft speed −0.8; +2 Hold on a Trophy or bigger |
| Ashwick | Holds the first fish after dark better. | +3 Hold on the first fish hooked after dark each evening |

The five lines are new words this plan proposes (the user asked for "different characters"; the lead asked for the trait
"in a few words"); the names and the traits are SPEC §10.1's. No trait touches the hold, the sale or the good bites. The
built Wicks' other effects (Embers, oil, armour, the aura, rarity, creel size), their quirks, boons and kits never apply on
a trip.

**The foot:** **Back** (closes the panel, back to the title; a new word, proposed) and **Start** (primary, the flame glyph,
focused). **Keys:** ← → (and A D) move the selection; 1–5 pick a Wick; Enter presses Start; Escape is Back.
**Selection:** opens on the Wick (a fresh save has no other memory of a choice).

**The choice lasts for this save.** Under the lead's default nothing at home changes the Wick in 1a; a start-over (Forget
everything) offers New Descent again. The panel says nothing about this (no extra words). Whether the Wick should be
changeable later without starting over is a question for the user (PLAN §7.1, with the cheap way to build it).

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
  cards 128 x 164, gap 16, the row centred (5 x 128 + 4 x 16 = 704 px); the line 16 px under it; the foot in the lower 72 px
```

**Phone 390×844** (the lower half, in thumb reach; 16 px gutter, so 358 px of width; the foot above `--sab`). The cards are
a 3 + 2 grid so each portrait reads as a look (a row of five would leave 62 px per card):

```
+--------------------------------------+
|        G L O O M W A T E R           |
|        (the lake under the veil)     |
|                                      |
|                                      |
|  +--------+ +========+ +--------+    |   3 x 104 px + 2 x 12 px gap = 336 px
|  |portrait| ||portrait|| |portrait|  |   cards 104 x 128
|  |  The   | || Taper  || |  Stub  |  |   ("The Wick" wraps to two lines)
|  |  Wick  | |+========+| +--------+  |
|  +--------+                          |
|       +--------+ +--------+          |   the second row centred
|       |portrait| |portrait|          |
|       | Tallow | | Ashwick|          |
|       +--------+ +--------+          |
|                                      |
|  Casts farther. More time to strike. |
|                                      |
|  [ Back ]   [     (flame) Start    ] |   both >= 56 px tall
+--------------------------------------+
```

Height: 2 × 128 + 12 + 24 (the line) + 16 + 56 (the foot) + 32 of gaps ≈ 396 px, inside the lower half (422 px).
The words on this screen are exactly: the five names, one trait line, **Back**, **Start**.

## 4. Start: straight into the film

**Start** (`ctx.game.beginIntro({character: id})`) in one press, with no loading screen:

1. The Wick is set: `meta.loop.wick = id` (in memory) and `actors.setCharacter(id)`, so the film shows the chosen Wick
   (the film uses the real player Wick: `getHeadPos`, `getRodTip`, `setIntroKindle`).
2. The title's picture **and the New Descent panel** are held for the opening ink (ui-intro's `takeTitle` holds both, under
   the loop only), so the panel never pops off before the ink closes over it.
3. `startIntro({replay: false})` (built): flow `intro`, the Mossmere under the ink, the film plays. **Skip** works as built
   (a veil skip in the first three beats, a 0.5 s finish in the last two).
4. Nothing is saved while the film plays (built: `game.save()` returns in flow `intro`). A tab closed during the film leaves
   a fresh save: the next visit shows New Descent again. If the film is abandoned back to the title (main's 1.5 s idle valve,
   or a film that could not start), the in-memory Wick is cleared too, so the title is still fresh and New Descent is
   offered again (PLAN CHOICE 46).

**No film** (a debug build without the intro opt-in, no `INTRO` data, or a film that cannot start): Start goes straight to
home (`enterHome('new')`: the raft at the Jetty's dock) and the tutorial begins at the wake. `meta.intro` is not touched, so
the film is still "not seen".

## 5. The hand-off: the glide to the Jetty

At `intro:done` the built hand-off marks the film seen and calls `startNewRun({__intro: true})`, which under the loop is
`enterHome('intro')`. No run is created.

- Flow `home`. The camera stays in the play camera's `'sail'` framing from the film's last frame (the film's last take already
  crane-fades into it), so nothing pops. The lake's grade eases in from `onIntroDone`'s one guarded line, as built.
- Murk's barge is moored as the glide starts (he is home before the raft is). The first save is written here
  (`meta.intro.seen`, `meta.loop.wick`, `meta.loop.tutorial = {done: false, step: 'arrive'}`).
- **The glide**: 3 s along the straight line from where the film left the raft (the Mossmere's spawn, x 0 z 46) to the
  Jetty's dock, the lake's first dock (x 24 z 38): 25.3 m, 7 m clear of the nearest statue. The sky eases from the lake's
  night toward home's dawn look. A tap, Enter or Space (or Escape, since no screen is up yet) ends it at the dock.
- After a veil skip the ink opens on the first frame of this glide; after a finish skip the glide follows the fast finish.
  The film's swallow guard (`INTRO.skip.after`) keeps a double press of the skip key from also ending the glide.

## 6. The tutorial at home: the Jetty and the Chart

**Where, in the lore, and the gap.** The Jetty is SPEC §6.1's slice-1a home: the last water's first dock at dawn, Murk's
barge moored, your raft tied up; Murk keeps the only shop left there, and it is where fish become clams. It is **not** the
place the lore names for a beginning. DESIGN §25.4.8 puts that at **the Landing**, the cove where the last Wicks came
ashore, and keeps "the Mossmere's drowned ferry harbour at Murk's day-1 dock" only as its fallback F0, because that is still
"in the game somewhere". The Jetty is that fallback, and nothing on screen gives a lore reason for the dock (the film's four
lines name no place). This is a **known gap** against the user's earlier words ("in a place thay makes sense for this game
to start in based on our lore"), accepted for slice 1a because the cove world is not built (`world.SUPPORTS_COVE` is
false). **Slice 4 fixes it:** the Landing replaces the Jetty as home, and the same tutorial beats move onto its posts. What
the Jetty does give the user's words: the game never starts "in the game somewhere" on the lake; it starts at home, with
Murk as the first voice, and the lake is something you are shown how to reach. The gap is recorded in PLAN §7.3 and put to
the user in PLAN §7.1.

**The rules.** One line at a time, Murk's own lines from the spec. No Skip word: every beat ends on its own tap or a short
wait. No pointer, arrow, ring or disc anywhere in the world; a cue is a soft ink "breathe" inside a tile's or a button's own
bounds (a static gold edge under reduced motion). The goal line is not drawn while the tutorial runs. The purse shows 0. The
tutorial clock (`loop-tutorial.js`, pure) runs on real time and only while the Jetty or the Chart is the top screen.

| beat | on screen | the one line | advances on | budget |
|---|---|---|---|---|
| **arrive** | the glide (§5) | none | its end, or a tap | 3 s |
| **wake** | the Jetty: **Murk** · **Chart** · **Journal**; the Chart tile breathes; Murk and Journal are dimmed but live; the purse, top-right; the quiet pause glyph, top-left | "Awake, little Wick? Good. Fish sell. Clams buy. That's the whole of it." (SPEC §11; held 5.95 s, Murk's grumble) | a tap on **Chart** at any moment. A tap elsewhere ends the line early. 3 s after the line ends, the Chart opens by itself, **once**: after the player has backed out of the Chart it never opens itself again, and only the tile's breathe remains | ≤ 9 s |
| **chart** | the Chart: one row, **The Mossmere**, already chosen; under it the hold's three empty slots ink in one by one (0.25 s apart) as the line appears; **Sail** breathes and is live from the first frame | "Three slots in that hold. Fill them and come home." (§8.6). Shown by the tutorial every time the Chart opens before the first Sail, so a reload or a step back never loses it | **Sail**, pressed by the player (never for them). Escape goes back to the Jetty, where the Chart tile still breathes | the player; ≈ 3 s |
| **out** | the screens close; the glide out (§7) | none | its end, or a tap | 3 s |

- The Murk and Journal tiles stay live: a curious player may open the shelf or the Journal and come back; the cue waits.
- **Escape at the Jetty** opens **Resume** · **Settings** (ruling 12); a phone has the same panel behind the quiet pause
  glyph (the built pause glyph, no word) in the Jetty's top-left corner. The tutorial clock waits under it. Resume returns
  to the Jetty as it was.
- **Done** is written the moment Sail is pressed, before anything moves: `meta.loop.tutorial = {done: true, step: null}`,
  `meta.loop.said.firstChart = true`, and a save. A reload after that never sees the tutorial.
- **A reload mid-tutorial** (arrive, wake or chart): the title shows **Continue** → the Jetty → the tutorial resumes at the
  wake (the line once more; no glide; the Chart's departure line again when it opens).
- Fishing is not taught at home.

**The Jetty, desktop 960×540, the wake:**

```
+------------------------------------------------------------------------------+
| (pause glyph)                                                    (clam) 0    |
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
purse and the pause glyph under the safe-area top. The Chart is one card in the lower half with the line above it and
**Sail** full width (≥ 56 px) at the bottom.

## 7. The glide out (every Sail)

**Home is always the Jetty's dock** (`docks[0]`, PLAN CHOICE 44): the sail home ends there (its 2 s glide heads for it and
the raft is placed there as the tally opens), and `enterHome('title')` and `enterHome('new')` put the raft there too. So
every Sail starts from the same place, and the glide out never begins with a jump.

Sail → `ctx.game.sail({water: 'mossmere'})`: the screens close, then a **3 s glide** in flow `home` from the dock 15 m toward
the lake's centre (the Mossmere: x 24 z 38 → x 16 z 25.3, 12 m clear of the statue), the camera in `'sail'`. At its end (or a
tap, Enter or Space: the raft jumps to the end) the trip starts in place: flow `playing`, `zone:change {sail: true}`,
`run:start`, the raft keeps its place (no jump back to the lake's spawn). This happens on every Sail, not only the first, so
leaving home always looks the same: this is "being shown how to head out to the lake" (PLAN CHOICE 38; whether later Sails
should skip it is put to the lead in PLAN §7.1). The path is data (`LOOP.tutorial.outPath[lake]`, or the `outDist` rule,
both through one pure `sailPlan` in `data.js` that the game and `validate-data --loop` share).

## 8. The first trip: the built light hints

Fishing is taught on the water, on evening 1 only (the loop's counters read the evening, PLAN T55):

- **the key glyphs** (`.gw-hints`, built) and **the strike ring** on the float (built; the float's own timing mark, never round
  the raft or the Wick);
- **two words**, each once per save (`meta.seenTips`): "Hold on the water. Let go to cast." (`FIRST_EVENING.tips.fe_cast`,
  a built word), 1.5 s after the trip starts while the line is idle, gone at the first cast; and "Now. Tap." / "Now.
  Click." (`fe_strike`, built), in the first bite's strike window, gone at the strike or the miss. These are the only tips
  the loop shows (PLAN CHOICE 39, amending CHOICE 8), and SPEC §8.5's opening rows list them, so §8 stays the whole text.
- No other word: no banner, no lore toast at the Sail, no Murk line on the first trip until the card (§8.6's lines as planned).

## 9. What a returning player sees

| the save | the title | after Continue |
|---|---|---|
| a trip out | Continue · Settings · Prologue | the trip, as saved |
| at home, tutorial done | Continue · Settings · Prologue | the Jetty (the tally first if one is unseen), the goal line, no cue |
| at home, tutorial not done (closed mid-tutorial) | Continue · Settings (· Prologue if the film was seen) | the Jetty, the tutorial from the wake |
| a wiped save | New Descent · Settings | the whole opening again |

## 10. The save fields

New keys in `meta.loop` (lane A; `freshLoop` sets both to `null`; `migrateLoop` gives a block that has sold an evening, has
a `lastTrip`, or comes with a saved trip `tutorial {done: true, step: null}` and `wick: 'wick'`):

```json
{
  "loop": { "v": 3, "clams": 0, "evenings": 0, "holdSlots": 3, "wick": "taper",
            "tutorial": { "done": false, "step": "wake" }, "said": {}, "...": "the rest of SPEC §9's block" },
  "intro": { "seen": true, "skipped": true },
  "seenTips": { "fe_cast": true }
}
```

- `meta.loop.wick`: the Wick chosen at New Descent (`'wick' | 'taper' | 'stub' | 'tallow' | 'ashwick'`); every trip is created
  with it (`run.character`); the title and home show it. It stays until a start-over. Migrated loop blocks (only earlier
  loop test builds wrote them) get `'wick'` and no choice.
- `meta.loop.tutorial`: `null` before the opening, `{done: false, step}` during it (`step` is a readout; a resume always
  starts at the wake), `{done: true, step: null}` from Sail on.
- `meta.loop.said.firstChart` is written at the first Sail (with `tutorial.done`), not when the line is first shown.
- `meta.intro` is the film's own record (built, `markIntroSeen`). `meta.seenTips` is the built tip record.
- Never written under the loop, as before: `meta.runs`, `meta.lastCharacter` (PLAN CHOICE 3), `meta.firstEvening`.

## 11. What the flag-off and v3-without-loop builds keep

Exactly what they have today: the title with Begin on a fresh v3 save (film → First Outing), New Descent with its Wick detail,
night-mode step, waystones and locked Wicks, the premise and the counts, Journal, Shrine and Trials on the title, the Wicks'
built effects and trial unlocks, the built Settings rows, and every tip. Every change above is behind `LOOP_ENABLED` and
reads `meta.loop`, which only a loop build writes; the ui-intro hold of the New Descent panel is behind `LOOP_ENABLED` too.

## Review log (revision 2 of this file, 14 November 2026)

The critics' 27 findings on commit a13bb87, each checked against the code on the base (`ccr-87831d14-8jseye` at 3292886,
which now carries `gw-intro` and `gw-loop-waters`), `gw-show` as committed, and a trial merge of the two (`git merge-tree`).
The branch first merged the base (so SPEC is v7.1 here). PLAN's own review log (revision 4) carries the same rows with the
PLAN-side detail; this table says what changed in this file and in SPEC.

| # | finding (severity) | verdict | what was done |
|---|---|---|---|
| 1 | The Jetty is called the place where the last Wicks came ashore; DESIGN §25.4.8 gives that to the Landing and calls the dock fallback F0 (major) | applied | §6 rewritten: the Jetty is Murk's dock, slice 1a's home; the lore gap is stated and slice 4 named as the fix; PLAN §7.3 records the gap; PLAN §7.1 puts it to the user |
| 2 | New on-screen lines missing from SPEC §8 (wake line, the two tips, the Forget lines, the glide out) (major) | applied, within the sections this branch may edit | SPEC §8.5 gains an "opening and first trip" table listing every new word and the wordless glide out, so §8 is again the whole text; a pointer to it for §8.1, §8.3 and §8.6 is left to the lead (those sections are outside this branch's remit); PLAN's header sentence corrected |
| 3 | Composed words credited to the user (trait lines, Back, the Forget lines, the title layouts) (major) | applied | SPEC rows re-tagged "(14 November 2026, the user's ruling; the wording is a proposal, PLAN CHOICE n)"; here every new word is marked "proposed"; PLAN §7.1 lists them for the lead's sign-off |
| 4 | The first Wick is permanent; not put to the user (major) | applied | §3 says the choice lasts for the save; PLAN §7.1 asks the user, with the cheap build (a Wick row on the Journal's first page) written out; migrated blocks stated in §10 |
| 5 | Trait under the row departs from the lead's reading; phone names truncated; 344 px wrong (minor) | applied | PLAN CHOICE 42; the phone becomes a 3 + 2 grid of 104 px cards, names wrap and never truncate; the sums are 704 and 336 px |
| 6 | T57 says Esc on the Jetty does nothing (minor) | applied | T57 rewritten in PLAN |
| 7 | After Esc from the Chart the auto-open could re-fire (minor) | applied | the auto-open fires once; T65 covers it |
| 8 | The glide on every Sail not put to the lead (minor) | applied | kept; PLAN §7.1 asks, with the first-Sail-only alternative |
| 9 | Settings shows parked rows and "outing" words (minor) | applied | §2 and PLAN CHOICE 43, T74 |
| 10 | SPEC §2.1 and slice 9 contradict §10.1 (minor) | applied in part | §10.1 now says slice 9's "four other Wicks" item is struck by this revision; §2.1, the slice 9 cell and §10's row are outside this branch's remit and are listed for the lead |
| 11 | The alternative's "dark portraits" are locks; "nothing else changes" is wrong (minor) | applied | §0: hidden; the sections and tests it amends are listed |
| 12 | Escape at home has no lane, function or test; no phone path (major) | applied | §6: Escape and a quiet pause glyph open Resume · Settings; PLAN lane C item, T57, T73 |
| 13 | The glide out starts at docks[0] but the sail home parks at the nearest dock (major) | applied | §7: home is always docks[0] (PLAN CHOICE 44), T66 checks the start |
| 14 | `sayOnce` loses the departure line after a reload or an Esc; two owners (major) | applied | §6: the tutorial shows the line every time before the first Sail; `said.firstChart` written at Sail (§10) |
| 15 | `player.glide` has no `kind` option (minor) | applied | PLAN lane B adds it |
| 16 | A tap in flow `home` never reaches the glide skip; no skip key (minor) | applied | PLAN lane B: `pressAction` and keydown branches for a home glide; §5 and §7 name the keys |
| 17 | `loopWickId` built twice (minor) | applied | one `data.js` export (PLAN) |
| 18 | `fakeLoop` lacks `beginTutorial`; a call without `?.` (minor) | applied | PLAN §2.0 and lane B item 7 |
| 19 | An abandoned film leaves the Wick set and the tutorial null (minor) | applied | §4 and PLAN CHOICE 46; `enterHome` begins the tutorial from any `from`; migration covers saved trips and `lastTrip` |
| 20 | The ui-intro hold is not behind the flag (minor) | applied | §4 and §11; PLAN lane C item 9 |
| 21 | Two places set the hand-off grade (minor) | applied | only `onIntroDone`'s guarded line (§5, PLAN) |
| 22 | `validate-data` cannot check B's `sailPlan` (minor) | applied | `sailPlan` moves to `data.js` in S2 (§7, PLAN) |
| 23 | Stale base and line numbers; index.html conflict missing (minor) | applied | PLAN header and §6.3 step 0 refreshed (M = 3292886 + `gw-show`); Settings cited as base:1520 / M:1586 |
| 24 | Three of the four joins wait on later slices, not two (minor) | applied | §0 |
| 25 | SPEC slice 9 and §10's row after the waters merge (minor) | applied in part | as row 10: §10.1 carries the strike; slice 9 and §10's row are for the lead |
| 26 | The sim and its gates run only for the Wick; trait odds never in a log (minor) | applied | PLAN §6.4 runs the 1 h and choosy checks per Wick; the logs' built rule (tackle odds, no run buffs) is recorded |
| 27 | `panel()` adds a ✕ (minor) | applied | §3: no ✕ (`close: false`) |
