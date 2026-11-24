// Shot 46 — 2:21.5, 4.0 s. FINAL TEST. Mo posts the finished dragon ("the BIG one.", callback to
// his age-10 list). Refresh: LIKES 6.   Cam: push 3%
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Darkness} from '../kit/three';
import {BIG_DRAGON, drawPostScreen, useCanvasTexture} from '../kit/canvas';
import {Phone, PovHands} from '../kit/props';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {PovBackdrop} from './Shot11';
import {push} from './util';

export const SHOT46_FRAMES = 120;
const TICKS = [44, 52, 60, 68, 78, 92];
const PW = 420;
const PH = 860;

export const Shot46: React.FC = () => {
  const frame = useCurrentFrame();
  const likes = TICKS.filter((t) => frame >= t).length;
  const pop = TICKS.reduce((m, t) => (frame >= t ? Math.max(m, Math.exp(-(frame - t) / 4)) : m), 0);
  const screen = useCanvasTexture(450, 922, (ctx, w, h) => drawPostScreen(ctx, w, h, {likes, pop, caption: 'the BIG one.', strokes: BIG_DRAGON}));
  const phoneY = 40 + Math.sin(frame / 20) * 3;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PovBackdrop />
      <Scene zoom={push(frame, SHOT46_FRAMES, 1.0, 1.03)}>
        <Phone x={0} y={phoneY} w={PW} h={PH} rotation={0.02} screen={screen} glow={0.3} />
        <PovHands phoneX={0} phoneY={phoneY} phoneW={PW} phoneH={PH} />
        <Darkness dark={0.82} lights={[{x: 0, y: phoneY, r: 760, strength: 1.25, squash: 0.75}]} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={likes} drawings={98} opacity={0.9} />
    </AbsoluteFill>
  );
};
