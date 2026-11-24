// Shot 23 — 1:02, 3.0 s. Mirror: Mo practices a smile. The reflection doesn't smile back.
// N: "the less he liked himself."
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow} from '../kit/three';
import {Hero} from '../kit/characters';
import {FloorShadow, MirrorFrame, Room, Sink, Tiles} from '../kit/sets';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {push} from './util';

export const SHOT23_FRAMES = 90;

const MX = 230;
const MY = 120;
const MW = 380;
const MH = 440;

export const Shot23: React.FC = () => {
  const frame = useCurrentFrame();
  const smiling = frame < 62;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT23_FRAMES, 1.08, 1.1)} camX={-20} camY={-40}>
        <Room wallTop="#1B2232" wallBottom="#141A26" />
        <Tiles x={0} w={2400} y0={FLOOR_Y} y1={700} />
        <MirrorFrame x={MX} y={MY} w={MW} h={MH} />
        {/* reflection: mirrored, dimmer, not smiling */}
        <group position={[MX + 20, 0, -66]} scale={[-1, 1, 1]}>
          <Hero x={0} y={FLOOR_Y} standing mood="tired" lookX={1} color="#B9B2A4" shade="#A0998B" blinkOffset={10} breathe={false} />
        </group>
        <Sink x={MX} w={MW + 40} topY={MY - MH / 2 - 4} />
        <FloorShadow x={-300} w={300} />
        <Hero x={-300} y={FLOOR_Y} standing mood={smiling ? 'happy' : 'neutral'} lookX={1} headTilt={smiling ? Math.sin(frame / 6) * 3 : 0} />
        <Glow x={MX} y={MY + MH / 2 + 30} z={46} size={520} sy={0.4} color="#DDE6F5" intensity={0.35} />
        <Darkness dark={0.88} lights={[{x: 20, y: 60, r: 640, strength: 1.15}]} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={1040} drawings={41} opacity={0.85} />
      <Caption text="the less he liked himself." from={6} to={SHOT23_FRAMES} />
    </AbsoluteFill>
  );
};
