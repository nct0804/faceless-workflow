# Ink & Ember: our signature style (v2)

This style merges two references. From **Day One Films** we keep the emotional self-improvement story, the faceless everyman, the meter that tracks his decline, and low-key night light with a single warm accent. From **RicksClips** we take the fully 3D drawn-ink world, the never-stopping camera, word-by-word captions, the paradox-hook script machine and the crisp premium finish. The result has to look like neither of them. It looks like **us**: Mo, navy night, one amber light, ink lines.

The research behind it is in `dayonefilms/STYLE_BIBLE.md` and `ricksclips/STYLE_BIBLE.md`. The tools are in `../assets/` (Blender) and `../studio/src/kit3d/` (three.js in Remotion).

---

## 1. Identity: what makes a frame ours

| Element | Day One (theirs) | RicksClips (theirs) | **Ink & Ember (ours)** |
|---|---|---|---|
| Hero | Blank 2D everyman | White ball-head, black sticks | **Mo:** paper-white capsule head, tall glossy black oval eyes with catch-lights, a single brow line, cream oversized hoodie with the hood down, long ink stick legs, round mitten hands |
| World | Flat 2D rooms | 3D, PBR or ink-outlined | **3D Blender sets, ink-outlined, cel-shaded, painted strokes** (wood grain, wallpaper motif, fabric hatching) with baked contact shadows |
| Palette | Dark, one accent | Saturated day / night | **Navy night base (`#141A2E`), one amber practical (`#F2A93B` / `#FFB45E`), cool moonlight rim (`#8FA8FF`).** Day scenes are allowed but stay warm-cool split; no red except danger |
| Antagonist | Red shadow critic | none | **The crowd:** faceless navy silhouettes whose eyes are amber phone screens |
| Text | Silent captions, 3 voices | 1–3 word VO captions | **Shorts:** VO plus word-by-word captions in Baloo 2 ExtraBold with an ink outline; **the key word of each line turns amber and pops 18% bigger.** **Films:** silent narrator lines (Patrick Hand) plus the same amber keyword rule |
| Meter | HUD number | Diegetic gauges | **Diegetic 3D meter** in the set (phone like-counter, wall calendar, gauge) |
| Ending | Moral couplet | Twist or mechanism | **The twist is the moral**: a two-line reversal ("Nobody was watching. / That was the good news.") |

---

## 2. The look, in numbers

Measured on `studio/out/look/` with the same probe as the research (`luma`, `σ`, `p5`/`p95`, `crush` <16, `sat`, `sharp`):

| | Day One | RicksClips | **Ours (target)** | Look test |
|---|---|---|---|---|
| Brightness | 23–43 | 110 | **55–75 night / 100–120 day** | 61 / 131 (close-up) |
| Contrast σ | 36–50 | 52 | **52–58** | 56 / 57 |
| Crushed blacks | 20–40% | 1% | **3–10%** (shadows are navy, not black) | 7.7% / 0.3% |
| Highlights p95 | 87–134 | 201 | **180–205** (practicals bloom) | 183 / 207 |
| Saturation | 23–29 | 117 | **100–120** | 112 / 77 |

The finishing stack is `kit3d/post.tsx`, in this order:

1. Beauty pass with MSAA.
2. Screen-space ink lines from depth and normals; the lines take the local colour, darkened.
3. Depth-of-field bokeh with autofocus on a point.
4. Bloom on high-dynamic-range practicals.
5. Grade:
   - exponential tone curve with a linear toe
   - contrast pivoted at 0.3 so the navy shadows survive
   - navy split-tone in the shadows, amber in the highlights
   - saturation
   - display-space unsharp mask at 1.5 px
   - light vignette, grain, edge chroma

Characters additionally get a 3.2 px inverted-hull ink outline.

---

## 3. Lighting recipe (every shot)

1. **One warm practical, visible in frame:** desk lamp, phone, laptop or streetlamp. It is the only amber. Use `<Practical>` plus a `GLOW_` mesh.
2. **Cool key from a window or the moon,** with crisp shadows (`<Moonlight>`), plus a **window light-shaft** (`<LightShaft square>`) with **dust** (`<Dust>`) floating in it.
3. **Navy fill** (`<Ambient>`): shadows read at luma 25–40, never black.
4. **Phone light on the face from below** when Mo looks at the phone: a blue under-light at the chin, very low intensity.
5. Close-ups: `aperture` 1.5–2.5 with `focusAt` the head, so the practicals behind become bokeh.

## 4. Camera and edit

- **The camera never stops.** Every shot has a push-in, drift or pull-out (RicksClips: 74% moving). Use `ease = bezier(.33,0,.2,1)` with handheld noise `shake` of 0.004–0.008.
- **One visual beat per clause.** A cut, a camera beat or an expression swap lands on every clause of the VO.
- **Match-moves between places,** e.g. through the window, into the phone screen, out of a poster. Use these instead of a plain cut at least twice per short.
- **Dissolves of about 6 frames** for time jumps; hard cuts on punchlines.
- Framing:
  - 9:16: hero in the centre third at 35–45% of frame height; low angle for confidence, high angle for defeat.
  - 16:9: room-wide establishing shots, then tight reactions.
- **Hold still exactly once:** the rock-bottom shot. No camera move, no music, 2–3 s. This is our Day One heritage and the contrast makes it hit.

## 5. Character acting

- Pose-to-pose (RicksClips): pick a pose preset (`POSES.holdPhone`, `defeated`, `cheer`, `shrug`, `wave`) and change **face mood every 0.3–0.6 s** on the words.
- Faces (`kit3d/face.ts`): neutral, happy, laugh, shock, sad, smirk, tired, fake, angry, determined, cry, worried, content. Extras: sweat drop, blush, tears, anger vein, eye direction, blink, talk flap.
- Mo never speaks on screen in films. In shorts the narrator voice is "us", not Mo.

---

## 6. Script machine (shorts, 55–65 s, about 200–220 words)

The RicksClips beat sheet, filled with our theme (the cost of a habit, then the reversal):

| # | Beat | s | Template | Example ("The 96 Checks") |
|---|---|---|---|---|
| 1 | **Paradox hook** | 0–3 | "He did [absurd thing], but/because [stake]." | "He checked his phone 96 times a day, and not once did anything change." |
| 2 | **You see,** | 3–8 | "You see, [world + stakes in one sentence]." | "You see, every post he made, he'd watch the likes climb like a scoreboard." |
| 3 | **Escalation, one beat per clause** | 8–30 | Concrete numbers; time jumps "That night…", "By Friday…" | "9 likes. He deletes it. Posts again at 2 AM. 11. Better." |
| 4 | **Skeptic line** (side character, deadpan) | ~20 | The viewer's question as a joke | "His little sister asks if the phone is paying rent." |
| 5 | **"But it gets weirder."** | ~30 | Midpoint pivot | "But here's the weird part. Every like he waited for was from someone doing the exact same thing." |
| 6 | **The crowd reveal** (our signature image) | 30–45 | The bleachers of amber phone-eyes turn out to be watching **their own** screens | "The crowd he performed for? All looking down. Nobody was watching." |
| 7 | **Name it** (Ricks) **plus the reversal** (Day One) | 45–58 | "It's called [the spotlight effect]." Then a two-line reversal | "It's called the spotlight effect. / Nobody was watching. / That was the good news." |
| 8 | **Loop button** | last 1 s | The final image equals the first frame | Mo's phone lights his face; the first shot again, but he puts it down |

Rules:
- Present tense for action. No feelings named.
- One drawable image per clause.
- One concrete number per beat.
- No CTA in the video. The amber keyword in each caption is the word you'd say louder.

Long films (3–4 min, silent) keep the Day One beat sheet but borrow the camera, the 3D world, the crowd reveal and the amber keyword.

---

## 7. Production pipeline (reusable; build once, reuse forever)

```
assets/blender/*.py  --Blender (headless)-->  studio/public/assets/*.glb   (+ assets/blend/*.blend, asset-marked)
                                                    |
studio/src/kit3d: useGLB / instantiate (materials by NAME) -> Character / SetView -> Stage(Post) -> Remotion
```

- **New video means new script, not new assets.** Reuse `mo`, `theo`, `lia`, `dex`, `crowd` and `set_bedroom`. Build a new set only when the script needs a new place: copy `assets/blender/sets/bedroom.py` and follow the naming API (TOON_<pattern>_*, GLOW_*, INK, MARK_*, LIGHT_*).
- Look-dev compositions: `CharTest` (rig/face sheet) and `LookTest-9x16` / `LookTest-16x9`.
