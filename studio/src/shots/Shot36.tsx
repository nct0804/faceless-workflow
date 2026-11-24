// Shot 36 — 1:53, 4.0 s. Bedroom, night. Mo pulls the sketchbook out from under the bed and
// blows the dust off (particle burst in the lamp light).   Cam: push 3%
import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow, Rect} from '../kit/three';
import {Hero} from '../kit/characters';
import {Bed, Desk, DeskLamp, FloorShadow, Room, Window} from '../kit/sets';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {lerp, push, ramp} from './util';

export const SHOT36_FRAMES = 120;
const BLOW = 74;

const rnd = (i: number) => {
  const s = Math.sin(i * 12.345) * 43758.5453;
  return s - Math.floor(s);
};

export const Shot36: React.FC = () => {
  const frame = useCurrentFrame();
  const slide = ramp(frame, 8, 40, Easing.out(Easing.cubic));
  const lift = ramp(frame, 44, 62);
  const bx = lift > 0 ? lerp(110, 70, lift) : lerp(330, 110, slide);
  const by = lift > 0 ? lerp(FLOOR_Y + 8, -150, lift) : FLOOR_Y + 8;
  const standUp = ramp(frame, 40, 60);
  const t = frame - BLOW;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT36_FRAMES, 1.06, 1.09)} camX={-60} camY={-80}>
        <Room />
        <Window x={-200} y={160} />
        <Desk x={-600} w={360} />
        <DeskLamp x={-560} baseY={FLOOR_Y + 178} on={1} coneBottomY={FLOOR_Y + 178} />
        <FloorShadow x={60} w={900} />
        <Hero
          x={-20}
          y={FLOOR_Y}
          standing
          mood={t >= 0 && t < 12 ? 'shock' : frame > BLOW + 14 ? 'happy' : 'neutral'}
          lookX={lerp(0.6, 0.5, standUp)}
          lookY={lerp(-1, -0.4, standUp)}
          bodyTilt={lerp(-22, 0, standUp)}
          armR={lerp(26, 70, standUp)}
          armL={lerp(-6, -40, standUp)}
        />
        <group position={[bx, by, 14]} rotation={[0, 0, lift * 0.1]}>
          <Rect w={150} h={14} color="#6B4F3A" />
          <Rect w={140} h={5} y={4} z={0.1} color={C.paper} />
        </group>
        {/* dust burst */}
        {t >= 0 &&
          t < 40 &&
          Array.from({length: 26}, (_, i) => {
            const a = -0.3 + rnd(i) * Math.PI * 1.2;
            const v = 3 + rnd(i + 7) * 5;
            const x = 70 + Math.cos(a) * v * t * 1.5;
            const y = -140 + Math.sin(a) * v * t * 0.9 + t * t * 0.03;
            return <Glow key={i} x={x} y={y} z={47} size={10 + rnd(i + 3) * 14} color="#FFE8C4" intensity={0.8 * (1 - t / 40)} />;
          })}
        <Bed x={300} w={560} />
        <Darkness
          dark={0.9}
          lights={[
            {x: -510, y: FLOOR_Y + 260, r: 420, strength: 1.1},
            {x: 0, y: -160, r: 440, strength: 0.75},
          ]}
        />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={9} drawings={41} opacity={0.85} />
    </AbsoluteFill>
  );
};
