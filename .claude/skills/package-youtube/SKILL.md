---
name: package-youtube
description: Step 6 (optional) of the Faceless Studio pipeline. Write the YouTube title options, description and a thumbnail (rendered from the video's own frames/sets, no AI images) for a finished video. Use after the final render, or when the user asks for titles, descriptions or thumbnails.
---

# /package-youtube: title, description, thumbnail (step 6, optional)

Model: `videos/01-nobody-is-watching/youtube.md` and `thumbnails/`.

## Titles: 5 options

- **Shorts (RicksClips style):** a curiosity question or claim in Title Case, no period, under 50 characters. Examples: "Why Nobody Is Actually Watching You", "The 96 Checks".
- **Long:** a story title plus an emotional hook. Example: "Nobody Is Watching. | An Animated Short Film".
- Mark the recommended one, with a one-line reason.

## Description

- **Short:** the title only (RicksClips rule: no hashtags, no call to action), unless the user wants more.
- **Long:**
  - 2–3 lines of logline
  - the moral couplet
  - chapters (timestamps from the shot table)
  - credits: "Animated in Remotion + three.js. No AI video."

## Thumbnail (made from our own renders)

1. Pick the strongest frame: the reveal or the emotional peak. Render it as a still at full resolution, or compose a dedicated thumbnail composition (1280×720 for long, 1080×1920 for the Shorts cover).
2. Use the face in close-up, one prop, high contrast, the mood colour, and 2–4 words in Baloo 2 ExtraBold with the amber key word.
3. Check it at 160 px wide: it must still read.

Write `videos/<NN>-<slug>/youtube.md`, put the thumbnails in `videos/<NN>-<slug>/thumbnails/`, and tick step 6 in the brief.
