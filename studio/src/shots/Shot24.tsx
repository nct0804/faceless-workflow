// Shot 24 — 1:05, 3.5 s. School hallway. The Bleachers line both sides like a tunnel;
// Mo walks small through the middle.  B: "don't be weird."   Cam: slow pan right with the walk
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {Bleachers, Hero} from '../kit/characters';
import {FloorShadow, Lockers, Room} from '../kit/sets';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';

export const SHOT24_FRAMES = 105;

export const Shot24: React.FC = () => {
  const frame = useCurrentFrame();
  const moX = interpolate(frame, [0, SHOT24_FRAMES], [-420, 260]);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.05} camX={moX * 0.85} camY={-40}>
        <Room />
        <Lockers x={0} count={34} />
        {/* far side of the tunnel */}
        <Bleachers rows={3} perRow={16} reveal={1} eyesOn={1} excite={0.25} baseY={FLOOR_Y + 260} rowGap={140} width={3400} z={-40} seed={4} />
        <FloorShadow x={moX} w={200} />
        <Hero x={moX} y={FLOOR_Y} scale={0.8} standing walk={frame * 0.32} mood="tired" lookX={0.3} lookY={-0.7} occlude />
        {/* near side of the tunnel: big silhouettes cutting across the bottom of frame */}
        <group scale={[1.7, 1.7, 1]} position={[0, 0, 30]}>
          <Bleachers rows={1} perRow={12} reveal={1} eyesOn={1} excite={0.25} baseY={-330} width={2200} z={0} seed={9} />
        </group>
        <Darkness dark={0.9} lights={[{x: moX, y: -120, r: 440, strength: 1.0}]} />
      </Scene>
      <PostFX vignette={0.9} amber={0.1} />
      <Hud likes={1040} drawings={41} opacity={0.85} />
      <Caption text="don't be weird." voice="crowd" from={28} to={SHOT24_FRAMES} x="56%" y="20%" />
    </AbsoluteFill>
  );
};
