// Shot 3 — 0:05.5, 2.0 s. Close-up: Mo (age 10) smiling at the page. Background blurred.
// Cam: push 2%
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow} from '../kit/three';
import {Hero} from '../kit/characters';
import {DeskLamp, Room, Window} from '../kit/sets';
import {PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';

export const SHOT03_FRAMES = 60;

export const Shot03: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, SHOT03_FRAMES], [1.0, 1.02], {easing: Easing.inOut(Easing.quad)});
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      {/* background plate, out of focus */}
      <Scene zoom={zoom * 1.6} camX={-80} camY={60} blur={16}>
        <Room />
        <Window x={-420} y={160} />
        <DeskLamp x={160} baseY={FLOOR_Y + 178} on={1} coneBottomY={FLOOR_Y + 178} />
        <Darkness dark={0.9} lights={[{x: 210, y: 0, r: 700, strength: 1.2}, {x: -368, y: 222, r: 220, strength: 0.4}]} />
      </Scene>
      {/* foreground character */}
      <Scene zoom={zoom}>
        <Hero x={-80} y={-540} scale={2.5} mood="happy" lookX={0.6} lookY={-0.9} armAngle={22 + Math.sin(frame / 2.6) * 3} headTilt={-4} />
        <Darkness dark={0.6} lights={[{x: 260, y: 120, r: 900, strength: 1.2, squash: 0.9}]} />
        <Glow x={620} y={300} z={46} size={900} color={C.lamp} intensity={0.2} />
      </Scene>
      <PostFX vignette={0.9} />
    </AbsoluteFill>
  );
};
