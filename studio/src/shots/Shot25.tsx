// Shot 25 — 1:08.5, 3.0 s. Theo at the lockers waves. Mo walks past, eyes on his phone.
// Theo's wave drops.  D (Theo): "...mo?"
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {CAST, Hero, Person} from '../kit/characters';
import {FloorShadow, Lockers, Room} from '../kit/sets';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {CLAMP, lerp, ramp} from './util';

export const SHOT25_FRAMES = 90;

export const Shot25: React.FC = () => {
  const frame = useCurrentFrame();
  const moX = interpolate(frame, [0, SHOT25_FRAMES], [-560, 520], CLAMP);
  const dropWave = ramp(frame, 48, 72);
  const wave = lerp(150 + Math.sin(frame / 3) * 18, 8, dropWave);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.04} camY={-40}>
        <Room />
        <Lockers x={0} count={22} />
        <FloorShadow x={180} w={200} />
        <Person {...CAST.theo} x={180} y={FLOOR_Y} standing z={9} mood={frame > 60 ? 'sad' : 'happy'} lookX={moX < 180 ? -1 : 1} armR={wave} />
        <FloorShadow x={moX} w={200} />
        <Hero x={moX} y={FLOOR_Y} z={12} standing walk={frame * 0.32} mood="neutral" lookX={0.3} lookY={-1} armR={28} holdPhone="R" />
        <Darkness dark={0.88} lights={[{x: 60, y: -60, r: 720, strength: 1.1}, {x: moX + 60, y: -100, r: 200, strength: 0.4}]} />
      </Scene>
      <PostFX vignette={0.88} />
      <Hud likes={1040} drawings={41} opacity={0.85} />
      <Caption text="...mo?" voice="dialogue" from={52} to={SHOT25_FRAMES} x="59%" y="34%" />
    </AbsoluteFill>
  );
};
