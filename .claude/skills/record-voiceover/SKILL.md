---
name: record-voiceover
description: Step 3 of the Faceless Studio pipeline. Offer the voiceover options (no voiceover, an Apple Premium/Enhanced voice, or the user's own recording), then produce the voice track plus word timings that drive cuts and captions. Use after assets are planned, or whenever the user wants to change or re-record the voice.
---

# /record-voiceover: the voice track (step 3)

## 1. Offer exactly these options (user rule)

> **How should the voiceover be done?**
> 1. **No voiceover** (captions and music only; the default for long videos)
> 2. **An Apple Premium or Enhanced voice** (free, made on this Mac)
> 3. **Record your own voice**

If the user turned on a paid voice service (for example ElevenLabs) for this video, it may be offered as an extra. Price it first (`estimate_only`), make **one** take, and get the user's OK.

## 2a. No voiceover

- **Long:** captions come from the shot table (`<Caption>` in each shot), and the music follows the cut list (`studio/audio/make_audio.py` pattern).
- **Short:** write the caption timing by hand. Set `gap` in `lines.json` as reading time (about 1 s per 3 words), and generate the timings with `make_vo.py` using a silent voice (see 2b) or with `timing.ts` directly.

## 2b. Apple Premium or Enhanced voice (local, free)

1. Check what's installed:

   ```bash
   swift studio/audio/vo/best_voice.swift
   ```

   The quality tier is printed: 3 = Premium, 2 = Enhanced. If none is installed, tell the user: **System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → English**. Recommend Evan (Enhanced), Nathan (Enhanced), Zoe (Premium) or Ava (Premium).
2. Generate the voice and word timings:

   ```bash
   cd studio && python3 audio/vo/make_vo.py src/shorts/<slug> auto 0.548
   ```

   This writes `public/audio/<slug>/vo.wav` and `src/shorts/<slug>/vo.json`. The rate 0.548 gives about 217 words/min with Evan; lower it for a calmer read.
3. Check the duration against the target length. Adjust the rate (0.50–0.56) or the line `gap`s rather than changing the script.

## 2c. Record your own voice

Give the user this recording guide:
- **Read the `say` lines** from `scripts/<NN>-<slug>/script.md`, one line at a time.
- **Pause about half a second between lines.** Keep pauses inside a line short.
- **Mic:** quiet room, about 15 cm from the mic. A phone voice memo is fine. Save it as WAV or M4A.
- **Retakes:** do the whole read again rather than patching.

Import it:

```bash
cd studio && .venv/bin/python audio/vo/import_voice.py src/shorts/<slug> <recording.m4a> - [tempo]
```

- `-` means no transcript: line starts are found from the pauses, and words are spaced by length.
- If a word-timing transcript exists (`{"words":[{text,start,end}]}`), pass it instead of `-` for word-exact captions.
- `tempo` (for example 1.05) speeds the read up without changing the pitch, to fit the 60–70 s target.

Then check that `vo.json` line starts sound right: play the mix and watch the captions in `npx remotion studio`.

## 3. Mix

```bash
cd studio && .venv/bin/python audio/make_short_audio.py <slug>
```

This adds the music and sound effects, ducks them under the voice, and masters to −14 LUFS. Long films use their own `make_audio.py`-style score script.

Verify the loudness: `ffmpeg -i public/audio/<slug>/mix.wav -af ebur128 -f null -` should read about −14 LUFS.

Write the voice choice into the brief, tick step 3, and move on to `/build-short` or `/build-long`.
