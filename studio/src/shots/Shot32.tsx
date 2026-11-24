// Shot 32 — 1:36.5, 5.0 s. THE REVEAL. Clunk: the stadium house lights slam on. Every seat is
// empty. Just phones lying on seats, glowing amber, switching off one by one.
// N: "He'd been performing for a crowd."   Cam: slow pull-out 4%
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Rect} from '../kit/three';
import {EmptySeats, Hero} from '../kit/characters';
import {Floodlights} from '../kit/sets';
import {Caption, Flash, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {CLAMP, push} from './util';

export const SHOT32_FRAMES = 150;
export const LIGHTS_ON = 8;

/** the empty stands with Mo seen from behind; shared by shots 32 and 33 */
export const EmptyStands: React.FC<{on: number; phonesOn: number}> = ({on, phonesOn}) => (
  <>
    <Rect w={4000} h={2400} y={600} z={-100} color={'#' + (on > 0.5 ? '1A1F2E' : '0B0D12')} />
    <Rect w={4000} h={900} y={FLOOR_Y - 450} z={-99} color={on > 0.5 ? '#141824' : C.floor} />
    <Floodlights y={640} on={on} width={2400} />
    <EmptySeats rows={6} perRow={13} width={2500} baseY={FLOOR_Y + 130} rowGap={128} z={-30} phonesOn={phonesOn} lit={on} seed={2} />
    <Hero x={-460} y={FLOOR_Y - 230} scale={1.15} standing back z={20} breathe />
    <Darkness dark={interpolate(on, [0, 1], [0.93, 0.32])} lights={[{x: -460, y: -260, r: 420, strength: 0.6}]} />
  </>
);

export const Shot32: React.FC = () => {
  const frame = useCurrentFrame();
  const on = interpolate(frame, [LIGHTS_ON, LIGHTS_ON + 4], [0, 1], CLAMP);
  const phonesOn = interpolate(frame, [34, 145], [1, 0.08], CLAMP);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT32_FRAMES, 1.08, 1.04)} camY={60}>
        <EmptyStands on={on} phonesOn={phonesOn} />
      </Scene>
      <PostFX vignette={0.8} amber={interpolate(frame, [0, LIGHTS_ON + 4], [0.35, 0.05], CLAMP)} />
      <Flash at={LIGHTS_ON} len={8} strength={0.55} />
      <Hud likes={9} drawings={41} opacity={0.7} />
      <Caption text="He'd been performing for a crowd." from={40} to={SHOT32_FRAMES} />
    </AbsoluteFill>
  );
};
