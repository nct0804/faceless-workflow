// Shot 47 — 2:25.5, 4.0 s. The full Bleachers flicker back on, all 6 rows, louder than ever.
// B: "only six." / "delete it." / "they saw it."   amber grade up to 40%
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Bleachers} from '../kit/characters';
import {Hud, PostFX, Whisper, Whispers} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {DeskScene} from './DeskScene';
import {flick} from './Shot37';
import {CLAMP, push} from './util';

export const SHOT47_FRAMES = 120;

const LINES: Whisper[] = [
  {text: 'only six.', x: 64, y: 20, size: 56, from: 18},
  {text: 'delete it.', x: 24, y: 30, size: 48, from: 38},
  {text: 'they saw it.', x: 76, y: 44, size: 48, from: 56},
  ...['delete it.', 'only six.', 'they saw it.', 'nobody cares.', 'delete it.', 'six.'].map((t, i) => ({
    text: t,
    x: 12 + ((i * 37) % 76),
    y: 14 + ((i * 23) % 50),
    size: 30 - i * 2,
    from: 74 + i * 6,
  })),
];

export const Shot47: React.FC = () => {
  const frame = useCurrentFrame();
  const base = interpolate(frame, [0, 26], [0.2, 1], CLAMP);
  const reveal = frame < 26 ? base * flick(frame, 3, 1, 0.45) : 1;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT47_FRAMES, 1.0, 1.04)} camX={-40} camY={30}>
        <DeskScene mood="sad" lookX={0.6} lookY={0.3} armR={150} holdPhone occlude extraLights={[{x: -110, y: 40, r: 300, strength: 0.6}]}>
          <Bleachers rows={6} perRow={13} reveal={reveal} eyesOn={reveal} excite={0.8} baseY={FLOOR_Y + 130} rowGap={128} width={2500} z={-30} seed={2} />
        </DeskScene>
      </Scene>
      <PostFX vignette={0.92} amber={interpolate(frame, [0, 60], [0.1, 0.4], CLAMP)} />
      <Whispers items={LINES} />
      <Hud likes={6} drawings={98} opacity={0.9} />
    </AbsoluteFill>
  );
};
