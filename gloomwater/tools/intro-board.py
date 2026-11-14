#!/usr/bin/env python3
"""The opening cut scene's storyboard sheet, from the frames of tools/tests/intro-board.scenario.mjs.

  python3 tools/intro-board.py sheet tools/out/intro/board tools/out/intro/storyboard.jpg [--cols=4] [--tile=480] [--title="..."]
  python3 tools/intro-board.py video tools/out/intro/video tools/out/intro/intro.mp4 [--fps=12] [--crf=23]

sheet: one tile per frame of frames.json, each captioned with its time and the line on screen, a one-line title on top.
video: the frames in order through ffmpeg (libx264, yuv420p).
"""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

def font(size, bold=False, italic=False):
    names = (['DejaVuSans-Bold.ttf'] if bold else []) + (['DejaVuSerif-Italic.ttf', 'LiberationSerif-Italic.ttf'] if italic else []) + ['DejaVuSans.ttf', 'LiberationSans-Regular.ttf']
    for n in names:
        for d in ('/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/truetype/liberation'):
            p = os.path.join(d, n)
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def opts(argv):
    o = {}
    for a in argv:
        if a.startswith('--'):
            k, _, v = a[2:].partition('=')
            o[k] = v if v else True
    return o

def sheet(src, out, o):
    meta = json.load(open(os.path.join(src, 'frames.json')))
    frames = meta['frames']
    cols = int(o.get('cols', 4))
    W, H = meta['width'], meta['height']
    tile_w = int(o.get('tile', 480 if W >= H else W))
    tile_h = round(tile_w * H / W)
    pad, cap_h, head_h = 10, 46, 64
    rows = (len(frames) + cols - 1) // cols
    sw = pad + cols * (tile_w + pad)
    sh = head_h + rows * (tile_h + cap_h + pad) + pad
    ink, pale, dim, amber = (10, 12, 25), (236, 235, 246), (150, 148, 190), (232, 190, 119)
    img = Image.new('RGB', (sw, sh), ink)
    d = ImageDraw.Draw(img)
    title = o.get('title') or 'Gloomwater: the opening cut scene, "One Warm Light" (%g s). One frame every %g s, then play.' % (meta['length'], meta['step'])
    d.text((pad + 2, 18), title, font=font(22 if sw > 1200 else 17, bold=True), fill=pale)
    f_t, f_l = font(15, bold=True), font(15, italic=True)
    for i, fr in enumerate(frames):
        x = pad + (i % cols) * (tile_w + pad)
        y = head_h + (i // cols) * (tile_h + cap_h + pad)
        im = Image.open(os.path.join(src, fr['file'])).convert('RGB')
        if im.size != (tile_w, tile_h):
            im = im.resize((tile_w, tile_h), Image.LANCZOS)
        img.paste(im, (x, y))
        d.rectangle([x - 1, y - 1, x + tile_w, y + tile_h], outline=(40, 40, 70))
        if fr['kind'] == 'film':
            t = fr['t']
            head = ('%.2f' % t).rstrip('0').rstrip('.') + ' s'
            line = fr.get('line') or ''
            # a line on its way in or out (under half strength): named, dimmed
            fading = next((l for l in meta.get('lines', []) if l['at'] <= t < l['out']), None) if not line and (fr.get('lineK') or 0) > 0.03 else None
            if fading:
                line, col = '“' + fading['text'] + '” (fading ' + ('in' if t < (fading['at'] + fading['out']) / 2 else 'out') + ')', dim
            elif not line:
                if fr.get('veil', 0) >= 0.5:
                    line = '(the ink closes over the title)' if t < 0.45 else '(the ink lifts on the lit kingdom)' if t < 2 else '(ink)'
                elif t < 0.05:
                    line = '(the title: Begin is pressed, the film starts)'
                else:
                    line = {'below': '(no words: the dark below)'}.get(fr.get('beat'), '')
                col = dim
            else:
                line, col = '“' + line + '”', pale
        elif fr['kind'] == 'play':
            head, line, col = '+%s s' % ('%.2f' % fr.get('after', 1)).rstrip('0').rstrip('.'), ('the film is over: this is play (the first run)' if fr.get('label') == 'play' else 'the title again'), amber
        else:
            head, line, col = 'title', 'the title, before the press', dim
        d.text((x + 2, y + tile_h + 6), head, font=f_t, fill=amber)
        # the line, shrunk to fit the tile if it must
        fl, size = f_l, 15
        while d.textlength(line, font=fl) > tile_w - 4 and size > 10:
            size -= 1
            fl = font(size, italic=True)
        d.text((x + 2, y + tile_h + 25), line, font=fl, fill=col)
    img.save(out, quality=int(o.get('quality', 88)))
    print('sheet', out, img.size, '%d tiles' % len(frames), '%.0f KB' % (os.path.getsize(out) / 1024))

def video(src, out, o):
    meta = json.load(open(os.path.join(src, 'frames.json')))
    fps = int(o.get('fps', meta.get('fps') or 12))
    with tempfile.TemporaryDirectory() as tmp:
        for i, fr in enumerate(meta['frames']):
            os.symlink(os.path.abspath(os.path.join(src, fr['file'])), os.path.join(tmp, '%05d.png' % i))
        cmd = ['/usr/bin/ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', os.path.join(tmp, '%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', str(o.get('crf', 23)),
               '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-movflags', '+faststart', out]
        subprocess.run(cmd, check=True)
    film = [f for f in meta['frames'] if f['kind'] == 'film']
    print('video', out, '%d frames at %d fps = %.2f s (film %d frames = %.2f s)' % (len(meta['frames']), fps, len(meta['frames']) / fps, len(film), len(film) / fps), '%.2f MB' % (os.path.getsize(out) / 1e6))

if __name__ == '__main__':
    if len(sys.argv) < 4 or sys.argv[1] not in ('sheet', 'video'):
        print(__doc__)
        sys.exit(2)
    (sheet if sys.argv[1] == 'sheet' else video)(sys.argv[2], sys.argv[3], opts(sys.argv[4:]))
