// Shot 44 — 2:15, 3.5 s. DAY 24 -> DAY 30 fast cards (0.7 s each): sketchbook pages flipping,
// filling up.  N: "He didn't need an audience."  DRAWINGS -> 97
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Darkness, Glow, Rect} from '../kit/three';
import {BIG_DRAGON, drawPage, PLANT, portrait, Stroke, useCanvasTexture} from '../kit/canvas';
import {TexturePlane, WoodSurface} from '../kit/props';
import {Caption, Hud, PostFX, TimeLabel} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {CLAMP, push} from './util';

export const SHOT44_FRAMES = 105;
const CARD = 21;
const PAGE_W = 460;
const PAGE_H = 600;

const PAGES: {day: number; label: string; strokes: Stroke[]; count: number}[] = [
  {day: 24, label: 'theo', strokes: portrait('glasses'), count: 80},
  {day: 26, label: "mom's plant", strokes: PLANT, count: 84},
  {day: 27, label: 'dex (he asked)', strokes: portrait('cap'), count: 88},
  {day: 28, label: 'lia, again', strokes: portrait('buns'), count: 92},
  {day: 30, label: 'the BIG one', strokes: BIG_DRAGON, count: 97},
];

export const Shot44: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(PAGES.length - 1, Math.floor(frame / CARD));
  const local = frame - i * CARD;
  const flip = interpolate(local, [0, 5], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const prev = PAGES[Math.max(0, i - 1)];
  const cur = PAGES[i];
  // the newest page draws itself during its card
  const p = interpolate(local, [2, CARD - 2], [0.35, 1], CLAMP);
  const left = useCanvasTexture(920, 1200, (ctx, w, h) => drawPage(ctx, w, h, prev.strokes, prev.label, 1, '#2A2A30', 9));
  const right = useCanvasTexture(920, 1200, (ctx, w, h) => drawPage(ctx, w, h, cur.strokes, cur.label, p, '#2A2A30', 9));
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Scene zoom={push(frame, SHOT44_FRAMES, 1.0, 1.03)}>
        <WoodSurface />
        <Rect w={PAGE_W * 2 + 40} h={PAGE_H + 40} x={10} y={-14} z={-1} color="#000" opacity={0.35} />
        <Rect w={PAGE_W * 2 + 18} h={PAGE_H + 18} z={-0.5} color="#6B4F3A" />
        <TexturePlane tex={left} w={PAGE_W} h={PAGE_H} x={-PAGE_W / 2} />
        {/* right page turns in from the spine */}
        <group scale={[Math.max(0.001, flip), 1, 1]}>
          <TexturePlane tex={right} w={PAGE_W} h={PAGE_H} x={PAGE_W / 2} z={0.1} />
        </group>
        <Rect w={26} h={PAGE_H} z={0.2} color="#000" opacity={0.12} />
        <Darkness dark={0.86} lights={[{x: 60, y: 60, r: 900, strength: 1.25, squash: 1.1}]} />
        <Glow x={420} y={420} z={46} size={1700} sy={0.9} color={C.lamp} intensity={0.14} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={9} drawings={cur.count} opacity={0.85} />
      <TimeLabel text={`DAY ${cur.day}`} />
      <Caption text="He didn't need an audience." from={20} to={SHOT44_FRAMES} />
    </AbsoluteFill>
  );
};
