// Shot 13 — 0:34.5, 3.5 s. Bedroom, night. Mo shoves the sketchbook under the bed.
// N: "So he gave them something else."   Cam: push 3%
import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Rect} from '../kit/three';
import {Hero} from '../kit/characters';
import {Bed, FloorShadow, Room, Window} from '../kit/sets';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {lerp, push, ramp} from './util';

export const SHOT13_FRAMES = 105;

export const Shot13: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = ramp(frame, 22, 30, Easing.in(Easing.quad));
  const slide = ramp(frame, 30, 58, Easing.out(Easing.cubic));
  // held at the arm tip -> dropped to the floor -> slid under the bed
  const held = {x: -73, y: -227};
  const floor = {x: -40, y: FLOOR_Y + 8};
  const under = {x: 190, y: FLOOR_Y + 8};
  const bx = slide > 0 ? lerp(floor.x, under.x, slide) : lerp(held.x, floor.x, drop);
  const by = slide > 0 ? floor.y : lerp(held.y, floor.y, drop);
  const rot = slide > 0 ? 0 : lerp(-0.4, 0, drop);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT13_FRAMES, 1.06, 1.09)} camX={-20} camY={-80}>
        <Room />
        <Window x={-560} y={140} />
        <FloorShadow x={0} w={900} />
        <Hero x={-180} y={FLOOR_Y} standing mood="tired" lookX={0.6} lookY={-1} bodyTilt={-18} armR={lerp(30, 48, slide)} armL={-6} />
        <group position={[bx, by, 7.5]} rotation={[0, 0, rot]}>
          <Rect w={150} h={14} color="#6B4F3A" />
          <Rect w={140} h={5} y={4} z={0.1} color={C.paper} />
        </group>
        <Bed x={200} w={600} />
        <Darkness
          dark={0.93}
          lights={[
            {x: -500, y: 160, r: 320, strength: 0.45},
            {x: -120, y: -140, r: 460, strength: 0.75},
          ]}
        />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={0} drawings={41} opacity={0.85} />
      <Caption text="So he gave them something else." from={40} to={SHOT13_FRAMES} />
    </AbsoluteFill>
  );
};
