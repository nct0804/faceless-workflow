// Shot 1 — 0:00, 3.0 s. Black. Desk lamp clicks on. Young Mo (age 10) drawing.
// N: "He used to draw for no one."   Cam: push 3%
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {C, FLOOR_Y} from '../theme';
import {CameraRig, Darkness} from '../kit/three';
import {Hero} from '../kit/characters';
import {Desk, DeskLamp, FloorShadow, Room, Sketchbook, Window} from '../kit/sets';
import {Caption, PostFX} from '../kit/overlay';

export const SHOT01_FRAMES = 90;

export const Shot01: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const on = interpolate(frame, [8, 10, 20], [0, 0.85, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoom = interpolate(frame, [0, SHOT01_FRAMES], [1.0, 1.03], {easing: Easing.inOut(Easing.quad)});
  const deskTop = FLOOR_Y + 170;
  const lampX = 110;
  const draw = 52 + Math.sin(frame / 2.6) * 5 + Math.sin(frame / 7) * 3;

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <ThreeCanvas width={width} height={height} orthographic flat linear={false} camera={{position: [0, 0, 1000], zoom: 1, near: 0.1, far: 5000}}>
        <CameraRig zoom={zoom} x={-40} y={-40} />
        <Room />
        <Window x={-520} y={120} />
        <FloorShadow x={-60} w={560} />
        <Hero x={-150} y={deskTop - 30} scale={0.78} mood="happy" lookX={0.7} lookY={-0.8} armAngle={draw} headTilt={-6} />
        <Desk x={-60} topY={deskTop} />
        <Sketchbook x={-20} y={deskTop + 13} />
        <DeskLamp x={lampX} baseY={deskTop + 8} on={on} coneBottomY={deskTop + 8} />
        <Darkness
          dark={0.94}
          lights={[
            {x: -40, y: deskTop + 90, r: 560, strength: 1.35 * on, squash: 1.15},
            {x: lampX + 48, y: deskTop + 150, r: 260, strength: 0.6 * on},
            {x: -468, y: 182, r: 220, strength: 0.4},
          ]}
        />
      </ThreeCanvas>
      <PostFX vignette={0.9} />
      <Caption text="He used to draw for no one." from={14} to={SHOT01_FRAMES} />
    </AbsoluteFill>
  );
};
