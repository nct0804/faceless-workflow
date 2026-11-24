# Faceless studio

Remotion 4.0.546 + @remotion/three (three.js 0.187, @react-three/fiber 9). Everything is rendered locally, with no AI video generation.

## Run

```bash
npm install
npm run studio                       # live preview in the browser
npx remotion render src/index.ts Film out/nobody-is-watching.mp4 --codec=h264 --crf=18   # all 57 shots, 3:20 (~3 min to render)
npx remotion render src/index.ts Act3 out/act3.mp4 --codec=h264 --crf=18          # shots 31–57, 107.5 s
npx remotion render src/index.ts Act1 out/act1.mp4 --codec=h264 --crf=18          # shots 1–10, 30 s
npx remotion render src/index.ts Act2 out/act2.mp4 --codec=h264 --crf=18          # shots 11–30, 62.5 s
npx remotion render src/index.ts Acts1-2 out/acts1-2.mp4 --codec=h264 --crf=18    # 0:00–1:32.5 (~70 s to render)
npx remotion still src/index.ts Shot10 out/shot10.png --frame=110
```

## Audio

Everything is synthesized locally with numpy (no samples, no AI, no licensed music):

```bash
python3 -m venv .venv && .venv/bin/pip install numpy   # once
.venv/bin/python audio/make_audio.py                    # ~40 s -> public/audio/mix.wav (+ music.wav, sfx.wav stems)
```

- `audio/synth.py`: felt piano, pluck, pad, drone, kick/tick, SFX (click, shutter, pop, ding, whoosh, thud, clunk, clap, pencil scratch, slide, blow, power-down, whispers, room tone) and a convolution reverb.
- `audio/make_audio.py`: reads every `SHOTxx_FRAMES` from `src/shots`, so **retime a shot and re-run it, and the music follows the new cut list**. Every cut gets a piano note (91% measurable onsets) with a short dip before it. Sections follow the script's cue sheet: warm Act 1, the thin "wound", the WEEK-montage pulse, the crowd drone, 6 s of silence at rock bottom, one note back, the reveal pad, the recovery, the click downbeat, the swell, and the resolve on the title card. SFX are placed at exact shot frames; whispers sit under every crowd line.
- Mixed to −14 LUFS / −1.5 dBTP (YouTube's loudness target). `Film`, `Act1`, `Act2`, `Acts1-2`, `Act3` all play it in sync (`trimBefore` offsets in `Root.tsx`).

## Layout

- `src/theme.ts`: palette, 1920×1080 @ 30 fps, floor line. 1 world unit = 1 px at zoom 1, origin at frame center.
- `src/kit/three.tsx`: `Flat` (flat shape + outline), `Glow` (fake bloom), `LightCone`, `GradientPlane`, `Darkness` (everything dark except pools around lights), `CameraRig` (push-in / pan per frame).
- `src/kit/characters.tsx`: `Person` (everyone: moods neutral/happy/laugh/shock/sad/smirk/tired, arms L/R in degrees, standing legs, glasses/buns/cap/hood, arm cast, bounce), `Hero` (Mo = Person + hoodie), `CAST` presets (Theo, Lia, Dex, friends) and `Bleachers` (crowd with staggered amber eyes).
- `src/kit/scene.tsx`: `Scene` (one transparent three.js layer; waits for the font). Stack a `<Scene blur={16}>` background under a sharp foreground `<Scene>` for depth-of-field close-ups.
- `src/kit/canvas.tsx`: frame-driven canvas textures: `DRAGON` / `LIA_DRAWING` strokes that draw themselves (`drawStrokes` + `strokeTip` for the pencil position), the phone post screen with ticking likes, wood and paper.
- `src/kit/props.tsx`: `Phone`, `PhoneOnDesk`, `PovHands`, `WoodSurface`, `OpenSketchbook`, `DrawingHand`, `Fridge`, `Counter`, `LunchTable`, `Tray`, `TexturePlane`.
- `src/kit/sets.tsx`: `Room`, `Window`, `Desk`, `Sketchbook`, `DeskLamp`, `PendantLamp`, `Chalkboard`, `FloorShadow`.
- `src/kit/overlay.tsx`: `PostFX` (vignette, grain, amber anxiety grade), `Caption` (narrator / crowd / dialogue voices, Patrick Hand), `Hud` (LIKES / DRAWINGS).
- `src/shots/ShotNN.tsx`: one file per script shot (`../scripts/01-nobody-is-watching.md`), and `Root.tsx` sequences them with hard cuts.

## Layering (z) rules

| z | what |
|---|---|
| −100…−80 | wall, floor, window, chalkboard |
| −30…−20 | Bleachers bodies |
| 10–22 | characters, desk, lamp body |
| **40** | `Darkness` layer |
| 45–51 | light cones, glows, crowd eyes (they glow through the dark) |
| 60 | `Hero occlude` depth-only silhouette, so crowd eyes can't draw over Mo |

Everything is driven by `useCurrentFrame()` (no `useFrame`, no `Math.random`), so renders are deterministic.

## kit3d: the 3D "Ink & Ember" kit (v2 style)

Style spec: `../research/MERGED_STYLE.md`. Assets come from Blender build scripts (`../assets/README.md`).

| File | What |
|---|---|
| `src/kit3d/Stage.tsx` | `<Stage cam={{pos,target,fov,shake}} post={...} background fog>`: one perspective view for any aspect ratio; preloads every GLB before the first frame. Lights: `<Practical>` (warm point light plus shadow), `<Moonlight>` (crisp directional), `<Ambient>` (navy fill) |
| `src/kit3d/post.tsx` | Finishing stack: ink lines (depth+normal edges) → depth-of-field bokeh (`aperture`, `focus` / `focusAt`) → bloom → grade (tone curve, contrast pivot 0.3, navy/amber split-tone, saturation, unsharp mask, vignette, grain, `flash`, `fade`) |
| `src/kit3d/materials.ts` | `toon()` (cel ramp, baked AO, world-space strokes, rim), `glow()`, `outlineMat()` (inverted hull, constant pixel width, works with skinning) |
| `src/kit3d/assets.ts` | `useGLB`, `usePreload`, `instantiate()` (restyle by material name, outlines, bones, marks), `ALL_ASSETS` |
| `src/kit3d/Character.tsx` | `<Character id pose face position rotation>`; pose in degrees in character space; `POSES` presets; `blinkAt(frame)` |
| `src/kit3d/face.ts` | Drawn faces: 13 moods plus look, blink, talk, tears, sweat, blush |
| `src/kit3d/Set.tsx` | `useSet('bedroom')` → `{root, marks}`; `<SetView set hide={['ceiling']}>` |
| `src/kit3d/fx.tsx` | `<LightShaft>`, `<Dust>`, `<GlowCard>` |
| `src/kit3d/Captions.tsx` | Word-by-word captions (Baloo 2 ExtraBold, ink outline, amber `*key words*`); `timeLine(text, from, to)` |

Look-dev compositions: `CharTest`, `LookTest-9x16`, `LookTest-16x9`.

```bash
npx remotion still LookTest-9x16 out/look/a.png --frame=40
```

### kit3d additions (v2 shorts)

| File | What |
|---|---|
| `src/kit3d/envs.tsx` | Ready-lit environments: `<BedroomNight lamp moon shaft ghost>` (+ `BEDROOM` points, `deskCutaway` ghost list), `<StadiumNight spot floods>` (+ `STADIUM.seat(tier, angle)`), `<Island name="class|dinner|shower">` |
| `src/kit3d/Crowd.tsx` | `stadiumSeats(markData)` + `<CrowdInstances down wave look clear skip>`: hundreds of amber-eyed silhouettes in one draw call; `down` bows them over glowing phones (the reveal) |
| `src/kit3d/Props.tsx` | `<Phone3D screen={(ctx,w,h)=>...}>` (any 2D UI on a glowing screen), `<Sketchbook draw>`, `<Pencil>`, `<GlowText>`; screens `drawLikesBig`, `drawScreenTime`, `drawTheirPost` (and everything in `kit/canvas.tsx`) |
| `src/kit3d/Set.tsx` | `<SetView ghost={[...]}>`: cutaway walls that stay in the shadow map but vanish for the camera |

## Shorts

`src/shorts/<name>/`: `lines.json` (VO script) → `vo.json` (word timings) → `timing.ts` (`L`, `W`, `captionWords`) → `Shots.tsx` → `Short.tsx` (cut list anchored to words). Re-recording the VO re-times every cut and caption.

```bash
python3 audio/vo/make_vo.py src/shorts/checks96                 # scratch VO (local Apple speech) + word timings
.venv/bin/python audio/make_short_audio.py checks96             # score + SFX + duck + -14 LUFS -> public/audio/checks96/mix.wav
npx remotion render src/index.ts Checks96 out/checks96/the-96-checks.mp4 --codec=h264 --crf=16   # ~4 min
```

New short: copy `src/shorts/checks96/`, rewrite `lines.json`, run the two scripts, then rewrite `Shots.tsx` and the cut list (reuse the sets, envs and props; build a Blender set only for a new place). `Checks96Test` renders look-dev stills (`--frame=N`).

## v3 (2026-11-24): two formats

| | Long (16:9, ~3:20) | Short (9:16, 60–70 s) |
|---|---|---|
| Look | First film's flat kit, enhanced: `FilmHD` composition | 3D "Ink & Ember" kit (`kit3d/`) |
| Voice | Silent, captions | ElevenLabs narrator (`audio/vo/import_voice.py`) |
| Places | `kit/backdrops.tsx`: bedroom, kitchen, classroom, hallway, bathroom, gym, street (full rooms, mood-coloured) | Blender sets: bedroom (day/night), stadium, vignette rooms |
| Colour script | `kit/film.tsx`: `FILM_PLAN` shot -> [place, mood], moods blend across cuts | `kit3d/mood.tsx`: `<MoodScript>` keyframes on VO words; `Stage` grades every shot |

```bash
npx remotion render src/index.ts FilmHD out/nobody-is-watching-enhanced.mp4 --codec=h264 --crf=18   # ~4 min
```

- **Holding things (3D):** `<Character reach={{L, R}}>` = two-bone IK; `gripPoints(phoneAt, phoneRot)` for phones, `drawGrip(book, rot, uv)` + `<PencilBetween>` for drawing (the tip rides `strokeTip`, so the page shows exactly what the pencil drew). POV inserts: `<PovArm>` + `cam.near`.
- **Characters:** 2-tone cel (`CHAR_RAMP`), no self-shadow on the head, 0.58 m stick arms.
- **ElevenLabs budget (Creator, ~131k credits/month):** one eleven_v4 take of a 60–70 s short ≈ 2.8k credits; Scribe word timings are free. Generate ONE take, import with `import_voice.py <short> <mp3> <words.json> [tempo]` (tempo 1.05–1.08 to fit 60–70 s instead of paying for a re-take); line starts are snapped to real audio onsets.
