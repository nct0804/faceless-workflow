// Shot 45 — 2:18.5, 3.0 s. Close-up: Mo drawing, calm, lamp light on his face.
// N: "He just needed the page."   Cam: push 2%
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow} from '../kit/three';
import {Hero} from '../kit/characters';
import {DeskLamp, Room, Window} from '../kit/sets';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {push} from './util';

export const SHOT45_FRAMES = 90;

export const Shot45: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.6} camX={-80} camY={60} blur={16}>
        <Room />
        <Window x={-420} y={160} />
        <DeskLamp x={160} baseY={FLOOR_Y + 178} on={1} coneBottomY={FLOOR_Y + 178} />
        <Darkness dark={0.9} lights={[{x: 210, y: 0, r: 700, strength: 1.2}, {x: -368, y: 222, r: 220, strength: 0.4}]} />
      </Scene>
      <Scene zoom={push(frame, SHOT45_FRAMES, 1.0, 1.02)}>
        <Hero x={-80} y={-540} scale={2.5} mood="happy" lookX={0.6} lookY={-0.9} armAngle={22 + Math.sin(frame / 2.6) * 3} headTilt={-4} blinkOffset={30} />
        <Darkness dark={0.6} lights={[{x: 260, y: 120, r: 900, strength: 1.2, squash: 0.9}]} />
        <Glow x={620} y={300} z={46} size={900} color={C.lamp} intensity={0.22} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={9} drawings={97} opacity={0.85} />
      <Caption text="He just needed the page." from={8} to={SHOT45_FRAMES} />
    </AbsoluteFill>
  );
};
