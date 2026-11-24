#!/usr/bin/env bash
# Organised renders: everything for one video lands in studio/out/<NN-slug>/ (same layout for long and short).
#
#   bin/render.sh <Composition> <NN-slug> draft            -> out/<NN-slug>/drafts/draft-<time>.mp4 + mosaic-<time>.jpg
#   bin/render.sh <Composition> <NN-slug> still <frame>    -> out/<NN-slug>/stills/f<frame>.png
#   bin/render.sh <Composition> <NN-slug> final            -> out/<NN-slug>/<slug>.mp4  (previous final -> versions/)
#
# Example: bin/render.sh Checks96 02-the-96-checks draft
set -euo pipefail
cd "$(dirname "$0")/.."
COMP=${1:?composition}; VID=${2:?NN-slug}; MODE=${3:-draft}
SLUG=${VID#[0-9][0-9]-}
DIR=out/$VID
mkdir -p "$DIR/drafts" "$DIR/stills" "$DIR/versions"
T=$(date +%Y%m%d-%H%M%S)
case "$MODE" in
  draft)
    OUT=$DIR/drafts/draft-$T.mp4
    npx remotion render src/index.ts "$COMP" "$OUT" --scale=0.5 --crf=26 --log=error
    W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$OUT")
    H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$OUT")
    if [ "$H" -gt "$W" ]; then VF="fps=2,scale=180:320,tile=14x10"; else VF="fps=1/3,scale=320:180,tile=10x7"; fi
    ffmpeg -y -loglevel error -i "$OUT" -vf "$VF" -frames:v 1 "$DIR/drafts/mosaic-$T.jpg"
    echo "draft:  $OUT"; echo "mosaic: $DIR/drafts/mosaic-$T.jpg" ;;
  still)
    F=${4:?frame}
    npx remotion still src/index.ts "$COMP" "$DIR/stills/f$F.png" --frame="$F" --log=error
    echo "still: $DIR/stills/f$F.png" ;;
  final)
    df -h . | tail -1
    OUT=$DIR/$SLUG.mp4
    [ -f "$OUT" ] && mv "$OUT" "$DIR/versions/$SLUG-$(date -r "$OUT" +%Y%m%d-%H%M).mp4" && echo "previous final -> versions/"
    H=$(npx remotion compositions src/index.ts 2>/dev/null | awk -v c="$COMP" '$1==c {print $0}' | grep -o '[0-9]*x[0-9]*' | head -1 | cut -dx -f2)
    CRF=18; [ -n "$H" ] && [ "$H" -gt 1500 ] && CRF=16
    npx remotion render src/index.ts "$COMP" "$OUT" --codec=h264 --crf=$CRF --log=error
    echo "final: $OUT" ;;
  *) echo "mode must be draft | still <frame> | final"; exit 1 ;;
esac
