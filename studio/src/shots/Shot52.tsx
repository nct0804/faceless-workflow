// Shot 52 — 2:45, 5.0 s. Wide: the lamp is the only light. Very slow push. The music swells.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {DeskScene} from './DeskScene';
import {CLAMP, push} from './util';

export const SHOT52_FRAMES = 150;

export const Shot52: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT52_FRAMES, 0.86, 0.9)} camX={-50} camY={-20}>
        <DeskScene lia mood="happy" dark={0.965} />
      </Scene>
      <PostFX vignette={0.95} />
      <Hud drawings={100} opacity={interpolate(frame, [100, 140], [0.85, 0], CLAMP)} />
    </AbsoluteFill>
  );
};
