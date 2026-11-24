---
name: write-video-script
description: Step 1 of the Faceless Studio pipeline. Agree the format (short or long) and length with the user, then co-write the script from their idea, or suggest topics from their interests if they have none. Use before any building, voiceover or assets work, and whenever the user shares a story idea or script for a video.
---

# /write-video-script: format, length, script (step 1)

**Nothing gets built until this step is confirmed.** Work *with* the user; it's their video.

## A. Ask the format first (never assume)

Ask: **"Short (9:16, 60–70 s, narrated RicksClips pace) or Long (16:9, the 'Nobody Is Watching' flat style, silent captions)?"**

## B. Ask the length

- If the user gives none, use the **default**: short **65 s**, long **3:20**.
- If the user says "whatever the script needs", estimate from the draft and **recommend** a length with the reason, e.g. "about 210 words, so about 70 s".
  - **Short pace:**
    - narrated: 170–185 words/min (natural voice), 215–225 words/min (fast RicksClips pace)
    - captions only: about 1 short line per 2 s
  - **Long pace:** about 1 shot per 3–4 s; caption lines are short and land on silent beats.

## C. Get the story

- **The user has an idea or script:** read it fully, restate the intention in one sentence, then structure it (section D). Keep the user's wording; suggest changes, don't overwrite.
- **The user has nothing:** ask about their interests (habits, school, work, sport, anxiety, focus, friends, ...). Offer **3–5 topics**, each with a one-line hook and the feeling it leaves. The channel's territory is self-improvement told through a small relatable hero (Mo) with a reversal at the end.

## D. Structure (by format)

### Short: the RicksClips beat sheet with our ending

From `research/MERGED_STYLE.md` section 6:

1. **Paradox hook** (0–3 s)
2. **"You see,"** the stakes in one sentence
3. **Escalation:** one drawable image per clause, concrete numbers, time jumps
4. **Skeptic line:** a side character asks the viewer's question as a deadpan joke
5. **"But here's where it gets weird."** at the midpoint
6. **The reveal image**
7. **Name it,** then the **two-line reversal**
8. **Loop button:** the last image hands back to the first

Rules: present tense for action, no feelings named, one image per clause, one number per beat, no call to action.

Deliverables:
- `scripts/<NN>-<slug>/script.md`: a beats table with the lines, plus a rough shot idea per line.
- `studio/src/shorts/<slug>/lines.json`: `[{id, beat, cap, say, gap}]`.
  - `cap` holds the on-screen text with `*key words*`, which turn amber.
  - `say` is the spoken text, with numbers written as words (for local voices).
  - `cap` and `say` must have the **same number of tokens**.

### Long: the Day One beat sheet (silent, captions)

Use `scripts/Nobody-is-watching/01-nobody-is-watching.md` as the model:

1. Normal world
2. The hook / inciting habit
3. Escalation montage (meter climbing)
4. Cost
5. Rock bottom: **one held, silent shot**
6. Turn / reveal
7. Recovery
8. Moral couplet and end cards

For each shot, write: number, duration, place, mood, action, caption.

Places must be existing backdrops (`bedroom`, `kitchen`, `classroom`, `hallway`, `bathroom`, `gym`, `street`) or flagged as **new** for step 2. Moods come from `studio/src/kit/film.tsx`: joy, warm, day, cool, night, grey, anxious, bottom, dawn, bright. The colour script should **brighten with hope** and darken only at the low beats.

Deliverable: `scripts/<NN>-<slug>/script.md` with the shot table and captions.

## E. Confirm

Show the user:
- the format, length and intention
- the beat summary
- the full script

Ask **"Lock this script?"** When they confirm:
1. Update `videos/<NN>-<slug>/brief.md`: rename the folder to the slug, fill the table, tick step 1.
2. Tell them the next step is `/plan-video-assets`.
