---
name: new-video
description: Start a new Faceless Studio video or continue one in progress. Use when the user wants to make a video, says "next video", "new short", "new long video", or asks where a video stands. Reads videos/<slug>/brief.md and runs the pipeline steps in order (script, assets, voiceover, build, review/render, package).
---

# /new-video: start or continue a video

This is the entry point of the pipeline. It never builds anything itself: it finds out where a video stands and runs **the next skill in order**.

## 1. Find the video

- List `videos/*/brief.md`. If one is in progress (unchecked steps), ask: **"Continue <title> (next: <step>) or start a new video?"**
- To start a new one, create `videos/<NN>-<slug>/brief.md` from the template below, with NN the next number. Leave the slug as `untitled` until the script has a title.

## 2. Run the steps in order (one at a time; confirm with the user between steps)

1. `/write-video-script`: format, length, topic and script. **Nothing else starts before this is confirmed.**
2. `/plan-video-assets`: reuse assets, and request new materials only if the content needs them.
3. `/record-voiceover`: no voiceover, an Apple Premium/Enhanced voice, or the user's own recording.
4. `/build-short` or `/build-long`, depending on the format in the brief.
5. `/review-and-render`: drafts, mosaic review, fixes, final.
6. `/package-youtube` (optional): title, description, thumbnail.

After each step, tick it in the brief, write one line of notes, and tell the user what comes next.

## brief.md template

```markdown
# <NN> · <Title>

| | |
|---|---|
| Format | short (9:16) \| long (16:9) |
| Target length | e.g. 65 s / 3:20 (default: short 65 s, long 3:20) |
| Topic / intention | one sentence: what the viewer should feel or learn |
| Voiceover | none \| apple:<voice> \| own recording |
| Code | studio/src/shorts/<slug>/ or studio/src/films/<slug>/ |
| Renders | studio/out/<NN>-<slug>/ (final <slug>.mp4, drafts/, stills/, versions/) |

## Steps
- [ ] 1 Script (videos/<NN>-<slug>/script.md)
- [ ] 2 Assets (reuse / new: ...)
- [ ] 3 Voiceover
- [ ] 4 Build
- [ ] 5 Review + final render
- [ ] 6 Package (optional)

## Notes / user requirements for this video
- 
```

## Rules

Follow `CLAUDE.md` (project root). Its "Rules the user set" override anything in a skill. When the user adds a new requirement mid-video, write it in the brief's notes **and** update the relevant skill or `CLAUDE.md`, so the next video inherits it.
