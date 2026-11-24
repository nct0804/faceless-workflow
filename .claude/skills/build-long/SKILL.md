---
name: build-long
description: Step 4 (long format) of the Faceless Studio pipeline. Build a 16:9 long video (default 3:20) in the enhanced "Nobody Is Watching" flat style - soft flat characters, silent captions, fully built mood-coloured backdrops, and a colour script that follows the story. Use after the voiceover step for long videos.
---

# /build-long: shots and edit (step 4, long)

**Reference film:** "Nobody Is Watching" (57 shots, `studio/src/shots/Shot01..57.tsx`), its plan `studio/src/films/nobody-is-watching/plan.ts`, and the `FilmHD` composition in `Root.tsx`.

## Set up a new film

1. Create `studio/src/films/<slug>/`:
   - `shots/ShotNN.tsx`: one file per row of the shot table. Each exports `ShotNN` and `SHOTNN_FRAMES`.
   - `plan.ts`: `export const PLAN: FilmPlan = { 1: ['bedroom', 'joy'], ... }`, the **place** and **mood** of every shot.
   - `index.ts`: the shot list `[{id: 'Shot01', C: Shot01, frames: SHOT01_FRAMES}, ...]`.
2. In `Root.tsx`, build a reel exactly like `FilmHD`. Each shot is wrapped in `<FilmShot shot start plan script>`, and `script = filmScript(list, PLAN)`. Register it at 1920×1080, 30 fps.

## How a shot is written (copy the patterns from the reference shots)

```tsx
<AbsoluteFill>
  <Scene zoom={z}>
    <Room />                      {/* the full backdrop for this shot's place, mood-coloured automatically */}
    <Window x={-520} y={120} />   {/* the sky follows the mood */}
    <Desk x={0} /> <DeskLamp ... on={1} />
    <Hero x={..} mood=".." arms={..} />
    <Darkness dark={0.9} lights={[...]} />   {/* scaled by the mood: bright moods = lit rooms */}
  </Scene>
  <Caption text="He used to draw for no one." from={14} to={FRAMES} />
  <PostFX />                      {/* vignette + grain + the mood grade */}
</AbsoluteFill>
```

- **Camera (from the second long film on): use the camera kit, `kit/camera.ts`.** "Nobody Is Watching" keeps its original push-ins and is not retrofitted.
  ```tsx
  const cam = camMove(frame, FRAMES, 'pan-right', {from: {x: -300}, to: {x: 200, zoom: 1.06}});
  <Scene cam={withWhip(cam, frame, FRAMES, {out: 'right'})}>   {/* whip only in montages */}
  ```
  - Moves: `push`, `pull`, `pan-left/right`, `tilt-up/down`, `reveal` (tight → wide), `settle` (lands with a tiny overshoot), `drift` (hand-held only), `hold` (locked, for rock bottom).
  - Every move starts already in motion and has a light hand-held drift on top (`handheld`, default 0.35). The amount per video type is in `docs/VIDEO_TYPES.md`.
  - Chain moves inside one shot with `camPath(frame, [{at: 0, x: -200}, {at: 60, zoom: 1.1}, ...])`.
  - Whip pans: `out: 'right'` on the last frames of shot A and `in: 'right'` on shot B. 6 frames each side, with a cheap directional blur.
  - Parallax: wrap far or near layers in `<Depth k={...}>` (sky 0.3, foreground plant 1.4–1.6). Keep the room, the floor and the characters at 1, or feet slide.
  - Focus pulls: `rackFocus` gives the blur for two stacked `<Scene>` layers.
  - Keep it calm: long videos move slowly and the camera reacts to the story, for example a slow push on Mo's face at the low point or a `reveal` of the crowd. Fast cameras belong to the shorts.
  - Preview every move: `bin/render.sh CamTest _lookdev draft`.
- **The set is alive:** every backdrop object already has its ambient motion (`kit/life.tsx`). New props you add to a shot should get one too: wrap hanging things in `<Sway x y amp>` (pivot at the pin), use `flicker()` for lights, and `<Motes>` for dust. Use `<Scene life={0.3}>` on the rock-bottom hold. Preview with `bin/render.sh LifeTest _lookdev draft`.
- **Faces carry the emotion:** `<Hero mood=...>` / `<Person mood=...>` accept all 34 presets of the shared face system (`kit3d/face.ts`). Change them on the beats.
- **Captions:** Patrick Hand. Narrator lines are white, the crowd is amber lowercase, dialogue goes in pills. Each caption is held long enough to read (at least 1 s per 4 words).
- **The meter:** `<Hud likes drawings>` tells the story in numbers.
- **Rock bottom:** one held, silent shot (no camera move, no music).
- **Hands:** when Mo holds the phone, use `PovHands` or `Phone` placed in his hands. Never float a prop.
- **Drawings:** `OpenSketchbook` plus `DrawingHand` with stroke progress, shown full at least once.

## Places and moods

- Places: `bedroom`, `kitchen`, `classroom`, `hallway`, `bathroom`, `gym`, `street`, or `none` (POV, text cards). A new place goes in `kit/backdrops.tsx` (see `/plan-video-assets`).
- Moods: joy, warm, day, cool, night, grey, anxious, bottom, dawn, bright. Moods blend across cuts (about 1 s).
- Plan the colour script as an arc:

  > warm / bright → cooling as the problem grows → darkest at rock bottom → dawn → bright ending

## Music

Copy `studio/audio/make_audio.py`. It reads the `SHOTxx_FRAMES` of the film's shots, so every cut gets a piano note, and it builds the sections from the script's cue sheet. Output: `public/audio/<slug>/mix.wav` at −14 LUFS.

## Then

Run `npx tsc --noEmit`, tick step 4 in the brief, and move on to `/review-and-render`.
