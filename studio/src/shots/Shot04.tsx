// Shot 4 — 0:07.5, 3.0 s. Match cut to shot 1: same desk, same lamp, Mo is now 16.
// Phone glowing beside the sketchbook.  N: "Then he posted one."  HUD fades in.  Cam: push 3%
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {Hero} from '../kit/characters';
import {Desk, DeskLamp, FloorShadow, Room, Sketchbook, Window} from '../kit/sets';
import {PhoneOnDesk} from '../kit/props';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';

export const SHOT04_FRAMES = 90;

export const Shot04: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const zoom = interpolate(frame, [0, SHOT04_FRAMES], [1.0, 1.03], {easing: Easing.inOut(Easing.quad)});
  const deskTop = FLOOR_Y + 170;
  const lampX = 110;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      {/* same framing as Shot01 so the cut reads as a match cut */}
      <Scene zoom={zoom} camX={-40} camY={-40}>
        <Room />
        <Window x={-520} y={120} />
        <FloorShadow x={-60} w={560} />
        <Hero x={-170} y={deskTop - 30} mood="neutral" lookX={0.8} lookY={-0.9} armAngle={58} headTilt={-3} />
        <Desk x={-60} topY={deskTop} />
        <Sketchbook x={60} y={deskTop + 13} />
        <PhoneOnDesk x={-60} y={deskTop + 12} on={1} />
        <DeskLamp x={lampX} baseY={deskTop + 8} on={1} coneBottomY={deskTop + 8} />
        <Darkness
          dark={0.94}
          lights={[
            {x: -50, y: deskTop + 100, r: 560, strength: 1.3, squash: 1.15},
            {x: lampX + 48, y: deskTop + 150, r: 260, strength: 0.6},
            {x: -60, y: deskTop + 60, r: 220, strength: 0.5},
            {x: -468, y: 182, r: 220, strength: 0.4},
          ]}
        />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={0} drawings={41} opacity={interpolate(frame, [8, 24], [0, 0.9], clamp)} />
      <Caption text="Then he posted one." from={10} to={SHOT04_FRAMES} />
    </AbsoluteFill>
  );
};
