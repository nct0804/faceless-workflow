// Shot 15 — 0:39.5, 1.5 s. WEEK 2: poses next to a car that isn't his.  LIKES 130
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow, LightCone, Rect} from '../kit/three';
import {Hero} from '../kit/characters';
import {Car, FloorShadow, Room} from '../kit/sets';
import {Flash, Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {push} from './util';

export const SHOT15_FRAMES = 45;

export const StreetLamp: React.FC<{x: number; on?: number}> = ({x, on = 1}) => {
  const top = FLOOR_Y + 620;
  return (
    <group>
      <Rect w={10} h={top - FLOOR_Y} x={x} y={(top + FLOOR_Y) / 2} z={-40} color="#232838" />
      <Rect w={90} h={10} x={x + 40} y={top} z={-40} color="#232838" />
      <Glow x={x + 80} y={top - 12} z={46} size={150} sy={0.5} color={C.lamp} intensity={on} />
      <LightCone x={x + 80} topY={top - 14} bottomY={FLOOR_Y} topW={60} bottomW={700} color={C.lamp} opacity={0.12 * on} z={45} />
    </group>
  );
};

export const Shot15: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT15_FRAMES, 1.05, 1.08)} camY={-60}>
        <Room wallTop="#121726" wallBottom="#0B0E16" />
        <StreetLamp x={-420} />
        <FloorShadow x={60} w={900} />
        <Hero x={-250} y={FLOOR_Y} standing mood="smirk" lookX={0.3} armR={68} armL={-12} extra={['shades']} />
        <Car x={140} />
        <Darkness dark={0.86} lights={[{x: -340, y: FLOOR_Y + 160, r: 620, strength: 1.2, squash: 1.1}, {x: 450, y: -244, r: 240, strength: 0.4}]} />
      </Scene>
      <PostFX vignette={0.85} />
      <Flash at={3} />
      <Hud likes={130} drawings={41} opacity={0.9} />
      <TimeLabel text="WEEK 2" />
    </AbsoluteFill>
  );
};
