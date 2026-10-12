#!/bin/sh
# Rebuilds the full app to tests/out/correct.html and runs every repro. Each prints
# "REPRODUCED <finding>" while the bug is present.
cd "$(dirname "$0")/../../.." && node tools/build.mjs --out tests/out/correct.html || exit 1
for f in docs/review/repro/[0-9]*.mjs; do echo "== $f"; node "$f"; done
