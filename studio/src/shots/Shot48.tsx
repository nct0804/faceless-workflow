// Shot 48 — 2:29.5, 3.0 s. Close-up: Mo looks at the phone... and turns it face down. Click.
// Amber drains out on the click. Hard cut.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {Bleachers, Hero} from '../kit/characters';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {CLAMP, lerp, push, ramp} from './util';

export const SHOT48_FRAMES = 90;
const CLICK = 58;

export const Shot48: React.FC = () => {
  const frame = useCurrentFrame();
  const down = ramp(frame, 44, CLICK);
  const glow = frame < CLICK ? 1 : 0;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={1.4} camY={120} blur={16}>
        <Bleachers rows={4} perRow={10} reveal={1} eyesOn={1} excite={0.8} baseY={FLOOR_Y + 160} rowGap={130} width={2200} z={-30} seed={2} />
        <Darkness dark={0.93} lights={[]} />
      </Scene>
      <Scene zoom={push(frame, SHOT48_FRAMES, 1.0, 1.02)}>
        <Hero
          x={-60}
          y={-520}
          scale={2.4}
          mood={frame < CLICK ? 'sad' : 'neutral'}
          lookX={lerp(0.6, 0.2, down)}
          lookY={lerp(0.2, -0.5, down)}
          armR={lerp(138, 20, down)}
          holdPhone="R"
          phoneGlow={glow}
          breathe={false}
          blinkOffset={60}
        />
        <Darkness dark={0.8} lights={[{x: 60, y: 0, r: 820, strength: glow ? 1.1 : 0.7}]} />
      </Scene>
      <PostFX vignette={0.92} amber={interpolate(frame, [CLICK - 1, CLICK + 1], [0.3, 0], CLAMP)} />
      <Hud likes={6} drawings={98} opacity={0.9} />
    </AbsoluteFill>
  );
};
