// Shot 35 — 1:50, 3.0 s. Close-up Dex: worried amber light on his face, refreshing.  Cam: push 2%
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Darkness, Glow} from '../kit/three';
import {CAST, Person} from '../kit/characters';
import {Chalkboard, Room} from '../kit/sets';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {MiniCrowd} from './Shot34';
import {push} from './util';

export const SHOT35_FRAMES = 90;

export const Shot35: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.28 + 0.1 * Math.abs(Math.sin(frame / 9));
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.7} camX={60} camY={140} blur={14}>
        <Room />
        <Chalkboard x={-300} y={260} />
        <MiniCrowd x={60} seed={14} size={0.46} rows={3} perRow={4} />
        <Darkness dark={0.9} lights={[{x: 60, y: 80, r: 500, strength: 0.6}]} />
      </Scene>
      <Scene zoom={push(frame, SHOT35_FRAMES, 1.0, 1.02)}>
        <Person {...CAST.dex} x={40} y={-520} scale={2.3} mood="sad" lookX={0.5} lookY={-0.6} armR={128} holdPhone="R" blinkOffset={50} />
        <Glow x={140} y={-20} z={46} size={850} color={C.amber} intensity={pulse} />
        <Darkness dark={0.74} lights={[{x: 120, y: -40, r: 760, strength: 1.1}]} />
      </Scene>
      <PostFX vignette={0.9} amber={0.1} />
      <Hud likes={9} drawings={41} opacity={0.8} />
    </AbsoluteFill>
  );
};
