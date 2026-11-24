# 01: Nobody Is Watching.

**Format:** silent animated short with no voiceover, told through music and on-screen captions · **Length:** ~3:20 (200 s) · **30 fps, 1920×1080** · **Built in:** Remotion + @remotion/three (three.js), rendered locally

**Title options:** *Nobody Is Watching.* (primary) · *You're Performing For No One.* · *APPROVAL | An Animated Short Film*

**Logline:** A kid who used to draw for no one starts performing for likes. A crowd only he can see cheers him on and judges him, until he turns around and finds the seats are empty.

---

## Story engine (what makes it ours)

| Device | Ours | Why it works |
|---|---|---|
| **Meter** | A **scoreboard HUD** top-left with two rows: `LIKES` and `DRAWINGS`. LIKES climbs while DRAWINGS freezes, then the reverse, and LIKES switches off at the end | Turns "approval vs. self" into a race you can watch |
| **Antagonist** | **The Bleachers**: dark tiered rows of faceless spectators behind him wherever he goes. Their eyes are glowing amber phone screens, and they whisper in amber text | Original (not a shadow double). It visualizes the imaginary audience. Its reveal is the twist |
| **Metaphor object** | His **sketchbook** ("MO · AGE 10" on the cover): opened, abandoned under the bed, recovered | The opening and closing image, the callback |
| **Flip** | He turns around, the house lights come up, and **the seats are empty**. Then every classmate has their own bleachers behind them | "He'd been performing for a crowd. / The seats were empty." |

## Original look (do NOT copy Day One Films' surface)

- **Hero "Mo":** a rounded-capsule head on a **hoodie-shaped body** (the hood is the silhouette signature), body in **warm paper-white `#EDE6D6`**, oversized sleeves with no hands showing except in inserts. Face is two vertical oval eyes plus a brow line, and the mouth appears only for big emotions.
- **Others:** same capsule head, body color = muted tones (`#7C8C7A` sage, `#9C7B6B` clay, `#6F7C96` slate) + **one accessory each**: Theo (best friend) = round glasses; Lia (little sister) = two hair buns; classmate Dex = snapback.
- **The Bleachers:** 3–6 tiered rows of identical dark-blue silhouettes (`#141824`), each with a small glowing **amber rectangle (`#F2A93B`) for eyes** (a phone screen). They bob slightly out of sync.
- **Accent color:** **amber `#F2A93B`** is used ONLY for the Bleachers, their text, the LIKES number, and anxiety grading. (No red.)
- **Font:** "Patrick Hand" (Google Fonts, free) for all captions. Narrator is white sentence case, Bleachers are amber lowercase, dialogue is white lowercase in rounded pills.
- **World:** dark night palette (bg `#0B0D12` → walls `#1B2030`), one warm practical light per scene (desk lamp `#FFD9A0`), heavy vignette, film grain, bloom on lights and amber eyes.

---

## Caption rules (from the style bible)
- Narrator lines ≤ 9 words, on screen 0.6 s per word (minimum 2 s)
- Narrator: 54 words in the story + 13 in the closing card (Day One Films uses 25–65)
- Bleachers lines repeat in act 3, quieter (smaller + lower opacity)

---

## Shot-by-shot script

Legend: **N** = narrator caption (bottom center) · **B** = Bleachers line (amber) · **D** = dialogue pill · **HUD** = scoreboard state · **Cam** = camera move (orthographic three.js camera; "push 3%" = zoom 1.00→1.03 eased over the shot) · ♪ = music cue / cut on note

### ACT 1: Before the crowd (0:00–0:30)

| # | Time | Dur | Shot | Text | HUD | Cam / FX |
|---|---|---|---|---|---|---|
| 1 | 0:00 | 3.0 | Black. A single desk lamp clicks on (light cone fades up 0→1 over 12 frames). Young Mo (smaller, age 10) at desk, drawing. Pencil scratch SFX | **N:** He used to draw for no one. | — | push 3%, lamp bloom, grain ♪ first piano note on lamp click |
| 2 | 0:03 | 2.5 | Insert, top-down on wood desk: sketchbook "MO · AGE 10", hand drawing a dragon | — | — | push 2% |
| 3 | 0:05.5 | 2.0 | Close-up Mo (age 10) smiling at the page, background blurred | — | — | push 2%, DOF blur |
| 4 | 0:07.5 | 3.0 | Match cut: same desk, same lamp, **Mo now 16**, hoodie. Phone beside the sketchbook | **N:** Then he posted one. | `LIKES 0` `DRAWINGS 41` fades in | push 3% ♪ |
| 5 | 0:10.5 | 3.0 | POV phone: his dragon drawing post, a heart count ticking 0→3 | — | `LIKES 3` | phone glow on hands |
| 6 | 0:13.5 | 3.5 | Lunch table, warm light: Mo doodles on Theo's arm cast, Theo and friends laugh *with* him | **D (Theo):** bro that's sick. | — | slow pan left |
| 7 | 0:17 | 3.0 | Home kitchen: Lia (sister, buns) holds up her crayon drawing, Mo grins and fist-bumps her | **D (Lia):** look! i drew you! | — | push 2% |
| 8 | 0:20 | 4.0 | Classroom. Dex (snapback) scrolls, stops, shows his friends the phone | **D (Dex):** who still draws dragons lol | — | push 3% |
| 9 | 0:24 | 2.0 | Close-up Mo, eyes widen. The music thins out | — | — | hard cut ♪ |
| 10 | 0:26 | 4.0 | **First appearance.** Wide classroom. Behind Mo's desk, the back wall dissolves into **two rows of Bleachers**, amber eyes switching on one by one (staggered 2 frames each) | **B:** they saw it. | — | slow pull-out 3%, amber glow |

### ACT 2: Performing (0:30–1:40)

| # | Time | Dur | Shot | Text | HUD | Cam / FX |
|---|---|---|---|---|---|---|
| 11 | 0:30 | 2.5 | POV phone, thumb hovers over "Delete post?" | **B:** delete it. | `LIKES 3` | — |
| 12 | 0:32.5 | 2.0 | Phone: "Post deleted." | — | `LIKES 0` | hard cut ♪ |
| 13 | 0:34.5 | 3.5 | Bedroom night. Mo shoves the sketchbook under the bed | **N:** So he gave them something else. | — | push 3% |
| 14 | 0:38 | 1.5 | **Montage card** `WEEK 1`: Mo copies a gym-mirror selfie pose (no muscles, flexing) | — | `LIKES 48` | ♪ cut on beat |
| 15 | 0:39.5 | 1.5 | `WEEK 2`: poses next to a car that isn't his | — | `LIKES 130` | ♪ |
| 16 | 0:41 | 1.5 | `WEEK 3`: fake laugh in a group photo, eyes dead | — | `LIKES 212` | ♪ |
| 17 | 0:42.5 | 1.5 | `WEEK 5`: trend dance in his room, the Bleachers now 4 rows behind him, clapping | **B:** more. | `LIKES 640` | ♪ |
| 18 | 0:44 | 3.0 | `WEEK 6`: phone notification "1,040 likes". A brief amber glow on Mo's face. He almost smiles | **B:** they like this you. | `LIKES 1,040` · `DRAWINGS 41` | push 4% |
| 19 | 0:47 | 4.0 | Phone POV: Theo texts "drawing session saturday? 🎨". Mo types "busy." | — | — | — |
| 20 | 0:51 | 4.0 | Kitchen. Lia holds up a new drawing. Mo doesn't look up from the phone | **D (Mo):** cool. | — | slow push 3%, Lia's arm drops slowly |
| 21 | 0:55 | 3.0 | Close-up Lia, drawing lowered. Background blurred | — | — | hold |
| 22 | 0:58 | 4.0 | Under the bed: the sketchbook with dust particles in a sliver of light | **N:** The more they liked him, | `DRAWINGS 41` | very slow push 2% |
| 23 | 1:02 | 3.0 | Mirror shot: Mo practices a smile. The reflection doesn't smile back (just tired eyes) | **N:** the less he liked himself. | — | hold |
| 24 | 1:05 | 3.5 | Hallway at school. The Bleachers now line *both* sides of the corridor like a tunnel. Mo walks small through the middle | **B:** don't be weird. | — | slow pan right with walk |
| 25 | 1:08.5 | 3.0 | Theo at lockers waves, Mo passes with eyes on his phone. Theo's wave drops | **D (Theo):** …mo? | — | — |
| 26 | 1:11.5 | 3.5 | Group chat POV: "saturday session 🎨" photo of Theo + friends drawing. Mo isn't in it | — | — | phone glow |
| 27 | 1:15 | 4.0 | Bedroom 1:48 AM. Mo posts a new photo. Refresh. `LIKES 9` | **B:** only nine? | `LIKES 9` | push 3%, amber tint starts creeping in (grade 0→15%) |
| 28 | 1:19 | 3.0 | **Grid repetition:** the refresh shot tiled 4×6, each tile a different time (1:52, 2:07, 2:13 AM…) | — | `LIKES 9` | tiles pop in 2 frames apart ♪ |
| 29 | 1:22 | 4.5 | Wide bedroom. The walls are gone: **Bleachers fill the whole frame**, 6 rows, all amber eyes on him. Whispers pile up in amber, overlapping, scaling down to tiny | **B:** nobody likes the real you. / delete it. / they're laughing. / be someone else. | — | slow push 5%, amber grade 60%, music cuts to a single low drone |
| 30 | 1:26.5 | 6.0 | **Rock bottom.** Silence. Mo curled on the bed, phone light on his face, everything else nearly black. Hold | — | — | static, then 1% push in the last 2 s |

### ACT 3: The empty seats (1:32–2:50)

| # | Time | Dur | Shot | Text | HUD | Cam / FX |
|---|---|---|---|---|---|---|
| 31 | 1:32.5 | 4.0 | Close-up: Mo slowly lifts his head. For the first time, he **turns around** to face the crowd | — | — | push 3% ♪ single piano note returns |
| 32 | 1:36.5 | 5.0 | **THE REVEAL.** Wide. A loud *clunk* SFX: stadium house lights slam on (exposure jumps from 0.2→1.0 over 4 frames). **Every seat is empty.** Just phones lying on seats, screens glowing amber… which switch off one by one | **N:** He'd been performing for a crowd. | — | slow pull-out 4% to show the scale of empty rows |
| 33 | 1:41.5 | 3.5 | Same wide. The last amber screen goes dark | **N:** The seats were empty. | — | hold, amber grade back to 0 |
| 34 | 1:45 | 5.0 | Next day, classroom wide. Now we can see it: **behind every classmate is their own small set of Bleachers.** Dex has the biggest set, nervously checking his phone | **N:** Everyone else was busy performing for theirs. | — | slow pan across the row |
| 35 | 1:50 | 3.0 | Close-up Dex, worried amber light on his face, refreshing | — | — | push 2% |
| 36 | 1:53 | 4.0 | Bedroom night. Mo reaches under the bed, pulls out the sketchbook, blows the dust off (particle burst in the lamp light) | — | `DRAWINGS 41` | push 3%, dust particles ♪ |
| 37 | 1:57 | 2.0 | `DAY 1`: first page, bad lines, eraser. A **small** single row of Bleachers flickers in the background | **B:** (small) nobody will like this. | `DRAWINGS 42` | ♪ |
| 38 | 1:59 | 1.5 | `DAY 3`: Mo keeps drawing, the Bleachers flicker but don't fully appear | — | `DRAWINGS 44` | ♪ |
| 39 | 2:00.5 | 3.0 | `DAY 7`: Mo shows Lia a drawing **of her**. Lia's buns bounce, she beams | **D (Lia):** is that me?! | `DRAWINGS 51` | push 2% |
| 40 | 2:03.5 | 3.0 | `DAY 9`: Mo texts Theo: "is saturday still a thing?". Reply instantly: "ALWAYS. 🎨" | — | — | phone glow |
| 41 | 2:06.5 | 3.5 | `DAY 12`: Saturday session, warm room, 4 friends drawing around a table under a pendant lamp | **D (Theo):** he lives! | `DRAWINGS 60` | slow pan, warm amber-*free* grade (gold `#FFD9A0` only) |
| 42 | 2:10 | 3.0 | `DAY 18`: Mo drawing in class margin. Dex leans over | **D (Dex):** …wait. you drew that? | `DRAWINGS 73` | — |
| 43 | 2:13 | 2.0 | Mo braces. Dex's Bleachers dim a little | **D (Dex):** teach me the eyes. | — | push 2% |
| 44 | 2:15 | 3.5 | `DAY 24` → `DAY 30` fast cards (0.7 s each): sketchbook pages flipping, filling up | **N:** He didn't need an audience. | `DRAWINGS 97` | ♪ each card on a beat |
| 45 | 2:18.5 | 3.0 | Close-up: Mo drawing, calm, lamp light on his face | **N:** He just needed the page. | — | push 2% |
| 46 | 2:21.5 | 4.0 | **Final test.** Mo photographs a finished dragon (the adult version of the age-10 dragon), posts it. Refresh: `LIKES 6` | — | `LIKES 6` | push 3% |
| 47 | 2:25.5 | 4.0 | The full Bleachers flicker back on, all 6 rows, amber eyes, louder than ever | **B:** only six. / delete it. / they saw it. | — | amber grade 40%, music thins out |
| 48 | 2:29.5 | 3.0 | Close-up: Mo looks at the phone… and turns it **face down** on the desk. *Click.* | — | — | hard cut ♪ |
| 49 | 2:32.5 | 4.0 | Wide: the Bleachers switch off row by row from the top down. The room is just a room. Mo picks up his pencil | — | **`LIKES` row powers off** (flicker, then gone). `DRAWINGS 100` ticks up | pull-out 3% |
| 50 | 2:36.5 | 4.5 | Callback: Lia sits next to him at the desk with her crayons. Both drawing under one lamp, same composition as shot 1 | — | — | push 3%, warm |
| 51 | 2:41 | 4.0 | Insert top-down: two sketchbooks side by side: "MO" and "LIA · AGE 8" | — | — | push 2% |
| 52 | 2:45 | 5.0 | Wide: the lamp is the only light. Very slow push. The music swells | — | `DRAWINGS 100` | push 4% ♪ swell |

### CLOSE (2:50–3:20)

| # | Time | Dur | Shot | Text | Cam / FX |
|---|---|---|---|---|---|
| 53 | 2:50 | 5.0 | Black. Typed on letter by letter | **N:** Nobody is watching as closely as you think. | — |
| 54 | 2:55 | 5.0 | Black, second line | **N:** So stop performing. Start living. | — |
| 55 | 3:00 | 4.0 | Title card, small: **NOBODY IS WATCHING.** | — | fade in over 10 frames |
| 56 | 3:04 | 6.0 | CTA, our twist on the formula | Only like this if it actually hit you. / *(smaller)* subscribe for more short films. | — |
| 57 | 3:10 | 10.0 | End screen: dark with two video slots | — | — |

**Narrator word count:** 54 story + 13 closing ✅ · **Shots:** 57 (avg ~3.5 s) ✅ · **Bleachers lines:** 14 (they repeat "delete it." and "they saw it." as callbacks) ✅

---

## Music and sound cue sheet

| Time | Cue |
|---|---|
| 0:00 | Solo felt piano, ~90 BPM, sparse. The lamp click is the first note |
| 0:24 | Music thins out (the wound) |
| 0:38–0:47 | Light pulse/beat added under the WEEK montage. Every card is cut on a beat |
| 1:22 | Everything drops to a single low drone + whisper layer (stereo-panned murmurs) |
| 1:26.5–1:32 | **Silence** (6 s) |
| 1:32.5 | Single piano note returns |
| 1:36.5 | Big "clunk" SFX of stadium lights, then a sustained warm pad |
| 1:57–2:18 | Piano returns fully, the DAY cards cut on beats |
| 2:25 | Thins out again (final test) |
| 2:29.5 | Phone face-down *click* = downbeat. Strings/pad enter |
| 2:45–3:00 | Swell, then resolve on the title card |

Use royalty-free or self-made music (e.g. a piano track you compose, or a licensed library track). No copyrighted songs.

---

## Description and tags

> He used to draw for no one. Then he started performing for a crowd.
> The seats were empty.
>
> Nobody is watching as closely as you think. So stop performing. Start living.
>
> #selfimprovement #confidence #socialmedia #animation #shortfilm

---

## Production map: Remotion + @remotion/three

| Need | How we build it |
|---|---|
| 2D flat look in three.js | `<ThreeCanvas>` with an **OrthographicCamera**. Characters are `ShapeGeometry` / `CapsuleGeometry` with `MeshBasicMaterial` (unlit, flat color), and outlines come from a slightly larger back-face mesh or `EdgesGeometry` |
| Light pools / lamp cones | Additive-blended radial-gradient planes (a shader or canvas texture) + emissive bulb sprites |
| Bloom on lamps and amber eyes | A custom fragment shader post pass rendered in the same canvas (or `@react-three/postprocessing` if it plays well with Remotion's frame-by-frame rendering; test it in the pipeline first) |
| Vignette + grain | Full-screen quad shader on top, with grain seeded by `useCurrentFrame()` so renders stay deterministic |
| Amber "anxiety" grade | A uniform on the post shader: mix toward amber multiply |
| Camera push-in / pan | `interpolate(frame, [0, dur], [1, 1.03], {easing: Easing.inOut(Easing.quad)})` on the camera zoom |
| Captions, HUD, phone UIs | Plain React/HTML layers over the `<ThreeCanvas>` inside the Remotion composition (crisp text, easy typing animation) |
| Shot timing | One `<Sequence>` per shot from a `shots.ts` table generated from this script, which makes retiming easy |
| Cut on beat | Python (numpy + ffmpeg) onset detection on the music file → `beats.json` → snap shot boundaries to the nearest beat |
| Render | `npx remotion render` locally to MP4 (H.264, 1080p30). ffmpeg for audio mux / loudness normalization (−14 LUFS) |
