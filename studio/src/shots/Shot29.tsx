// Shot 29 — 1:22, 4.5 s. The walls are gone: the Bleachers fill the frame, 6 rows, all eyes on him.
// Whispers pile up.  B: "nobody likes the real you." / "delete it." / "they're laughing." / "be someone else."
// Cam: slow push 5%, amber grade up to 60%; music drops to a single drone
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Rect} from '../kit/three';
import {Bleachers, Hero} from '../kit/characters';
import {Bed} from '../kit/sets';
import {Hud, PostFX, Whisper, Whispers} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {CLAMP, push} from './util';

export const SHOT29_FRAMES = 135;

const MAIN: Whisper[] = [
  {text: 'nobody likes the real you.', x: 50, y: 16, size: 56, from: 8},
  {text: 'delete it.', x: 20, y: 32, size: 46, from: 24},
  {text: "they're laughing.", x: 79, y: 34, size: 46, from: 36},
  {text: 'be someone else.', x: 27, y: 60, size: 44, from: 48},
];
const ECHO = ['delete it.', 'only nine.', 'be someone else.', "they're laughing.", 'nobody likes the real you.', 'weird.', 'delete it.'];
const rnd = (i: number) => {
  const s = Math.sin(i * 45.164) * 43758.5453;
  return s - Math.floor(s);
};
const ECHOES: Whisper[] = Array.from({length: 26}, (_, i) => ({
  text: ECHO[i % ECHO.length],
  x: 8 + rnd(i) * 84,
  y: 10 + rnd(i + 50) * 62,
  size: Math.max(16, 36 - i * 0.8),
  from: 58 + i * 2,
  rot: (rnd(i + 99) - 0.5) * 10,
}));

export const Shot29: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 26], [0.34, 1], CLAMP);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT29_FRAMES, 1.0, 1.05)} camY={60}>
        <Rect w={4000} h={900} y={FLOOR_Y - 450} z={-99} color={C.floor} />
        <Bleachers
          rows={6}
          perRow={13}
          reveal={reveal}
          eyesOn={1}
          excite={interpolate(frame, [0, SHOT29_FRAMES], [0.3, 1], CLAMP)}
          baseY={FLOOR_Y + 130}
          rowGap={128}
          width={2500}
          z={-30}
          seed={2}
        />
        <Hero x={-70} y={FLOOR_Y + 130} mood="sad" lookX={0.5} lookY={0.3} armR={150} holdPhone="R" occlude />
        <Bed x={90} w={600} blanketFrom={0.1} />
        <Darkness dark={0.9} lights={[{x: -40, y: 40, r: 380, strength: 1.0}]} />
      </Scene>
      <PostFX vignette={0.92} amber={interpolate(frame, [0, SHOT29_FRAMES], [0.2, 0.6], CLAMP)} />
      <Whispers items={[...MAIN, ...ECHOES]} />
      <Hud likes={9} drawings={41} opacity={0.85} />
    </AbsoluteFill>
  );
};
