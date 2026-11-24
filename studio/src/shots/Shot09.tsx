// Shot 9 — 0:24, 2.0 s. Close-up Mo, eyes widen. (Music thins.) Hard cut into shot 10.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {CAST, Hero, Person} from '../kit/characters';
import {Chalkboard, PendantLamp, Room} from '../kit/sets';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';

export const SHOT09_FRAMES = 60;

export const Shot09: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const zoom = interpolate(frame, [0, SHOT09_FRAMES], [1.0, 1.02], {easing: Easing.inOut(Easing.quad)});
  const widen = interpolate(frame, [16, 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.5} camX={200} camY={40} blur={16}>
        <Room />
        <Chalkboard x={460} y={150} />
        <Person {...CAST.dex} x={620} y={FLOOR_Y + 120} mood="laugh" lookX={-1} />
        <Person {...CAST.friendA} x={860} y={FLOOR_Y} standing mood="laugh" lookX={-1} />
        <PendantLamp x={200} shadeY={430} on={1} coneBottomY={FLOOR_Y} />
        <Darkness dark={0.88} lights={[{x: 200, y: 0, r: 700, strength: 1.1}, {x: 700, y: 0, r: 500, strength: 0.6}]} />
      </Scene>
      <Scene zoom={zoom}>
        <Hero
          x={-60}
          y={-500}
          scale={2.5}
          mood={widen > 0.5 ? 'shock' : 'neutral'}
          eyeScale={1 + widen * 0.4}
          browLift={widen * 12}
          lookX={0.5}
          lookY={0}
          breathe={false}
        />
        <Darkness dark={0.7} lights={[{x: -60, y: 200, r: 900, strength: 1.15}]} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={3} drawings={41} opacity={0.8} />
    </AbsoluteFill>
  );
};
