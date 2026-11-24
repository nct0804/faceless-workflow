// Shot 27 — 1:15, 4.0 s. Bedroom, 1:48 AM. Mo posts a new photo. Refresh. LIKES 9.
// B: "only nine?"   Cam: push 3%, amber tint creeps 0 -> 15%
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness} from '../kit/three';
import {Hero} from '../kit/characters';
import {Bed, Nightstand, Room, Window} from '../kit/sets';
import {Caption, Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {CLAMP, push, ramp} from './util';

export const SHOT27_FRAMES = 120;

/** Mo sitting up in bed with his phone; reused by shots 28 & 29 */
export const BedroomAtNight: React.FC<{time: string; mood?: 'tired' | 'sad' | 'neutral'; occlude?: boolean}> = ({
  time,
  mood = 'tired',
  occlude,
}) => (
  <>
    <Window x={450} y={140} />
    <Nightstand x={-380} time={time} />
    <Hero x={-110} y={FLOOR_Y + 130} mood={mood} lookX={0.6} lookY={0.4} armR={150} holdPhone="R" occlude={occlude} blinkOffset={70} />
    <Bed x={80} w={640} blanketFrom={0.1} />
  </>
);

export const Shot27: React.FC = () => {
  const frame = useCurrentFrame();
  const likes = frame < 50 ? 0 : Math.round(interpolate(frame, [50, 62], [0, 9], CLAMP));
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT27_FRAMES, 1.06, 1.09)} camY={-60}>
        <Room />
        <BedroomAtNight time="1:48" />
        <Darkness dark={0.95} lights={[{x: -30, y: 40, r: 400, strength: 1.05}, {x: -380, y: -110, r: 160, strength: 0.4}, {x: 450, y: 140, r: 260, strength: 0.35}]} />
      </Scene>
      <PostFX vignette={0.9} amber={ramp(frame, 40, 120) * 0.15} />
      <Hud likes={likes} drawings={41} opacity={0.9} />
      <TimeLabel text="1:48 AM" />
      <Caption text="only nine?" voice="crowd" from={72} to={SHOT27_FRAMES} x="62%" y="26%" />
    </AbsoluteFill>
  );
};
