// Shot 12 — 0:32.5, 2.0 s. Phone: "Post deleted."  HUD LIKES 0.  Hard cut.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {Darkness} from '../kit/three';
import {drawPostDeleted, useCanvasTexture} from '../kit/canvas';
import {Phone, PovHands} from '../kit/props';
import {Hud, PostFX} from '../kit/overlay';
import {Scene} from '../kit/scene';
import {PovBackdrop} from './Shot11';
import {push, ramp} from './util';

export const SHOT12_FRAMES = 60;
const PW = 420;
const PH = 860;

export const Shot12: React.FC = () => {
  const frame = useCurrentFrame();
  const toast = ramp(frame, 3, 9);
  const screen = useCanvasTexture(450, 922, (ctx, w, h) => drawPostDeleted(ctx, w, h, {toast}));
  const phoneY = 40 + Math.sin((frame + 75) / 20) * 3;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PovBackdrop />
      <Scene zoom={push(frame, SHOT12_FRAMES, 1.03, 1.04)}>
        <Phone x={0} y={phoneY} w={PW} h={PH} rotation={0.03} screen={screen} glow={0.3} />
        <PovHands phoneX={0} phoneY={phoneY} phoneW={PW} phoneH={PH} />
        <Darkness dark={0.86} lights={[{x: 0, y: phoneY, r: 760, strength: 1.2, squash: 0.75}]} />
      </Scene>
      <PostFX vignette={0.9} />
      <Hud likes={0} drawings={41} opacity={0.9} />
    </AbsoluteFill>
  );
};
