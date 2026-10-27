# Copy a course's build folder into docs/courses/maths/<slug>, without tools/, pictures, or
# the files of lessons not in the finished list. usage: python3 tocopy.py <slug> i1,i2,...
import os, shutil, re, sys
slug, done = sys.argv[1], set(sys.argv[2].split(','))
SHELF = sys.argv[sys.argv.index('--shelf') + 1] if '--shelf' in sys.argv else 'maths'
src = f'/home/user/Study-App/build/{SHELF}/{slug}'; dst = f'/home/user/Study-App/docs/courses/{SHELF}/{slug}'
n = 0
for root, dirs, files in os.walk(src):
    rel = os.path.relpath(root, src)
    if rel.split(os.sep)[0] in ('tools', 'source', 'pptx-pdf'): continue   # his own course files stay out of the repo
    for f in files:
        m = re.match(r'(i\d+)\.', f)
        if f.endswith('.png') or (m and m.group(1) not in done): continue
        if rel == 'out':
            m2 = re.match(r'(lesson|guide)-(i\d+)\.json$', f)
            if m2 and m2.group(2) not in done: continue
        s = os.path.join(root, f); d = os.path.join(dst, rel, f)
        os.makedirs(os.path.dirname(d), exist_ok=True)
        if not os.path.exists(d) or open(s, 'rb').read() != open(d, 'rb').read():
            shutil.copy2(s, d); n += 1
print(slug, 'copied', n)
