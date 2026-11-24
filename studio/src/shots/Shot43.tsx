// Shot 43 — 2:13, 2.0 s. Mo braces. Dex's Bleachers dim a little.
// D (Dex): "teach me the eyes."   Cam: push 2%
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Caption} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {MarginScene} from './Shot42';
import {CLAMP, push} from './util';

export const SHOT43_FRAMES = 60;

export const Shot43: React.FC = () => {
  const frame = useCurrentFrame();
  const eyes = interpolate(frame, [12, 50], [1, 0.3], CLAMP);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT43_FRAMES, 1.6, 1.63)} camX={30} camY={60}>
        <MarginScene lean={1} dexMood={frame > 10 ? 'happy' : 'smirk'} moMood={frame < 22 ? 'shock' : 'happy'} crowdEyes={eyes} drawing={false} />
      </Scene>
      <PostFX vignette={0.88} />
      <Hud likes={9} drawings={73} opacity={0.85} />
      <TimeLabel text="DAY 18" />
      <Caption text="teach me the eyes." voice="dialogue" from={12} to={SHOT43_FRAMES} x="60%" y="22%" />
    </AbsoluteFill>
  );
};
