// Shot 16 — 0:41, 1.5 s. WEEK 3: fake laugh in a group photo, eyes dead.  LIKES 212
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow} from '../kit/three';
import {CAST, Hero, Person} from '../kit/characters';
import {FloorShadow, Room} from '../kit/sets';
import {Flash, Hud, PostFX, TimeLabel, Viewfinder} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {push} from './util';

export const SHOT16_FRAMES = 45;

const PARTY = ['#3E7C7A', '#6F5B96', '#4E6A9A', '#3E7C7A', '#6F5B96', '#4E6A9A', '#3E7C7A', '#6F5B96', '#4E6A9A'];

export const Shot16: React.FC = () => {
  const frame = useCurrentFrame();
  const b = (k: number) => Math.abs(Math.sin((frame + k) / 4)) * 0.5;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT16_FRAMES, 1.12, 1.14)} camY={-50}>
        <Room wallTop="#1C1828" wallBottom="#120F1A" />
        {/* string lights */}
        {PARTY.map((c, i) => (
          <Glow key={i} x={-760 + i * 190} y={330 - Math.sin(i * 1.3) * 18} z={46} size={90} color={c} intensity={0.8} />
        ))}
        <FloorShadow x={0} w={1000} />
        <Person {...CAST.friendA} x={-360} y={FLOOR_Y} standing mood="laugh" lookX={0.2} armR={70} bounce={b(0)} />
        <Hero x={-120} y={FLOOR_Y} standing mood="fake" lookX={0} armR={20} armL={-60} />
        <Person {...CAST.friendB} x={120} y={FLOOR_Y} standing mood="laugh" lookX={-0.2} armL={-70} bounce={b(5)} />
        <Person {...CAST.dex} x={360} y={FLOOR_Y} standing mood="laugh" lookX={-0.3} armL={-150} bounce={b(9)} />
        <Darkness dark={0.8} tint="#07050C" lights={[{x: 0, y: -20, r: 760, strength: 1.2, squash: 1.2}]} />
      </Scene>
      <PostFX vignette={0.85} />
      <Viewfinder />
      <Flash at={3} />
      <Hud likes={212} drawings={41} opacity={0.9} />
      <TimeLabel text="WEEK 3" />
    </AbsoluteFill>
  );
};
