# Faceless Studio: project rules

Animated self-improvement videos (hero: **Mo**), rendered **locally** with Remotion + three.js. **No AI video generators.** Assets are built by Blender scripts; everything else is code.

## The pipeline: always sequential, always in this order

Every video goes through these skills, one at a time. Don't skip ahead. Each step ends by asking the user to confirm before the next one starts.

| # | Skill | What it produces |
|---|---|---|
| 0 | `/new-video` | Starts or continues a video and routes to the next step (reads `videos/<slug>/brief.md`) |
| 1 | `/write-video-script` | The **format** (short or long), the **length**, the finished script and the brief |
| 2 | `/plan-video-assets` | A place/character/prop list mapped to existing assets, plus **requests for new materials** |
| 3 | `/record-voiceover` | The voice track and word timings (or none) |
| 4 | `/build-short` or `/build-long` | The shots and the edit |
| 5 | `/review-and-render` | Draft renders, a frame-by-frame review, fixes and the final MP4 |
| 6 | `/package-youtube` | Title, description and thumbnail (optional) |
| ↺ | `/clean-renders` | Housekeeping. `/new-video` runs it first: renders older than 14 days → ask whether the video was posted; **posted → move its renders to the Trash, not posted → keep everything, drafts too** |

### Rules the user set (2026-11-24)

1. **Ask the format first:** Short or Long. Never assume.
1b. **Ask the video type:** edutainment (the RicksClips style of entertainment plus learning; the current main style), motivation, entertainment, science, art, animal, or another.
   - The type sets the energy and pace: voice rate, cuts, camera, music, sound effects, colour bias and script shape. Use the profile in `docs/VIDEO_TYPES.md`.
   - The materials stay the same.
   - If the type has no studied reference yet (⏳), remind the user to share example videos.
2. **Ask the length.** If the user gives none, use the default. If the user wants it to follow the script, estimate it from the script and recommend a length.
   - **Short:** 9:16, **60–70 s** (default 65 s), the RicksClips pace.
   - **Long:** 16:9, the "Nobody Is Watching" flat style, enhanced. Default **3:20** (200 s); a sensible range is 2–5 min.
3. **Script first:**
   - If the user has an idea or script, work on it **with** them.
   - If they don't, suggest topics based on their interests.
   - Build nothing until the script and the user's intention are clear, structured and confirmed.
4. **Voiceover: always offer exactly these options:**
   1. no voiceover
   2. an Apple **Premium or Enhanced** voice (free, local)
   3. **record your own voice**
5. **New materials (sets, props, characters) only when the content needs them.** Reuse the asset library first. Ask before building new assets, and say what each new asset is for.
6. **Long videos keep the first film's style:** soft flat characters, silent caption storytelling, fully built backdrops, and a mood colour script.
7. **Spend carefully.** Paid services (for example ElevenLabs, if the user turns it on) are used only with the user's OK. Price the job first (estimate), make one take, and reuse it.
8. **Keep `studio/out/` clean.**
   - Renders older than 14 days: ask the user whether that video was uploaded or posted on social media.
   - **Yes:** move its renders to the Trash (`python3 studio/bin/renders.py clean <NN-slug>`). The source stays, so it can be re-rendered.
   - **No:** keep everything, including drafts.
   - Record the answer in the brief's `Published` row. Never delete the renders of an unpublished video.
9. **Improve as you go.** When the user gives new requirements during a video, update the kit, the skills and this file together.

## Pending from the user (remind them at /new-video until done)

- [ ] **Example videos for the video types** without a studied reference: entertainment, science, art, animal. The user said on 2026-11-24 that they would send examples. When they arrive, study them like RicksClips and update `docs/VIDEO_TYPES.md`.

## Look and quality rules (learned from feedback; check every render)

- **Characters really hold things.**
  - 3D: `<Character reach={gripPoints(...)}>`.
  - Drawing: `drawGrip` plus `<PencilBetween>`, with the pencil tip on the stroke.
  - Never float a prop near a hand.
- **Drawings are shown in full** at least once: a POV or top-down insert, drawn to the last line.
- **Positive, bright colour by default.** Darkness is a story beat, not the base. Colour changes **gradually** with the mood:
  - short: `kit3d/mood.tsx` `MoodScript`
  - long: `kit/film.tsx` plan moods
- **Backgrounds are fully built, meaningful and reusable:** rooms with real objects, never a floating void.
- **Smooth cuts:**
  - Cuts land about 4 frames before the word.
  - Camera moves start already in motion.
  - Use whip pans for montages and 6–8 frame dissolves for time jumps.
- **No blown-out heads:** check that clipped (>245) pixels stay under 2% per frame.
- **Review loop:**
  1. Render a half-resolution draft.
  2. Make a mosaic at 2 frames per second, view it, fix, and repeat.
  3. Render the final only after a clean mosaic.

## Where things are

- `videos/<NN-slug>/`: **one folder per video, long or short.**
  - `brief.md`: the state of the video (format, length, voice, step checklist). `/new-video` reads it.
  - `script.md`, `youtube.md`, `thumbnails/`.
- `studio/out/<NN-slug>/`: that video's renders (git-ignored), same folder name: `<slug>.mp4` (final), `drafts/`, `stills/`, `versions/`. **Always render with `studio/bin/render.sh <Comp> <NN-slug> draft | still <frame> | final`**, never to the top of `out/`. Kit tests that aren't tied to a video go in `out/_lookdev/`.
- `research/`: style studies (`MERGED_STYLE.md`, `dayonefilms/`, `ricksclips/`). The full third-party transcripts stay local (git-ignored), because the repo is public.
- `assets/`: Blender build scripts. See `assets/README.md`; build headless with `/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P <script>`.
- `studio/`: the Remotion project. See `studio/README.md`.
  - `src/kit/`: the flat 2D kit (long videos).
  - `src/kit3d/`: the 3D kit (shorts).
  - `src/films/<slug>/`: long videos.
  - `src/shorts/<slug>/`: short videos.
- `docs/`: guides and tutorials for people.

## Environment

macOS, Node and npm, Python 3 (`studio/.venv` has numpy), ffmpeg, Blender 5.3 at `/Applications/Blender.app`. Renders go to `studio/out/<NN-slug>/` (git-ignored). Check `df -h` before long renders: the disk has been nearly full before.
