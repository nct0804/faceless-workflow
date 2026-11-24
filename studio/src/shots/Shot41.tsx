// Shot 41 — 2:06.5, 3.5 s. DAY 12: Saturday session. Warm room, four friends drawing around a
// table under a pendant lamp.  D (Theo): "he lives!"  DRAWINGS 60   Cam: slow pan, warm (no amber)
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow, Rect} from '../kit/three';
import {CAST, Hero, Person} from '../kit/characters';
import {FloorShadow, PendantLamp, Room, Window} from '../kit/sets';
import {LunchTable} from '../kit/props';
import {Caption, Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {CLAMP} from './util';

export const SHOT41_FRAMES = 105;

export const Shot41: React.FC = () => {
  const frame = useCurrentFrame();
  const camX = interpolate(frame, [0, SHOT41_FRAMES], [70, -50], CLAMP);
  const topY = FLOOR_Y + 150;
  const seat = topY - 30;
  const draw = (k: number) => 52 + Math.sin(frame / 2.7 + k) * 5;
  const laughing = frame > 8 && frame < 70;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.1} camX={camX} camY={-30}>
        <Room wallTop="#2E2620" wallBottom="#1C1714" />
        <Window x={-620} y={150} moon={false} />
        <FloorShadow x={0} w={1200} />
        <Person {...CAST.theo} x={-380} y={seat} mood={laughing ? 'laugh' : 'happy'} lookX={0.7} lookY={-0.2} armR={laughing ? 150 : draw(1)} bounce={laughing ? Math.abs(Math.sin(frame / 4)) * 0.5 : 0} />
        <Hero x={-130} y={seat} mood="happy" lookX={0.5} lookY={-0.9} armR={draw(0)} />
        <Person {...CAST.friendA} x={130} y={seat} mood="happy" lookX={0.4} lookY={-0.9} armR={draw(2)} blinkOffset={60} />
        <Person {...CAST.friendB} x={380} y={seat} mood="smirk" lookX={-0.4} lookY={-0.9} armL={-draw(3)} blinkOffset={80} />
        <LunchTable x={0} w={1150} topY={topY} />
        {[-300, -60, 190, 420].map((x, i) => (
          <Rect key={i} w={110} h={6} x={x} y={topY + 12} z={21} color={C.paper} />
        ))}
        <PendantLamp x={0} shadeY={420} on={1} coneBottomY={topY} />
        <Glow x={0} y={140} z={46} size={1800} sy={0.8} color={C.lamp} intensity={0.12} />
        <Darkness dark={0.72} tint="#0A0706" lights={[{x: 0, y: topY + 140, r: 760, strength: 1.25, squash: 1.1}]} />
      </Scene>
      <PostFX vignette={0.82} />
      <Hud likes={9} drawings={60} opacity={0.85} />
      <TimeLabel text="DAY 12" />
      <Caption text="he lives!" voice="dialogue" from={10} to={96} x="33%" y="30%" />
    </AbsoluteFill>
  );
};
