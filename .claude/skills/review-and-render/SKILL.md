---
name: review-and-render
description: Step 5 of the Faceless Studio pipeline. Render half-resolution drafts, review them frame by frame (mosaics, full-res stills, exposure/black/clipping metrics, loudness), fix what's wrong, and only then render the final MP4. Use after a short or long video is built, or whenever the user reports glitches.
---

# /review-and-render: draft, review, fix, final (step 5)

## Loop until the review is clean

All renders go to `studio/out/<NN>-<slug>/`, the same folder name as `videos/<NN>-<slug>/`. Use the helper (run it from `studio/`).

1. **Draft and mosaic:**

   ```bash
   bin/render.sh <Comp> <NN>-<slug> draft
   ```

   This writes `drafts/draft-<time>.mp4` and `drafts/mosaic-<time>.jpg`: 2 frames per second for 9:16, 1 frame every 3 s for 16:9. It takes about 1 min per minute of video. Read the mosaic and check every frame against the checklist below.
2. **Inspect at full resolution:** for any suspicious shot, run `bin/render.sh <Comp> <NN>-<slug> still <frame>`. It writes `stills/f<frame>.png`; look closely at hands, pencil tip, props and faces.
3. **Fix and repeat.** Write each problem and its fix into the brief notes.

## Checklist (everything the user has flagged before)

- [ ] **Hands hold every prop:** phone grips, pencil in the mitten, tip on the page.
- [ ] **Drawings shown in full** at least once.
- [ ] **No camera inside a head or wall,** and no huge out-of-focus blobs in the foreground.
- [ ] **Cuts land on or just before the word,** with no dead starts. Montages whip, time jumps dissolve.
- [ ] **Exposure:** no blown-out heads, and the colours follow the mood arc (positive by default).
- [ ] **Backgrounds fully built** in every shot.
- [ ] **Captions:** right word, key words in amber, inside the safe area (around 68% height on 9:16).
- [ ] **Length:** short 60–70 s, long as briefed.

## Metrics (run on the draft, then on the final)

```bash
.venv/bin/python - <<'EOF'
import subprocess, numpy as np
W,H=135,240   # use 192,108 for 16:9
raw=subprocess.run(['ffmpeg','-v','error','-i','out/<NN>-<slug>/<slug>.mp4','-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','gray','-'],capture_output=True).stdout
f=np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(np.float32)
print('black frames',int((f.mean((1,2))<8).sum()),'| mean luma %.0f'%f.mean(),'| frames >2%% clipped',int(((f>245).mean((1,2))>0.02).sum()))
EOF
ffmpeg -hide_banner -i out/<NN>-<slug>/<slug>.mp4 -af ebur128=framelog=quiet -f null - 2>&1 | grep " I:"
```

Targets:
- black frames: 0 or 1 (only the first frame)
- mean luma: 70–110 (shorts) or 40–70 (long)
- clipped frames: 0
- loudness: −14 LUFS

## Final

```bash
df -h /System/Volumes/Data
```

Check there is at least 3 GB free, then render:

```bash
bin/render.sh <Comp> <NN>-<slug> final
```

This writes `out/<NN>-<slug>/<slug>.mp4`. The previous final moves to `versions/`, and the CRF is chosen automatically: 16 for shorts, 18 for long videos. Verify the streams with `ffprobe` and re-run the metrics. Send the MP4 to the user, tick step 5 in the brief, and offer `/package-youtube`.
