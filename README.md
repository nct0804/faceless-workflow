# Faceless Studio

Animated self-improvement videos about **Mo**, a small paper-white kid in an oversized hoodie, made **entirely on your own computer**: Remotion + three.js for picture, Blender scripts for reusable 3D assets, Python for sound. **No AI video generators.**

| | Long video | Short |
|---|---|---|
| Format | 16:9, default **3:20** | 9:16, **60–70 s** |
| Look | Soft flat characters, silent captions, fully built mood-coloured rooms (enhanced "Nobody Is Watching" style) | 3D "Ink & Ember": ink-outlined Blender sets, cel shading, moving camera, word-by-word captions |
| Voice | Usually none (captions) | Apple Premium/Enhanced voice or your own recording |
| Example | `studio/out/01-nobody-is-watching/nobody-is-watching.mp4` (`FilmHD`) | `studio/out/02-the-96-checks/the-96-checks.mp4` (`Checks96`) |

## How a video gets made: a harness of skills, run in order

Open this folder in **Claude Code** and type `/new-video`. The skills run one after another and confirm with you between steps:

```
/new-video            start or continue a video (tracks state in videos/<slug>/brief.md)
  1 /write-video-script   Short or Long? How long? Your idea or script, or topic suggestions. Lock the script
  2 /plan-video-assets    reuse places, characters and props; request new materials only if needed
  3 /record-voiceover     no voiceover | Apple Premium/Enhanced voice | record your own
  4 /build-short  or  /build-long
  5 /review-and-render    draft, frame-by-frame review, fixes, final MP4
  6 /package-youtube      titles, description, thumbnail (optional)
  ↺ /clean-renders        renders >14 days old: posted? yes -> move renders to Trash, no -> keep all (drafts too)
```

The rules behind every step are in [`CLAUDE.md`](CLAUDE.md). The skills are in [`.claude/skills/`](.claude/skills).

## Start here

1. [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md): install and first render (about 15 min)
2. [docs/WORKFLOW.md](docs/WORKFLOW.md): the pipeline, step by step, with what you'll be asked
3. Tutorials:
   - [docs/TUTORIAL_LONG.md](docs/TUTORIAL_LONG.md): make a long video
   - [docs/TUTORIAL_SHORT.md](docs/TUTORIAL_SHORT.md): make a short
4. [docs/VOICEOVER.md](docs/VOICEOVER.md): the three voice options in detail

## Repository layout

```
CLAUDE.md                 project rules (read by Claude Code every session)
.claude/skills/           the pipeline skills
videos/<NN-slug>/         ONE FOLDER PER VIDEO (long or short): brief.md, script.md, youtube.md, thumbnails/
research/                 style studies: MERGED_STYLE.md, dayonefilms/, ricksclips/
assets/                   Blender build scripts (characters, sets) -> studio/public/assets/*.glb   (assets/README.md)
studio/                   Remotion project (studio/README.md)
  src/kit/                flat 2D kit (long videos): backdrops, characters, props, film colour script
  src/kit3d/              3D kit (shorts): Stage/post, Character (+IK), Props, envs, mood colour script, captions
  src/films/<slug>/       long videos (plan.ts: place + mood per shot)
  src/shorts/<slug>/      shorts (lines.json -> vo.json -> Shots.tsx -> Short.tsx)
  audio/                  synth score + SFX, voice tools (audio/vo/)
docs/                     guides and tutorials
```

Renders go to `studio/out/<NN-slug>/` (same names as `videos/`): the final `<slug>.mp4`, plus `drafts/`, `stills/` and `versions/`. Use `studio/bin/render.sh <Comp> <NN-slug> draft|still N|final`. Renders, `node_modules` and generated audio stems are not in git. They are rebuilt by the scripts.
