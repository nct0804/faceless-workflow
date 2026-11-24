# Tutorial: make a long video (16:9, enhanced "Nobody Is Watching" style)

Worked example: **"Nobody Is Watching."** (3:20, 57 shots, silent captions).

- Script: `scripts/Nobody-is-watching/01-nobody-is-watching.md`
- Plan: `studio/src/films/nobody-is-watching/plan.ts`
- Render: `FilmHD`

## 1. Write the script: `/write-video-script`

Say: *"I want to make a long video. Here's my script: …"* You'll be asked for the length (default 3:20). Claude turns the script into a **shot table**:

| # | s | place | mood | action | caption |
|---|---|---|---|---|---|
| 1 | 3.0 | bedroom | joy | Mo draws at his desk, lamp on, push-in | He used to draw for no one. |
| 27 | 4.0 | bedroom | bottom | Mo in bed, phone light only, hold | (none) |

**Moods make the colour script.** Plan an arc:

> warm and bright at the start → cooling as the problem grows → darkest at rock bottom → dawn → bright ending

| Mood | Feels like |
|---|---|
| joy, warm, bright | happy, cosy, sunny rooms |
| day | ordinary daylight (school) |
| cool | doubt creeping in |
| night | alone with the phone |
| grey | numb routine |
| anxious | the imagined crowd |
| bottom | rock bottom |
| dawn | the turn |

## 2. Plan assets: `/plan-video-assets`

- **Places available as full rooms:** bedroom, kitchen, classroom, hallway, bathroom, gym, street.
- **Characters:** Mo, Theo, Lia, Dex, the Bleachers crowd.
- **Props:** desk, lamp, bed, phone and POV hands, lockers, car, sketchbook, drawing hand, ...

Anything missing (say a **park**) is proposed as NEW and built as a reusable backdrop in `kit/backdrops.tsx` once you approve.

## 3. Voiceover: `/record-voiceover`

Long videos default to **no voiceover** (captions). You can still choose an Apple voice or record your own.

## 4. Build: `/build-long`

Each shot is a small file. The room, window light and grade come from the plan, so the shot only places the story:

```tsx
<Scene zoom={interpolate(f, [0, FRAMES], [1, 1.06])}>
  <Room />  <Window x={-520} y={120} />
  <Desk x={0} />  <DeskLamp x={160} baseY={...} on={1} coneBottomY={...} />
  <Hero x={-40} mood="happy" />
  <Darkness dark={0.9} lights={[{x: 210, y: -40, r: 520, strength: 1}]} />
</Scene>
<Caption text="He used to draw for no one." from={14} to={FRAMES} />
<PostFX />
```

## 5. Review and render: `/review-and-render`

- Draft at half resolution.
- Mosaic at 1 frame every 3 s; check rooms, light, captions and the colour arc.
- Fix, then render the final:

```bash
npx remotion render src/index.ts <FilmComp> out/<slug>.mp4 --codec=h264 --crf=18
```

## 6. Package: `/package-youtube`
