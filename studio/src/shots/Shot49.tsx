// Shot 49 — 2:32.5, 4.0 s. Wide: the Bleachers switch off row by row from the top down.
// The room is just a room. Mo picks up his pencil.  The LIKES row powers off; DRAWINGS 100.
// Cam: pull-out 3%
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Bleachers} from '../kit/characters';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {DeskScene} from './DeskScene';
import {flick} from './Shot37';
import {CLAMP, push} from './util';

export const SHOT49_FRAMES = 120;

export const Shot49: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [10, 80], [1, 0], CLAMP);
  const likes = frame < 20 ? 6 : frame < 46 ? (flick(frame, 5, 1, 0) ? 6 : null) : null;
  const pickUp = frame > 64;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT49_FRAMES, 1.06, 1.03)} camX={-40} camY={30}>
        <DeskScene mood={frame > 84 ? 'happy' : 'neutral'} lookX={0.8} lookY={-0.9} armR={pickUp ? undefined : 12} phoneOnDesk={0} occlude>
          {reveal > 0 && <Bleachers rows={6} perRow={13} reveal={reveal} eyesOn={reveal} baseY={FLOOR_Y + 130} rowGap={128} width={2500} z={-30} seed={2} />}
        </DeskScene>
      </Scene>
      <PostFX vignette={0.9} amber={interpolate(frame, [0, 60], [0.15, 0], CLAMP)} />
      <Hud likes={likes} drawings={frame < 80 ? 98 : frame < 95 ? 99 : 100} opacity={0.9} />
    </AbsoluteFill>
  );
};
