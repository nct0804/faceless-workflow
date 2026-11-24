---
name: build-short
description: Step 4 (short format) of the Faceless Studio pipeline. Build a 9:16 60-70 s short in the 3D "Ink & Ember" kit from the locked script, the asset plan and vo.json; every cut is anchored to a spoken word, hands really hold props, and a mood colour script grades the whole edit. Use after the voiceover step for short videos.
---

# /build-short: shots and edit (step 4, short)

**Template:** `studio/src/shorts/checks96/` ("The 96 Checks").

```bash
cp -R studio/src/shorts/checks96 studio/src/shorts/<slug>
```

Keep `timing.ts`. Rewrite `Shots.tsx`, the cut list in `Short.tsx` and the `moodScript`. Then register the composition in `studio/src/Root.tsx` (1080×1920, 30 fps, `durationInFrames = VO_END + TAIL`).

## Rules (each one exists because of user feedback)

1. **One visual beat per clause.** Cuts come from words, `{at: W('L07', 'posts') - LEAD}`, with `LEAD = 4`: the picture leads the voice and never lags.
2. **The camera never stops.** Use `move(f, len, keyA, keyB)` with the default ease, which starts already in motion. Shake is 0.003–0.006. **Hold still exactly once**, on the rock-bottom beat.
3. **Transitions:**
   - hard cuts on punchlines
   - `whip: 6` for montages (class → dinner → shower)
   - `dissolve: 8` for time jumps or into a "mental space"
4. **Hands hold things.**
   - Phone: `const ph = phoneIn(root, yaw)`, then `<Phone3D at={ph.at} rot={ph.rot}/>` with `<Character reach={gripPoints(ph.at, ph.rot)}/>`.
   - Drawing: `<DeskDrawing strokes p>`, which uses `drawGrip` and `<PencilBetween>`, so the pencil tip is on the stroke.
   - POV inserts: `pov` mode with `<PovArm>`.
5. **Show drawings in full:** at least one POV or top-down insert where the drawing reaches `p = 1`.
6. **Colour script:** `moodScript()` keyframes on words. Use `bright`, `cozy`, `cool`, `night`, `grey`, `anxious`, `bottom` or `dawn` (`kit3d/mood.tsx`). Positive by default; blends take about 1.2 s. `Stage` grades automatically. Use `Bedroom time="day"` for daytime.
7. **Fully built places:** desk shots through the ghost wall (`ghost={B.deskCutaway}`), vignette rooms with `Island`, the stadium with `Arena`-style crowd. Never a floating void behind a character.
8. **Captions** come from `captionWords()`: one content word per chunk, with the `*key*` words in amber.
9. **Audio:** copy the cue section of `studio/audio/make_short_audio.py` for the new story. Anchor every sound effect to `W(line, word)`, and keep the one silence at the reversal.

## Look-dev before the full edit

Add a test composition (like `Checks96Test`) and render stills of each new set-up:

```bash
bin/render.sh <Comp> <NN>-<slug> still N        # -> out/<NN>-<slug>/stills/fN.png
```

Check:
- the framing (the camera isn't inside a head or a wall)
- that the hands are on their props
- the exposure: heads not blown out
- the shadows: navy, not black

## Then

Run `npx tsc --noEmit`, tick step 4 in the brief, and move on to `/review-and-render`.
