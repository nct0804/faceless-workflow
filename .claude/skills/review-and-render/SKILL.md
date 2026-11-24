---
name: review-and-render
description: Step 5 of the Faceless Studio pipeline. Render half-resolution drafts, review them frame by frame (mosaics, full-res stills, exposure/black/clipping metrics, loudness), fix what's wrong, and only then render the final MP4. Use after a short or long video is built, or whenever the user reports glitches.
---

# /review-and-render: draft, review, fix, final (step 5)

## Loop until the review is clean

1. **Draft:**

   ```bash
   npx remotion render src/index.ts <Comp> out/<slug>/dev/draftN.mp4 --scale=0.5 --crf=26 --log=error
   ```

   About 1 min per minute of video.
2. **Mosaic and view:** 2 frames per second for shorts, 1 frame every 3 s for long videos.

   ```bash
   ffmpeg -y -loglevel error -i out/<slug>/dev/draftN.mp4 -vf "fps=2,scale=180:320,tile=14x10" -frames:v 1 out/<slug>/dev/mosN.jpg
   ```

   Read the image and check every frame against the checklist below.
3. **Inspect at full resolution:** for any suspicious shot, run `npx remotion still ... --frame=N` and look closely (hands, pencil tip, props, faces).
4. **Fix and repeat.** Write each problem and its fix into the brief notes.

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
raw=subprocess.run(['ffmpeg','-v','error','-i','out/<slug>/final.mp4','-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','gray','-'],capture_output=True).stdout
f=np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(np.float32)
print('black frames',int((f.mean((1,2))<8).sum()),'| mean luma %.0f'%f.mean(),'| frames >2%% clipped',int(((f>245).mean((1,2))>0.02).sum()))
EOF
ffmpeg -hide_banner -i out/<slug>/final.mp4 -af ebur128=framelog=quiet -f null - 2>&1 | grep " I:"
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
npx remotion render src/index.ts <Comp> out/<slug>.mp4 --codec=h264 --crf=16
```

Use `--crf=18` for long videos. Verify the streams with `ffprobe` and re-run the metrics. Send the MP4 to the user, tick step 5 in the brief, and offer `/package-youtube`.
