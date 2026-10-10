# Dossier redesign: the field guide

Dan chose this design on 10 Oct 2026, from the redesign canvas ("Dossier redesign 3"). It replaces
the field-journal dossier (cloth covers, tape, stamps, ring stains, hand-lettered fonts, Literata,
its own ink palette) with the D4 look the rest of the app now uses (`app/src/css/80-d4.css`,
`docs/ARCHITECTURE.md` section 12). These files are mockups only: nothing in the app has changed yet.

| File | Screen | Address |
|---|---|---|
| `library.html` | The Library's Dossiers section | `#/book` |
| `at-a-glance.html` | A dossier's first page: cover and contents in one | `#/book/:tid` |
| `chapter.html` | A chapter, as one page of tiles with the plate in it | `#/book/:tid/:iid` |
| `practice.html` | Put it into practice, and the sources | `#/book/:tid/:iid/practice` |
| `overview.png` | All four side by side | |

Each mockup is a 390 x 844 phone screen in plain HTML with inline styles: open it in a browser,
or render it with Playwright. The text is the real Fractions course (`fractions-2c5b7`), chapter II
(`i2`, "Equal pieces make the bottom number honest"). The other courses on the Library shelf
(Negative numbers, Circuits, Cryptocurrency) are made up to fill it. Each mockup shows the
top of a page that scrolls; the floating bar at the bottom stays put.

## What stays the same

The data and the rules of `docs/ARCHITECTURE.md` section 4 (Dossiers) do not change: the same
`profile/dossiers/{tid}` and chapter docs, the same binding and backfill, and the same fixed
derivation rules for the field note, Look for, the clipping, Compare, How certain, the glossary,
the bibliography and the practice parts (word for word). Nothing Dan wrote, chose or scored is
ever printed. Kept dossiers still open with no course behind them.

**The title is the course title.** The mockups say "What a fraction really is", which is
`topic.title`. The short name "Fractions" is `topic.query`, which a dossier must never read.

## The look: tiles

Two columns, a 10px gap and 16px side gutters on a phone. A full-width tile spans both columns.
Use the token names in `00-tokens.css` / `80-d4.css`, so dark mode, Text size and Easier reading
follow without extra work.

| Tile | Style | Used for |
|---|---|---|
| White | `--surface`, 1.5px solid `--edge`, radius 16px; `--shadow` on the page's first tile only | Headline tiles, the chapters grid, finished dossiers |
| Grey | `--sunk`, radius 6px, no border | Reading panels: the plate, worked example, the analogy, the question, sources |
| Emphasis | `--surface`, 2px solid `--edge`, radius 16px, hard shadow `3px 3px 0 var(--edge)` | Key idea (the field note), Rule of thumb |
| Ink | `--heading` background, `--on-heading` text | Progress only (the Bound tile) |
| Warning | `--surface`, 1.5px solid `--red`, label and text in `--red` | Where it breaks, each common mistake |
| Dashed | 1.5px dashed `--line-strong` (`--muted` for kept dossiers) | Chapters not yet written, kept dossiers |

- Tile labels: `--mono`, 10.5px, upper case, `--muted`, top left (in `--red` on warning tiles).
- Type: Barlow (`--sans`) throughout, the dossier included: drop the `.dos` rule in `80-d4.css`
  that brings Literata back. Easier reading still switches to Atkinson. Use `--cond` for
  the idea's kind ("CONCEPT", in `--teal`) and `--mono` for labels, dates and the path.
- Colour keeps its meaning: ink for progress and controls, green for finished only, red for
  mistakes and warnings, teal for small labels (the kind, the source number chips on
  `--teal-tint`), amber for key terms (`--hl`) and what is due. Amber is never used for progress.
- Rings and bars: a ring is n of N chapters, ink on a `--line` track (white on a dark track
  inside the ink tile; green when the dossier is finished). Bars are one per idea: bound ones
  filled ink, the rest dashed. They must shrink or wrap for courses with more ideas.

## Pages, and the new page order

A chapter is now **two** page turns instead of three: the plate moves into the chapter page,
and the cover and contents become one page.

```
before: cover | contents | per chapter: idea+explanation, plate+notes, practice+sources | glossary
after:  at a glance       | per chapter: chapter (with plate),         practice+sources | glossary
```

Old addresses keep working: `/contents` opens At a glance at the chapters grid. `/plate` opens
the chapter page scrolled to the plate, and `/plate/play` does the same with the plate awake.
`model().leaves`, the turn links, the desk arrows and the arrow keys follow the new order.

### Shared chrome
- **Dossier pages** use D4's focus bar: a 44px outlined back button, the mono path
  (`library/fractions`, `fractions/ch-ii`, `fractions/ch-ii/practice`) and an outlined Aa
  (reading settings).
- **The page bar** floats at the bottom with the same frame as the D4 tab bar (62px high,
  2px `--edge`, radius 16px). On the left is the previous page (a chevron and its name); in the
  middle, the position in mono ("II · 1 of 2") over one `--step` segment per page of the chapter;
  on the right, the next page as an ink button. It replaces the turn links and the side arrows.
- **The Library** keeps the normal app header and the floating tab bar.

### Library (`library.html`)
- "Library", with one line under it.
- A **lead tile** (white) for the dossier most recently bound that is still being written:
  "DOSSIER 01" (the dossier number) and its state, the title, a ring (2/8), bars I to VIII, and
  a footer with "ch. II bound 10 Oct" and Open.
- The other dossiers as **half-width tiles** in the current group order: still being written
  (grey, with a small ring and "3 of 7"), then finished (white, a green check and
  "Finished 2 Oct"), then kept (dashed, "DOSSIER 04 · KEPT", "2 of 6 · course deleted").
- An **"In your own words"** tile that opens `#/book/words`.
- Empty, loading and error states as now, in a grey tile.

### At a glance (`at-a-glance.html`)
1. **Title tile** (white, full width): "DOSSIER 01 · A COURSE IN 8 IDEAS" and the course title.
2. **Bound** (ink, half width): ring, "2/8", "chapters". When finished: "Finished" and the date,
   with a green ring. A kept dossier says it was kept from a deleted course.
3. **Begun** (grey, half width): the date, then the year and the number of sources.
4. **Chapters** (white, full width): a two-column grid with one cell per idea, showing its Roman
   numeral and the idea's title. A bound chapter is a white outlined cell with an ink check that
   links to it. An unbound one is dashed and muted, not a link, and screen readers hear
   "not yet written".
5. **The question it set out to answer** (grey): `hook`.
- Not drawn, but keep them: **In one breath** (a grey tile after the question). The **course
  picture**, when pictures are on, as a full-width tile after the title tile, captioned as drawn
  by an image model. **Save a copy**. Links to the **glossary and bibliography** as two small tiles
  at the end.

### Chapter (`chapter.html`), top to bottom
1. **Header** (white): a 58px numeral box (2px `--edge`, radius 12px), "CHAPTER II OF VIII"
   with the kind, and the idea title as the page's h1.
2. **Key idea** (emphasis): the field note, the explanation's closing all-bold paragraph,
   taken out of the explanation as now. No field note means no tile.
3. **Plate** (grey): "PLATE II", the interactive's title and an ink **Tap to play** button. Under
   them sits the plate itself in a `--surface` well, asleep under the same rules as now (inert,
   covered, Tap to play / Done, mounted within 900px of the screen). It takes the D4 kit theme
   (`U.sandbox.theme`) like a lesson does, not the dossier's old ink palette. Below the plate
   goes "**Look for** …": the brief without "The one thing you should see is", word for word.
   A chapter without a plate shows its plate note in this tile.
4. **What's going on** (grey, full width): the explanation, with key terms highlighted and
   source chips; the clipping goes after the paragraph that cites it. The mockup leaves this tile
   out so the plate and the analogy fit on one screen, but in the build it goes **here**, between
   the plate and the analogy.
5. **Think of it like** (grey, half width) beside **Where it breaks** (warning, half width).
   With no "breaks", the analogy runs full width.
6. Not drawn: **Compare** (half width): "Builds on ch. I. Comes back in ch. III and ch. VII",
   linking only to bound chapters. **How certain** (half width): settled / simplified / contested
   as three pills with this chapter's filled ink, and its sentence ("Not yet source-checked"
   for an unsourced lesson).
7. Not drawn: the plate's notes, which used to face the plate. **A number from the sources**
   (a small tile: the value large, its label, a source chip). **What you're looking at** and
   **What this model leaves out** (grey). **The numbers on this plate (n)** (collapsible).
   Contested views, when there are any, get one tile each.

### Put it into practice (`practice.html`)
- A heading with no tile: mono "CHAPTER II · <IDEA TITLE>", then "Put it into practice".
- **Rule of thumb** (emphasis): the part's first sentence large (34px, 700), the rest at 18px.
- **Steps** (none in this lesson): a white tile holding the numbered ink checklist.
- **Worked example** (grey).
- **Common mistakes**: a red label, then one warning tile per mistake in two columns (a cross,
  then the text). With an odd count, the last tile spans both columns. A mistakes part written as
  paragraphs gets one full-width tile.
- Any other prose part goes in a grey tile.
- **Sources**: a label, then one grey tile per source in two columns, each with its number chip,
  the publisher (the title split on " — " as now), the quote in italics, and the host as a link
  that opens a new tab. A chapter without practice keeps the sources page on its own.

### Glossary and bibliography (not drawn)
The same tiles: one grey tile per glossary term (the term highlighted, its sentence, "First met in
chapter …"), and one grey tile per bibliography entry (with the chapters that rest on it and its
collapsible quotes).

### Wide screens (not drawn)
At 55rem and up, a leaf is one wider tile page instead of two facing pages, up to `--wide`. On the
chapter page the header and key idea run across, the plate spans two or three of four columns,
and the analogy, Where it breaks, Compare and How certain stack beside it. At a glance shows four
chapter cells per row.

### What goes away
Cloth covers, ribbons, the deboss, tape, stamps, ring stains, splats, the kind sketches and the
index card all go, along with the hand-lettered fonts (the second Google Fonts link from
`U.dossier.fonts()`), Literata and the plates' ink palette (`inkTheme`). Most of
`75-dossier.css` can go. **Save a copy** (the static HTML export) should get the same tiles.

## Likely to need updating
- `tests/dossier.test.mjs` (the page order) and `tests/e2e/dossier.spec.mjs`, `art.spec.mjs`
  (the frontispiece) and `shelves.spec.mjs`. Keep the behaviour checks (plate sleep and wake,
  keys, kept dossiers, nothing personal printed) and update the ones about looks and leaves.
- `docs/ARCHITECTURE.md`: the dossier page builders in section 4, the routes and page notes in
  section 10, and the note in section 12 that the dossier keeps its own palette and fonts.
