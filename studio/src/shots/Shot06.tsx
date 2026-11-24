// Shot 6 — 0:13.5, 3.5 s. Lunch table, warm light. Mo doodles on Theo's arm cast,
// Theo and friends laugh WITH him.  D (Theo): "bro that's sick."  Cam: slow pan left
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {CAST, Hero, Person} from '../kit/characters';
import {FloorShadow, PendantLamp, Room, Window} from '../kit/sets';
import {LunchTable, Tray} from '../kit/props';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';

export const SHOT06_FRAMES = 105;

export const Shot06: React.FC = () => {
  const frame = useCurrentFrame();
  const camX = interpolate(frame, [0, SHOT06_FRAMES], [70, -50], {easing: Easing.inOut(Easing.quad)});
  const topY = FLOOR_Y + 150;
  const seatY = topY - 30;
  const laughing = frame > 36;
  const bounce = (k: number) => (laughing ? Math.abs(Math.sin((frame + k) / 4)) * 0.6 : 0);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.12} camX={camX} camY={-30}>
        <Room wallTop="#2A2420" wallBottom="#1A1614" />
        <Window x={-640} y={140} moon={false} />
        <Window x={640} y={140} moon={false} />
        <FloorShadow x={0} w={1300} />
        <Person {...CAST.friendB} x={-400} y={seatY} mood={laughing ? 'laugh' : 'happy'} lookX={1} lookY={-0.3} bounce={bounce(3)} blinkOffset={20} />
        <Hero x={-140} y={seatY} mood="happy" lookX={0.8} lookY={-0.8} armAngle={48 + Math.sin(frame / 2.5) * 4} bodyTilt={-4} />
        <Person
          {...CAST.theo}
          x={120}
          y={seatY}
          mood={laughing ? 'laugh' : 'happy'}
          lookX={-0.8}
          lookY={-0.6}
          armL={-50}
          castOn="L"
          bounce={bounce(0) * 0.6}
          blinkOffset={40}
        />
        <Person {...CAST.friendA} x={380} y={seatY} mood={laughing ? 'laugh' : 'smirk'} lookX={-1} lookY={-0.3} bounce={bounce(7)} blinkOffset={60} />
        <LunchTable x={0} w={1300} topY={topY} />
        <Tray x={-420} y={topY} />
        <Tray x={400} y={topY} />
        <PendantLamp x={-260} shadeY={420} on={1} coneBottomY={topY} />
        <PendantLamp x={260} shadeY={420} on={1} coneBottomY={topY} />
        <Darkness
          dark={0.78}
          tint="#0A0706"
          lights={[
            {x: -260, y: topY + 120, r: 520, strength: 1.2, squash: 1.1},
            {x: 260, y: topY + 120, r: 520, strength: 1.2, squash: 1.1},
          ]}
        />
      </Scene>
      <PostFX vignette={0.85} />
      <Hud likes={3} drawings={41} opacity={0.8} />
      <Caption text="bro that's sick." voice="dialogue" from={22} to={SHOT06_FRAMES} x="60%" y="30%" />
    </AbsoluteFill>
  );
};
