// Shot 33 — 1:41.5, 3.5 s. Same wide. The last amber screen goes dark.
// N: "The seats were empty."   Hold, amber grade back to 0
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {EmptyStands} from './Shot32';
import {CLAMP} from './util';

export const SHOT33_FRAMES = 105;

export const Shot33: React.FC = () => {
  const frame = useCurrentFrame();
  const phonesOn = interpolate(frame, [20, 54], [0.08, 0], CLAMP);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.04} camY={60}>
        <EmptyStands on={1} phonesOn={phonesOn} />
      </Scene>
      <PostFX vignette={0.8} amber={interpolate(frame, [0, 54], [0.05, 0], CLAMP)} />
      <Hud likes={9} drawings={41} opacity={0.7} />
      <Caption text="The seats were empty." from={8} to={SHOT33_FRAMES} />
    </AbsoluteFill>
  );
};
