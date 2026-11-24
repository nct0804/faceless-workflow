// Shot 17 — 0:42.5, 1.5 s. WEEK 5: trend dance in his room. The Bleachers, now 4 rows,
// clap behind him.  B: "more."  LIKES 640
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {Bleachers, Hero} from '../kit/characters';
import {FloorShadow, RingLight, Room} from '../kit/sets';
import {Caption, Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {push} from './util';

export const SHOT17_FRAMES = 45;

export const Shot17: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = frame / 3;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT17_FRAMES, 1.0, 1.03)} camY={-10}>
        <Room />
        <Bleachers rows={4} perRow={11} reveal={1} eyesOn={1} excite={1} baseY={FLOOR_Y + 200} rowGap={135} width={2000} z={-30} />
        <FloorShadow x={-60} w={320} />
        <Hero
          x={-60}
          y={FLOOR_Y}
          standing
          occlude
          mood="fake"
          lookX={0.5}
          bodyTilt={Math.sin(beat) * 12}
          armR={140 + Math.sin(beat) * 35}
          armL={-140 + Math.sin(beat + 1.4) * 35}
          bounce={Math.abs(Math.sin(beat)) * 0.8}
        />
        <RingLight x={460} />
        <Darkness dark={0.88} lights={[{x: 80, y: -40, r: 620, strength: 1.15}]} />
      </Scene>
      <PostFX vignette={0.85} amber={0.1} />
      <Hud likes={640} drawings={41} opacity={0.9} />
      <TimeLabel text="WEEK 5" />
      <Caption text="more." voice="crowd" from={8} to={SHOT17_FRAMES} x="28%" y="24%" size={52} />
    </AbsoluteFill>
  );
};
