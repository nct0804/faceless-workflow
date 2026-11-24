// Shot 14 — 0:38, 1.5 s. WEEK 1: gym mirror selfie, flexing (no muscles).  LIKES 48
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {Hero} from '../kit/characters';
import {DumbbellRack, FloorShadow, MirrorFrame, Room} from '../kit/sets';
import {Flash, Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {push} from './util';

export const SHOT14_FRAMES = 45;

export const Shot14: React.FC = () => {
  const frame = useCurrentFrame();
  const flex = Math.sin(frame / 3) * 6;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT14_FRAMES, 1.1, 1.13)} camY={-60}>
        <Room wallTop="#1E2433" wallBottom="#141824" />
        <DumbbellRack x={-480} />
        <MirrorFrame x={380} y={FLOOR_Y + 300} w={420} h={580} />
        <group position={[380, 0, -66]} scale={[-1, 1, 1]}>
          <Hero x={0} y={FLOOR_Y + 10} scale={0.92} standing mood="smirk" lookX={0.4} armL={-140 + flex} armR={162} holdPhone="R" headTilt={4} color="#B9B2A4" shade="#A0998B" />
        </group>
        <FloorShadow x={-20} w={300} />
        <Hero x={-20} y={FLOOR_Y} standing mood="smirk" lookX={0.4} armL={-140 + flex} armR={162} holdPhone="R" headTilt={4} />
        <Darkness dark={0.82} lights={[{x: 0, y: -40, r: 700, strength: 1.2}, {x: 380, y: 60, r: 380, strength: 0.4}]} />
      </Scene>
      <PostFX vignette={0.85} />
      <Flash at={3} />
      <Hud likes={48} drawings={41} opacity={0.9} />
      <TimeLabel text="WEEK 1" />
    </AbsoluteFill>
  );
};
