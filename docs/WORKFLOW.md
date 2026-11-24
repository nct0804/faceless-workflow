# The workflow (harness)

Every video runs the same sequence. Each step is a **skill**: type it in Claude Code, or just say what you want and Claude picks the right one. **Steps run one at a time, and each ends with a confirmation from you.** Progress lives in `videos/<NN-slug>/brief.md`, so you can stop and continue in a later session with `/new-video`.

```
 /new-video
    │
    ├─ 1 /write-video-script ──► format + length + locked script   (nothing is built before this)
    ├─ 2 /plan-video-assets  ──► reuse table; new materials only if needed (you approve)
    ├─ 3 /record-voiceover   ──► none | Apple Premium/Enhanced | your own recording
    ├─ 4 /build-short | /build-long
    ├─ 5 /review-and-render  ──► drafts → frame review → fixes → final MP4
    └─ 6 /package-youtube    ──► titles, description, thumbnail (optional)
```

## What you'll be asked, step by step

### 1. Script

- **"Short or Long?"**
  - Short: 9:16, narrated, fast.
  - Long: 16:9, silent captions, cinematic.
- **"How long?"** With no answer, the defaults apply: short 65 s, long 3:20. Say "whatever fits the script" and you'll get a recommendation with the reason.
- **"Do you have an idea or a script?"**
  - **Yes:** paste it. Claude restates your intention, structures it into the format's beat sheet, and suggests edits without overwriting you.
  - **No:** tell Claude your interests and you get 3–5 topics, each with a hook.
- **"Lock this script?"** Only after this does anything get built.

### 2. Assets

You get a table of every place, character and prop, marked **reuse**, **tweak** or **NEW**. New materials are only proposed when the story needs them, and only built after your OK. They're built reusably, so the next video can use them too.

### 3. Voiceover

You choose one of:
1. no voiceover
2. an Apple Premium/Enhanced voice
3. your own recording

See [VOICEOVER.md](VOICEOVER.md).

### 4. Build

Claude writes the shots and the edit. Cuts are anchored to the words (shorts) or the shot table (long). The colour script follows the story's mood.

### 5. Review and render

Half-resolution drafts are reviewed frame by frame on a mosaic and on full-resolution stills. They're checked against every issue found in earlier videos:
- floating props
- unfinished drawings
- blown-out faces
- late cuts
- empty backgrounds

The final render happens only when the draft is clean, and you get the MP4.

### 6. Package (optional)

Titles, a description and a thumbnail made from the video's own frames.

## Changing the rules

Tell Claude a new requirement at any time, for example "characters should blink more" or "long videos need a narrator". It goes into the video's brief **and** into `CLAUDE.md` or the relevant skill, so every later video follows it.
