// Shot 22 — 0:58, 4.0 s. Under the bed: the sketchbook, dust drifting in a sliver of light.
// N: "The more they liked him,"   Cam: very slow push 2%
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FLOOR_Y} from '../theme';
import {Darkness, Glow, LightCone, Rect} from '../kit/three';
import {Caption, Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {push} from './util';

export const SHOT22_FRAMES = 120;

// beam from the gap at the bed edge down to the sketchbook
const START = {x: 430, y: -40};
const END = {x: 70, y: FLOOR_Y + 8};
const DX = END.x - START.x;
const DY = END.y - START.y;
const LEN = Math.hypot(DX, DY);
const ANGLE = Math.atan2(-DX, -DY) * -1;

const r = (i: number) => {
  const s = Math.sin(i * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

export const Shot22: React.FC = () => {
  const frame = useCurrentFrame();
  const dust = Array.from({length: 28}, (_, i) => {
    const s = (r(i) + frame * (0.0012 + r(i + 9) * 0.0012)) % 1;
    const lateral = (r(i + 3) - 0.5) * (40 + s * 120) + Math.sin(frame / 30 + i) * 8;
    const x = START.x + DX * s + (lateral * -DY) / LEN;
    const y = START.y + DY * s + (lateral * DX) / LEN;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / 14 + i * 2.1));
    return {x, y, tw, size: 10 + r(i + 5) * 14};
  });
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT22_FRAMES, 1.55, 1.58)} camX={120} camY={-170}>
        {/* floor + underside of the bed */}
        <Rect w={4000} h={900} y={FLOOR_Y - 450} z={-99} color="#0B0C11" />
        <Rect w={4000} h={1400} y={-40 + 700} z={-60} color="#120F17" />
        <Rect w={4000} h={14} y={-40} z={-59} color="#1E1924" />
        <Rect w={30} h={-40 - FLOOR_Y} x={-760} y={(FLOOR_Y - 40) / 2} z={-58} color="#1A1620" />
        <Rect w={30} h={-40 - FLOOR_Y} x={760} y={(FLOOR_Y - 40) / 2} z={-58} color="#1A1620" />
        {/* the sketchbook, closed */}
        <group position={[70, FLOOR_Y + 9, 5]}>
          <Rect w={300} h={18} color="#6B4F3A" />
          <Rect w={290} h={7} y={5} z={0.1} color={C.paper} />
        </group>
        {/* a sock and a cable, so it reads as under-the-bed */}
        <Rect w={70} h={16} x={-420} y={FLOOR_Y + 8} z={4} color="#3A4256" />
        <Rect w={260} h={4} x={-160} y={FLOOR_Y + 2} z={4} color="#20242F" />
        <group position={[START.x, START.y, 45]} rotation={[0, 0, ANGLE]}>
          <LightCone x={0} topY={0} bottomY={-LEN} topW={40} bottomW={200} color="#DDE6F5" opacity={0.22} z={0} />
        </group>
        {dust.map((d, i) => (
          <Glow key={i} x={d.x} y={d.y} z={47} size={d.size} color="#EEF3FF" intensity={0.55 * d.tw} />
        ))}
        <Darkness dark={0.95} lights={[{x: END.x, y: END.y + 20, r: 360, strength: 0.95, squash: 1.6}]} />
      </Scene>
      <PostFX vignette={0.92} />
      <Hud likes={1040} drawings={41} opacity={0.85} />
      <Caption text="The more they liked him," from={15} to={SHOT22_FRAMES} />
    </AbsoluteFill>
  );
};
