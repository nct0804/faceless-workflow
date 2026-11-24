// Shot 31 — 1:32.5, 4.0 s. Close-up: Mo slowly lifts his head. For the first time,
// he turns toward the crowd.   Cam: push 3% (a single piano note returns)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow} from '../kit/three';
import {Bleachers, Hero} from '../kit/characters';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {lerp, push, ramp} from './util';

export const SHOT31_FRAMES = 120;

export const Shot31: React.FC = () => {
  const frame = useCurrentFrame();
  const lift = ramp(frame, 10, 70);
  const turn = ramp(frame, 72, 112);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.4} camY={120} blur={16}>
        <Bleachers rows={4} perRow={10} reveal={1} eyesOn={1} baseY={FLOOR_Y + 160} rowGap={130} width={2200} z={-30} seed={2} />
        <Darkness dark={0.94} lights={[]} />
      </Scene>
      <Scene zoom={push(frame, SHOT31_FRAMES, 1.0, 1.03)}>
        <Hero
          x={-40}
          y={-520}
          scale={2.4}
          mood={lift < 0.6 ? 'sad' : 'neutral'}
          lookY={lerp(-0.9, 0.3, lift)}
          lookX={lerp(0, 1, turn)}
          headTilt={lerp(-6, 0, lift) + turn * 7}
          breathe={false}
          blinkOffset={20}
        />
        <Glow x={60} y={-560} z={46} size={900} color="#BFD2FF" intensity={0.22} />
        <Darkness dark={0.82} lights={[{x: 0, y: -200, r: 820, strength: 1.0}]} />
      </Scene>
      <PostFX vignette={0.92} amber={0.12} />
      <Hud likes={9} drawings={41} opacity={0.6} />
    </AbsoluteFill>
  );
};
