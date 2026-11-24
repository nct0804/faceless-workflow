// Shot 51 — 2:41, 4.0 s. Top-down insert: two sketchbooks side by side, "MO" and "LIA · AGE 8".
// Cam: push 2%
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Darkness, Glow, Rect} from '../kit/three';
import {BIG_DRAGON, drawPage, LIA_DRAWING, useCanvasTexture} from '../kit/canvas';
import {TexturePlane, WoodSurface} from '../kit/props';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {push} from './util';

export const SHOT51_FRAMES = 120;
const PW = 420;
const PH = 560;

const Crayon: React.FC<{x: number; y: number; r: number; color: string}> = ({x, y, r, color}) => (
  <group position={[x, y, 2]} rotation={[0, 0, r]}>
    <Rect w={90} h={16} color={color} />
    <Rect w={14} h={12} x={52} color={color} opacity={0.8} />
  </group>
);

export const Shot51: React.FC = () => {
  const frame = useCurrentFrame();
  const mo = useCanvasTexture(840, 1120, (ctx, w, h) => drawPage(ctx, w, h, BIG_DRAGON, 'MO', 1, '#2A2A30', 9));
  const lia = useCanvasTexture(840, 1120, (ctx, w, h) => drawPage(ctx, w, h, LIA_DRAWING, 'LIA  ·  AGE 8', 1, '#3E5C8A', 12));
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT51_FRAMES, 1.0, 1.02)}>
        <WoodSurface />
        <group position={[-250, 0, 0]} rotation={[0, 0, 0.04]}>
          <Rect w={PW + 30} h={PH + 30} x={12} y={-14} z={-1} color="#000" opacity={0.35} />
          <Rect w={PW + 14} h={PH + 14} z={-0.5} color="#6B4F3A" />
          <TexturePlane tex={mo} w={PW} h={PH} />
        </group>
        <group position={[250, -10, 0]} rotation={[0, 0, -0.05]}>
          <Rect w={PW + 30} h={PH + 30} x={12} y={-14} z={-1} color="#000" opacity={0.35} />
          <Rect w={PW + 14} h={PH + 14} z={-0.5} color="#8A5A6A" />
          <TexturePlane tex={lia} w={PW} h={PH} />
        </group>
        <Crayon x={560} y={-300} r={0.4} color="#5E8A4E" />
        <Crayon x={600} y={-250} r={0.2} color="#3E5C8A" />
        <Crayon x={530} y={-350} r={0.7} color="#E0A93B" />
        <group position={[-20, -330, 2]} rotation={[0, 0, -0.3]}>
          <Rect w={220} h={14} color="#E2B34A" />
        </group>
        <Darkness dark={0.86} lights={[{x: 0, y: 40, r: 900, strength: 1.25, squash: 1.2}]} />
        <Glow x={300} y={420} z={46} size={1800} sy={0.9} color={C.lamp} intensity={0.14} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud drawings={100} opacity={0.85} />
    </AbsoluteFill>
  );
};
