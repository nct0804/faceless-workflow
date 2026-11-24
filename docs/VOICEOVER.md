# Voiceover options

You're always offered these three. Whichever you pick, the result is `vo.wav` plus `vo.json` (word timings), and every cut and caption re-times itself to it.

## 1. No voiceover

Captions carry the story: Patrick Hand captions in long videos, word chunks in shorts. Music and sound effects still play. This is the default for long videos.

## 2. Apple Premium or Enhanced voice (free, made on your Mac)

1. Install a voice: **System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → English**. Good narrators:
   - **Evan (Enhanced)** or **Nathan (Enhanced)**: American male
   - **Zoe (Premium)** or **Ava (Premium)**: American female
   - **Jamie (Premium)**: British male
2. Generate it:

   ```bash
   cd studio
   python3 audio/vo/make_vo.py src/shorts/<slug> auto 0.548
   ```

   `auto` picks the best installed voice. 0.548 is about 217 words/min; use 0.52 for calmer.

## 3. Record your own voice

1. Open `videos/<NN-slug>/script.md` and read the **spoken lines** in order.
2. **Leave about half a second of silence between lines.** The importer finds the lines by your pauses. Keep pauses inside a line short.
3. Use a quiet room and keep the mic about 15 cm away. A phone voice memo (M4A) is fine.
4. Import it:

   ```bash
   cd studio
   .venv/bin/python audio/vo/import_voice.py src/shorts/<slug> ~/Desktop/my-read.m4a - 1.0
   ```

   - `-` means "no transcript, use my pauses".
   - If you have a word-timing transcript (JSON `{"words":[{"text","start","end"}]}`), pass its path instead for word-exact captions.
   - The last number is the tempo: 1.05 speeds you up 5% with the pitch kept, handy to fit 60–70 s.
5. Mix:

   ```bash
   .venv/bin/python audio/make_short_audio.py <slug>
   ```

   This adds the music and sound effects, ducks them under the voice, and masters to −14 LUFS.

## (Optional, paid) ElevenLabs

Used for "The 96 Checks" (voice "Emmett – sharp narrator", model eleven_v4). It is only used when you ask for it:
- A 60–70 s short costs about **2.8k credits** for one take; the Scribe word timings are free.
- Price it first, make one take, and import it with `import_voice.py <short> <take.mp3> <words.json> 1.07`.
