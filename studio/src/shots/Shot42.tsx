// Shot 42 — 2:10, 3.0 s. DAY 18: Mo drawing in the class margin. Dex leans over.
// D (Dex): "...wait. you drew that?"  DRAWINGS 73
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Darkness} from '../kit/three';
import {CAST, Hero, Person} from '../kit/characters';
import {Chalkboard, Desk, Room} from '../kit/sets';
import {Caption, Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {DESK_Y, MiniCrowd} from './Shot34';
import {lerp, push, ramp} from './util';

export const SHOT42_FRAMES = 90;

/** Mo + Dex at neighbouring desks; reused by shot 43 */
export const MarginScene: React.FC<{lean: number; dexMood: 'neutral' | 'shock' | 'happy' | 'smirk'; moMood: 'neutral' | 'shock' | 'happy'; crowdEyes: number; drawing: boolean}> = ({
  lean,
  dexMood,
  moMood,
  crowdEyes,
  drawing,
}) => {
  const frame = useCurrentFrame();
  const draw = 52 + Math.sin(frame / 2.6) * 5 + Math.sin(frame / 7) * 3;
  return (
    <>
      <Room />
      <Chalkboard x={-520} y={260} />
      <MiniCrowd x={200} seed={14} size={0.46} rows={3} perRow={4} eyes={crowdEyes} />
      <Hero x={-160} y={DESK_Y - 30} mood={moMood} lookX={drawing ? 0.6 : 0.9} lookY={drawing ? -0.9 : 0} armR={drawing ? draw : 30} />
      <Desk x={-160} w={300} topY={DESK_Y} />
      <Person {...CAST.dex} x={lerp(220, 190, lean)} y={DESK_Y - 30} mood={dexMood} lookX={-1} lookY={lerp(-0.2, -0.7, lean)} bodyTilt={lean * 14} blinkOffset={9} />
      <Desk x={220} w={300} topY={DESK_Y} />
      <Darkness dark={0.88} lights={[{x: 20, y: DESK_Y + 140, r: 560, strength: 1.15}]} />
    </>
  );
};

export const Shot42: React.FC = () => {
  const frame = useCurrentFrame();
  const lean = ramp(frame, 14, 34);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT42_FRAMES, 1.25, 1.27)} camX={20} camY={-10}>
        <MarginScene lean={lean} dexMood={frame > 28 ? 'shock' : 'neutral'} moMood="neutral" crowdEyes={1} drawing />
      </Scene>
      <PostFX vignette={0.88} />
      <Hud likes={9} drawings={73} opacity={0.85} />
      <TimeLabel text="DAY 18" />
      <Caption text="...wait. you drew that?" voice="dialogue" from={26} to={SHOT42_FRAMES} x="60%" y="24%" />
    </AbsoluteFill>
  );
};
