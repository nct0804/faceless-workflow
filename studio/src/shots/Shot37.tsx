// Shot 37 — 1:57, 2.0 s. DAY 1: bad first lines. A small single row of Bleachers flickers behind.
// B (small): "nobody will like this."  DRAWINGS 42
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Bleachers} from '../kit/characters';
import {Caption, Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {DeskScene} from './DeskScene';
import {push} from './util';

export const SHOT37_FRAMES = 60;

export const flick = (frame: number, seed: number, hi: number, lo: number) => {
  const s = Math.sin(Math.floor(frame / 3) * 91.3 + seed) * 43758.5453;
  return s - Math.floor(s) > 0.5 ? hi : lo;
};

export const Shot37: React.FC = () => {
  const frame = useCurrentFrame();
  const r = flick(frame, 1, 0.55, 0.15);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT37_FRAMES, 1.1, 1.12)} camX={-40} camY={-30}>
        <DeskScene mood="neutral" occlude>
          <Bleachers rows={1} perRow={8} reveal={r} eyesOn={r} baseY={FLOOR_Y + 300} width={1300} z={-40} seed={5} />
        </DeskScene>
      </Scene>
      <PostFX vignette={0.9} amber={0.05} />
      <Hud likes={9} drawings={42} opacity={0.85} />
      <TimeLabel text="DAY 1" />
      <Caption text="nobody will like this." voice="crowd" from={6} to={SHOT37_FRAMES} x="66%" y="28%" size={30} />
    </AbsoluteFill>
  );
};
