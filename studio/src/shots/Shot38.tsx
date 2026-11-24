// Shot 38 — 1:59, 1.5 s. DAY 3: Mo keeps drawing. The Bleachers flicker but don't fully appear.
// DRAWINGS 44
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Bleachers} from '../kit/characters';
import {Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {DeskScene} from './DeskScene';
import {flick} from './Shot37';
import {push} from './util';

export const SHOT38_FRAMES = 45;

export const Shot38: React.FC = () => {
  const frame = useCurrentFrame();
  const r = flick(frame, 7, 0.22, 0);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT38_FRAMES, 1.35, 1.37)} camX={-120} camY={-20}>
        <DeskScene mood="happy" occlude>
          <Bleachers rows={1} perRow={8} reveal={r} eyesOn={r} baseY={FLOOR_Y + 300} width={1300} z={-40} seed={5} />
        </DeskScene>
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={9} drawings={44} opacity={0.85} />
      <TimeLabel text="DAY 3" />
    </AbsoluteFill>
  );
};
