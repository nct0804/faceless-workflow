# 02 · The 96 Checks (Short, 9:16, 54.6 s)

The first short in the merged **Ink & Ember** style (`research/MERGED_STYLE.md`). It follows the RicksClips beat sheet and ends with our two-line reversal.

- **Render:** `studio/out/checks96/the-96-checks.mp4`
- **Code:** `studio/src/shorts/checks96/`
  - VO lines: `lines.json`
  - Word timings: `vo.json`
  - Shots: `Shots.tsx`
  - Edit: `Short.tsx`

**Title:** Why Nobody Is Actually Watching You
**Alternatives:** The 96 Checks · He Checked His Phone 96 Times a Day
**Description:** the title only (RicksClips rule: no hashtags, no CTA).

**Stats:** 192 words over 53.1 s of VO (217 words/min, voice: Evan (Enhanced) at rate 0.548), 32 shots, median shot about 1.6 s, the camera moves in every shot except one.

---

## Script (VO), with beats

| # | Beat | Line (`*key*` words turn amber in the captions) |
|---|---|---|
| L01 | **Paradox hook** | Mo checked his phone *96 times* a day, for a crowd that wasn't even *looking.* |
| L02–03 | **"You see,"** | You see, every drawing he posted turned into a *scoreboard.* And the score was *likes.* |
| L04–06 | Escalation | Monday, he posts a *dragon.* *Nine likes.* He *deletes* it. |
| L07–08 | Escalation | Tuesday, he redraws it for *three hours,* posts at *2 AM.* *Eleven.* Better. |
| L09 | Escalation | Wednesday, he checks in *class,* at *dinner,* in the *shower.* |
| L10–11 | Escalation | By Friday, he isn't drawing anymore. He's just *refreshing.* *96 checks.* Zero drawings. |
| L12 | **Skeptic** (side character, deadpan) | His little sister asks if the phone pays *rent* now. |
| L13–14 | Escalation into the image | He doesn't laugh. Because in his head, there's a *stadium.* Thousands of seats, every one of them *watching him,* waiting for him to *mess up.* |
| L15 | **"But it gets weirder."** | But here's where it gets *weird.* |
| L16–19 | **Crowd reveal** (our signature image) | Walk up into those seats and look *closer.* *Nobody's* looking at Mo. Every single one of them is staring at their *own phone.* Counting their own likes. Scared of their *own crowd.* |
| L20–21 | **Name it** | It's called the *spotlight effect.* You feel like the whole world is watching, when almost *nobody* is. |
| L22–23 | **Reversal** (Day One heritage) | *Nobody was watching.* And that was the *good news.* |
| L24 | **Loop button** | So Mo puts the phone face down, picks up his pencil, and for once, he doesn't *check.* |

The 96 a day figure is the widely cited US phone-check statistic. The spotlight effect is a well-studied finding: people overestimate how much others notice them.

## Shot list (all 3D, word-anchored cuts)

| Shot | Set | What we see | Camera |
|---|---|---|---|
| S01a | Bedroom, night | Phone wakes up and lights Mo's face from below | Slow push-in, depth of field on the face |
| S01b | Stadium (dark) | Teaser: rows of amber eyes in the dark ("a crowd") | Drift forward |
| S02 | Bedroom desk | Mo happily drawing the dragon; the page draws itself | Cutaway through the back wall |
| S03 | Phone macro | The like counter rolls like a scoreboard to 9 | Macro push |
| S04 | Phone macro | Upload bar, then the post goes live | Macro push |
| S05 | Phone macro | Likes tick to 9, "Delete post?", deleted | Macro push |
| S07a | Desk | Tuesday: drawing again, crumpled tries pile up | Arc around the desk |
| S07b | Nightstand | Alarm clock flips 1:59, then 2:00 AM | Macro push |
| S08 | Bed | 9 rolls to 11; Mo's smirk ("Better.") | Push-in |
| S09 ×3 | Vignette islands | Class, dinner (sister at the table), shower (steam, shock face) | One whip per word |
| S10a | Desk, lamp off | The abandoned half dragon in moonlight dust | Push-in |
| S10b | Bed | Refresh spinner; the screen pulses on Mo's tired face | Push-in |
| S11 | Phone macro | Screen Time: Pickups counts up to 96; Drawings 0 | Macro push |
| S12 | Bedroom | Lia at the door, deadpan, mouth flapping | Over the shoulder past Mo |
| S13a | Bed | "He doesn't laugh." | Push-in |
| S13b | Bed | Push into Mo's eye … | Accelerating dolly, 8-frame dissolve |
| S14a | Stadium | … lights clunk on; thousands of amber eyes | Crane out and up |
| S14b | Stadium | Mo small, sweating, under towering stands | Low angle, dutch tilt |
| S15 | Stadium | "But here's where it gets weird": Mo looks up | Push-in, dutch tilt |
| S16 | Stadium | Fly up the aisle; on "Nobody's" the heads bow in a wave | Bezier flight |
| S17 | Stands | A row of strangers, faces lit by their own screens | Low track along the row |
| S18a | Stands | Their point of view: their own post, ♡ 3 | Macro |
| S18b | Stands | One looks around, terrified someone saw | Medium |
| S19 | Stadium high | A field of tiny screens; Mo alone in the spotlight | Slow descend |
| S20 | Stadium | Mo looks around; on "nobody" the spotlight dies (clunk) | Push-in |
| S21 | Stadium | **The one still shot.** No music, 2 s | Locked off |
| S22 | Stadium | Relief; a warm light finds him | Push-in |
| S23a | Desk | Phone flipped face down; its light goes out | Macro |
| S23b | Desk | Picks up the pencil, content | Cutaway pull |
| S23c | Bedroom | Pull back; the phone buzzes; he keeps drawing | Pull-out (loops to S01a) |

## Sound

- **VO:** Apple's Evan (Enhanced) voice, generated locally (`studio/audio/vo/`; `make_vo.py ... auto` picks the best installed voice). The old scratch take is in `public/audio/checks96/_tts/`.
- **Music and SFX:** synthesized (`studio/audio/make_short_audio.py`), one section per beat:
  - **Bedroom:** pluck pulse and felt piano (A minor).
  - **Stadium:** a boom on "stadium", then a drone, a heartbeat and the crowd's whispers.
  - **"Weird":** a clock tick only.
  - **Reveal:** a pad swell, with phones popping on in a wave.
  - **"Nobody was watching.":** hard silence over room tone.
  - **"Good news":** one piano note, then a C-major resolve.
  - **Ducking:** the music ducks under the voice.
  - **Master:** −14 LUFS.

## Replace the voice (recommended before upload)

The scratch voice is a compact Apple voice. For a premium result, choose one:

1. **Record yourself.** Save it as `studio/public/audio/checks96/vo.wav` and keep `vo.json` in the same structure, with the word times updated.
2. **Install a Premium Apple voice** (free; System Settings → Accessibility → Spoken Content → System Voice → Manage Voices, e.g. "Zoe (Premium)" or "Evan (Enhanced)"). Then run:

```bash
python3 audio/vo/make_vo.py src/shorts/checks96 <voice identifier> 0.53
```

```bash
.venv/bin/python audio/make_short_audio.py checks96
```

The cuts and captions re-time themselves from the new `vo.json`.
