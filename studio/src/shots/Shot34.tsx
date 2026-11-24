// Shot 34 — 1:45, 5.0 s. Next day, classroom wide. Behind every classmate floats their own little
// Bleachers. Dex has the biggest, nervously checking his phone.  Mo has none.
// N: "Everyone else was busy performing for theirs."   Cam: slow pan across the row
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {Bleachers, CAST, Hero, Person} from '../kit/characters';
import {Chalkboard, Desk, Room} from '../kit/sets';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {CLAMP} from './util';

export const SHOT34_FRAMES = 150;
export const DESK_Y = FLOOR_Y + 150;

/** a classmate's personal audience, floating above their head */
export const MiniCrowd: React.FC<{x: number; size?: number; rows?: number; perRow?: number; eyes?: number; seed: number}> = ({
  x,
  size = 0.36,
  rows = 2,
  perRow = 3,
  eyes = 1,
  seed,
}) => (
  <group position={[x, DESK_Y + 290, -20]} scale={[size, size, 1]}>
    <Bleachers rows={rows} perRow={perRow} reveal={1} eyesOn={eyes} excite={0.6} baseY={0} rowGap={130} width={perRow * 150} z={0} seed={seed} />
  </group>
);

const STUDENTS = [
  {x: -720, who: CAST.theo, seed: 11},
  {x: -360, who: CAST.friendA, seed: 12},
  {x: 360, who: CAST.friendB, seed: 13},
];

export const Shot34: React.FC = () => {
  const frame = useCurrentFrame();
  const camX = interpolate(frame, [0, SHOT34_FRAMES], [-230, 230], CLAMP);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.0} camX={camX} camY={-10}>
        <Room />
        <Chalkboard x={0} y={260} />
        {STUDENTS.map((s, i) => (
          <React.Fragment key={i}>
            <MiniCrowd x={s.x} seed={s.seed} />
            <Person {...s.who} x={s.x} y={DESK_Y - 30} mood="tired" lookX={0.4} lookY={-1} armR={30} holdPhone="R" blinkOffset={i * 17} />
            <Desk x={s.x} w={260} topY={DESK_Y} />
          </React.Fragment>
        ))}
        {/* Dex: the biggest crowd */}
        <MiniCrowd x={720} seed={14} size={0.46} rows={3} perRow={4} />
        <Person {...CAST.dex} x={720} y={DESK_Y - 30} mood="sad" lookX={0.4} lookY={-1} armR={34 + Math.sin(frame / 4) * 3} holdPhone="R" blinkOffset={5} />
        <Desk x={720} w={260} topY={DESK_Y} />
        {/* Mo: no crowd, looking around */}
        <Hero x={0} y={DESK_Y - 30} mood="neutral" lookX={interpolate(frame, [0, 60, 110, 150], [-0.8, -0.8, 0.9, 0.9], CLAMP)} lookY={0.1} />
        <Desk x={0} w={260} topY={DESK_Y} />
        <Darkness
          dark={0.86}
          lights={[-720, -360, 0, 360, 720].map((x) => ({x, y: DESK_Y + 120, r: 300, strength: 0.95}))}
        />
      </Scene>
      <PostFX vignette={0.85} />
      <Hud likes={9} drawings={41} opacity={0.8} />
      <Caption text="Everyone else was busy performing for theirs." from={20} to={SHOT34_FRAMES} />
    </AbsoluteFill>
  );
};
