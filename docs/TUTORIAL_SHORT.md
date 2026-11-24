# Tutorial: make a short (9:16, 60–70 s, 3D "Ink & Ember")

Worked example: **"The 96 Checks"** (69 s).

- Folder: `videos/02-the-96-checks/` (brief, script)
- Code: `studio/src/shorts/checks96/`
- Render: `Checks96`

## 1. Script: `/write-video-script`

Short scripts follow the RicksClips beat sheet with our reversal ending:

> paradox hook → "You see," → escalation (one image per clause, real numbers) → deadpan side-character joke → "But here's where it gets weird." → reveal image → "It's called …" → two-line reversal → loop button

The script becomes `studio/src/shorts/<slug>/lines.json`:

```json
{"id":"L05","beat":"escalation","cap":"*Nine likes.*","say":"Nine likes.","gap":0.12}
```

- `cap` is shown on screen; the `*key*` words turn amber.
- `say` is spoken, with numbers as words for local voices.
- Both must have the same number of words.

The default length is 65 s, and anything in 60–70 s is fine. Around 190 words at a natural pace fits.

## 2. Assets: `/plan-video-assets`

- **3D places:**
  - Mo's bedroom (`time="day"` or night)
  - the stadium (full crowd that can bow over their phones)
  - three small rooms: class, dinner, shower
- **Characters:** Mo, Theo, Lia, Dex, crowd, all rigged with drawn faces (13 moods).
- **Props:** a phone with any live screen, a sketchbook that draws itself, a pencil, clock text.

New places are Blender scripts (`assets/blender/sets/*.py`), built only with your OK.

## 3. Voiceover: `/record-voiceover`

Choose: none, an Apple Premium/Enhanced voice, or your own recording ([VOICEOVER.md](VOICEOVER.md)). The result `vo.json` times **every cut and caption**.

## 4. Build: `/build-short`

```bash
cp -R studio/src/shorts/checks96 studio/src/shorts/<slug>
```

- **Shots:** rewrite `Shots.tsx`. Each shot is a camera move through a lit set.
  - The hands hold things: `reach={gripPoints(phone.at, phone.rot)}`.
  - Drawing shots use `<DeskDrawing strokes p pov>`, so the pencil tip draws the strokes.
- **Cut list** (`Short.tsx`): `{at: W('L07', 'posts') - LEAD, C: S07b}`. A cut lands 4 frames before its word. Use `whip` for montages and `dissolve` for time jumps.
- **Colour script:** `moodScript()`, for example `[L('L02'), 'cozy'], [L('L10'), 'grey'], [L('L23'), 'dawn']`. Moods blend over about 1.2 s.
- **Sound:** adapt the cue section of `audio/make_short_audio.py`, then run it.

## 5. Review and render: `/review-and-render`

- Draft, then a mosaic at 2 frames per second.
- Check hands, drawings, exposure, cuts and rooms. Fix and repeat.
- Final render:

```bash
bin/render.sh <Comp> <NN>-<slug> final
```

## 6. Package: `/package-youtube`
