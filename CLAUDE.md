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

### Rules the user set (2026-11-24)

1. **Ask the format first:** Short or Long. Never assume.
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
8. **Improve as you go.** When the user gives new requirements during a video, update the kit, the skills and this file together.

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

- `videos/<slug>/brief.md`: the state of each video (format, length, voice, step checklist). `/new-video` reads it.
- `scripts/`: scripts and shot lists of finished videos.
- `research/`: style studies (`MERGED_STYLE.md`, `dayonefilms/`, `ricksclips/`). The full third-party transcripts stay local (git-ignored), because the repo is public.
- `assets/`: Blender build scripts. See `assets/README.md`; build headless with `/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P <script>`.
- `studio/`: the Remotion project. See `studio/README.md`.
  - `src/kit/`: the flat 2D kit (long videos).
  - `src/kit3d/`: the 3D kit (shorts).
  - `src/films/<slug>/`: long videos.
  - `src/shorts/<slug>/`: short videos.
- `docs/`: guides and tutorials for people.

## Environment

macOS, Node and npm, Python 3 (`studio/.venv` has numpy), ffmpeg, Blender 5.3 at `/Applications/Blender.app`. Renders go to `studio/out/` (git-ignored). Check `df -h` before long renders: the disk has been nearly full before.
