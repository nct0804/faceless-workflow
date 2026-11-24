# Video types: same materials, different energy

Every video gets a **type** as well as a format (short or long). The type sets the **energy and pace**: speech rate, cut rhythm, camera, music, sound effects, humour, colour bias and the script shape.

The **materials stay the same**: Mo and the cast, the sets, the kits, the colour script, and hands that really hold things.

`/write-video-script` asks for the type and applies its profile. Each profile is a starting point; the script can still bend it.

## Profiles

| | **Edutainment** (entertainment + learning) | **Motivation** | **Entertainment** (comedy / story) | **Science** | **Art** | **Animal** |
|---|---|---|---|---|---|---|
| Reference studied | ✅ RicksClips (20 shorts, `research/ricksclips/`) | ✅ Day One Films (20 films, `research/dayonefilms/`) | ⏳ waiting for the user's examples | ⏳ waiting | ⏳ waiting | ⏳ waiting |
| Our example | "The 96 Checks" (short) | "Nobody Is Watching" (long) | none | none | none | none |
| Feels like | a friend telling a mind-blowing true story | a quiet film that hits home | a sketch with a punchline | "wait, how does that work?" | watching something being made | warm, playful, surprising |
| Voice / pace | 215–225 wpm, no pauses, dry wit | silent captions, or a calm VO at 140–160 wpm | 190–220 wpm, comic timing pauses | 170–190 wpm, clear and curious | 140–160 wpm or none, relaxed | 180–200 wpm, light and warm |
| Cut rhythm | a beat per clause, 1.5–2.5 s shots, whips | 3–4 s shots, dissolves, one long hold | hard cuts on punchlines, reaction shots | 2–3 s shots plus diagram inserts | long takes, time-lapses | 2–3 s, reaction close-ups |
| Camera | never stops; push-ins, fly-throughs, match moves | slow push-ins, held frames | snappy push-ins, whip pans | orbit and reveal, cross-sections | slow over-the-shoulder, top-down on the work | low playful angles, follow moves |
| Long-video camera kit (`kit/camera.ts`) | every shot moves: `push`, `pan-*`, `reveal`; whips in montages; `handheld` 0.4 | `push`, `pull`, `drift`; `reveal` for the crowd; one `hold` at rock bottom; `handheld` 0.3 | `settle` on punchlines, whips between gags; `handheld` 0.5 | `reveal`, `tilt-*` up diagrams, rack focus to the detail; `handheld` 0.2 | slow `push` on the work, `drift`; `handheld` 0.3 | `pan-*` following the animal, `settle` on reactions; `handheld` 0.5 |
| Script shape | paradox hook → "You see," → escalation with numbers → skeptic joke → "it gets weird" → reveal → name the mechanism → reversal → loop | normal world → habit → cost → rock bottom → turn → recovery → moral couplet | setup → escalation → twist → button | question hook → intuition → "but actually" → mechanism shown → so-what | blank page → struggle → process → reveal of the finished piece | cute hook → surprising fact or behaviour → payoff → aww or laugh button |
| Music | plucky light underscore, ducked low, stops for the reveal | felt piano and pads, silence at the low point | bouncy, comic stings | curious pulses, "discovery" swell | ambient, lo-fi | playful pizzicato |
| Sound effects | on every action (pops, whooshes, ticks) | sparse, room tone | cartoon hits | clicks, UI blips, "aha" chime | pencil and brush foley | paws, chirps, boing |
| Colour bias | bright and saturated, warm-cool split | low-key, then a hopeful arc | bright, poppy | clean cool with one accent | warm paper and lamp light | sunny, natural greens and warm tones |
| Captions | 1–2 words, amber key word | sentence captions (Patrick Hand) | 1–3 words, punchline in amber | 1–2 words; key terms amber plus diagram labels | few or none | 1–3 words |

✅ = profile built from a studied reference. ⏳ = a **draft** profile: it works, but it should be refined from the user's reference examples.

## Reminder (for Claude)

The user said they will share **example videos for the other types**. Until a type is ✅, whenever the user picks it (or at the start of `/new-video`), **remind them**:

> "I don't have reference examples for <type> yet. Want to share a few before we lock the style?"

When the examples arrive:
1. Study them the way RicksClips was studied (mosaics, pace, cuts, colour, script shape).
2. Update the profile and mark it ✅.
3. Remove the type from the "pending" list in `CLAUDE.md`.

## Adding a new type

Add a column to the table. Mark it ⏳ until it has been studied from references, and add it to the pending list in `CLAUDE.md`.
