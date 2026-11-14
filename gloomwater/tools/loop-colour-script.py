#!/usr/bin/env python3
"""The waters' colour script: the greening ramp at a glance.

Reads the ramp table in docs/loop/WATERS.md (section 1, one row per water: its lushness step, its green share and its
sky, fog, water, foliage and accent colours for day, dusk and night) and paints one simple swatch landscape per water
and phase: sky, far bank, the bank's foliage band (its height and cover follow the lushness step), the water with the
bank in its mirror, the accents (flowers by day, fireflies or glow by night) and the raft's one candle. Rivers get a
near bank and a visible current. A bar under each column shows the target green share by day.

  python3 tools/loop-colour-script.py                 (from gloomwater/; writes tools/out/loop/colour-script.png)
  python3 tools/loop-colour-script.py --out path.png

Design only: it reads the doc and writes an untracked image. Python 3 with Pillow.
"""
import math
import os
import random
import re
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
DOC = os.path.join(HERE, '..', 'docs', 'loop', 'WATERS.md')
OUT = os.path.join(HERE, 'out', 'loop', 'colour-script.png')

CELL_W, CELL_H, LEFT, TOP, BOTTOM = 152, 196, 64, 74, 92
PHASES = ('day', 'dusk', 'night')
CANDLE = (237, 158, 59)                     # the Wick's lantern: the one warm light, the same on every water
MOON = (196, 184, 255)                      # the lavender moon
ZENITH = {'day': (92, 94, 160), 'dusk': (62, 56, 116), 'night': (12, 13, 38)}   # the shared violet sky
INK = (8, 6, 26)
PAPER = (22, 20, 44)
TEXT = (226, 222, 240)
DIM = (150, 144, 186)


def hexrgb(h):
    h = h.strip().lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def mul(a, k):
    return tuple(max(0, min(255, round(x * k))) for x in a)


def read_ramp(path):
    """The rows of the ramp table (the first table whose header has the columns below)."""
    text = open(path, encoding='utf-8').read()
    lines = text.splitlines()
    need = ['#', 'water', 'kind', 'step', 'sky', 'fog', 'water colour', 'foliage', 'accent']
    for i, line in enumerate(lines):
        if not line.startswith('|'):
            continue
        head = [c.strip().lower() for c in line.strip().strip('|').split('|')]
        if not all(n in head for n in need):
            continue
        col = {n: head.index(n) for n in head}
        rows = []
        for row in lines[i + 2:]:
            if not row.startswith('|'):
                break
            cells = [c.strip() for c in row.strip().strip('|').split('|')]
            hexes = lambda k: [hexrgb(x) for x in re.findall(r'#[0-9a-fA-F]{6}', cells[col[k]])]
            share = re.findall(r'\d+(?:\.\d+)?', cells[col['green share']]) if 'green share' in col else ['0']
            w = {'n': int(cells[col['#']]), 'name': cells[col['water']].replace('**', ''), 'kind': cells[col['kind']],
                 'step': float(cells[col['step']]), 'share': float(share[0]) if share else 0.0,
                 'sky': hexes('sky'), 'fog': hexes('fog'), 'water': hexes('water colour'), 'leaf': hexes('foliage'), 'accent': hexes('accent')}
            for k in ('sky', 'fog', 'water', 'leaf', 'accent'):
                if len(w[k]) != 3:
                    sys.exit(f'WATERS.md: {w["name"]}: the {k} cell needs three colours (day · dusk · night), found {len(w[k])}')
            rows.append(w)
        return rows
    sys.exit('WATERS.md: no ramp table found (a table with the columns ' + ', '.join(need) + ')')


def font(size, bold=False):
    for name in (('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'), 'LiberationSans-Regular.ttf'):
        for d in ('/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/truetype/liberation', '/Library/Fonts', 'C:/Windows/Fonts'):
            p = os.path.join(d, name)
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def ridge(rng, width, base, amp, bumps, jag=0.0):
    """A soft skyline: a sum of a few sines plus optional jagged crowns."""
    ph = [rng.uniform(0, 6.28) for _ in range(4)]
    pts = []
    for x in range(width + 1):
        t = x / width
        y = base - amp * (0.55 + 0.25 * math.sin(t * bumps * 6.28 + ph[0]) + 0.15 * math.sin(t * bumps * 15.1 + ph[1])
                          + 0.05 * math.sin(t * 41 + ph[2]))
        if jag:
            y -= jag * abs(math.sin(t * bumps * 23 + ph[3]))
        pts.append((x, y))
    return pts


def paint_cell(w, phase, rng):
    p = PHASES.index(phase)
    step = w['step']
    lush = step / 15.0
    river = 'river' in w['kind']
    sea = 'sea' in w['kind']
    reef = 'reef' in w['kind']
    sky, fog, water, leaf, acc = (w[k][p] for k in ('sky', 'fog', 'water', 'leaf', 'accent'))
    img = Image.new('RGB', (CELL_W, CELL_H), INK)
    d = ImageDraw.Draw(img, 'RGBA')
    wl = int(CELL_H * 0.6)                                  # the waterline

    # sky: the shared violet zenith down to this water's horizon
    for y in range(wl):
        t = (y / wl) ** 1.6
        d.line([(0, y), (CELL_W, y)], fill=mix(ZENITH[phase], sky, t))
    if phase != 'day':
        srng = random.Random(7)
        for _ in range(34 if phase == 'night' else 10):
            x, y = srng.uniform(0, CELL_W), srng.uniform(0, wl * 0.62)
            a = srng.randint(110, 230) if phase == 'night' else srng.randint(50, 110)
            d.point((x, y), fill=(236, 232, 255, a))
    if phase == 'night':
        mx, my = int(CELL_W * 0.74), int(CELL_H * 0.15)
        for r, a in ((15, 26), (11, 40)):
            d.ellipse([mx - r, my - r, mx + r, my + r], fill=MOON + (a,))
        d.ellipse([mx - 6, my - 6, mx + 6, my + 6], fill=MOON)

    stone = mix(fog, {'day': (214, 210, 232), 'dusk': (222, 190, 206), 'night': (92, 86, 140)}[phase], 0.42)
    leaf_dark = mix(leaf, INK, 0.45)
    leaf_hi = mix(leaf, (226, 236, 176) if phase != 'night' else MOON, 0.34 if phase != 'night' else 0.22)

    # far bank: stone, and the canopy creeping over it with the step; always lavender with distance (aerial perspective)
    far_h = 9 + 1.0 * step
    far_col = mix(mix(stone, leaf_dark, min(1.0, lush * 1.15)), fog, 0.5 if phase != 'night' else 0.35)
    far = ridge(rng, CELL_W, wl - 1, far_h, 1.3 + lush, jag=2.5 * lush if not sea else 0)
    if sea:   # the open sea: no shore you can reach, only a high green island far off, and the Lamp Rock
        far = [(x, wl - 1 - 1.5 * far_h * (math.sin(min(1, max(0, (x / CELL_W - 0.5) / 0.5)) * math.pi) ** 0.5) * (1 + 0.12 * math.sin(x * 0.7))) for x in range(CELL_W + 1)]
        far_col = mix(mix(leaf_dark, leaf, 0.6), fog, 0.38 if phase != 'night' else 0.3)
    d.polygon(far + [(CELL_W, wl), (0, wl)], fill=far_col)

    # the near bank: a stone lip at the waterline, and the foliage band on it (height and cover follow the step)
    bank_h = 0 if sea else (3 if reef else 5)
    if not sea:
        d.rectangle([0, wl - bank_h, CELL_W, wl], fill=mix(stone, INK, 0.35))
    band = 1.5 + 3.4 * step                                 # pixels of foliage above the lip
    cover = (0.08 + 0.92 * lush ** 0.9) * (0.55 if sea else 1.0) if step > 0 else 0.0
    if sea:
        band *= 0.6                                         # the sea's green is low: weed on the water, turf on the rock
    if reef:
        band *= 0.95                                        # the reef's green keys stand low over the water
    crowns = []
    if step == 0:                                           # the Mossmere: a trace of dun-ochre reeds, no green
        for x in range(4, CELL_W, 9):
            hgt = rng.uniform(4, 9)
            d.line([(x, wl - bank_h), (x + rng.uniform(-1, 1), wl - bank_h - hgt)], fill=leaf, width=1)
    else:
        tones = [leaf, mix(leaf, leaf_hi, 0.22), mix(leaf, leaf_dark, 0.25), mix(leaf, (150, 160, 70), 0.18 if phase != 'night' else 0.06)]
        layers = [(0.55, 1.0, mix(leaf_dark, fog, 0.25))] if step >= 6 and not sea else []
        layers.append((1.0, 0.75, None))
        for scale, hmul, back in layers:                    # a taller, darker back row once the forest closes in
            x = rng.uniform(-6, 2)
            row = []
            while x < CELL_W + 6:
                r = (rng.uniform(3.0, 6.0) + 0.45 * step) * (1.15 if back else 1.0)
                on = rng.random() < cover
                if on:
                    top = wl - bank_h - band * hmul * rng.uniform(0.55, 1.0) * (1.25 if back else 1.0)
                    row.append((x, top, r, rng.choice(tones)))
                x += r * rng.uniform(0.8, 1.4) * (1.0 if on else 1.7)
            if back:
                for (x, top, r, _) in row:
                    d.ellipse([x - r, top, x + r, wl - bank_h + 2], fill=back)
                    d.chord([x - r * 0.8, top, x + r * 0.4, top + r], 180, 300, fill=mix(back, leaf_hi, 0.35))
            else:
                crowns = row
        for (x, top, r, _) in crowns:                       # dark base, mid body, backlit rim on the upper left
            if step >= 8 and rng.random() < 0.3:            # an emergent tree: trunk and a high crown
                d.line([(x, wl - bank_h), (x, top - r)], fill=leaf_dark, width=2)
                d.ellipse([x - r * 0.9, top - r * 2.0, x + r * 0.9, top - r * 0.4], fill=leaf_dark)
            d.ellipse([x - r, top, x + r, wl - bank_h + 2], fill=leaf_dark)
        for (x, top, r, tone) in crowns:
            d.ellipse([x - r * 0.86, top + 1, x + r * 0.8, wl - bank_h - 1], fill=tone)
        for (x, top, r, tone) in crowns:
            d.chord([x - r * 0.8, top, x + r * 0.5, top + r * 1.1], 180, 300, fill=mix(tone, leaf_hi, 0.7))
        if step >= 9 and not sea:                           # hanging vines and roots
            for (x, top, r, _) in crowns[::2]:
                d.line([(x + r * 0.3, top + r), (x + r * 0.3, wl - bank_h + rng.uniform(2, 6))], fill=mix(leaf_dark, leaf, 0.4), width=1)
        reed_n = int(3 + step * 1.2)
        for _ in range(reed_n if not sea else 0):           # reeds at the water's edge
            x = rng.uniform(0, CELL_W)
            d.line([(x, wl + 1), (x + rng.uniform(-1.5, 1.5), wl - rng.uniform(4, 8 + step * 0.4))], fill=mix(leaf, leaf_hi, 0.3), width=1)

    # the water: this water's colour, deepening toward the viewer, with the bank in its mirror
    for y in range(wl, CELL_H):
        t = (y - wl) / (CELL_H - wl)
        d.line([(0, y), (CELL_W, y)], fill=mix(water, mul(water, 0.55), t ** 0.8))
    refl = img.crop((0, max(0, wl - int(band * 1.3 + far_h + 8)), CELL_W, wl)).transpose(Image.FLIP_TOP_BOTTOM)
    refl = Image.blend(refl, Image.new('RGB', refl.size, water), 0.5).filter(ImageFilter.GaussianBlur(0.8))
    img.paste(refl, (0, wl))
    d = ImageDraw.Draw(img, 'RGBA')
    for y in range(wl + 3, CELL_H, 5):                      # ripples
        x0 = rng.uniform(-20, CELL_W)
        d.line([(x0, y), (x0 + rng.uniform(14, 40), y)], fill=mix(sky, water, 0.55) + (90,), width=1)
    if river:                                               # a current you can see: foam lines along the flow
        for _ in range(7):
            y = rng.uniform(wl + 6, CELL_H - 18)
            x0 = rng.uniform(-10, CELL_W - 20)
            d.line([(x0, y), (x0 + 26, y + 3)], fill=(236, 232, 246, 120), width=1)
    if not river and step >= 1 and not sea:                 # pads and floating meadows on still water
        for _ in range(int(2 + step * 0.8)):
            x, y = rng.uniform(4, CELL_W - 4), rng.uniform(wl + 8, CELL_H - 30)
            rr = rng.uniform(2.5, 4.5)
            d.ellipse([x - rr, y - rr * 0.4, x + rr, y + rr * 0.4], fill=mix(leaf, water, 0.25))
    if (sea or reef) and step >= 1:                                   # weed meadows on the swell
        for _ in range(int(step * 2.2)):
            x, y = rng.uniform(0, CELL_W), rng.uniform(wl + 4, CELL_H - 26)
            d.ellipse([x - 9, y - 1.8, x + 9, y + 1.8], fill=mix(mix(leaf, (150, 140, 60), 0.25), water, 0.25))
    if river:                                               # the near bank of a river, along the bottom
        nb = 4 + 0.9 * step
        pts = ridge(rng, CELL_W, CELL_H - 1, nb, 1.8)
        d.polygon([(x, CELL_H - (CELL_H - y)) for x, y in pts] + [(CELL_W, CELL_H), (0, CELL_H)], fill=mix(leaf_dark, INK, 0.35) if step else mix(stone, INK, 0.5))

    # accents: flowers by day and dusk, fireflies or glow at night (never over open water, never near the raft)
    if step == 0:
        pts = [(rng.uniform(6, CELL_W - 6), wl - bank_h - 1) for _ in range(3)]
    else:
        pts = [(x + rng.uniform(-r * 0.5, r * 0.5), top + rng.uniform(1, r)) for (x, top, r, _) in rng.sample(crowns, min(len(crowns), int(2 + step * 1.4)))] if crowns else []
    for (x, y) in pts:
        if phase == 'night':
            if step >= 5:                                   # fireflies hang above the green
                y -= rng.uniform(2, 10)
            d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=acc + (40,))
            d.ellipse([x - 1, y - 1, x + 1, y + 1], fill=acc)
        else:
            d.ellipse([x - 1.4, y - 1.4, x + 1.4, y + 1.4], fill=acc)

    # the raft and the Wick's candle: the one warm light
    rx, ry = int(CELL_W * 0.42), int(CELL_H * 0.8)
    d.rectangle([rx - 9, ry, rx + 9, ry + 3], fill=mix(INK, (60, 44, 34), 0.6))
    glow = 0.0 if phase == 'day' else (0.5 if phase == 'dusk' else 1.0)
    for r, a in ((12, int(16 + 30 * glow)), (6, int(30 + 50 * glow))):
        d.ellipse([rx - r, ry - 6 - r, rx + r, ry - 6 + r], fill=CANDLE + (a,))
    d.ellipse([rx - 2, ry - 8, rx + 2, ry - 4], fill=CANDLE)
    return img


def wrap(text, f, width, draw):
    words, lines, cur = text.split(), [], ''
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if draw.textlength(t, font=f) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = wd
    lines.append(cur)
    return lines


def main():
    out = OUT
    if '--out' in sys.argv:
        out = sys.argv[sys.argv.index('--out') + 1]
    rows = read_ramp(DOC)
    W = LEFT + CELL_W * len(rows) + 12
    H = TOP + CELL_H * 3 + BOTTOM
    sheet = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(sheet)
    f_name, f_small, f_row = font(12, bold=True), font(10), font(13, bold=True)
    for i, w in enumerate(rows):
        x0 = LEFT + i * CELL_W
        lines = wrap(f"{w['n']}. {w['name'].replace('The ', '')}", f_name, CELL_W - 10, d)[:2]
        for k, ln in enumerate(lines):
            d.text((x0 + 6, 8 + k * 15), ln, font=f_name, fill=TEXT)
        d.text((x0 + 6, 44), f"{w['kind']} · step {w['step']:g}", font=f_small, fill=DIM)
        for p, phase in enumerate(PHASES):
            cell = paint_cell(w, phase, random.Random(1000 + w['n'] * 31))
            sheet.paste(cell, (x0, TOP + p * CELL_H))
    for p, phase in enumerate(PHASES):
        d.text((10, TOP + p * CELL_H + CELL_H // 2 - 8), phase, font=f_row, fill=TEXT)
    # the target green share by day, as bars under the columns
    base = TOP + 3 * CELL_H + BOTTOM - 22
    top_share = max(1.0, max(w['share'] for w in rows))
    d.text((10, base - 52), 'green', font=f_small, fill=DIM)
    d.text((10, base - 40), 'share', font=f_small, fill=DIM)
    d.text((10, base - 28), 'by day', font=f_small, fill=DIM)
    for i, w in enumerate(rows):
        x0 = LEFT + i * CELL_W
        h = 56 * w['share'] / top_share
        d.rectangle([x0 + 40, base - h, x0 + CELL_W - 40, base], fill=w['leaf'][0])
        d.text((x0 + 40, base + 4), f"{w['share']:g}%", font=f_small, fill=DIM)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    sheet.save(out)
    print(f'colour script: {len(rows)} waters × 3 phases → {os.path.relpath(out)}')


if __name__ == '__main__':
    main()
