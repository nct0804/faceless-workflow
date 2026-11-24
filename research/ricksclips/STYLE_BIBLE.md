# RicksClips: Style Bible

A study of the channel's latest 20 Shorts (21 Oct to 22 Nov 2026, **599K to 31.4M views, median ≈10M**). Every short was decoded at its native 30 fps and analysed:

- **Per frame:** brightness, contrast, crushed blacks, highlights, saturation, vignette, sharpness, and optical-flow camera motion (pan and zoom).
- **Cuts:** hard cuts measured; dissolves and continuous camera moves checked by eye on dense filmstrips.
- **Whole video:** viewed as a one-frame-per-second mosaic.
- **Captions:** read by OCR at 10 fps, cross-checked against YouTube's own captions where available (7 of 20).

Raw numbers are in `stats.csv` and `script_stats.json`; the full scripts are in `transcripts/`.

---

## 0. The one-sentence formula

> **A paradox hook ("He did something absurd, because or but X"), told at 225 words per minute by one narrator over a fully 3D, cartoon-outlined world. The camera never stops travelling, a side character asks the dumb question the viewer is thinking, and the story pays off with a named mechanism or a dark twist in the last 10 seconds. No intro, no outro, no call to action.**

---

## 1. Format

| | Measured |
|---|---|
| Length | 55–78 s (median **61.7 s**). The 78 s one has the fewest views (599K) |
| Upload cadence | Every 1–3 days |
| Title | Curiosity question or claim in Title Case, no period: "Why Perfect Railroads Don't Work", "The Pink Prison Cell Experiment", "How One Cart Stopped an Entire Army" |
| Description | The title only. No hashtags, links or CTA |
| Voice | One male narrator ("Rick", a voice-over hobbyist) with an energetic, conversational, dry-funny delivery |
| Speech rate | **~225 words/min** (183–251). No pauses longer than 0.25 s: the audio is a wall of words |
| Loudness | −14 LUFS, **LRA 1.8 LU**, which is extremely compressed. Music sits low under the voice; SFX hits on actions |
| Topics | Hidden mechanisms of history, psychology and everyday life: target fixation, mine salting, storm oil, the "Baker-Miller pink" cell, Japanese "boredom rooms", grave bells, roller-coaster loop shapes |

---

## 2. How the scripts are written

### 2.1 The beat sheet (every one of the 20 follows it)

| # | Beat | Time | Grammar | Real lines |
|---|---|---|---|---|
| 1 | **Paradox hook** | 0–3 s | A strange action plus its contradiction, in one breath. Past or present tense, third person ("He…") or second person ("If you…", "Imagine…") | "He sawed gaps into a railroad every 39 feet." · "If you plant a tree beside an empty road, cars will steer right into it." · "They buried a man alive with a bell tied to his finger." · "It's impossible to get fired in Japan, but companies found something way worse." |
| 2 | **"You see,"** setup | 3–8 s | Always starts with **"You see,"** then the world and stakes in one sentence | "You see, two companies are racing to build a railroad along a canyon so deep you can't see the bottom." |
| 3 | **Escalation** | 8–35 s | One visual beat per clause, chained with "and", "so", "but", "then". Time jumps: "That night…", "The next morning…", "Then summer comes…". Concrete numbers everywhere (82 holes, 15 mph, 300 times) | "So the town nails a giant flashing arrow to it… Yet the crashes double." |
| 4 | **The skeptic** | inside 3 | A side character says the viewer's dumb question as a joke, delivered by the narrator with no quote marks | "His commander asks, are we fighting them or grating cheese?" · "So we're shooting gold into a gold mine?" · "You go check. No, you go check." |
| 5 | **"But it gets weirder."** | ~50% | A pivot line that resets attention at the midpoint | "But it gets weirder." · "Then summer comes and something weird happens." · "Wait. Practiced?" |
| 6 | **Climax** | 35–50 s | The setup pays off visually in one big action | "All 82 blast off the cart at once…" |
| 7 | **Name the mechanism, or the twist** | last 8–12 s | Either the explainer ("So how does this keep happening? Well, it's called **target fixation**.") or the dark twist ("…every debt got buried right along with him. And the house was all hers.") | |
| 8 | **Button / loop** | last 1–2 s | The last words often hand back to the first frame so the short replays seamlessly | Pink cell ends with the rage cracks it opened on |

### 2.2 Rules of the voice

- **Present tense for action, past tense for the hook.** "He drilled 82 holes… while everyone else sharpens swords, he's in the corner still drilling."
- **One image per clause.** Every clause is drawable, and the edit cuts or moves on every clause.
- **No feelings stated, only shown.** The narrator never says "he was sad". The face and the shot do it.
- **Humour by understatement:** "the tow truck guy… has never made more money in his life."
- **No moral, no CTA, no "subscribe".** The twist is the ending.

### 2.3 Captions

| | Measured |
|---|---|
| Words per caption | **1.3** (1–3 words; function words ride with the next word: "on a", "the toilet") |
| Hold | **0.3 s** median; captions change with each spoken word |
| Position | Horizontally centred, **~69% down** the 9:16 frame (above the Shorts UI) |
| Type | Heavy rounded sans, white, thick black outline plus drop shadow, lower-case as spoken, punctuation kept |
| Motion | Hard swap per word, small scale-pop |

---

## 3. The look

### 3.1 Measured, median across 20 (0–255 luma on a 270 px-wide copy)

| Metric | Median | Range | Reads as |
|---|---|---|---|
| Brightness (luma) | **110** | 62–140 | Bright, daylight-heavy. Night episodes (astronauts, memories) sit at 60–70 |
| Contrast (σ) | **52** | 42–62 | Strong |
| Shadows p5 / highlights p95 | **37 / 201** | | Lifted, coloured shadows; bright highlights |
| Crushed blacks (<16) | **1%** | 0.2–29% | Almost never pure black, even at night (blue-navy shadows) |
| Clipped whites (>240) | **2%** | | Practicals and screens bloom to white |
| Saturation | **117** | 73–166 | Very saturated |
| Vignette (centre minus edge) | **22** | | Light |
| Sharpness (Laplacian variance) | **~1900** | 1100–3000 | Extremely crisp: fine texture plus sharpening |

### 3.2 What the frames are made of

- **Fully 3D sets** with real perspective, depth and lighting: canyons, prisons, mission control, a 1890s town. Every surface carries texture detail: wood grain, brick, wallpaper, quilt patterns, posters with real readable text.
- **Two finishes:**
  - **Clean PBR world:** space, prison.
  - **Ink-outlined "drawn" world:** the Japan office, the grave bell, the memory shop. Here every object has a dark, variable-width outline, cel shading in 2–3 bands, and hatch-line texture. The ink look gets the highest engagement (19M views and 11K comments on the office short).
- **Characters** are deliberately simple against those rich worlds:
  - **Head:** a white ball with a thick ink outline and a drawn 2D face (eyes, brows, mouth, sweat drop, blush, tears, anger veins), swapped per expression.
  - **Body:** a bean-shaped coloured torso with clothing details drawn as lines (buttons, name tags, stripes).
  - **Limbs:** long thin black sticks; small round hands.
  - **Identity:** carried by hats and hair.
- **Light:**
  - Motivated practicals: lanterns, candles, screens, a sunrise.
  - Strong warm against cool contrast: amber lamp on navy night, pink cell against blue prison, orange canyon against blue sky.
  - Window light cuts hard shafts across faces and floors.
  - Bloom on every light source, bokeh in the background.
- **Depth:** shallow depth of field on close-ups, atmospheric haze, floating dust or snow, aerial establishing shots.
- **Graphic inserts:** cross-sections (a coffin underground), x-ray highlights (rail gaps glowing yellow), meters and gauges (a "HAPPINESS" pressure gauge), newspapers, phone UIs, wall calendars. All are diegetic, 3D props in the set rather than flat overlays.

### 3.3 Camera, movement, cuts

| | Measured |
|---|---|
| Hard cuts | **14 per short** (4–24), median shot 2.4 s. The real count of picture changes is higher because many changes are dissolves or camera travel |
| Shots with camera movement | **74%** (40–100%) |
| Push-ins / pull-outs | 45% / 18% of shots |

- **Continuous camera travel ("one-take world").** The camera flies out of a window, across space, into a monitor that shows the next scene (shot-in-a-screen match), then pulls back into a new room. One move can carry 3–4 story beats (10–20 s with no cut).
- **Quick cross-dissolves (~6 frames)** between places; whip moves; aerial-to-ground drops.
- **Framing:**
  - Wide-angle lenses and low hero angles; characters often in the centre third with deep perspective lines (rails, corridors) converging behind them.
  - Close-ups are tight on the face for reactions.
  - Macro inserts on objects.
- **Character animation is limited and pose-to-pose:** expression swaps every 0.2–0.5 s; small body pose changes; walks and gestures on key beats. The camera supplies the energy.

---

## 4. What to borrow, and what not to

| Borrow (grammar) | Don't copy (identity) |
|---|---|
| The **beat sheet**: paradox hook, "You see,", escalation, skeptic, midpoint pivot, payoff, loop | His narrator, characters, hats and settings |
| **One visual beat per clause**; continuous camera travel; screen and window match-moves | The ball-head-plus-black-stick character design as is |
| Ink outlines, cel shading, practical lighting, bloom, depth of field, dust and haze | His topics ("hidden mechanism of history") as a format clone |
| 1–3-word captions at about 69% height with a scale pop | His font and caption styling one-to-one |
| Diegetic 3D graphics (gauges, cross-sections) | |

How we merge it with our own (Day One-derived) style is in `../MERGED_STYLE.md`.
