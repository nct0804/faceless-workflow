// Shot 10 — 0:26, 4.0 s. First appearance of the Bleachers in the classroom.
// B: "they saw it."   Cam: slow pull-out 3%, amber glow creeping in
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {C, FLOOR_Y} from '../theme';
import {CameraRig, Darkness} from '../kit/three';
import {Bleachers, Hero} from '../kit/characters';
import {Chalkboard, Desk, FloorShadow, PendantLamp, Room} from '../kit/sets';
import {Caption, Hud, PostFX} from '../kit/overlay';

export const SHOT10_FRAMES = 120;

export const Shot10: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const zoom = interpolate(frame, [0, SHOT10_FRAMES], [1.06, 1.03], {easing: Easing.inOut(Easing.quad)});
  const reveal = interpolate(frame, [6, 54], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const eyes = interpolate(frame, [26, 96], [0, 1], clamp);
  const amber = interpolate(frame, [30, 120], [0, 0.18], clamp);
  const deskTop = FLOOR_Y + 150;

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <ThreeCanvas width={width} height={height} orthographic flat linear={false} camera={{position: [0, 0, 1000], zoom: 1, near: 0.1, far: 5000}}>
        <CameraRig zoom={zoom} y={-20} />
        <Room />
        <Chalkboard x={420} y={140} />
        <Bleachers rows={2} perRow={9} reveal={reveal} eyesOn={eyes} baseY={FLOOR_Y + 210} rowGap={150} width={1700} z={-30} />
        <FloorShadow x={0} w={460} />
        <Hero x={-30} y={deskTop - 30} mood="shock" lookX={-0.3} lookY={-0.5} armAngle={20} breathe={false} occlude />
        <Desk x={0} w={420} topY={deskTop} />
        <PendantLamp x={-10} shadeY={430} on={1} coneBottomY={deskTop} />
        <Darkness
          dark={0.9}
          lights={[
            {x: -10, y: deskTop + 120, r: 470, strength: 1.1, squash: 1.1},
            {x: 420, y: 140, r: 380, strength: 0.25},
          ]}
        />
      </ThreeCanvas>
      <PostFX amber={amber} vignette={0.9} />
      <Hud likes={3} drawings={41} opacity={interpolate(frame, [0, 10], [0, 0.9], clamp)} />
      <Caption text="they saw it." voice="crowd" from={68} to={SHOT10_FRAMES} x="64%" y="34%" />
    </AbsoluteFill>
  );
};
