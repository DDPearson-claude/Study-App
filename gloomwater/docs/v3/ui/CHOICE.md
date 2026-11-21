# The user's interface and colour decisions (binding)

Recorded from the user's own words, in order:

1. "The text fonts, the thinning boxes the overall size and design of the ui i dont like at all. Make it more interesting and take inspiration from hollowknights menus and design"
2. "I hate the orange ring around our character" -> remove the lantern-radius ring on the water entirely (day and night). The pool of lantern light itself shows how far the light reaches; never a ring.
3. Colour reference: four Elden Ring screenshots (starry indigo night sky over ruins, lavender mist, a pink-magenta nebula glow, warm amber candle and torch light, gold autumn foliage, pale snowy stone, reflective water). Inspiration for colour and mood only: do not recreate that game's places, assets or UI.
4. "A, but with C's catch card" -> interface direction A, Drowned Filigree, everywhere, except the catch card (and its legendary / new-record variants), which uses direction C, Ink-Wash Field Journal.

## Reference palette (extracted from the screenshots)

| name | hex | role |
|---|---|---|
| Night ink | #0A0C19 | deepest background, UI veils |
| Deep indigo | #1D245D | skies, cave ceilings, fog |
| Violet dusk | #433E74 | mid tones, mist, far silhouettes |
| Lavender mist | #7E81B4 | haze, distant light, UI dim text base |
| Nebula pink | #D296AE | rare glow (nebula patches, special moments, "new" kickers) |
| Candle amber | #ED9E3B | lantern, candles, torches, braziers |
| Pale gold | #E8BE77 | trophies, highlights, handwritten notes on the catch card |
| Autumn ochre | #B8893A | foliage / fungus accents |
| Pale stone | #D6D6E4 | ruins, foam, ink lines |

UI ink: text #ECEBF6, dim text #AEACD0, glow rgba(160,150,240,.5). Green and teal stay out except the one sage merchant accent.

## Direction A, Drowned Filigree (everything except the catch card)

- No boxes. Menus and modals float in darkness on a soft radial night-ink veil; a filigree crest (reeds, fishing line, hook curls, a float in the centre) above headings, a flourish below.
- Selected / focused item: twin hook-curl ornaments left and right that draw themselves in (stroke-dash animation; off under prefers-reduced-motion), plus a lavender glow on the text.
- Fonts: Marcellus SC for titles and menu items (wide letter-spacing, about .16 to .3em), Alegreya for reading text and numbers.
- Big: the title logotype about 104 px at 1280 wide; menu items about 30 px; body text at least 17 px on a phone; tap targets at least 44 px.
- HUD: sparse. Top left the day in spaced capitals with the place in italics and a small line-and-curl rule; top right Shells and the journal count with thin line icons; the reel line as a hairline with curled ends, a brighter pale band and an amber marker; lantern oil as a thin arc with a small flame; the float's favour notches (v3) as five slanted ink ticks.
- See A-title.png and A-hud-reeling.png.

## Direction C catch card

- A feathered ink-wash patch (SVG turbulence + displacement edge) instead of a box; two columns on desktop (fish sketch left, details right), one column on a phone.
- Left: the fish as a pale ink line sketch with a brush filter, a measuring line under it, and a handwritten note in pale gold (Cedarville Cursive), e.g. "1.12 m, biggest yet! took the moth-fly at dusk".
- Right: a small spaced-capitals kicker ("A new personal best"), the species name in IM Fell English SC, a red rubber-stamp size class ("TROPHY", rotated about -7deg), length / weight / worth with handwritten values, one italic lore line, and actions as text with a brush-stroke underline under the selected one.
- See C-catch-card-desktop.png and C-catch-card-phone.png. The full interactive mockup is ui-directions-mockup.html.
