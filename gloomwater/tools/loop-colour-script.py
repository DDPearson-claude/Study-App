#!/usr/bin/env python3
"""The waters' colour script: the greening ramp at a glance, painted and measured.

Reads the ramp table in docs/loop/WATERS.md (section 1: one row per water, with its kind, its lushness step, its target green
share for day, dusk and night, and its sky, fog, water, foliage and accent colours for each phase) and the repaint table in
section 6. It then does three things:

  1. lint: every colour in the doc obeys the doc's own caps (leaf keys: HSV saturation <= min(0.62, 0.25 + 0.04 x step) and
     value <= 0.70; mid-tone hue 85-135; night mid-tone hue 125-158; the water's own colour and the air keys outside the green
     band 65-195 deg unless nearly grey), and the foliage tones follow a smooth track (hue, value and night value never fall);
  2. paint: one small landscape per water and phase, in the frame the sail camera sees (a lake: the far shore and the side
     banks; a river: the channel receding up to its landmark, banks converging to a bend). Each water's kind has its own
     silhouettes (papyrus, mangrove prop roots, swamp knees with moss curtains, a tiered flood forest, a closed canopy...).
     The raft's candle is a pinpoint flame with a short streak on the water: never a disc or ring;
  3. measure and gate, the way tools/hue-report.mjs measures a capture (a pixel is chromatic when HSV s > 0.10 and v > 0.06;
     it weighs s x v; green is hue 65-160): each cell's green share, its sky, water and bank bands, its mean Oklab a, its
     teal and neon pixels and its green variety. It prints measured against target and fails (exit 1) when a gate of
     WATERS.md section 7 fails: the share within +-10% of target (at least +-0.5 and at most +-1.5 points), each day step
     1.5-5 points, dusk steps >= 1 point, night steps >= 0.5 point with the night silhouettes and fireflies never fewer,
     night >= 25% of day, the water band's green <= 0.6 x the bank band's, the sky band <= 2% green with >= 12% of the frame
     sky (6% under the Inkwood's canopy), no cast (mean Oklab a), no neon, teal <= 2% of the frame and 10% of the green, and
     from step 6 the three green families each >= 12% of the green.

  python3 tools/loop-colour-script.py            (from gloomwater/; writes tools/out/loop/colour-script.png, untracked)
  python3 tools/loop-colour-script.py --fit      re-derive each water's foliage amount so its day share meets its target
  python3 tools/loop-colour-script.py --out path.png

Design only: it reads the doc and writes an untracked image. Python 3 with Pillow.
"""
import colorsys
import math
import os
import random
import re
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
DOC = os.path.join(HERE, '..', 'docs', 'loop', 'WATERS.md')
OUT = os.path.join(HERE, 'out', 'loop', 'colour-script.png')

CW, CH = 168, 210                           # one cell (the frame scaled down; 960x540 frames are 16:9, a cell is taller to show the bands)
LEFT, TOP, BOTTOM = 66, 64, 150
PHASES = ('day', 'dusk', 'night')
CANDLE = (237, 158, 59)                     # the Wick's lantern: the one warm light, the same on every water
MOON = (196, 184, 255)                      # the lavender moon
ZENITH = {'day': (92, 94, 160), 'dusk': (62, 56, 116), 'night': (12, 13, 38)}   # the shared violet sky
INK = (8, 6, 26)
PAPER = (22, 20, 44)
TEXT = (226, 222, 240)
DIM = (150, 144, 186)
OKC = (120, 220, 140)
BAD = (255, 120, 120)
# labels painted beside the colours, so the measure knows its bands
SKY, LAND, LEAF, WATER, WLEAF, OTHER = 1, 2, 3, 4, 5, 6

# The light on the leaves at dusk and at night, as a multiplier on the foliage value (the rose key's and the moon's translucency
# through the leaves, which the build sets per water): fitted with --fit so the dusk and night shares meet the doc's targets.
LIGHT = {'dusk': {2: 0.976, 3: 0.881, 4: 0.975, 5: 0.809, 6: 0.966, 7: 0.902, 8: 0.94, 9: 0.824, 10: 0.908, 11: 0.849, 12: 0.861,
                  13: 0.938, 14: 0.956, 15: 0.813, 16: 1.02},
         'night': {2: 0.919, 3: 0.856, 4: 0.928, 5: 0.788, 6: 0.881, 7: 0.837, 8: 1.029, 9: 0.845, 10: 1.017, 11: 0.886, 12: 0.973,
                   13: 1.109, 14: 0.874, 15: 1.025, 16: 1.15}}
# The foliage amount each water's frame is painted with (0 = none). Fitted with --fit so the day share meets the doc's target;
# the geometry it drives is fixed per kind, so dusk and night are measured, not fitted.
AMOUNT = {1: 0.0, 2: 0.671, 3: 1.332, 4: 1.202, 5: 0.47, 6: 1.124, 7: 2.298, 8: 0.944, 9: 2.0, 10: 0.976, 11: 0.684, 12: 1.279,
          13: 0.67, 14: 1.129, 15: 0.72, 16: 0.699}
# The one exception to the step rule (WATERS.md section 7; LAKE2.md section 1A, the user's binding words "more greenery than the moss
# mere"): Sporewood takes step 5's green at once. Its own step in is held to the lower bounds only (it must rise, never fall), and the
# step out of it is reported as pending, not failed, until the waters after it are re-stepped from it as each ships.
EXCEPT = {2: 'LAKE2 section 1A: Sporewood takes step 5 at once; the waters after it re-step from it when each ships'}


# ----------------------------------------------------------------------------------------------------------- colour helpers
def hexrgb(h):
    h = h.strip().lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def hsv(c):
    return colorsys.rgb_to_hsv(*(x / 255 for x in c))


def fromhsv(h, s, v):
    r, g, b = colorsys.hsv_to_rgb((h % 360) / 360, max(0, min(1, s)), max(0, min(1, v)))
    return (round(r * 255), round(g * 255), round(b * 255))


def shift(c, dh=0.0, ds=0.0, kv=1.0, smax=1.0, vmax=1.0):
    h, s, v = hsv(c)
    return fromhsv(h * 360 + dh, min(smax, s + ds), min(vmax, v * kv))


def mix(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def mul(a, k):
    return tuple(max(0, min(255, round(x * k))) for x in a)


def oklab_a(c):
    r, g, b = (((x / 255 + 0.055) / 1.055) ** 2.4 if x / 255 > 0.04045 else x / 255 / 12.92 for x in c)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = (x ** (1 / 3) for x in (l, m, s))
    return 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s


def cap(step):
    return min(0.62, 0.25 + 0.04 * step)


# ----------------------------------------------------------------------------------------------------------- the doc
def table_rows(lines, need):
    for i, line in enumerate(lines):
        if not line.startswith('|'):
            continue
        head = [c.strip().lower() for c in line.strip().strip('|').split('|')]
        if all(n in head for n in need):
            rows = []
            for row in lines[i + 2:]:
                if not row.startswith('|'):
                    break
                rows.append([c.strip() for c in row.strip().strip('|').split('|')])
            return head, rows
    return None, []


def read_doc(path):
    lines = open(path, encoding='utf-8').read().splitlines()
    need = ['#', 'water', 'kind', 'step', 'green share', 'sky', 'fog', 'water colour', 'foliage', 'accent']
    head, rows = table_rows(lines, need)
    if not head:
        sys.exit('WATERS.md: no ramp table found (a table with the columns ' + ', '.join(need) + ')')
    col = {n: head.index(n) for n in head}
    waters = []
    for cells in rows:
        hexes = lambda k: [hexrgb(x) for x in re.findall(r'#[0-9a-fA-F]{6}', cells[col[k]])]
        share = [float(x) for x in re.findall(r'\d+(?:\.\d+)?', cells[col['green share']])]
        w = {'n': int(cells[col['#']]), 'name': cells[col['water']].replace('**', ''), 'kind': cells[col['kind']],
             'step': int(float(cells[col['step']])), 'share': share,
             'sky': hexes('sky'), 'fog': hexes('fog'), 'water': hexes('water colour'), 'leaf': hexes('foliage'), 'accent': hexes('accent')}
        for k in ('sky', 'fog', 'water', 'leaf', 'accent'):
            if len(w[k]) != 3:
                sys.exit(f'WATERS.md: {w["name"]}: the {k} cell needs three colours (day · dusk · night), found {len(w[k])}')
        if len(share) != 3:
            sys.exit(f'WATERS.md: {w["name"]}: the green share needs three numbers (day · dusk · night)')
        waters.append(w)
    # section 6: the built waters' repaint keys (named leaf colours on the row of each water)
    head6, rows6 = table_rows(lines, ['water', 'step', 'what changes'])
    repaint = []
    for cells in rows6:
        step = int(re.findall(r'\d+', cells[1])[0])
        text = cells[2]
        for m in re.finditer(r'#[0-9a-fA-F]{6}', text):
            repaint.append((cells[0].replace('**', ''), step, m.group(0), text[max(0, m.start() - 40):m.start()]))
    return waters, repaint


# ----------------------------------------------------------------------------------------------------------- lint
def lint(waters, repaint):
    errs = []
    prev = None
    for w in waters:
        k = w['step']
        for p, phase in enumerate(PHASES):
            for key in ('sky', 'fog'):
                h, s, v = hsv(w[key][p])
                if 65 <= h * 360 < 195 and s >= 0.12:
                    errs.append(f"{w['name']}: {phase} {key} {w[key][p]} is in the green band (air never green)")
            h, s, v = hsv(w['water'][p])
            if 65 <= h * 360 < 195 and s >= 0.12:
                errs.append(f"{w['name']}: {phase} water colour is in the green band")
            if k == 0:
                continue
            h, s, v = hsv(w['leaf'][p])
            if s > cap(k) + 0.005 or v > 0.70:
                errs.append(f"{w['name']}: {phase} foliage {'#%02x%02x%02x' % w['leaf'][p]} s {s:.2f} v {v:.2f} breaks the cap (s <= {cap(k):.2f}, v <= 0.70)")
        if k:
            hd = hsv(w['leaf'][0])[0] * 360
            hn = hsv(w['leaf'][2])[0] * 360
            if not (82 <= hd <= 135):
                errs.append(f"{w['name']}: day mid foliage hue {hd:.0f} is outside 82-135")
            if not (125 <= hn <= 158):
                errs.append(f"{w['name']}: night mid foliage hue {hn:.0f} is outside 125-158")
            if prev and prev['step'] and prev['n'] not in EXCEPT:
                for p, phase in enumerate(PHASES):
                    a, b = hsv(prev['leaf'][p]), hsv(w['leaf'][p])
                    if b[0] * 360 < a[0] * 360 - 0.5 or b[2] < a[2] - 0.004:
                        errs.append(f"{w['name']}: {phase} foliage falls back from {prev['name']} (hue or value must never fall along the ramp)")
        prev = w
    for name, step, hx, ctx in repaint:
        h, s, v = hsv(hexrgb(hx))
        leafy = 65 <= h * 360 < 195 and s >= 0.12 and 'glow' not in ctx.lower()
        if leafy and (s > cap(step) + 0.005 or v > 0.70):
            errs.append(f"WATERS.md section 6, {name}: {hx} s {s:.2f} breaks the step-{step} leaf cap ({cap(step):.2f})")
    return errs


# ----------------------------------------------------------------------------------------------------------- painting
class Cell:
    """An RGB image plus a label image painted in step, so the measure knows which band each pixel is."""

    def __init__(self):
        self.img = Image.new('RGB', (CW, CH), INK)
        self.lab = Image.new('L', (CW, CH), OTHER)
        self.d = ImageDraw.Draw(self.img, 'RGBA')
        self.l = ImageDraw.Draw(self.lab)
        self.fireflies = 0

    def poly(self, pts, fill, lab, alpha=255):
        self.d.polygon(pts, fill=fill + (alpha,))
        if alpha > 128:
            self.l.polygon(pts, fill=lab)

    def ell(self, box, fill, lab, alpha=255):
        x0, y0, x1, y1 = box
        if x1 < x0: x0, x1 = x1, x0
        if y1 < y0: y0, y1 = y1, y0
        self.d.ellipse([x0, y0, x1, y1], fill=fill + (alpha,))
        if alpha > 128:
            self.l.ellipse([x0, y0, x1, y1], fill=lab)

    def line(self, pts, fill, lab, width=1, alpha=255):
        self.d.line(pts, fill=fill + (alpha,), width=width)
        if alpha > 128 and lab:
            self.l.line(pts, fill=lab, width=width)

    def rect(self, box, fill, lab, alpha=255):
        self.d.rectangle(box, fill=fill + (alpha,))
        if alpha > 128:
            self.l.rectangle(box, fill=lab)


def tones(w, phase, p):
    """The foliage tones of a water at a phase: young (yellow-green), lit, mid, dark (blue-green), from the doc's mid tone."""
    mid = w['leaf'][p]
    k = w['step']
    if phase != 'day':
        mid = shift(mid, 0, 0, LIGHT[phase].get(w['n'], 1.0), vmax=0.70)
    if phase == 'night':
        return {'young': shift(mid, -14, -0.02, 1.05), 'lit': shift(mid, -6, -0.02, 1.22), 'mid': mid,
                'dark': shift(mid, min(8, 152 - hsv(mid)[0] * 360), 0.02, 0.66), 'deep': shift(mid, 4, 0.0, 0.45)}
    h = hsv(mid)[0] * 360
    dh = min(40, 150 - h)
    return {'young': shift(mid, max(-45, 70 - h), -0.03, 1.22, smax=cap(k), vmax=0.70),
            'lit': shift(mid, -32 if phase == 'day' else -14, -0.04, 1.28, smax=cap(k), vmax=0.70),
            'mid': mid, 'dark': shift(mid, dh, 0.03, 0.64, smax=cap(k)), 'deep': shift(mid, dh, 0.0, 0.42, smax=cap(k))}


def stone_of(w, phase, p):
    return mix(w['fog'][p], {'day': (214, 210, 232), 'dusk': (222, 190, 206), 'night': (92, 86, 140)}[phase], 0.45)


def far_mix(c, w, p, t):
    """Aerial perspective: green near, lavender far (through grey, so a green never turns teal on its way to lavender)."""
    g = round(0.3 * c[0] + 0.55 * c[1] + 0.15 * c[2])
    return mix(mix(c, (g, g, g), min(1.0, t * 3.0)), w['fog'][p], t)


def sky(c, w, phase, p, y0, rng):
    for y in range(y0 + 1):
        t = (y / max(1, y0)) ** 1.5
        c.line([(0, y), (CW, y)], mix(ZENITH[phase], w['sky'][p], t), SKY)
    if phase != 'day':
        srng = random.Random(7)
        for _ in range(30 if phase == 'night' else 8):
            x, y = srng.uniform(0, CW), srng.uniform(0, y0 * 0.8)
            c.d.point((x, y), fill=(236, 232, 255, srng.randint(110, 230) if phase == 'night' else srng.randint(50, 100)))
    if phase == 'night':
        mx, my = int(CW * 0.76), int(y0 * 0.36)
        c.d.ellipse([mx - 10, my - 10, mx + 10, my + 10], fill=MOON + (34,))
        c.d.ellipse([mx - 5, my - 5, mx + 5, my + 5], fill=MOON)


def crown(c, x, base, r, hgt, T, rng, kind='round', lab=LEAF, far=0.0, w=None, p=0):
    """One tree or plant silhouette with its three tiers (dark base, mid body, backlit rim on the upper left)."""
    f = (lambda col: far_mix(col, w, p, far)) if far else (lambda col: col)
    if kind == 'round':
        c.ell([x - r, base - hgt, x + r, base + 1], f(T['dark']), lab)
        c.ell([x - r * 0.86, base - hgt + 1, x + r * 0.78, base - 1], f(T['mid']), lab)
        c.d.chord([x - r * 0.8, base - hgt, x + r * 0.45, base - hgt + r * 1.05], 180, 300, fill=f(T['lit']) + (255,))
    elif kind == 'spire':                   # fir, spruce, cedar, pine
        c.poly([(x, base - hgt), (x - r, base), (x + r, base)], f(T['dark']), lab)
        c.poly([(x, base - hgt), (x - r * 0.5, base - hgt * 0.4), (x + r * 0.1, base - hgt * 0.45)], f(T['mid']), lab)
    elif kind == 'palm':
        c.line([(x, base), (x + r * 0.4, base - hgt)], f(T['deep']), lab, width=1)
        tx, ty = x + r * 0.4, base - hgt
        for a in (-150, -110, -60, -20, 200):
            ex, ey = tx + math.cos(math.radians(a)) * r * 1.4, ty + math.sin(math.radians(a)) * r * 0.7 + r * 0.5
            c.line([(tx, ty), (ex, ey)], f(T['mid'] if a > -100 else T['lit']), lab, width=2)
    elif kind == 'reed':
        for i in range(3):
            dx = rng.uniform(-r, r)
            c.line([(x + dx, base), (x + dx * 1.3, base - hgt * rng.uniform(0.7, 1.0))], f(T['lit'] if i == 0 else T['mid']), lab, width=1)
    elif kind == 'papyrus':                 # a tall stem with a mop head
        c.line([(x, base), (x + rng.uniform(-1, 1), base - hgt)], f(T['mid']), lab, width=1)
        c.ell([x - r * 0.7, base - hgt - r * 0.5, x + r * 0.7, base - hgt + r * 0.35], f(T['lit']), lab)
    elif kind == 'tuft':
        c.ell([x - r, base - hgt, x + r, base + 1], f(T['young']), lab)
    elif kind == 'fern':
        for a in (-160, -130, -90, -50, -20):
            c.line([(x, base), (x + math.cos(math.radians(a)) * r, base + math.sin(math.radians(a)) * hgt)], f(T['young'] if a in (-130, -50) else T['mid']), lab, width=1)


def strands(c, x, top, length, T, rng, n=3, col=None, w=None, p=0):
    for _ in range(n):
        dx = rng.uniform(-2, 2)
        c.line([(x + dx, top), (x + dx + rng.uniform(-1, 1), top + length * rng.uniform(0.6, 1.0))], col or T['mid'], LEAF, width=1)


def bank_row(c, rng, x0, x1, base, size, amt, T, kinds, w, p, far=0.0, density=1.0):
    """A row of plants along a shore line between x0 and x1 at height base. Returns the crowns placed."""
    placed = []
    x = x0 + rng.uniform(-3, 1)
    while x < x1:
        r = size * rng.uniform(0.75, 1.15)
        if rng.random() < min(1.0, amt * density):
            kind = rng.choice(kinds)
            hgt = r * (2.2 if kind in ('round',) else 3.2 if kind in ('spire', 'papyrus', 'palm', 'reed') else 1.2)
            crown(c, x, base, r, hgt, T, rng, kind, far=far, w=w, p=p)
            placed.append((x, base - hgt, r, kind))
        x += r * rng.uniform(1.0, 1.6)
    return placed


def water_body(c, w, phase, p, y0, rng, poly=None):
    """The water: its own colour, deepening toward the viewer, with the sky in the far grazing water."""
    wc = w['water'][p]
    for y in range(y0, CH):
        t = (y - y0) / (CH - y0)
        col = mix(mix(wc, w['sky'][p], 0.42 * (1 - t) ** 2), mul(wc, 0.62), t ** 0.9)
        c.line([(0, y), (CW, y)], col, WATER)
    if poly:                                 # a river: only the channel is water; the rest is painted over by the banks
        pass


def mirror(c, w, p, y_src0, y_line, depth, fade=0.6):
    """The planar mirror: the band above the waterline, flipped, darkened and desaturated (x0.6), with at least 35% sky kept."""
    if y_line - y_src0 < 2:
        return
    band = c.img.crop((0, y_src0, CW, y_line)).transpose(Image.FLIP_TOP_BOTTOM)
    band = band.resize((CW, min(depth, CH - y_line)))
    grey = band.convert('L').convert('RGB')
    band = Image.blend(band, grey, 0.4)
    band = Image.eval(band, lambda v: int(v * fade))
    skyc = Image.new('RGB', band.size, mix(w['sky'][p], w['water'][p], 0.5))
    band = Image.blend(band, skyc, 0.35)
    water_now = c.img.crop((0, y_line, CW, y_line + band.size[1]))
    lab_now = c.lab.crop((0, y_line, CW, y_line + band.size[1]))
    mask = lab_now.point(lambda v: 200 if v == WATER else 0).filter(ImageFilter.GaussianBlur(0.6))
    out = Image.composite(Image.blend(water_now, band, 0.75), water_now, mask)
    c.img.paste(out, (0, y_line))
    c.d = ImageDraw.Draw(c.img, 'RGBA')


def ripples(c, w, p, y0, rng, x0=0, x1=CW, river=False, vp=None):
    for y in range(y0 + 3, CH, 6):
        xa = rng.uniform(x0 - 20, x1)
        c.line([(xa, y), (xa + rng.uniform(10, 30), y)], mix(w['sky'][p], w['water'][p], 0.5), 0, alpha=70)


def candle(c, w, phase, x, y):
    """The raft, the Wick and the candle: a pinpoint flame and a short streak on the water. Never a disc or ring."""
    c.rect([x - 10, y, x + 10, y + 3], mix(INK, (64, 46, 34), 0.6), OTHER)
    c.rect([x - 1, y - 7, x + 1, y], (38, 30, 44), OTHER)                  # the Wick
    c.ell([x - 1.6, y - 11, x + 1.6, y - 7], CANDLE, OTHER)
    strength = {'day': 60, 'dusk': 120, 'night': 190}[phase]
    for i in range(1, 7):                                                   # the flame's streak on the water below the raft
        c.d.line([(x + (i % 2) - 0.5, y + 3 + i * 2), (x + (i % 2) + 0.5, y + 4 + i * 2)], fill=CANDLE + (max(0, strength - i * 26),))
    c.d.line([(x - 6, y), (x + 6, y)], fill=mix(CANDLE, (64, 46, 34), 0.5) + (strength // 2,))   # warm light on the raft's own planks


def flowers_and_lights(c, w, phase, p, crowns, rng, k, night_lights):
    acc = w['accent'][p]
    if not crowns:
        return
    if phase == 'night':
        n = night_lights
        for _ in range(n):
            x, top, r, _ = rng.choice(crowns)
            fx, fy = x + rng.uniform(-r, r), top + rng.uniform(-6, r)
            c.d.point((fx, fy), fill=acc + (255,))
            c.d.point((fx + 1, fy), fill=acc + (150,))
            c.fireflies += 1
    else:
        for _ in range(int(2 + k * 1.2)):
            x, top, r, _ = rng.choice(crowns)
            fx = x + rng.uniform(-r * 0.5, r * 0.5)
            c.d.ellipse([fx - 1.3, top + 2, fx + 1.3, top + 4.6], fill=acc + (255,))


# ---- the frames by kind -------------------------------------------------------------------------------------------------
def paint_lake(c, w, phase, p, rng, amt, T, style):
    k = w['step']
    y0 = int(CH * 0.33)                              # the far waterline
    sky(c, w, phase, p, y0, rng)
    stone = stone_of(w, phase, p)
    # the far shore: hills or cliffs, lavender with distance
    hill_h = {'fjord': 46, 'sea': 0}.get(style, 16 + 4 * amt)
    pts = []
    ph = rng.uniform(0, 6)
    for x in range(0, CW + 1, 2):
        t = x / CW
        hh = hill_h * (0.55 + 0.3 * math.sin(t * 7 + ph) + 0.15 * math.sin(t * 19 + ph * 2))
        if style == 'fjord':
            hh = 12 + hill_h * (abs(t - 0.5) * 2) ** 0.8        # the sound's head is low (the glacier), the walls rise to the sides
        pts.append((x, y0 - hh))
    if style != 'sea':
        c.poly(pts + [(CW, y0), (0, y0)], far_mix(stone, w, p, 0.35), LAND)
    water_body(c, w, phase, p, y0, rng)
    crowns = []
    # far shore foliage (distance-blended)
    if amt > 0 and style not in ('sea',):
        kinds = {'sporewood': ['tuft'], 'glass': ['tuft', 'spire'], 'pallid': ['spire', 'tuft'], 'fjord': ['spire'],
                 'fen': ['papyrus', 'palm', 'round'], 'swamp': ['round', 'spire'], 'lagoon': ['round', 'palm'], 'reef': ['palm', 'round']}[style]
        size = 2.0 + 2.6 * amt
        if style == 'fjord':                          # spruce ranks down the walls to the tideline
            for row in range(5):
                yb = y0 - 4 - row * 7
                for (x, top, r, kd) in bank_row(c, rng, 0, CW, yb, 2.2 + amt, amt * 1.15, T, ['spire'], w, p, far=0.32 - row * 0.02):
                    if abs(x / CW - 0.5) * 2 > 0.28 + row * 0.12:
                        crowns.append((x, top, r, kd))
            # the glacier front at the head and its waterfalls
            gx = CW * 0.5
            c.poly([(gx - 26, y0), (gx - 20, y0 - 14), (gx + 18, y0 - 15), (gx + 26, y0)], mix(stone, (236, 232, 250), 0.45), LAND)
            for wx in (CW * 0.18, CW * 0.83):
                c.line([(wx, y0 - 34), (wx + 1, y0 - 2)], (232, 230, 246), LAND, width=1)
        else:
            crowns += bank_row(c, rng, 0, CW, y0 + 1, size, amt * 1.35, T, kinds, w, p, far=0.28)
    # the built waters' own forms
    if style == 'mossmere':                           # the Toppled Bridge and the Bell Pool's dun reeds: no green
        bx = CW * 0.62
        c.poly([(bx - 30, y0), (bx - 28, y0 - 10), (bx - 4, y0 - 12), (bx - 2, y0)], mix(stone, INK, 0.1), LAND)
        c.poly([(bx + 6, y0 + 2), (bx + 8, y0 - 6), (bx + 26, y0 - 3), (bx + 27, y0 + 2)], mix(stone, INK, 0.15), LAND)
        for x in range(4, CW, 9):
            c.line([(x, y0 + 1), (x + rng.uniform(-1, 1), y0 - rng.uniform(4, 9))], w['leaf'][p], OTHER)
    if style == 'sporewood':                          # the cap reef: ochre caps on stalks, olive moss on their edges
        for i in range(6):
            x = CW * (0.08 + 0.17 * i) + rng.uniform(-5, 5)
            hh, rr = rng.uniform(14, 24), rng.uniform(7, 11)
            c.rect([x - 1.5, y0 - hh, x + 1.5, y0], mix(stone, (180, 150, 120), 0.3), LAND)
            c.ell([x - rr, y0 - hh - 4, x + rr, y0 - hh + 4], mix((176, 110, 78), w['fog'][p], 0.25 if phase != 'night' else 0.6), LAND)
            if amt > 0:
                c.d.arc([x - rr, y0 - hh - 4, x + rr, y0 - hh + 4], 0, 180, fill=T['mid'] + (255,), width=max(1, int(1 + amt * 2)))
                c.l.arc([x - rr, y0 - hh - 4, x + rr, y0 - hh + 4], 0, 180, fill=LEAF, width=max(1, int(1 + amt * 2)))
    if style == 'glass':                              # the monoliths, mossed on top
        for i, x in enumerate((CW * 0.2, CW * 0.47, CW * 0.74)):
            hh = 30 + 8 * (i % 2)
            c.rect([x - 6, y0 - hh, x + 6, y0], mix(stone, (190, 196, 240), 0.35), LAND)
            c.rect([x - 6, y0 - hh, x + 6, y0 - hh + 2 + amt * 7], T['mid'], LEAF)
            c.d.line([(x - 6, y0 - hh), (x + 2, y0 - hh)], fill=T['lit'] + (255,))
    if style == 'pallid':                             # the ribs, four of them in ivy, and dark cedar spires
        for i in range(5):
            x = CW * (0.1 + 0.2 * i)
            col = mix(stone, (236, 230, 220), 0.3)
            c.d.arc([x - 14, y0 - 34, x + 14, y0 + 14], 190, 260, fill=col + (255,), width=3)
            c.l.arc([x - 14, y0 - 34, x + 14, y0 + 14], 190, 260, fill=LAND, width=3)
            if i % 2 == 0 and amt > 0:
                c.d.arc([x - 14, y0 - 34, x + 14, y0 + 14], 200, 200 + 50 * amt / 0.5, fill=T['dark'] + (255,), width=3)
                c.l.arc([x - 14, y0 - 34, x + 14, y0 + 14], 200, 200 + 50 * amt / 0.5, fill=LEAF, width=3)
    if style == 'sea':                                # the Lamp Rock island near the spawn, a third of the frame, turf and fern on its cliff
        ix = CW * (0.26 + 0.16 * amt)
        top = y0 - 30
        isl = [(0, CH * 0.62), (0, top + 6), (ix * 0.4, top), (ix * 0.9, top + 5), (ix, y0 + 18), (ix * 0.7, CH * 0.6)]
        c.poly(isl, mix(stone, INK, 0.25), LAND)
        c.poly([(0, top + 6), (ix * 0.4, top), (ix * 0.9, top + 5), (ix * 0.95, top + 5 + 22 * amt), (ix * 0.4, top + 4 + 30 * amt), (0, top + 10 + 36 * amt)], T['dark'], LEAF)
        c.poly([(0, top + 6), (ix * 0.4, top), (ix * 0.9, top + 5), (ix * 0.92, top + 5 + 12 * amt), (ix * 0.4, top + 3 + 17 * amt), (0, top + 8 + 20 * amt)], T['mid'], LEAF)
        c.poly([(0, top + 6), (ix * 0.4, top), (ix * 0.9, top + 5), (ix * 0.9, top + 5 + 4 * amt), (ix * 0.4, top + 2 + 6 * amt), (0, top + 7 + 7 * amt)], T['young'], LEAF)
        crowns += bank_row(c, rng, 2, ix * 0.85, top + 6, 3.2, 0.9, T, ['round', 'fern'], w, p)
        c.rect([ix * 0.55, top - 22, ix * 0.55 + 5, top + 2], mix(stone, (236, 232, 244), 0.5), LAND)   # the lighthouse
        c.ell([ix * 0.55 - 1, top - 26, ix * 0.55 + 6, top - 20], CANDLE, OTHER)
        # the far green island in cloud and the reef breakers that bound the water
        fx = CW * 0.78
        c.poly([(fx - 26, y0), (fx - 8, y0 - 22), (fx + 10, y0 - 18), (fx + 30, y0)], far_mix(T['dark'], w, p, 0.55), LEAF)
        for x in range(0, CW, 7):
            c.line([(x, y0 + 2 + (x % 3)), (x + 4, y0 + 2 + (x % 3))], mix(w['sky'][p], (240, 238, 250), 0.6), 0, alpha=150)
    # side shores: the lake's own banks running from the far shore down past the raft, wide near and narrow far (perspective)
    if amt > 0 and style not in ('sea', 'reef', 'mossmere'):
        side = amt
        kinds = {'sporewood': ['tuft', 'fern'], 'glass': ['fern', 'tuft', 'spire'], 'pallid': ['spire', 'tuft', 'spire'], 'fjord': ['spire'],
                 'fen': ['papyrus', 'reed', 'papyrus', 'palm'], 'swamp': ['round'], 'lagoon': ['round', 'palm', 'round']}[style]
        for sgn in (-1, 1):
            x_edge = 0 if sgn < 0 else CW
            reach = CW * (0.06 + 0.30 * side)
            inner = lambda t: x_edge - sgn * reach * (0.12 + 0.88 * t)     # t = 0 at the far shore, 1 at the bottom of the frame
            yy = lambda t: y0 + 1 + (CH - y0) * t
            c.poly([(x_edge, y0 - 2), (inner(0), y0 + 1), (inner(1), CH), (x_edge, CH)], mix(stone, INK, 0.4), LAND)
            if style in ('fen', 'lagoon', 'swamp', 'fjord'):            # a continuous wall of green behind the edge plants
                wall = [(inner(t) + sgn * 2, yy(t) - (3 + 26 * side) * (0.25 + 0.75 * t)) for t in [i / 12 for i in range(13)]]
                c.poly([(x_edge, y0 - 6)] + wall + [(inner(1), CH), (x_edge, CH)], T['dark'], LEAF)
                if style in ('fen', 'lagoon'):              # the lit face of the wall: papyrus heads, mangrove crowns in the light
                    face = [(x_ + sgn * 4, y_ + 7) for (x_, y_) in wall]
                    c.poly([(x_edge, y0 - 6)] + face + [(inner(1) + sgn * 30, CH), (x_edge + sgn * 0, CH)], T['mid'], LEAF)
                for _ in range(int(10 + 40 * side)):     # the wall's own texture: crowns, mop heads, fronds, in depth
                    t = rng.random()
                    bx = inner(t) + sgn * rng.uniform(4, 60) * (0.2 + t)
                    if (sgn < 0 and bx < -4) or (sgn > 0 and bx > CW + 4):
                        continue
                    by = yy(t) - rng.uniform(0, 26 * side) * (0.25 + 0.75 * t)
                    sz = (1.2 + 3.4 * side) * (0.35 + 0.9 * t)
                    kd = {'fen': 'papyrus', 'fjord': 'spire'}.get(style, 'round')
                    if style == 'lagoon' and rng.random() < 0.35:
                        kd = 'tuft'                     # new leaves catching the light on the mangrove crowns
                    crown(c, bx, by, sz, sz * (3.0 if kd != 'round' else 2.0), T, rng, kd)
            for j in range(int(4 + 16 * side)):
                t = rng.random() ** 0.8
                bx = inner(t) + sgn * rng.uniform(0, 6) * (0.3 + t)
                by = yy(t)
                sz = (1.4 + 4.6 * side) * (0.35 + 0.9 * t)
                kd = rng.choice(kinds)
                hgt = sz * (3.0 if kd in ('spire', 'papyrus', 'palm', 'reed') else 2.0)
                crown(c, bx, by, sz, hgt, T, rng, kd)
                crowns.append((bx, by - hgt, sz, kd))
                if style == 'swamp':              # flared trunks on knees, and curtains of lamp-moss from the crowns
                    c.poly([(bx - sz * 0.55, by + 1), (bx - sz * 0.15, by - hgt * 0.45), (bx + sz * 0.15, by - hgt * 0.45), (bx + sz * 0.55, by + 1)], mix(T['deep'], (70, 60, 66), 0.4), LAND)
                    for kx in (bx - sz * 1.1, bx + sz * 1.0):
                        c.poly([(kx - 1.5, by + 4), (kx, by - 1), (kx + 1.5, by + 4)], mix(T['deep'], (70, 60, 66), 0.4), LAND)
                    strands(c, bx - sz * 0.3, by - hgt * 0.85, hgt * 0.95, T, rng, n=4, col=shift(T['young'], 0, -0.12, 1.1))
                if style == 'lagoon':             # mangroves on arched prop roots
                    for q in range(4):
                        rx = bx + (q - 1.5) * sz * 0.55
                        c.d.arc([rx - sz * 0.45, by - sz * 0.9, rx + sz * 0.45, by + sz * 0.7], 180, 360, fill=mix(T['deep'], (72, 58, 60), 0.4) + (255,), width=1)
    if style == 'reef':                               # roof ridges and spires above the water as green keys
        nk = int(4 + 2 * amt)
        for i in range(nk):
            x = CW * (0.08 + 0.84 * i / (nk - 1)) + rng.uniform(-6, 6)
            yb = y0 + 8 + 12 * (i % 3)
            c.poly([(x - 12, yb), (x, yb - 9), (x + 12, yb)], mix(stone, (236, 226, 214), 0.25), LAND)
            c.rect([x + 5, yb - 26, x + 8, yb - 6], mix(stone, (236, 226, 214), 0.25), LAND)
            kw = 8 + 26 * amt
            c.ell([x - kw, yb - 4 - 4 * amt, x + kw, yb + 3 + 2 * amt], T['dark'], LEAF)
            c.ell([x - kw * 0.8, yb - 5 - 4 * amt, x + kw * 0.6, yb], T['mid'], LEAF)
            c.ell([x - kw * 0.7, yb - 5 - 4 * amt, x + kw * 0.1, yb - 2 - 2 * amt], T['young'], LEAF)
            crowns += bank_row(c, rng, x - kw * 0.9, x + kw * 0.9, yb - 3, 2.2 + 2.6 * amt, 0.5 + amt, T, ['palm', 'round'], w, p)
            strands(c, x + 6.5, yb - 24, 16 * amt, T, rng, n=1)
    # the mirror, then the water's own floating things
    top_src = max(0, y0 - 46)
    mirror(c, w, p, top_src, y0, 40)
    ripples(c, w, p, y0, rng)
    if amt > 0:
        if style in ('swamp',):                       # duckweed carpets in the still corners
            for _ in range(int(6 + 14 * amt)):
                x, y = rng.uniform(0, CW), rng.uniform(y0 + 30, CH - 8)
                c.ell([x - 9, y - 2, x + 9, y + 2], T['dark'] if phase == 'night' else T['young'], WLEAF)
        n_pad = int({'fen': 10, 'lagoon': 6, 'reef': 0}.get(style, 3) + 10 * amt)
        for _ in range(n_pad):
            x, y = rng.uniform(4, CW - 4), rng.uniform(y0 + 10, CH - 20)
            rr = 2 + 2.5 * (y - y0) / (CH - y0)
            c.ell([x - rr, y - rr * 0.35, x + rr, y + rr * 0.35], T['dark'] if phase == 'night' else mix(T['mid'], w['water'][p], 0.2), WLEAF)
    if style == 'sea':                                # the Drift Line's weed meadow on the swell
        for _ in range(int(10 * amt)):
            x, y = rng.uniform(CW * 0.4, CW), rng.uniform(y0 + 20, CH - 30)
            c.ell([x - 10, y - 1.6, x + 10, y + 1.6], mix(T['young'], w['water'][p], 0.3), WLEAF)
    return crowns, y0


def paint_pools(c, w, phase, p, rng, amt, T, style):
    """Sporewood Pools as the loop builds it (LAKE2 sections 1A and 3.3): the sail camera on the East Pool looking west to the neck's
    mouth. A ragged window of sky framed by far cap rims; the neck's green walls closing to a gap with the West Pool's far bank beyond;
    the Gill Harp's two cap trees leaning over the neck, their gill strings hanging; the Mother Cap towering on the right, its amber
    gills laying a pool of warm light on the water; near banks on both sides (intimate: banks near on two sides), moss carpets, ferns,
    reeds, shrubs; lily rafts in the shallows. Air, light and water stay the ember garden's; the green is on surfaces only."""
    y0 = int(CH * 0.37)                              # the far waterline: the neck's mouth
    sky(c, w, phase, p, y0, rng)
    stone = stone_of(w, phase, p)
    capC = mix((150, 96, 52), w['fog'][p], 0.3 if phase != 'night' else 0.62)        # autumn-ochre caps
    capFar = far_mix(mix(capC, INK, 0.35), w, p, 0.55)
    gill = {'day': (226, 168, 84), 'dusk': (236, 164, 86), 'night': (232, 172, 76)}[phase]   # the amber gills (the built glow)
    stalk = mix(stone, (120, 100, 110), 0.3)
    # the cap-rim window: far cap silhouettes on the far rim, lavender with distance, framing the sky at the top corners
    for (cx, cy, rx, ry) in ((CW * 0.02, y0 * 0.20, 34, 10), (CW * 0.22, y0 * 0.05, 26, 7), (CW * 0.97, y0 * 0.12, 30, 9), (CW * 0.66, -2, 22, 6)):
        c.rect([cx - 2, cy, cx + 2, y0], far_mix(stalk, w, p, 0.6), LAND)
        c.ell([cx - rx, cy - ry, cx + rx, cy + ry], capFar, LAND)
        c.ell([cx - rx * 0.86, cy + ry * 0.35, cx + rx * 0.86, cy + ry * 0.9], far_mix(gill, w, p, 0.5), OTHER)
    # beyond the neck: the West Pool's far bank, low and lavender, its far crowns
    gx = CW * 0.46                                   # the neck's mouth
    c.poly([(gx - 30, y0), (gx - 22, y0 - 9), (gx + 4, y0 - 11), (gx + 26, y0 - 7), (gx + 34, y0)], far_mix(stone, w, p, 0.45), LAND)
    crowns = bank_row(c, rng, gx - 28, gx + 30, y0 - 6, 1.6 + 1.2 * amt, amt, T, ['round', 'tuft'], w, p, far=0.42)
    # the neck's green walls closing on the gap from both sides (2-3 m, grown over: moss carpet, ferns, shrubs)
    for sgn in (-1, 1):
        x_edge = 0 if sgn < 0 else CW
        inner = gx + sgn * 10
        wall = [(x_edge, y0 - 26), (inner + sgn * 22, y0 - 18), (inner + sgn * 6, y0 - 9), (inner, y0 + 1), (x_edge, y0 + 1)]
        c.poly(wall, mix(stone, INK, 0.38), LAND)
        cover = min(1.0, 0.6 * amt)                  # (the moss carpet over the walls, as much of them as the foliage amount grows)
        top_ = [(x_edge, y0 - 26), (inner + sgn * 22, y0 - 18), (inner + sgn * 6, y0 - 9)]
        foot = [(x_edge, y0 - 26 + 16 * cover), (inner + sgn * 22, y0 - 18 + 9 * cover), (inner + sgn * 6, y0 - 9 + 8 * cover)]
        if cover > 0.02:
            c.poly(top_ + foot[::-1], T['dark'], LEAF)
            c.poly(top_[:2] + [(p_[0], p_[1] - 4 * cover) for p_ in foot[:2][::-1]], T['mid'], LEAF)
        crowns += bank_row(c, rng, min(x_edge, inner + sgn * 30), max(x_edge, inner + sgn * 30), y0 - 14, 2.2 + 2.2 * amt, amt * 1.1, T, ['round', 'fern', 'tuft'], w, p, far=0.12)
    # the Gill Harp: two cap trees leaning over the neck from both banks, their gills hanging down in long strings over the water
    for sgn, top in ((-1, y0 - 44), (1, y0 - 40)):
        bx = gx + sgn * 26
        tx = gx + sgn * 7
        c.line([(bx, y0 - 10), ((bx + tx) / 2 + sgn * 3, (y0 - 10 + top) / 2), (tx, top + 3)], mix(stalk, INK, 0.25), LAND, width=3)
        c.ell([tx - 15, top - 4, tx + 15, top + 5], mix(capC, INK, 0.15), LAND)
        c.ell([tx - 13, top + 2, tx + 13, top + 6], gill, OTHER)
        for k in range(7):                           # the gill strings (amber) and moss threads (green) hanging over the neck
            sx = tx - 11 + k * 3.6
            if k % 2:
                c.line([(sx, top + 5), (sx + rng.uniform(-1, 1), top + 5 + rng.uniform(16, 30))], mix(gill, INK, 0.25), OTHER)
            else:
                c.line([(sx, top + 5), (sx + rng.uniform(-1, 1), top + 5 + rng.uniform(10, 22) * (0.4 + amt))], T['mid'], LEAF)
    # the Mother Cap: 30 m on the Mother's Foot, its cap overhanging the right of the frame, moss and ferns at its foot, vines from its rim
    mx = CW * 0.84
    c.poly([(mx - 7, y0 + 2), (mx - 3, y0 - 60), (mx + 4, y0 - 60), (mx + 9, y0 + 2)], mix(stalk, INK, 0.2), LAND)
    c.poly([(mx - 9, y0 + 3), (mx - 6, y0 - 8 - 10 * amt), (mx + 8, y0 - 6 - 10 * amt), (mx + 13, y0 + 3)], T['dark'], LEAF)   # moss up its foot
    cap_y = y0 - 66
    c.ell([mx - 46, cap_y - 14, mx + 40, cap_y + 12], mix(capC, INK, 0.05), LAND)
    c.d.chord([mx - 40, cap_y - 14, mx + 20, cap_y + 4], 180, 320, fill=mix(capC, (240, 200, 150), 0.25) + (255,))
    c.ell([mx - 42, cap_y + 4, mx + 36, cap_y + 14], gill, OTHER)
    for k in range(9):                               # vines hanging from its rim
        vx = mx - 40 + k * 9 + rng.uniform(-2, 2)
        strands(c, vx, cap_y + 10, (14 + 14 * amt) * rng.uniform(0.6, 1.0), T, rng, n=1, col=T['dark'] if k % 3 else T['mid'])
    # the near banks on both sides: earth and root faces under moss carpets, ferns, reeds and shrubs, wide near and narrow far
    for sgn in (-1, 1):
        x_edge = 0 if sgn < 0 else CW
        reach = CW * 0.24                            # (the near banks are near on two sides: their earth is there whatever grows on it)
        inner = lambda t: x_edge - sgn * reach * (0.18 + 0.82 * t)
        yy = lambda t: y0 + 1 + (CH - y0) * t
        c.poly([(x_edge, y0 - 2), (inner(0), y0 + 1), (inner(1), CH), (x_edge, CH)], mix(stone, INK, 0.45), LAND)
        cov = min(1.0, 0.7 * amt)                    # (the moss carpet over the bank's top, the foliage amount's share of it)
        top = [(inner(t) + sgn * 3, yy(t) - (3 + 10 * cov) * (0.3 + 0.7 * t)) for t in [i / 10 for i in range(11)]]
        inn = [(x_edge + (x_ - x_edge) * cov, y_) for (x_, y_) in top]
        c.poly(inn + [(x_edge, CH)] + [(x_edge, y0 - 4)], T['dark'], LEAF)
        c.poly([(x_edge + (x_ + sgn * 5 - x_edge) * cov * 0.8, y_ + 3) for (x_, y_) in top] + [(x_edge, CH), (x_edge, y0 - 4)], T['mid'], LEAF)
        for j in range(int(6 + 18 * amt)):
            t = rng.random() ** 0.8
            bx = inner(t) + sgn * rng.uniform(0, 5) * (0.3 + t)
            by = yy(t) - (2 + 8 * amt) * (0.3 + 0.7 * t)
            sz = (1.2 + 3.6 * amt) * (0.35 + 0.9 * t)
            kd = rng.choice(['fern', 'tuft', 'reed', 'round'])
            hgt = sz * (3.0 if kd == 'reed' else 2.0)
            crown(c, bx, by, sz, hgt, T, rng, kd)
            crowns.append((bx, by - hgt, sz, kd))
    # the water: plum, deepening toward the viewer, the sky in the far grazing water; the banks and caps in the mirror
    for y in range(y0, CH):
        t = (y - y0) / (CH - y0)
        col = mix(mix(w['water'][p], w['sky'][p], 0.42 * (1 - t) ** 2), mul(w['water'][p], 0.62), t ** 0.9)
        x0, x1 = 0, CW
        px = c.img.load()
        lab = c.lab.load()
        for x in range(CW):
            if lab[x, y] in (OTHER,) and px[x, y] == INK:
                px[x, y] = col
                lab[x, y] = WATER
    mirror(c, w, p, max(0, y0 - 46), y0, 44)
    ripples(c, w, p, y0, rng, 30, CW - 30)
    # the amber pools under the caps on the water (warm light, never a ring: soft, falling off)
    for (px_, py_, rr) in ((mx - 4, y0 + 10, 22), (gx, y0 + 6, 12)):
        for k in range(6, 0, -1):
            c.d.ellipse([px_ - rr * k / 6, py_ - rr * k / 24, px_ + rr * k / 6, py_ + rr * k / 24], fill=gill + (int(10 + 8 * (6 - k) * (1.3 if phase == 'night' else 1.0)),))
    # lily and leaf rafts in the shallows by the near banks; cream and rose flowers on them by day and dusk
    for _ in range(int(4 + 12 * amt)):
        sgn = rng.choice((-1, 1))
        t = rng.uniform(0.15, 0.9)
        x = (0 if sgn < 0 else CW) - sgn * CW * 0.24 * (0.18 + 0.82 * t) - sgn * rng.uniform(4, 16) * (0.3 + t)
        y = y0 + 1 + (CH - y0) * t + rng.uniform(-2, 2)
        for q in range(rng.randint(2, 5)):
            rr = (1.6 + 2.2 * t) * rng.uniform(0.7, 1.1)
            qx, qy = x + rng.uniform(-6, 6) * (0.4 + t), y + rng.uniform(-1.5, 1.5)
            c.ell([qx - rr, qy - rr * 0.35, qx + rr, qy + rr * 0.35], T['dark'] if phase == 'night' else mix(T['mid'], w['water'][p], 0.2), WLEAF)
    return crowns, y0


def paint_river(c, w, phase, p, rng, amt, T, style):
    """The sail camera looks up the channel (it yaws to the river's tangent): banks converge to a bend under the landmark."""
    k = w['step']
    y0 = int(CH * 0.30) if style != 'canopy' else int(CH * 0.40)
    sky(c, w, phase, p, y0, rng)
    stone = stone_of(w, phase, p)
    water_body(c, w, phase, p, y0, rng)
    wide = {'braided': 0.95, 'wide': 1.0, 'gorge': 0.48, 'stair': 0.62, 'tidal': 0.78, 'canopy': 0.62}[style]
    vx = CW * 0.56
    # the channel: from the bottom (width ~wide x CW) to the bend at the horizon (width ~0.12 CW)
    lb = lambda t: (vx - CW * 0.07) + (CW * (0.5 - wide / 2) - (vx - CW * 0.07)) * t       # t = 0 at the bend, 1 at the bottom
    rb = lambda t: (vx + CW * 0.07) + (CW * (0.5 + wide / 2) - (vx + CW * 0.07)) * t
    yt = lambda t: y0 + (CH - y0) * t
    wall = {'gorge': 1.0, 'stair': 0.7, 'canopy': 0.2}.get(style, 0.0)
    # far bend bank and the hills beyond (lavender with distance)
    hills = [(x, y0 - (8 + 10 * wall + 6 * math.sin(x * 0.09 + 1.3))) for x in range(0, CW + 1, 4)]
    c.poly(hills + [(CW, y0 + 1), (0, y0 + 1)], far_mix(stone, w, p, 0.4), LAND)
    if amt > 0:
        bank_row(c, rng, 0, CW, y0 - 2, 2.0 + 2.4 * amt, amt * 1.3, T, ['round', 'spire'] if style in ('gorge',) else ['round'], w, p, far=0.42)
    # the landmark at the head of the reach, framed by the converging banks
    lx = vx
    if style == 'braided':                      # the broken royal weir: a white sill across the channel
        c.rect([lx - 22, y0 - 3, lx + 22, y0 + 2], mix(stone, (236, 232, 244), 0.4), LAND)
        c.line([(lx - 22, y0 + 3), (lx + 22, y0 + 3)], (240, 238, 250), 0, width=2)
    if style == 'gorge':                        # the temple stairs and the floating pyres
        for i in range(5):
            c.rect([lx - 16 + i * 3, y0 - 2 - i * 3, lx + 4, y0 - i * 3], mix(stone, (236, 226, 210), 0.3), LAND)
        for i in range(4):
            c.ell([lx - 10 + i * 6, y0 + 3 + i, lx - 8 + i * 6, y0 + 5 + i], CANDLE, OTHER)
    if style == 'stair':                        # the broken lock stair, its falls and two towers with amber lamps
        for i in range(3):
            c.rect([lx - 18, y0 - 6 - i * 6, lx + 18, y0 - i * 6], mix(stone, INK, 0.1), LAND)
            c.line([(lx - 14 + i * 9, y0 - 6 - i * 6), (lx - 13 + i * 9, y0 + 2)], (238, 236, 250), 0, width=2)
        for tx in (lx - 24, lx + 22):
            c.rect([tx, y0 - 30, tx + 5, y0], mix(stone, INK, 0.2), LAND)
            c.ell([tx + 1, y0 - 28, tx + 4, y0 - 25], CANDLE, OTHER)
            strands(c, tx + 2.5, y0 - 30, 24 * amt, T, rng, n=2)
    if style == 'tidal':                        # the open sea-gate and the harbour light's stump
        for tx in (lx - 20, lx + 14):
            c.rect([tx, y0 - 16, tx + 6, y0], mix(stone, (236, 226, 214), 0.25), LAND)
        c.ell([lx + 15, y0 - 20, lx + 19, y0 - 16], CANDLE, OTHER)
    if style == 'wide':                         # the Seam: amber water beside ink water, unmixed
        c.poly([(lx, y0 + 1), (lx + 6, y0 + 1), (CW * 0.66, CH), (CW * 0.52, CH)], mix(w['water'][p], (24, 18, 30), 0.55), WATER)
    # banks: left and right, with plants on them sized by distance; near the camera only low kinds (under 1.2 m)
    crowns = []
    kinds = {'braided': ['reed', 'round', 'tuft'], 'gorge': ['spire', 'round', 'fern', 'reed'], 'stair': ['round', 'palm', 'fern'],
             'tidal': ['round', 'round', 'palm'], 'wide': ['round', 'round', 'palm', 'spire'], 'canopy': ['round', 'round', 'fern']}[style]
    for side in (-1, 1):
        edge = lb if side < 0 else rb
        outer = 0 if side < 0 else CW
        rise = 22 + 58 * wall                       # how far the bank rises above the water at the bottom of the frame
        pts = [(edge(t), yt(t) - (rise * t if wall else 2 * t)) for t in [i / 20 for i in range(21)]]
        land = [(edge(0), y0)] + pts + [(outer, CH), (outer, y0 - 4 - 30 * wall)]
        c.poly(land, mix(stone, INK, 0.45 - 0.15 * wall), LAND)
        if amt > 0 and not wall:                    # the green bank: a wall of leaves behind the edge plants, lower near the camera
            hmax = (4 + 34 * amt) * (0.6 if style == 'braided' else 1.0)
            prof = [(edge(t) + side * 3, yt(t) - 2 * t - hmax * (0.35 + 0.65 * math.sin(math.pi * min(1.0, t * 1.25)) ** 0.7)) for t in [i / 16 for i in range(17)]]
            back = [(edge(t) + side * (4 + 70 * amt) * t ** 0.8, yt(t) - hmax * 0.3 * t) for t in [i / 16 for i in range(16, -1, -1)]]
            c.poly(prof + back, T['dark'], LEAF)
            for (x_, y_) in prof[1:-1:2]:
                c.d.chord([x_ - 7, y_ - 1, x_ + 7, y_ + 9], 180, 320, fill=T['mid'] + (255,))
                c.d.chord([x_ - 6, y_ - 1, x_ + 2, y_ + 5], 180, 300, fill=T['lit'] + (255,))
        if amt > 0 and wall:                        # the hanging forest on the gorge's ledges
            for i in range(int(4 + 18 * amt)):
                t = rng.uniform(0.1, 1.0)
                yy_ = yt(t) - rise * t * rng.uniform(0.2, 1.0)
                x_ = edge(t) + side * rng.uniform(2, 40) * t
                ww = (6 + 16 * amt) * t
                c.ell([x_ - ww, yy_ - ww * 0.35, x_ + ww, yy_ + ww * 0.25], T['dark'], LEAF)
                c.ell([x_ - ww * 0.8, yy_ - ww * 0.35, x_ + ww * 0.5, yy_ + ww * 0.05], T['mid'], LEAF)
        if wall:                                    # the gorge's stone-white walls, the hanging forest on their ledges
            for i in range(1, 9):
                t = i / 9
                yy = yt(t) - rise * t * rng.uniform(0.2, 0.9)
                ex = edge(t) + side * rng.uniform(2, 14) * t
                c.line([(edge(t) + side, yy), (ex + side * 18 * t, yy)], mix(stone, (236, 232, 244), 0.3), LAND, width=1)
        for i in range(int(6 + 26 * amt)):
            t = rng.uniform(0.04, 1.0) ** 0.8
            scale = 0.25 + 1.6 * t
            bx = edge(t) + side * rng.uniform(0.5, 1.0 + 30 * scale * amt)
            if (side < 0 and bx < 0) or (side > 0 and bx > CW):
                continue
            by = yt(t) - (rise * t * rng.uniform(0.3, 1.0) if wall else rng.uniform(0, 4) * scale)
            near = t > 0.72                         # the camera band: reeds, tufts and pads only
            kd = rng.choice(['reed', 'tuft', 'fern']) if near else rng.choice(kinds)
            sz = (1.6 + 4.2 * amt) * scale * (0.5 if near else 1.0)
            hgt = sz * (3.0 if kd in ('spire', 'palm', 'reed', 'papyrus') else 2.0)
            crown(c, bx, by, sz, hgt, T, rng, kd)
            crowns.append((bx, by - hgt, sz, kd))
            if style == 'tidal' and not near and kd == 'round':        # mangrove prop roots
                for q in range(3):
                    rx = bx + (q - 1) * sz * 0.6
                    c.d.arc([rx - sz * 0.4, by - sz * 0.6, rx + sz * 0.4, by + sz * 0.5], 180, 360, fill=mix(T['deep'], (72, 58, 60), 0.4) + (255,), width=1)
            if style == 'wide' and not near and rng.random() < 0.35:   # an emergent tree over the tiered wall
                c.line([(bx, by), (bx, by - hgt * 1.8)], T['deep'], LEAF)
                c.ell([bx - sz * 0.9, by - hgt * 2.2, bx + sz * 0.9, by - hgt * 1.5], T['dark'], LEAF)
            if style in ('canopy', 'stair') and not near and rng.random() < 0.5:
                strands(c, bx, by - hgt * 0.5, hgt * 1.2, T, rng, n=2)
    # the overhead canopy of the Inkwood: green on green, roots and vines hanging into the frame, moon coins through it at night
    if style == 'canopy':
        band = int(CH * (0.08 + 0.16 * amt))
        for x in range(-6, CW + 8, 9):
            r = rng.uniform(5, 8) + 6 * amt
            yy = rng.uniform(-6, band * 0.5)
            c.ell([x - r, yy - r, x + r, yy + r * 1.1], T['dark'], LEAF)
            c.ell([x - r * 0.8, yy - r, x + r * 0.6, yy + r * 0.8], T['mid'], LEAF)
            c.d.chord([x - r * 0.8, yy - r * 0.2, x + r * 0.2, yy + r * 0.9], 0, 180, fill=T['lit'] + (255,))
        for x in range(0, CW, 6):
            if rng.random() < 0.6 * min(1.0, amt):
                strands(c, x, band * rng.uniform(0.4, 0.8), rng.uniform(12, 40) * amt, T, rng, n=1, col=T['deep'] if rng.random() < 0.5 else T['dark'])
        for _ in range(4):                          # gaps: the sky through the leaves (moon coins at night)
            gx, gy = rng.uniform(10, CW - 10), rng.uniform(4, band * 0.5)
            col = mix(ZENITH[phase], w['sky'][p], 0.5)
            c.ell([gx - 5, gy - 3, gx + 5, gy + 3], col if phase != 'night' else mix(col, MOON, 0.4), SKY)
        for tx in (CW * 0.3, CW * 0.72):            # trunks standing in the water to their waists
            c.rect([tx - 2, y0 - 10, tx + 2, y0 + 14], mix(T['deep'], (40, 30, 40), 0.5), LAND)
    # the mirror of the bend and banks, then the river's own water marks
    mirror(c, w, p, max(0, y0 - 40), y0, 34, fade=0.6)
    for i in range(int(5 + 3 * (style in ('braided', 'gorge', 'stair')))):          # foam lines following the channel
        u = rng.uniform(0.15, 0.85)
        t0, t1 = rng.uniform(0.05, 0.5), rng.uniform(0.6, 1.0)
        xa, xb = lb(t0) + (rb(t0) - lb(t0)) * u, lb(t1) + (rb(t1) - lb(t1)) * u
        c.line([(xa, yt(t0)), (xb, yt(t1))], (236, 232, 246), 0, width=1, alpha=110)
    if style == 'braided':                          # pale sand bars in the channel and drifting reed islands
        for i in range(4):
            t = 0.2 + 0.18 * i
            xm = lb(t) + (rb(t) - lb(t)) * rng.uniform(0.25, 0.75)
            sw = (rb(t) - lb(t)) * 0.18
            c.ell([xm - sw, yt(t) - 2 * t, xm + sw, yt(t) + 3 * t], mix(stone, (214, 190, 150), 0.4), LAND)
            if amt > 0:
                crown(c, xm, yt(t), 2 + 3 * t * amt * 2, 5 * t + 4 * amt, T, rng, 'reed')
    if style == 'wide' and amt > 0:                 # floating meadows and giant lilies
        for _ in range(int(4 + 10 * amt)):
            t = rng.uniform(0.15, 0.9)
            xm = lb(t) + (rb(t) - lb(t)) * rng.choice([rng.uniform(0.02, 0.2), rng.uniform(0.8, 0.98)])
            sw = 4 + 12 * t
            c.ell([xm - sw, yt(t) - 1.5 * t - 1, xm + sw, yt(t) + 2 * t + 1], mix(T['mid'], T['young'], 0.4), WLEAF)
        for _ in range(int(3 + 5 * amt)):
            t = rng.uniform(0.5, 0.95)
            xm = lb(t) + (rb(t) - lb(t)) * rng.uniform(0.05, 0.3)
            rr = 3 + 4 * t
            c.ell([xm - rr, yt(t) - rr * 0.35, xm + rr, yt(t) + rr * 0.35], mix(T['mid'], w['water'][p], 0.2), WLEAF)
    if style == 'tidal':                            # the mudflats shining at dusk
        for _ in range(3):
            t = rng.uniform(0.3, 0.8)
            xm = lb(t) + (rb(t) - lb(t)) * rng.uniform(0.05, 0.25)
            c.ell([xm - 10 * t, yt(t) - 2, xm + 10 * t, yt(t) + 2], mix(stone, w['sky'][p], 0.5), LAND)
    if style == 'canopy':                           # blossom and petals on the black mirror
        for _ in range(8):
            c.d.point((rng.uniform(CW * 0.3, CW * 0.8), rng.uniform(y0 + 20, CH - 20)), fill=w['accent'][p] + (220,))
    return crowns, y0


STYLE = {1: ('lake', 'mossmere'), 2: ('lake', 'pools'), 3: ('lake', 'glass'), 4: ('lake', 'pallid'), 5: ('lake', 'fjord'),
         6: ('river', 'braided'), 7: ('lake', 'sea'), 8: ('river', 'gorge'), 9: ('lake', 'reef'), 10: ('river', 'stair'),
         11: ('lake', 'fen'), 12: ('river', 'tidal'), 13: ('lake', 'swamp'), 14: ('river', 'wide'), 15: ('lake', 'lagoon'),
         16: ('river', 'canopy')}


def night_lights(k):
    """Fireflies and glow-moss per cell at night: the built waters' own glows first, fireflies from step 5, more with each step."""
    return 3 + 2 * k if k < 5 else 6 + 3 * k


def paint(w, phase, amt):
    p = PHASES.index(phase)
    rng = random.Random(1000 + w['n'] * 31)
    c = Cell()
    T = tones(w, phase, p)
    layout, style = STYLE[w['n']]
    crowns, y0 = (paint_pools if style == 'pools' else paint_lake if layout == 'lake' else paint_river)(c, w, phase, p, rng, amt, T, style)
    flowers_and_lights(c, w, phase, p, crowns or [(CW * 0.5, y0 - 4, 6, 'x')], random.Random(77 + w['n']), w['step'], night_lights(w['step']))
    candle(c, w, phase, int(CW * 0.5), int(CH * 0.86))
    return c


# ----------------------------------------------------------------------------------------------------------- the measure
def measure(c):
    """hue-report's metric on a cell, by band (sky, water, the rest) and for the whole frame."""
    px, lab = c.img.load(), c.lab.load()
    acc = {b: [0.0, 0.0] for b in ('all', 'sky', 'water', 'bank', 'float')}
    teal = neon = 0.0
    fam = [0.0, 0.0, 0.0]                      # yellow-green 65-100, green 100-140, blue-green 140-195
    oka = 0.0
    okair = [0.0, 0]
    n = CW * CH
    cnt = {SKY: 0, LEAF: 0}
    nonsky = 0
    for y in range(CH):
        for x in range(CW):
            r, g, b = px[x, y]
            L = lab[x, y]
            a_ = oklab_a((r, g, b))
            oka += a_
            if L not in (LEAF, WLEAF):
                okair[0] += a_
                okair[1] += 1
            if L in cnt:
                cnt[L] += 1
            if L != SKY:
                nonsky += 1
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if v <= 0.06 or s <= 0.10:
                continue
            wgt, hd = s * v, h * 360
            band = 'sky' if L == SKY else 'water' if L == WATER else 'float' if L == WLEAF else 'bank'
            green = 65 <= hd < 160
            for key in ('all', band):
                acc[key][0] += wgt
                if green:
                    acc[key][1] += wgt
            if 160 <= hd < 195:
                teal += 1
            if green and s > 0.6 and v > 0.6:
                neon += 1
            if 65 <= hd < 100:
                fam[0] += wgt
            elif 100 <= hd < 140:
                fam[1] += wgt
            elif 140 <= hd < 195:
                fam[2] += wgt
    share = {k: (100 * v[1] / v[0] if v[0] else 0.0) for k, v in acc.items()}
    gsum = sum(fam) or 1.0
    return {'share': share['all'], 'sky': share['sky'], 'water': share['water'], 'bank': share['bank'],
            'skyfrac': 100 * cnt[SKY] / n, 'okair': okair[0] / max(1, okair[1]), 'cover': 100 * cnt[LEAF] / max(1, nonsky), 'oka': oka / n,
            'teal': 100 * teal / n, 'neon': 100 * neon / n,
            'fam': [100 * f / gsum for f in fam], 'ff': c.fireflies}


def tol(target):
    return max(0.5, min(1.5, 0.1 * target))


def gates(waters, M):
    fails = []
    prev = None
    for w in waters:
        n, k = w['n'], w['step']
        m = M[n]
        for p, phase in enumerate(PHASES):
            got, want = m[phase]['share'], w['share'][p]
            if k == 0:
                if got > 1.0:
                    fails.append(f"{w['name']} {phase}: {got:.1f}% green (the Mossmere keeps today's gate, <= 1%)")
            elif abs(got - want) > tol(want):
                fails.append(f"{w['name']} {phase}: measured {got:.1f}% against the doc's {want:g}% (tolerance {tol(want):.1f})")
            mm = m[phase]
            if mm['bank'] > 0 and mm['water'] > 0.6 * mm['bank'] + 0.5:
                fails.append(f"{w['name']} {phase}: the water band is {mm['water']:.1f}% green, over 0.6 x the bank band's {mm['bank']:.1f}%")
            if mm['sky'] > 2.0:
                fails.append(f"{w['name']} {phase}: the sky band is {mm['sky']:.1f}% green (<= 2%)")
            if mm['skyfrac'] < (6 if STYLE[n][1] == 'canopy' else 12):
                fails.append(f"{w['name']} {phase}: only {mm['skyfrac']:.1f}% of the frame is sky")
            if mm['neon'] > 0.3:
                fails.append(f"{w['name']} {phase}: {mm['neon']:.2f}% neon green pixels (<= 0.3%)")
            if mm['teal'] > 2.0:
                fails.append(f"{w['name']} {phase}: teal {mm['teal']:.1f}% of the frame (<= 2%)")
            if mm['okair'] < -0.004:
                fails.append(f"{w['name']} {phase}: mean Oklab a of the sky, water and stone {mm['okair']:+.4f} (a green cast: must be >= -0.004)")
            if k >= 6 and phase == 'day' and min(mm['fam']) < 10:
                fails.append(f"{w['name']} day: green families {', '.join(f'{x:.0f}' for x in mm['fam'])}% (each >= 10% from step 6)")
        if m['night']['share'] < 0.25 * m['day']['share'] - 0.2:
            fails.append(f"{w['name']}: night {m['night']['share']:.1f}% is under 25% of day {m['day']['share']:.1f}%")
        if prev is not None and prev['n'] in EXCEPT:
            pass                                      # (the step out of the exception: pending until re-stepped, main() prints it)
        elif prev is not None and n in EXCEPT:
            pm = M[prev['n']]                          # (the step into it: it must rise by at least a step, with no upper bound)
            for phase, least in (('day', 1.5), ('dusk', 1.0), ('night', 0.5)):
                if m[phase]['share'] - pm[phase]['share'] < least:
                    fails.append(f"{prev['name']} -> {w['name']}: the {phase} step is {m[phase]['share'] - pm[phase]['share']:+.1f} points (>= {least}, the exception)")
            if m['night']['ff'] < pm['night']['ff']:
                fails.append(f"{prev['name']} -> {w['name']}: the night lights fall ({pm['night']['ff']} -> {m['night']['ff']})")
        elif prev is not None:
            pm = M[prev['n']]
            d = m['day']['share'] - pm['day']['share']
            if not (1.5 <= d <= 5.0):
                fails.append(f"{prev['name']} -> {w['name']}: the day step is {d:+.1f} points (1.5-5)")
            if m['dusk']['share'] - pm['dusk']['share'] < 1.0:
                fails.append(f"{prev['name']} -> {w['name']}: the dusk step is {m['dusk']['share'] - pm['dusk']['share']:+.1f} points (>= 1)")
            if m['night']['share'] - pm['night']['share'] < 0.5:
                fails.append(f"{prev['name']} -> {w['name']}: the night step is {m['night']['share'] - pm['night']['share']:+.1f} points (>= 0.5)")
            if m['night']['ff'] < pm['night']['ff']:
                fails.append(f"{prev['name']} -> {w['name']}: the night lights fall ({pm['night']['ff']} -> {m['night']['ff']})")
        prev = w
    return fails


def fit(waters):
    only = [int(x) for x in os.environ.get('FIT_ONLY', '').split(',') if x]
    for w in waters:
        if only and w['n'] not in only:
            continue
        if w['step'] == 0:
            AMOUNT[w['n']] = 0.0
            continue
        lo, hi = 0.0, 2.6
        for _ in range(18):
            mid = (lo + hi) / 2
            if measure(paint(w, 'day', mid))['share'] < w['share'][0]:
                lo = mid
            else:
                hi = mid
        best = (lo + hi) / 2
        cands = [best + d * 0.01 for d in range(-25, 26)]
        AMOUNT[w['n']] = round(min((a for a in cands if a > 0), key=lambda a: abs(measure(paint(w, 'day', a))['share'] - w['share'][0])), 3)
        for p, phase in ((1, 'dusk'), (2, 'night')):
            lo, hi = 0.6, 1.7
            for _ in range(16):
                LIGHT[phase][w['n']] = (lo + hi) / 2
                if measure(paint(w, phase, AMOUNT[w['n']]))['share'] < w['share'][p]:
                    lo = LIGHT[phase][w['n']]
                else:
                    hi = LIGHT[phase][w['n']]
            LIGHT[phase][w['n']] = round((lo + hi) / 2, 3)
    print('AMOUNT = {' + ', '.join(f"{n}: {a}" for n, a in AMOUNT.items()) + '}')
    print("LIGHT = {'dusk': {" + ', '.join(f"{n}: {a}" for n, a in LIGHT['dusk'].items()) + "}, 'night': {" + ', '.join(f"{n}: {a}" for n, a in LIGHT['night'].items()) + '}}')


# ----------------------------------------------------------------------------------------------------------- the sheet
def font(size, bold=False):
    for name in (('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'), 'LiberationSans-Regular.ttf'):
        for d in ('/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/truetype/liberation', '/Library/Fonts', 'C:/Windows/Fonts'):
            q = os.path.join(d, name)
            if os.path.exists(q):
                return ImageFont.truetype(q, size)
    return ImageFont.load_default()


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
    waters, repaint = read_doc(DOC)
    errs = lint(waters, repaint)
    if '--fit' in sys.argv:
        fit(waters)
    cells, M = {}, {}
    for w in waters:
        M[w['n']] = {}
        for phase in PHASES:
            c = paint(w, phase, AMOUNT[w['n']])
            cells[(w['n'], phase)] = c
            M[w['n']][phase] = measure(c)
    fails = gates(waters, M)
    Wd = LEFT + CW * len(waters) + 12
    Ht = TOP + CH * 3 + BOTTOM
    sheet = Image.new('RGB', (Wd, Ht), PAPER)
    d = ImageDraw.Draw(sheet)
    f_name, f_small, f_row = font(12, bold=True), font(10), font(13, bold=True)
    for i, w in enumerate(waters):
        x0 = LEFT + i * CW
        for kk, ln in enumerate(wrap(f"{w['n']}. {w['name'].replace('The ', '')}", f_name, CW - 10, d)[:2]):
            d.text((x0 + 6, 6 + kk * 15), ln, font=f_name, fill=TEXT)
        d.text((x0 + 6, 40), f"{w['kind']} · step {w['step']}", font=f_small, fill=DIM)
        for p, phase in enumerate(PHASES):
            sheet.paste(cells[(w['n'], phase)].img, (x0, TOP + p * CH))
            m = M[w['n']][phase]
            ok = w['step'] == 0 and m['share'] <= 1.0 or abs(m['share'] - w['share'][p]) <= tol(w['share'][p])
            d.rectangle([x0 + 3, TOP + p * CH + CH - 15, x0 + 102, TOP + p * CH + CH - 2], fill=(10, 8, 26))
            d.text((x0 + 6, TOP + p * CH + CH - 14), f"{m['share']:.1f}% / {w['share'][p]:g}%", font=f_small, fill=OKC if ok else BAD)
    for p, phase in enumerate(PHASES):
        d.text((10, TOP + p * CH + CH // 2 - 8), phase, font=f_row, fill=TEXT)
    # the measured ramp: day, dusk and night shares as three lines under the columns, the doc's targets as ticks
    base = TOP + 3 * CH + BOTTOM - 26
    top_share = max(1.0, max(max(w['share']) for w in waters))
    scale = (BOTTOM - 46) / top_share
    d.text((8, base - 92), 'green', font=f_small, fill=DIM)
    d.text((8, base - 80), 'share,', font=f_small, fill=DIM)
    d.text((8, base - 68), 'measured', font=f_small, fill=DIM)
    d.text((8, base - 44), '— day', font=f_small, fill=(230, 226, 150))
    d.text((8, base - 32), '— dusk', font=f_small, fill=(236, 170, 190))
    d.text((8, base - 20), '— night', font=f_small, fill=(170, 160, 240))
    for p, col in enumerate(((230, 226, 150), (236, 170, 190), (170, 160, 240))):
        pts = [(LEFT + i * CW + CW / 2, base - M[w['n']][PHASES[p]]['share'] * scale) for i, w in enumerate(waters)]
        d.line(pts, fill=col, width=2)
        for i, w in enumerate(waters):
            x = LEFT + i * CW + CW / 2
            d.line([(x - 6, base - w['share'][p] * scale), (x + 6, base - w['share'][p] * scale)], fill=col, width=1)
            d.ellipse([pts[i][0] - 2, pts[i][1] - 2, pts[i][0] + 2, pts[i][1] + 2], fill=col)
    for i, w in enumerate(waters):
        m = M[w['n']]
        d.text((LEFT + i * CW + 8, base + 6), f"{m['day']['share']:.1f} · {m['dusk']['share']:.1f} · {m['night']['share']:.1f}", font=f_small, fill=DIM)
    d.text((LEFT, Ht - 16), f"lint {'ok' if not errs else str(len(errs)) + ' errors'} · gates {'ok' if not fails else str(len(fails)) + ' failed'}  "
           "(tools/loop-colour-script.py; the measure is tools/hue-report.mjs's)", font=f_small, fill=OKC if not (errs or fails) else BAD)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    sheet.save(out)
    print(f'colour script: {len(waters)} waters x 3 phases -> {os.path.relpath(out)}')
    print('water                 step   day  (target)   dusk (target)  night (target)  sky%  cover  lights  water/bank day  Oklab a day/night')
    for w in waters:
        m = M[w['n']]
        print(f"{w['n']:>2} {w['name'][:20]:<20} {w['step']:>3}  " + '  '.join(f"{m[ph]['share']:5.1f} ({w['share'][p]:>4g})" for p, ph in enumerate(PHASES))
              + f"  {m['day']['skyfrac']:4.0f}  {m['night']['cover']:5.0f}  {m['night']['ff']:5d}   {m['day']['water']:4.1f}/{m['day']['bank']:4.1f}   {m['day']['oka']:+.4f}/{m['night']['oka']:+.4f}")
    for i, w in enumerate(waters[1:], 1):
        if waters[i - 1]['n'] in EXCEPT:
            pm, m = M[waters[i - 1]['n']], M[w['n']]
            print(f"PENDING {waters[i - 1]['name']} -> {w['name']}: day {m['day']['share'] - pm['day']['share']:+.1f} points ({EXCEPT[waters[i - 1]['n']]})")
    for e in errs:
        print('LINT ', e)
    for f_ in fails:
        print('GATE ', f_)
    print('all lint and gates pass' if not (errs or fails) else f'{len(errs)} lint error(s), {len(fails)} gate failure(s)')
    return 1 if (errs or fails) else 0


if __name__ == '__main__':
    sys.exit(main())
