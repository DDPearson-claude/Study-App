#!/usr/bin/env python3
"""Replace a built lesson's reading text without touching its interactive.

    python3 -I tools/course/patch_text.py <build dir> <iid> <patch.json>

patch.json may hold any of: explain, practice, whatAmILookingAt, ignores (strings) and analogy
({"text", "breaks"} or null). The interactive's spec (brief, title, controls, outputs, numbers) and
its built page are left alone. Sources are cut to the ones the new text cites and renumbered in
order of first citation, as the app's finalise step does. The lesson before the first patch is
kept as <iid>.lesson.verified.long.json. Prints the new word counts. Run
`node tools/course/assemble.mjs docs --dir <build dir>` afterwards: it validates every lesson.
"""
import json, os, re, shutil, sys

d, iid, patch_path = sys.argv[1], sys.argv[2], sys.argv[3]
path = os.path.join(d, iid + '.lesson.verified.json')
long_path = os.path.join(d, iid + '.lesson.verified.long.json')
if not os.path.exists(long_path):
    shutil.copy(path, long_path)
L = json.load(open(path))
P = json.load(open(patch_path))
I = L.get('interactive') or {}
if 'explain' in P: L['explain']['text'] = P['explain']
if 'practice' in P: L['practice']['text'] = P['practice']
if 'whatAmILookingAt' in P and I: I['whatAmILookingAt'] = P['whatAmILookingAt']
if 'ignores' in P and I: I['ignores'] = P['ignores']
if 'analogy' in P: L['analogy'] = P['analogy']

texts = [L['explain']['text'], L['practice']['text']]
if I: texts += [I.get('whatAmILookingAt', ''), I.get('ignores', '')]
if L.get('analogy'): texts += [L['analogy'].get('text', ''), L['analogy'].get('breaks', '')]
order = []
for t in texts:
    for m in re.finditer(r'\[\^(\d+)\]', t):
        n = int(m.group(1))
        if n not in order: order.append(n)
known = {s['n']: s for s in L['sources']}
missing = [n for n in order if n not in known]
if missing: sys.exit('cites a source the lesson does not have: %s' % missing)
renum = {old: i + 1 for i, old in enumerate(order)}
sub = lambda t: re.sub(r'\[\^(\d+)\]', lambda m: '[^%d]' % renum[int(m.group(1))], t)
L['explain']['text'] = sub(L['explain']['text'])
L['practice']['text'] = sub(L['practice']['text'])
if I:
    I['whatAmILookingAt'] = sub(I.get('whatAmILookingAt', ''))
    I['ignores'] = sub(I.get('ignores', ''))
    for nm in I.get('numbers', []):
        if isinstance(nm.get('source'), int):
            if nm['source'] in renum: nm['source'] = renum[nm['source']]
            else: nm.pop('source')
if L.get('analogy'):
    L['analogy'] = {k: sub(v) for k, v in L['analogy'].items()}
L['sources'] = [dict(known[old], n=renum[old]) for old in order]
json.dump(L, open(path, 'w'), indent=2, ensure_ascii=False)
w = lambda t: len((t or '').split())
print(json.dumps({
    'iid': iid,
    'explain': w(L['explain']['text']), 'practice': w(L['practice']['text']),
    'lookingAt': w(I.get('whatAmILookingAt')) if I else 0, 'ignores': w(I.get('ignores')) if I else 0,
    'analogy': (w(L['analogy']['text']) + w(L['analogy']['breaks'])) if L.get('analogy') else 0,
    'sources': len(L['sources']),
}))
