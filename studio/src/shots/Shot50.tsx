// Shot 50 — 2:36.5, 4.5 s. Callback to shot 1: Lia sits next to him with her crayons.
// Both drawing under one lamp, same composition as the opening.   Cam: push 3%, warm
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {DeskScene} from './DeskScene';
import {push} from './util';

export const SHOT50_FRAMES = 135;

export const Shot50: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT50_FRAMES, 1.0, 1.03)} camX={-40} camY={-40}>
        <DeskScene lia mood="happy" />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud drawings={100} opacity={0.85} />
    </AbsoluteFill>
  );
};
