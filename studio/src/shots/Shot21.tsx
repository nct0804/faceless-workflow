// Shot 21 — 0:55, 3.0 s. Close-up Lia, drawing lowered. Background (Mo on his phone) blurred. Hold.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {CAST, Hero, Person} from '../kit/characters';
import {PendantLamp} from '../kit/sets';
import {TexturePlane} from '../kit/props';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {Kitchen, useLiaDragon} from './Shot20';
import {push} from './util';

export const SHOT21_FRAMES = 90;

export const Shot21: React.FC = () => {
  const frame = useCurrentFrame();
  const drawing = useLiaDragon();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.4} camX={-220} camY={-20} blur={16}>
        <Kitchen />
        <Hero x={-330} y={FLOOR_Y} standing mood="neutral" lookX={0.4} lookY={-1} armR={28} holdPhone="R" />
        <PendantLamp x={-200} shadeY={440} on={1} coneBottomY={FLOOR_Y} />
        <Darkness dark={0.88} lights={[{x: -250, y: 0, r: 600, strength: 1.0}]} />
      </Scene>
      <Scene zoom={push(frame, SHOT21_FRAMES, 1.0, 1.01)}>
        <Person {...CAST.lia} x={140} y={-520} scale={2.2} mood="sad" lookX={-0.4} lookY={-0.6} headTilt={5} blinkOffset={70} />
        <TexturePlane tex={drawing} w={300} h={372} x={-230} y={-470} z={30} rotation={0.4} />
        <Darkness dark={0.66} lights={[{x: 60, y: 160, r: 860, strength: 1.1}]} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={1040} drawings={41} opacity={0.85} />
    </AbsoluteFill>
  );
};
