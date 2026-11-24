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

- **Push-ins every shot:** `zoom` grows over the shot (for example 1.0 → 1.06). Use a pan for reveals.
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
